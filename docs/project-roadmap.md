# Project Roadmap

Maintainer-facing planning notes. Excluded from the published site via
`srcExclude` in `docs/.vitepress/config.ts`, so it can stay blunt about what is
unfinished.

Everything under "Current state" and "Known gaps" is checked against the
repository. Everything under "Candidates" is a proposal with no committed date —
this project has no release schedule, and inventing one here only produces a
document that is wrong a month later.

## Current state

**v2.0.1 is the published latest.** v2.0.0 was the port onto the
`vue3-maplibre-gl` v6 API, and it is breaking — see
[the v1 → v2 migration guide](./guide/migration-v1-to-v2.md). v2.0.1 changed
only the npm landing-page READMEs.

|             |                                                           |
| ----------- | --------------------------------------------------------- |
| Components  | 10                                                        |
| Composables | 38, all exported from the package root                    |
| Tests       | 223 across 32 files                                       |
| Coverage    | 42% statements / 37% branches / 40% functions / 43% lines |
| Nuxt module | `nuxt-maptiler-gl` 2.0.1, published                       |

Coverage is enforced as a ratchet in `vitest.config.ts`: every threshold is the
number a file actually reached, so a change that lowers it fails CI. The global
figure is low because most layer, source and control composables have no tests
at all — see Known gaps.

## What v2 changed

Behavioural changes are documented for consumers in
[the v1 → v2 migration guide](./guide/migration-v1-to-v2.md). In short:

- **Composables return refs.** v1 unwrapped its reactive state once in the
  return object, so every status a consumer read was frozen at setup. This is
  the reason v2 is a major release.
- **A post-load `error` no longer unmounts the map.** Any error used to be
  fatal, so a tile 404 tore down every child component.
- **Camera calls settle on their own animation.** Calls shared the map's
  movement events, so an interrupted ease resolved whichever promise was
  waiting.
- **Layer and map-event listeners attach when their target arrives.** A
  listener registered before its layer existed was never attached.
- **Stylesheets separated.** The package ships only its own rules; MapTiler's
  stylesheet is imported the way MapTiler documents it.
- **MapTiler runtime moved to `vue3-maptiler-gl/maptiler`**, so importing one
  component no longer pins the whole upstream runtime into the module graph.
- **`@maptiler/sdk` is a peer dependency**, guaranteeing a single shared copy of
  the runtime.

## Known gaps

Verified, not aspirational.

### Untested modules

These have no test file. The layer composables are the largest hole — they carry
the property-setter and lifecycle logic that the v2 fixes touched.

| Area      | Modules                                                                                                        |
| --------- | -------------------------------------------------------------------------------------------------------------- |
| Layers    | `useCreateFillLayer`, `useCreateCircleLayer`, `useCreateLineLayer`, `useCreateSymbolLayer`, `layerStyleConfig` |
| Map       | `useLayer`, `useGeoJsonSource`, `useMapTilerConfig`                                                            |
| Events    | `useMapEventListener`, `useGeolocateEventListener`                                                             |
| Controls  | `useGeolocateControl`                                                                                          |
| Camera    | `useFlyTo`, `useEaseTo`, `useJumpTo`, `useFitBounds`                                                           |
| Utilities | `useDebounce`, `useLogger`                                                                                     |

`useFlyTo` / `useEaseTo` / `useJumpTo` are partly exercised through
`createCameraAnimation`'s tests, but nothing pins their own option handling.

### Other

- **No integration test runs a real map.** Every test uses a hand-written mock,
  so a wrong assumption about MapTiler's behaviour is invisible until a
  consumer hits it. The camera event bugs fixed in v2 were exactly this.
- **No expression type hints.** MapTiler style expressions are typed as loose
  arrays; a malformed expression fails at runtime.
- **No classic `<script>` install.** `@maptiler/sdk` is ESM-only, so this
  package dropped its UMD build; CDN users need `<script type="module">`.
- **No benchmark backs any performance claim.** The maintainer docs now state
  only measured bundle sizes and describe what the code does, because the
  figures they used to assert (frame rates, memory ceilings, adoption numbers)
  had nothing measuring them.

## Candidates for 2.x

Backward-compatible work, roughly in the order it would pay off.

1. **Tests for the four layer composables and `useLayer`.** Largest untested
   surface, and the one v2 changed most.
2. **A browser-based smoke test** (one real map, one real style) to catch the
   class of defect the mocks cannot.
3. **Expression builder helpers** with typed operators, replacing raw arrays at
   call sites that want type safety.
4. **GeoJSON clustering helpers** — MapTiler supports clustering natively; this
   package exposes no ergonomic wrapper for cluster events and expansion.
5. **Sprite / icon management composable.** `useCreateImage` handles one image;
   nothing helps with a sprite sheet.

## Candidates for 3.0

Only breaking work belongs here. Nothing is committed.

- **Reconsider the status-enum surface.** Every composable exports its own
  `*Status` enum plus boolean mirrors; a single shared shape would be smaller to
  learn, and cannot change without a major.
- **Consolidate the four layer composables** onto `useCreateLayer` with a
  discriminated type, if the tests in 2.x show the wrappers add nothing.

## Compatibility

Current declared support, from `package.json`:

| Dependency      | Range    | Kind                            |
| --------------- | -------- | ------------------------------- |
| `vue`           | `^3.0.0` | peer                            |
| `@maptiler/sdk` | `^4.1.0` | peer                            |
| `typescript`    | `^5.4.5` | dev — build and type generation |

`nuxt-maptiler-gl` declares `nuxt >=3.0.0` as a peer and keeps `@maptiler/sdk` in
its own dependencies, so a Nuxt app is unaffected by the peer change.

There is no `engines` field. Node is only constrained in practice by the build
toolchain (Vite 5, Vitest 4).

## Releasing

Both packages publish from this repository and the order matters, because the
Nuxt module depends on the root package by version range. The check that
enforces that order lives in [`nuxt/README.md`](../nuxt/README.md).

1. Set `version` in `package.json` deliberately — no script picks it for you.
2. `bun run changelog` writes the new section into `docs/changelog.md` from the
   conventional commits since the last tag. Review it.
3. Commit the version bump and the changelog together.
4. `bun run publish:vue`, then `bun run publish:nuxt`. Both refuse to start
   if that version is already on npm, which cannot be republished.
5. Push. CI tags the version and creates the GitHub release.

CI never writes to the repository. `master` requires pull requests, so a push
from `github-actions[bot]` is rejected with GH006 — when the changelog step
still ran there it failed the whole release job before it could tag anything.

## Contributing

Issues and pull requests: <https://github.com/danh121097/vue-maptiler-gl>.

The most useful contribution right now is a test for anything in the Untested
modules table — the coverage ratchet means new tests raise the floor
permanently.
