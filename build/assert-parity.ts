/**
 * Asserts that `libs/` is the upstream `vue3-maplibre-gl` tree with the rename
 * map applied, and that the only files which differ are the ones the port
 * deliberately diverged on.
 *
 * The port's whole premise is "identical except for the engine", and prose in a
 * plan cannot keep that true. This can: point it at a checkout of the source
 * repository and it renames every source file, formats both sides, and diffs.
 *
 *   bun run build/assert-parity.ts                    # ../vue-maplibre-gl
 *   PARITY_SOURCE=/path/to/vue-maplibre-gl bun run build/assert-parity.ts
 *   bun run build/assert-parity.ts --strict            # absent source is an error
 *
 * Exits 0 when every file either matches or is a declared divergence, and 1
 * with a per-file report otherwise. A missing source checkout is a skip by
 * default, because this runs on a developer's machine and not every clone has
 * the sibling repository — but `--strict` turns that skip into a failure, and
 * `publish:vue` passes it, so a release cannot quietly go out unverified.
 * It is deliberately not in `prepublishOnly`: that chain runs on any clone, and
 * a gate that passes by being absent is worse than no gate at all.
 *
 * Two things about it are load-bearing and were learned by getting them wrong.
 *
 * **Both sides are formatted, not just the renamed source.** `@maptiler/sdk` is
 * five characters longer than `maplibre-gl`, so renamed lines cross Prettier's
 * print width and re-wrap; without normalising, the audit reports pure reflow
 * as divergence. Formatting only the source side is just as wrong in the other
 * direction: `docs/.vitepress/theme/style.css` once reported eighteen changed
 * lines while being byte-identical, because the project's `format` script glob
 * covers `{html,vue,ts,js,json,md}` and not `css`, so only the audit's copy got
 * touched. Files outside that glob are therefore compared raw.
 *
 * **A clean run is necessary, not sufficient.** The comparison is
 * renamed-source against target, so damage done by the rename map itself lands
 * on both sides and reads as IDENTICAL. A declared divergence would likewise be
 * a blind spot — "this file differs" waives every later change to it — so each
 * one pins the SHA-256 of the diff it is allowed to have. Change an exempt file
 * and the audit fails with the new hash, which is the prompt to re-read the
 * divergence and paste it in deliberately rather than by default. Every defect found in the docs and
 * Nuxt port — a dead `demotiles.maptiler.org` host, package names mangled into
 * `vue-@maptiler/sdk`, an `addPlugin` path pointing at a file that does not
 * exist — audited clean here. This checks that nothing drifted from upstream;
 * it cannot check that the rename was a good idea.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const rootDir = resolve(import.meta.dirname, '..');
const sourceDir = resolve(
  process.env.PARITY_SOURCE ?? join(rootDir, '..', 'vue-maplibre-gl'),
);

/** Trees compared file-for-file. Everything else is out of the audit's scope. */
const TREES = ['libs'];

/**
 * The §3 rename map, applied to file contents. Order matters: each rule runs
 * against the output of the last, so the longest and most specific spellings
 * come first or a shorter rule eats their prefix.
 */
const CONTENT_RULES: ReadonlyArray<readonly [string, string]> = [
  ['vue3-maplibre-gl', 'vue3-maptiler-gl'],
  ['maplibre-gl/dist/maplibre-gl.css', '@maptiler/sdk/dist/maptiler-sdk.css'],
  ["'maplibre-gl'", "'@maptiler/sdk'"],
  ['"maplibre-gl"', '"@maptiler/sdk"'],
  ['maplibre-gl', '@maptiler/sdk'],
  ['MapLibre GL JS', 'MapTiler SDK'],
  ['MapLibre GL', 'MapTiler SDK'],
  ['MapLibreZoomEvent', 'MapTilerZoomEvent'],
  ['MapLibreEvent', 'MapTilerEvent'],
  ['MapLibre', 'MapTiler'],
  ['Maplibre', 'MapTiler'],
  ['maplibregl', 'maptilersdk'],
  ['maplibre', 'maptiler'],
];

/**
 * Paths rename by different rules than contents: `maplibre-gl` is a package
 * name inside a file but a filename stem on disk, where it becomes
 * `maptiler-sdk` rather than `@maptiler/sdk` — a slash in a filename would be a
 * directory. Getting this wrong is what once pointed the Nuxt module's
 * `addPlugin` at `runtime/plugins/@maptiler/sdk.client`, a file that cannot
 * exist, so the module registered nothing.
 */
function renamePath(path: string): string {
  return path
    .replaceAll('Maplibre', 'MapTiler')
    .replaceAll('maplibre-gl', 'maptiler-sdk')
    .replaceAll('maplibre', 'maptiler');
}

function renameContent(text: string): string {
  let out = text;
  for (const [from, to] of CONTENT_RULES) out = out.replaceAll(from, to);
  return out;
}

/**
 * Files the port changes on purpose, each with the reason. A divergence here is
 * a claim that has to stay true: the audit fails if one of these files turns
 * out to match after all, because a stale exemption is how a real regression
 * gets waved through.
 */
const DIVERGENCES = new Map<string, { hash: string; reason: string }>([
  [
    'libs/maptiler-reexports.ts',
    {
      hash: 'bbf4a310dd0aa675a5a582d99a072d38af197da03740f41297c5b4c7068d7920',
      reason:
        'D11: the SDK re-exports MapLibre types wholesale but forwards runtime ' +
        'bindings selectively, so Color, ErrorEvent, Event, Formatted, ' +
        'FormattedSection, GlobeControl and createTileMesh are values upstream ' +
        'and types only here. They move to an export type block.',
    },
  ],
  [
    'libs/components/MapTiler.vue',
    {
      hash: '439c863daa1d6d16dabe49b27e0c40286bd4a312c709e37cece7ded31097a9b7',
      reason:
        'D5/D10: a keyless default style, because every MapTiler Cloud style ' +
        'needs an API key and the component must render without an account; ' +
        'and the emit signatures name MapTilerGLEvent, the SDK generic event ' +
        'class, which the rename map would otherwise collide with the enums ' +
        'union MapTilerEvent.',
    },
  ],
  [
    'libs/composables/map/useCreateMapTiler.ts',
    {
      hash: '90bd9594937998f01be33426f315f5fa79a17766dc2a568bae4bbb88346922b4',
      reason:
        "D12: setStyle takes the SDK's own style union rather than MapLibre's " +
        'string | StyleSpecification, because the SDK also accepts a ' +
        'ReferenceMapStyle and a MapStyleVariant.',
    },
  ],
  [
    'libs/types/index.ts',
    {
      hash: '91f84dfcaef6aba3cc83004c79173e97f898adc77d3761a1234f715c6370b657',
      reason:
        'D12: the MapTilerMethods.setStyle signature derives its parameter from ' +
        "MapOptions['style'] rather than restating MapLibre's narrower pair. " +
        'Also two @see links: the style spec lives on maplibre.org, and the ' +
        'rename map had rewritten them to a maptiler.org host that does not exist.',
    },
  ],
  [
    'libs/index.ts',
    {
      hash: '6008184a21bc504f9e3f9ee1520901e59382303877ebfaf2e0249012ff960a6b',
      reason:
        'D10: the rename map sends two distinct upstream names to one target ' +
        'name. The enums union keeps MapTilerEvent, so the SDK generic event ' +
        'class is re-exported as MapTilerGLEvent.',
    },
  ],
  [
    'libs/composables/map/useMapTilerConfig.ts',
    {
      hash: '2a4e80683f7c4b2c31ce2a8875e1be1a0685e76a8a4e462f559d8f3d0d5a8176',
      reason:
        'D4: an optional apiKey applied to the SDK global config before any ' +
        'request goes out. MapLibre has no hosted tile service to authenticate ' +
        'against, so upstream has no counterpart.',
    },
  ],
  [
    'libs/composables/map/useMapTiler.ts',
    {
      hash: '399ad30c1edcf672e215b2af8c288983c27e31613a93c91de35a80372ec6b478',
      reason:
        "D12: setStyle is typed as the SDK's own style union rather than " +
        'string | StyleSpecification, for the same reason as useCreateMapTiler.',
    },
  ],
]);

const FORMATTED_EXTENSIONS = ['.html', '.vue', '.ts', '.js', '.json', '.md'];

function isFormatted(path: string): boolean {
  return FORMATTED_EXTENSIONS.some((ext) => path.endsWith(ext));
}

/**
 * Run the project's own Prettier over a string, using the project's own config.
 *
 * The file has to sit inside the repository. Prettier resolves configuration
 * from the file's location, so a temp file under `/tmp` finds none and is
 * silently reformatted to Prettier's defaults — double quotes, different
 * wrapping — which then shows up as divergence on every single line.
 */
function format(text: string, samplePath: string): string {
  const ext = samplePath.slice(samplePath.lastIndexOf('.'));
  try {
    return execFileSync('bunx', ['prettier', '--stdin-filepath', `x${ext}`], {
      cwd: rootDir,
      input: text,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      maxBuffer: 32 * 1024 * 1024,
    });
  } catch {
    // A file Prettier cannot parse is compared raw rather than skipped: an
    // unformattable file is still a file whose content has to match.
    return text;
  }
}

function walk(dir: string, base: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, base, out);
    else out.push(relative(base, full));
  }
  return out;
}

const strict = process.argv.includes('--strict');

if (!existsSync(sourceDir) || !statSync(sourceDir).isDirectory()) {
  const message =
    `no source checkout at ${sourceDir}.\n` +
    'Clone vue-maplibre-gl beside this repository, or set PARITY_SOURCE.';
  if (strict) {
    console.error(`Parity audit cannot run: ${message}`);
    process.exit(1);
  }
  console.log(`Parity audit skipped: ${message}`);
  process.exit(0);
}

const missing: string[] = [];
const extra: string[] = [];
const differing: { path: string; reason: string }[] = [];
const staleExemptions: string[] = [];
const driftedExemptions: { path: string; hash: string }[] = [];
let identical = 0;
let declared = 0;

/**
 * Files this repository owns that upstream has no counterpart for. Without
 * this list the audit would only ever walk the source tree, so a file *added*
 * here — a composable upstream never had, a stray scratch file left in `libs/`
 * — is invisible to it and the audit still passes.
 */
const TARGET_ONLY = new Set<string>([]);

/** Every path the source tree accounts for, renamed into target spelling. */
const accountedFor = new Set<string>();

for (const tree of TREES) {
  const sourceTree = join(sourceDir, tree);
  if (!existsSync(sourceTree)) {
    console.error(`Source tree ${tree}/ is missing from ${sourceDir}.`);
    process.exit(1);
  }

  for (const sourceRel of walk(sourceTree, sourceDir)) {
    const targetRel = renamePath(sourceRel);
    const targetAbs = join(rootDir, targetRel);
    accountedFor.add(targetRel);

    if (!existsSync(targetAbs)) {
      missing.push(targetRel);
      continue;
    }

    const ported = renameContent(
      readFileSync(join(sourceDir, sourceRel), 'utf8'),
    );
    const actual = readFileSync(targetAbs, 'utf8');
    const [a, b] = isFormatted(targetRel)
      ? [format(ported, targetRel), format(actual, targetRel)]
      : [ported, actual];

    const divergence = DIVERGENCES.get(targetRel);
    if (a === b) {
      if (divergence) staleExemptions.push(targetRel);
      else identical++;
    } else if (divergence) {
      // Pin the exact difference, not merely the fact of one. Hashing the
      // renamed source together with the target ties the exemption to both
      // sides, so an upstream change reopens it too.
      const actual = createHash('sha256')
        .update(a)
        .update('\u0000')
        .update(b)
        .digest('hex');
      if (actual === divergence.hash) {
        declared++;
      } else {
        driftedExemptions.push({ path: targetRel, hash: actual });
      }
    } else {
      // Where the two first disagree, not how many lines differ: a single
      // inserted line shifts every line after it, so a naive positional count
      // reports a two-line change as three hundred.
      const [left, right] = [a.split('\n'), b.split('\n')];
      const firstDiff = left.findIndex((line, i) => line !== right[i]);
      // -1 means every line of the shorter side matches, so the difference is
      // whatever the longer side appends past its end.
      const at = firstDiff === -1 ? left.length + 1 : firstDiff + 1;
      differing.push({
        path: targetRel,
        reason: `first differs at line ${at}, ${left.length} vs ${right.length} lines`,
      });
    }
  }

  // The other direction. A file only this repository has never appears in the
  // loop above, so without this the audit is blind to anything added.
  for (const targetRel of walk(join(rootDir, tree), rootDir)) {
    if (accountedFor.has(targetRel)) continue;
    if (TARGET_ONLY.has(targetRel)) {
      declared++;
      continue;
    }
    extra.push(targetRel);
  }
}

console.log(
  `Parity audit against ${sourceDir}\n` +
    `  ${identical} files identical after rename\n` +
    `  ${declared} declared divergences\n` +
    `  ${differing.length} undeclared divergences\n` +
    `  ${missing.length} files missing from the target\n` +
    `  ${extra.length} files the target has and upstream does not`,
);

for (const path of missing) console.error(`MISSING     ${path}`);
for (const path of extra) {
  console.error(
    `EXTRA       ${path} has no upstream counterpart; delete it, or add it to ` +
      'TARGET_ONLY with the reason it belongs here.',
  );
}
for (const { path, reason } of differing) {
  console.error(`DIVERGED    ${path} (${reason})`);
}
for (const { path, hash } of driftedExemptions) {
  console.error(
    `CHANGED     ${path} is a declared divergence, but the difference is no ` +
      `longer the reviewed one. Re-read it, then pin: hash: '${hash}'`,
  );
}
for (const path of staleExemptions) {
  console.error(
    `STALE       ${path} is declared a divergence but now matches upstream; ` +
      'remove it from DIVERGENCES.',
  );
}

const failed =
  missing.length > 0 ||
  extra.length > 0 ||
  differing.length > 0 ||
  driftedExemptions.length > 0 ||
  staleExemptions.length > 0;
if (failed) {
  console.error(
    '\nEvery file above must either match upstream after the rename, or be ' +
      'declared in DIVERGENCES with the reason it does not.',
  );
}
process.exit(failed ? 1 : 0);
