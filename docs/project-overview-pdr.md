# Project Overview & Product Development Requirements

## Project Vision

**Vue3 MapTiler SDK** is the most comprehensive Vue 3 component library for building interactive, production-ready maps with MapTiler SDK. It provides a seamless, reactive integration between Vue 3's Composition API and MapTiler SDK's WebGL-powered mapping engine.

### Mission Statement

Empower Vue 3 developers to build high-performance, interactive maps with minimal boilerplate through:

- **Component-oriented design** - Familiar Vue patterns for map building
- **Composable architecture** - Fine-grained, composable utilities for advanced use cases
- **Type-safe development** - Comprehensive TypeScript support from day one
- **Framework integration** - First-class Nuxt support with SSR out of the box
- **Zero performance compromise** - Optimized bundle size, memory management, and rendering

## Current Release: v2.0.2

### Release Summary

**v2.0.0** rebuilt this package on the API of `vue3-maplibre-gl` v6, keeping
the MapTiler SDK as the engine. It was the first release with breaking API
changes: composables now return refs instead of values unwrapped once at setup,
so a consumer reading a status sees it change; `@maptiler/sdk` moved to
`peerDependencies`; and the package stopped shipping a stylesheet of its own
that consumers had not asked for. **v2.0.1** changed only the npm landing-page READMEs, and
**v2.0.2** only the package metadata and the docs site; neither touched the
API, and 2.0.2 ships a `dist/` byte-identical to 2.0.1. npm carries 1.0.0,
1.0.1, 2.0.0, 2.0.1 and 2.0.2.

Consumer-facing detail is in [the v1 → v2 migration guide](./guide/migration-v1-to-v2.md),
which folds that whole history into the one upgrade this package's users actually make.

### Key Achievements

| Aspect            | Achievement                                                                                                      |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Architecture**  | Factory-based composables — event listeners, camera animations and layer property setters each share one factory |
| **Components**    | 10 fully-featured components with reactive data binding                                                          |
| **Composables**   | 38 composables for map management, animations, and utilities                                                     |
| **TypeScript**    | Comprehensive type definitions with event handler types                                                          |
| **Correctness**   | v2 fixed reactive status, camera promise settlement, listener attachment ordering, and post-load error recovery  |
| **SSR Support**   | Full Nuxt SSR/SSG compatibility with browser guards                                                              |
| **Nuxt Module**   | nuxt-maptiler-gl v2.0.2, auto-importing all 38 composables                                                       |
| **Testing**       | 224 tests across 32 files, with a coverage ratchet in CI                                                         |
| **Documentation** | VitePress docs with API reference, guides, and examples                                                          |

## Feature Set

### Components (10)

| Component             | Purpose             | Key Features                                                 |
| --------------------- | ------------------- | ------------------------------------------------------------ |
| **MapTiler**          | Main map container  | Full MapTiler SDK integration, event system, camera controls |
| **GeoJsonSource**     | GeoJSON data source | Reactive data binding, clustering support, feature access    |
| **FillLayer**         | Polygon rendering   | Paint/layout configuration, reactive style updates           |
| **CircleLayer**       | Point rendering     | Radius/color styling, responsive to zoom level               |
| **LineLayer**         | Line rendering      | Complex stroke patterns, elevation support                   |
| **SymbolLayer**       | Text/icon rendering | Dynamic labels, icon placement, text sizing                  |
| **Marker**            | Map markers         | Draggable markers, custom popups, event handlers             |
| **Popup**             | Popup overlays      | Auto-positioning, interactive content, responsive            |
| **Image**             | Static images       | Custom image layers, dynamic source loading                  |
| **GeolocateControls** | User location       | Geolocation tracking, permission handling, status feedback   |

### Composables (38)

#### Map Management (3)

- `useCreateMapTiler()` - Create and manage MapTiler instances
- `useMapTiler()` - Access current map context with TypeScript safety
- `useMapTilerConfig()` - Configure map options reactively

#### Camera Animations (7)

- `useFlyTo()` - Animated flight to location
- `useEaseTo()` - Smooth easing animation
- `useJumpTo()` - Instant camera jump
- `useFitBounds()` - Zoom to bounds
- `useCameraForBounds()` - Get optimal camera for bounds
- `useZoomTo()` - Zoom to specific level
- `usePanBy()` / `usePanTo()` - Pan map with animation

#### Zoom & Rotation (6)

- `useZoomIn()` - Step zoom up
- `useZoomOut()` - Step zoom down
- `useRotateTo()` - Rotate to bearing
- `useResetNorth()` - Reset bearing to north
- `useResetNorthPitch()` - Reset bearing and pitch
- `useSnapToNorth()` - Snap to nearest north angle

#### Layer Management (5)

- `useCreateFillLayer()` - Create fill layers
- `useCreateCircleLayer()` - Create circle layers
- `useCreateLineLayer()` - Create line layers
- `useCreateSymbolLayer()` - Create symbol layers
- `useLayer()` - Generic layer management with generics

#### Event Listeners (4)

- `useMapEventListener()` - Listen to map events
- `useLayerEventListener()` - Listen to layer events
- `useGeolocateEventListener()` - Listen to geolocation events
- `useMapReloadEvent()` - Handle map reload scenarios

#### Data Sources (2)

- `useCreateGeoJsonSource()` - Create GeoJSON sources
- `useGeoJsonSource()` - Access GeoJSON source context

#### Controls (1)

- `useGeolocateControl()` - Programmatic geolocation control

#### Utilities (3+)

- `useCreateMarker()` - Create markers programmatically
- `useCreatePopup()` - Create popups programmatically
- `useCreateImage()` - Add images to map

### Framework Support

#### Vue 3 Compatibility

- Full Composition API support
- Reactive data binding with computed properties
- Template syntax and directives support
- Suspense and async component support

#### Nuxt Integration

- **Nuxt 3** with App Router
- Auto-import components and composables
- SSR/SSG compatible with browser guards
- Integrated CSS auto-import
- Optional prefix for auto-imported composables

#### TypeScript

- Full generic type support
- Event handler types for IDE autocompletion
- Layer style type preservation
- Source and filter specifications
- Exported factory utilities for advanced usage

## Architecture

### Core Patterns

#### Factory-Based Architecture (v2)

The library uses three key factory functions to eliminate code duplication:

1. **Event Listener Factory** (`createEventListenerComposable`)
   - Shared adapter pattern for map, layer, and geolocate events
   - Idempotent attach/detach with status tracking
   - Error handling and watchEffect cleanup

2. **Camera Animation Factory** (`createCameraAnimation`)
   - Unified promise-wrapping for all animations (flyTo, easeTo, etc.)
   - Optional timeout support to prevent hanging animations
   - Automatic cleanup on completion or error

3. **Layer Property Setter Factory** (`createPropertySetter`)
   - Generic type preservation for layer styles
   - Batch property updates with Vue reactivity
   - Tested across all 4 layer types (Fill, Circle, Line, Symbol)

#### Component Hierarchy

```
MapTiler (Root Provider)
├── GeoJsonSource (Data Provider)
│   ├── FillLayer (Consumer)
│   ├── CircleLayer (Consumer)
│   ├── LineLayer (Consumer)
│   └── SymbolLayer (Consumer)
├── Marker (Independent)
├── Popup (Independent)
├── Image (Independent)
└── GeolocateControls (Independent)
```

#### SSR Safety

- All browser APIs wrapped with `isBrowser` guard
- `ClientOnly` wrapper recommended for map components
- Transpilation configuration for Nuxt
- @maptiler/sdk excluded from SSR bundle (requires WebGL context)

### Performance Optimizations

| Optimization                      | Benefit                                          |
| --------------------------------- | ------------------------------------------------ |
| `shallowRef` for MapTiler objects | Reduces unnecessary reactivity tracking          |
| `markRaw` for native objects      | Prevents Vue from wrapping MapTiler SDK objects  |
| Automatic cleanup on unmount      | Zero memory leaks via defensive-in-depth pattern |
| Event listener deduplication      | Prevents duplicate handlers via factory adapter  |
| Tree-shakeable exports            | Import only what you use                         |

## Technical Specifications

### Dependencies

- **Vue 3**: `^3.0.0` (peer)
- **MapTiler SDK**: `^4.1.0` (peer — the app installs it, so one copy is shared)
- **TypeScript**: `^5.4.5` (dev — build and type generation)

### Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 15+
- Mobile browsers (iOS Safari 15+, Chrome Android)

### Build Output

- **ESM** (ES modules) - tree-shakeable, modern tooling, and the only format;
  `@maptiler/sdk` ships no UMD bundle and no browser global, so a UMD build of
  this package could not resolve its own peer dependency
- **TypeScript Declarations** - Full type support
- **CSS** - `dist/style.css`, this package's own rules only. MapTiler's own
  stylesheet is imported separately, the way MapTiler documents it.

### Package Size

Measured on the built `dist`, with `@maptiler/sdk` externalized — it is a peer
dependency, so it is never bundled in these numbers.

| Artifact        | Raw   | Gzipped |
| --------------- | ----- | ------- |
| ES entry chunks | 13 KB | 2.2 KB  |
| `style.css`     | 78 B  | —       |

The build is split per module and tree-shakeable, so an app pays for the
components and composables it imports rather than the figure above.

## Development Standards

### Code Quality

- **Framework**: TypeScript with strict mode
- **Testing**: vitest, 224 tests across 32 files, with a coverage ratchet
- **Linting**: ESLint with Vue 3 plugin
- **Formatting**: Prettier with consistent style

### Git Workflow

- **Main branch**: `master`, protected — changes land through pull requests
- **Commits**: Conventional commits with scope and emoji
- **PR reviews**: Required before merge to main

### Documentation

- **VitePress**: V1.6.4 documentation site
- **API Docs**: Auto-generated from component props/types
- **Examples**: Runnable examples with explanations
- **Guides**: Step-by-step tutorials and best practices

## Success Metrics

Only what the repository can prove. Adoption figures, frame rates and memory
ceilings were previously asserted here with nothing measuring them, so they are
gone rather than restated.

| Metric         | Current                                                   | Where it comes from                                                  |
| -------------- | --------------------------------------------------------- | -------------------------------------------------------------------- |
| Components     | 10                                                        | `libs/components`                                                    |
| Composables    | 38                                                        | exported from the package root, all auto-imported by the Nuxt module |
| Tests          | 32 test files                                             | `bun run test`                                                       |
| Coverage floor | 39% statements / 34% branches / 37% functions / 40% lines | ratchet in `vitest.config.ts`; CI fails if it drops                  |
| Type safety    | strict TypeScript, types generated on build               | `tsconfig.json`, `bun run build`                                     |

Coverage is low by design of the ratchet, not by target: it is the number the
suite actually reaches, and most layer, source and control composables still
have no tests. [`project-roadmap.md`](./project-roadmap.md) lists which.

## Roadmap

Owned by [`project-roadmap.md`](./project-roadmap.md). It tracks candidates
against verified gaps and deliberately commits to no dates.

## Integration Points

### External Dependencies

- **MapTiler SDK**: Core mapping engine
- **Vue 3**: Frontend framework
- **Nuxt 3**: Optional full-stack framework
- **TypeScript**: Optional type safety

### Known Limitations

1. **Expressions**: MapTiler expressions work but lack IDE type hints
2. **Style Functions**: Limited JS function support (compile to expressions)
3. **Private APIs**: Some MapTiler SDK internals may change between versions
4. **Browser APIs**: WebGL context required (no canvas fallback)

## Contributing

The project welcomes contributions including:

- Bug reports and fixes
- Feature requests and implementations
- Documentation improvements
- Example applications
- Framework integration

See [GitHub repository](https://github.com/danh121097/vue-maptiler-gl) for details.

## Author

**Danh Nguyen** - Lead developer and maintainer

- Portfolio: [harrynguyen.work](https://harrynguyen.work)
- GitHub: [@danh121097](https://github.com/danh121097)

## License

The project is licensed under the **MIT License** - see LICENSE file for details.
