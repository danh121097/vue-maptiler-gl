# Vue3 MapTiler SDK

[![npm](https://img.shields.io/npm/v/vue3-maptiler-gl)](https://www.npmjs.com/package/vue3-maptiler-gl) [![Downloads](https://img.shields.io/npm/dt/vue3-maptiler-gl)](https://www.npmjs.com/package/vue3-maptiler-gl) [![Stars](https://img.shields.io/github/stars/danh121097/vue-maptiler-gl?style=flat-square)](https://github.com/danh121097/vue-maptiler-gl/stargazers) [![License](https://img.shields.io/npm/l/vue3-maptiler-gl)](https://github.com/danh121097/vue-maptiler-gl/blob/master/LICENSE)

> **The most comprehensive Vue 3 library for MapTiler SDK** - Build interactive maps with 10 components and 38 composables

A powerful, feature-rich Vue 3 component library that provides an intuitive, reactive way to build interactive maps in your Vue applications using MapTiler SDK.

`@maptiler/sdk` is a peer dependency, re-exported from this package so your app and this one always share a single copy of the MapTiler runtime. npm and Bun would install it on their own; Yarn and pnpm would not, so the commands below name it explicitly.

**Requirements:** Vue `^3.0.0` and `@maptiler/sdk` `^4.1.0`, both peer dependencies.

**Using Nuxt?** Install [`nuxt-maptiler-gl`](https://www.npmjs.com/package/nuxt-maptiler-gl) instead — it wraps this package with auto-imports, CSS injection, and the SSR configuration the MapTiler SDK needs.

**API key:** optional. Any `http(s)` style URL is passed through untouched, so a keyless style works with no MapTiler account — which is why the package default is one. You need a key only for `maptiler://` styles, Cloud style ids such as `streets-v2`, or `api.maptiler.com` URLs; set it with `useMapTilerConfig({ apiKey })`. See [Configuration](https://vue-maptiler-gl.pages.dev/guide/configuration).

## ✨ Features

- 🗺️ **Interactive Maps** - High-performance vector maps with WebGL rendering
- 🧩 **10 Vue Components** - MapTiler, GeoJsonSource, FillLayer, CircleLayer, LineLayer, SymbolLayer, Marker, Popup, Image, GeolocateControls
- 🔧 **38 Composables** - Complete map management, animations, events, and utilities
- 🎯 **Full TypeScript Support** - Comprehensive type definitions and interfaces
- ⚡ **High Performance** - Optimized rendering with automatic resource cleanup
- 📱 **Mobile-Friendly** - Touch controls and responsive design for all devices
- 🌐 **Self-Contained** - Bundled CSS and automatic dependency management
- 🔄 **Reactive Data Binding** - Seamless integration with Vue 3's reactivity system

## 📦 Installation

### Using Bun (Recommended)

```bash
bun add vue3-maptiler-gl @maptiler/sdk
```

### Using npm

```bash
npm install vue3-maptiler-gl @maptiler/sdk
```

### Using Yarn

```bash
yarn add vue3-maptiler-gl @maptiler/sdk
```

### Using pnpm

```bash
pnpm add vue3-maptiler-gl @maptiler/sdk
```

Both stylesheets are required and neither is imported for you — importing CSS as a side effect of importing a component would defeat tree-shaking. Do this once, at your application entry; skip the first and controls, markers and popups render unstyled.

```ts
import '@maptiler/sdk/dist/maptiler-sdk.css';
import 'vue3-maptiler-gl/dist/style.css';
```

> **ESM only.** `@maptiler/sdk` ships an ES module and nothing else — its `exports` map offers a single `"import"` condition and no browser global — so this package ships no UMD build and cannot be loaded from a plain `<script>` tag. See [Installation](https://vue-maptiler-gl.pages.dev/guide/installation) for a CDN setup that works.

## 🚀 Quick Start

```vue
<template>
  <MapTiler :options="mapOptions" style="height: 500px" @load="onMapLoad">
    <!-- GeoJSON Data Source -->
    <GeoJsonSource :data="geoJsonData">
      <FillLayer :style="fillStyle" />
      <CircleLayer :style="circleStyle" />
    </GeoJsonSource>

    <!-- Interactive Marker -->
    <Marker :lnglat="[0, 0]" :draggable="true">
      <div class="marker">📍</div>
    </Marker>

    <!-- Popup -->
    <Popup :lnglat="[0, 0]" :show="true">
      <div class="popup-content">
        <h3>Welcome to Vue3 MapTiler SDK!</h3>
        <p>Interactive maps made easy with Vue 3</p>
      </div>
    </Popup>

    <!-- Geolocation Control -->
    <GeolocateControls position="top-right" />
  </MapTiler>
</template>

<script setup>
import { ref } from 'vue';
import {
  MapTiler,
  GeoJsonSource,
  FillLayer,
  CircleLayer,
  Marker,
  Popup,
  GeolocateControls,
} from 'vue3-maptiler-gl';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import 'vue3-maptiler-gl/dist/style.css';

const mapOptions = ref({
  style: 'https://demotiles.maplibre.org/style.json',
  center: [0, 0],
  zoom: 2,
  // The SDK adds its own locate button by default; turn it off so
  // <GeolocateControls> above does not render a second one.
  geolocateControl: false,
});

const geoJsonData = ref({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [0, 0] },
      properties: { name: 'Sample Point' },
    },
  ],
});

const fillStyle = ref({
  'fill-color': '#088',
  'fill-opacity': 0.8,
});

const circleStyle = ref({
  'circle-radius': 6,
  'circle-color': '#007cbf',
});

function onMapLoad(event) {
  // `@load` forwards the SDK's own event. The map is `event.target`; the
  // `onMapLoad` prop is the one that receives the map directly.
  console.log('Map loaded:', event.target);
}
</script>

<style>
.marker {
  font-size: 24px;
  cursor: pointer;
}

.popup-content {
  padding: 10px;
  max-width: 200px;
}
</style>
```

> **The SDK brings its own controls.** `MapOptions.navigationControl` and `MapOptions.geolocateControl` both default to `true`, where MapLibre adds none, so a bare `<MapTiler>` already shows zoom, compass and locate buttons. Pass `navigationControl: false` / `geolocateControl: false` when you place your own.

> **An inline style object does not work in the constructor.** The SDK's `style` option accepts a URL string, a MapTiler Cloud style id or a `ReferenceMapStyle`; a plain `StyleSpecification` object silently yields no map. Build the map first and call `setStyle()` with the object instead. See [Migration v1 → v2](https://vue-maptiler-gl.pages.dev/guide/migration-v1-to-v2).

## 🧩 Components

All 10 components are reactive and register themselves with the map they are nested in:

| Component             | Description                                                   |
| --------------------- | ------------------------------------------------------------- |
| **MapTiler**          | Main map container with comprehensive event handling          |
| **GeoJsonSource**     | Reactive data source for GeoJSON data with clustering support |
| **FillLayer**         | Render filled polygons with customizable styling              |
| **CircleLayer**       | Display point data as circles with dynamic sizing             |
| **LineLayer**         | Render linear features like routes and boundaries             |
| **SymbolLayer**       | Display icons and text labels                                 |
| **Marker**            | HTML markers with drag support and custom content             |
| **Popup**             | Interactive popup windows with custom HTML                    |
| **Image**             | Manage and load images for map styles                         |
| **GeolocateControls** | User location tracking with comprehensive events              |

## 🔧 Composables

All 38 composables are exported from the package root, and every component in
the table above is built out of them — reach for one when you want the behaviour
without the component:

### Map

- `useCreateMapTiler` - Create and manage a map instance, with status and error state
- `useMapTiler` - Hold a map created elsewhere; pass it what `<MapTiler>` emits from `@register`
- `useMapTilerConfig` - Global MapTiler settings, including `apiKey`, set once at app startup
- `useCreateMarker` - Marker creation and lifecycle
- `useCreatePopup` - Popup creation and lifecycle
- `useCreateImage` - Load and manage style images
- `useLayer` - Hold a layer created elsewhere, with reactive status and style setters

### Layers

- `useCreateLayer` - Generic layer creation for any layer type
- `useCreateFillLayer` - Fill layer for polygons
- `useCreateCircleLayer` - Circle layer for point data
- `useCreateLineLayer` - Line layer for linear features
- `useCreateSymbolLayer` - Symbol layer for icons and text

### Sources

- `useCreateGeoJsonSource` - GeoJSON source with reactive data
- `useGeoJsonSource` - Hold a GeoJSON source created elsewhere, with error handling

### Controls

- `useGeolocateControl` - User location tracking control

### Events

- `useMapEventListener` - Map events, typed by event name
- `useLayerEventListener` - Layer-scoped events
- `useGeolocateEventListener` - Geolocate control events
- `useMapReloadEvent` - Re-run work after a style reload

### Camera

- `usePanBy` / `usePanTo` - Pan by an offset, or to a coordinate
- `useRotateTo` / `useSnapToNorth` / `useResetNorth` / `useResetNorthPitch` - Bearing and pitch
- `useZoomIn` / `useZoomOut` / `useZoomTo` - Zoom control
- `useFitBounds` / `useCameraForBounds` - Fit the camera to a bounding box
- `useFitScreenCoordinates` - Fit the camera to two screen points

### Animations and utilities

- `useFlyTo` - Curved fly-to animation
- `useEaseTo` - Eased camera transition
- `useJumpTo` - Instant camera move
- `useLogger` - Logging gated on a `debug` flag

### Performance

- `useDebounce` - Debounce a function
- `useDebouncedRef` - Immediate and debounced views of one value
- `useDebouncedWatch` - Debounced `watch`

Full signatures and return types: [Composables API](https://vue-maptiler-gl.pages.dev/api/composables).

## 🎯 TypeScript Support

Vue3 MapTiler SDK includes comprehensive TypeScript support:

```typescript
import { ref } from 'vue';
import {
  MapTiler,
  GeoJsonSource,
  FillLayer,
  type MapOptions,
  type FillLayerStyle,
  type GeoJSONSourceSpecification,
} from 'vue3-maptiler-gl';

const mapOptions = ref<Partial<MapOptions>>({
  style: 'https://demotiles.maplibre.org/style.json',
  center: [0, 0],
  zoom: 2,
});

const fillStyle = ref<FillLayerStyle>({
  'fill-color': '#088',
  'fill-opacity': 0.8,
});

const geoJsonData = ref<GeoJSONSourceSpecification['data']>({
  type: 'FeatureCollection',
  features: [],
});
```

MapTiler SDK **types** come from the package root, because types cost nothing at runtime:

```typescript
import type { Map, MapOptions, StyleSpecification } from 'vue3-maptiler-gl';
```

MapTiler SDK **runtime classes** live on the `/maptiler` subpath, so importing a component from the root does not pin the whole MapTiler runtime into your bundle:

```typescript
import {
  Map,
  NavigationControl,
  MapTilerMarker,
} from 'vue3-maptiler-gl/maptiler';
```

`Marker` and `Popup` collide with the Vue components of the same name, so they are re-exported as `MapTilerMarker` / `MapTilerPopup` — or reach them through the namespace:

```typescript
import { MapTilerPopup, maptilersdk } from 'vue3-maptiler-gl/maptiler';
import { Marker } from 'vue3-maptiler-gl';

const popup = new MapTilerPopup();
const marker = new maptilersdk.Marker();
```

`Marker` in the example above is the Vue component; importing straight from `@maptiler/sdk` works too.

## 🌟 Advanced Example with Composables

```vue
<template>
  <div ref="mapContainer" style="height: 500px" />
</template>

<script setup>
import { ref } from 'vue';
import {
  useCreateMapTiler,
  useFlyTo,
  useMapEventListener,
  useCreateGeoJsonSource,
} from 'vue3-maptiler-gl';

// The map initializes itself as soon as this ref resolves to an element.
const mapContainer = ref();
const mapStyle = ref('https://demotiles.maplibre.org/style.json');

// Create map with enhanced error handling
const { mapInstance, setCenter, setZoom } = useCreateMapTiler(
  mapContainer,
  mapStyle,
  {
    onLoad: (map) => console.log('Map loaded:', map),
    onError: (error) => console.error('Map error:', error),
    debug: true,
  },
);

// Add smooth animations
const { flyTo } = useFlyTo({ map: mapInstance });

// Create reactive data source
const { setData } = useCreateGeoJsonSource({
  map: mapInstance,
  id: 'my-source',
  data: { type: 'FeatureCollection', features: [] },
});

// Listen to map events
useMapEventListener({
  map: mapInstance,
  event: 'click',
  on: (event) => {
    flyTo({
      center: event.lngLat,
      zoom: 12,
      duration: 2000,
    });
  },
});
</script>
```

## 📚 Documentation

- **[Getting Started](https://vue-maptiler-gl.pages.dev/guide/getting-started)** - Learn the basics and see examples
- **[Installation Guide](https://vue-maptiler-gl.pages.dev/guide/installation)** - Detailed setup instructions
- **[Configuration](https://vue-maptiler-gl.pages.dev/guide/configuration)** - API key, global config, per-map overrides
- **[Components API](https://vue-maptiler-gl.pages.dev/api/components)** - Complete component documentation
- **[Composables API](https://vue-maptiler-gl.pages.dev/api/composables)** - Composables reference
- **[TypeScript Types](https://vue-maptiler-gl.pages.dev/api/types)** - Type definitions
- **[SSR / Nuxt](https://vue-maptiler-gl.pages.dev/guide/ssr-nuxt)** - Server-side rendering and the Nuxt module
- **[Migration v1 → v2](https://vue-maptiler-gl.pages.dev/guide/migration-v1-to-v2)** - Breaking changes and how to move
- **[Live Examples](https://vue-maptiler-gl.pages.dev/examples/)** - Interactive demos

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/danh121097/vue-maptiler-gl.git
cd vue-maptiler-gl

# Install dependencies
bun install

# Start development server
bun run dev

# Build the library
bun run build

# Run documentation
bun run docs:dev
```

## 🌟 Why Choose Vue3 MapTiler SDK?

- **🎯 Vue 3 Native** - Built specifically for Vue 3 with Composition API support
- **🗺️ MapTiler SDK** - MapLibre's WebGL rendering plus MapTiler Cloud styles and helpers
- **🧩 Component-Based** - 10 Vue components for maps, layers, sources, markers, and controls
- **🔧 Powerful Composables** - 38 composables for map management, animations, and utilities
- **📚 Comprehensive Documentation** - Detailed guides, API references, and examples
- **⚡ High Performance** - Optimized for performance with automatic resource cleanup
- **🌐 Open Source** - MIT licensed with active community support
- **📱 Mobile Ready** - Touch-friendly controls and responsive design

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

The Development section above has the clone-and-run steps. Before opening a pull request:

```bash
bun run test
bun run type-check
bun run lint:check
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on top of the [MapTiler SDK](https://docs.maptiler.com/sdk-js/) (BSD-3-Clause), which wraps [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/) and adds MapTiler Cloud styles, geocoding and helpers
- Ported from [vue3-maplibre-gl](https://github.com/danh121097/vue-maplibre-gl), whose API this package mirrors
- Thanks to all contributors and users who make this project better

## 📞 Support

- 📖 [Documentation](https://vue-maptiler-gl.pages.dev/) - Comprehensive guides and API reference
- 🐛 [Issues](https://github.com/danh121097/vue-maptiler-gl/issues) - Bug reports and feature requests
- 💬 [Discussions](https://github.com/danh121097/vue-maptiler-gl/discussions) - Community discussions and questions
- ⭐ [GitHub](https://github.com/danh121097/vue-maptiler-gl) - Star the project if you find it useful!

---

**Made with ❤️ for the Vue.js community**
