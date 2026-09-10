/**
 * Emits `dist/style-with-maptiler.css`: the MapTiler SDK's own stylesheet
 * followed by this package's.
 *
 * `dist/style.css` holds one rule — the map container's sizing — because the
 * build externalises the SDK entirely. A consumer therefore has to remember two
 * stylesheet imports, and forgetting the SDK one produces a map whose controls
 * and popups are unstyled rather than an error. This concatenation is the
 * single import for consumers who do not already load the SDK's CSS
 * themselves; `dist/style.css` stays published for the ones who do, so nobody
 * is forced to ship the ~103KB twice.
 *
 * Runs after the Vite pass, since it reads what that wrote.
 *
 * Usage: emit-stylesheet-with-maptiler.ts
 */
import { fileURLToPath } from 'node:url';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

/**
 * The SDK's stylesheet, resolved through the `./style.css` subpath the SDK
 * itself exports.
 *
 * Reading `style` out of its manifest — what the MapLibre port does — is not
 * available here: `@maptiler/sdk` ships an `exports` map that declares only an
 * `import` condition, so `require.resolve` rejects every deep specifier
 * including `package.json` with ERR_PACKAGE_PATH_NOT_EXPORTED. `import.meta`
 * resolution honours the condition the SDK actually publishes.
 */
function maptilerStylesheet(): { css: string; version: string } {
  const cssPath = fileURLToPath(import.meta.resolve('@maptiler/sdk/style.css'));

  // The version is read off disk rather than through another specifier, for
  // the same reason: the manifest is not an exported subpath. Walking up from
  // the stylesheet finds the package root without asking the resolver again.
  let dir = dirname(cssPath);
  let version = 'unknown';
  for (let depth = 0; depth < 5; depth++) {
    try {
      const manifest = JSON.parse(
        readFileSync(resolve(dir, 'package.json'), 'utf8'),
      ) as { name?: string; version?: string };
      if (manifest.name === '@maptiler/sdk' && manifest.version) {
        version = manifest.version;
        break;
      }
    } catch {
      // Not the package root yet; keep walking.
    }
    dir = dirname(dir);
  }

  return { css: readFileSync(cssPath, 'utf8').trim(), version };
}

export function emitStylesheetWithMaptiler(rootDir: string): string {
  const ownPath = resolve(rootDir, 'dist/style.css');
  let own: string;
  try {
    own = readFileSync(ownPath, 'utf8').trim();
  } catch {
    throw new Error(
      `Cannot build dist/style-with-maptiler.css: ${ownPath} does not exist. ` +
        'Run the Vite pass first — `bun run build` chains them in order.',
    );
  }

  const maptiler = maptilerStylesheet();
  const bundled = [
    '/*!',
    ` * MapTiler SDK v${maptiler.version} stylesheet, bundled verbatim.`,
    ' * Copyright (c) 2022, MapTiler. BSD-3-Clause.',
    ' * https://github.com/maptiler/maptiler-sdk-js/blob/main/LICENSE',
    ' *',
    ' * Import this file INSTEAD OF, not alongside, @maptiler/sdk/dist/maptiler-sdk.css.',
    ' */',
    maptiler.css,
    own,
    '',
  ].join('\n');

  const outputPath = resolve(rootDir, 'dist/style-with-maptiler.css');
  writeFileSync(outputPath, bundled);
  return outputPath;
}

// Run only as a CLI: the tests import `emitStylesheetWithMaptiler` directly,
// and a bare top-level call would write into the real `dist/` on every test
// run.
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const outputPath = emitStylesheetWithMaptiler(
    resolve(import.meta.dirname, '..'),
  );
  console.log(`Wrote ${outputPath}`);
}
