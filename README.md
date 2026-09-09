# Vue3 MapTiler SDK

[![npm](https://img.shields.io/npm/v/vue3-maptiler-gl)](https://www.npmjs.com/package/vue3-maptiler-gl) [![Downloads](https://img.shields.io/npm/dt/vue3-maptiler-gl)](https://www.npmjs.com/package/vue3-maptiler-gl) [![Stars](https://img.shields.io/github/stars/danh121097/vue-maptiler-gl?style=flat-square)](https://github.com/danh121097/vue-maptiler-gl/stargazers) [![License](https://img.shields.io/npm/l/vue3-maptiler-gl)](https://github.com/danh121097/vue-maptiler-gl/blob/master/LICENSE)

> **The most comprehensive Vue 3 library for MapTiler SDK** — build interactive maps with 10 components and 38 composables

A Vue 3 component library that gives you a reactive, declarative way to build interactive maps on the [MapTiler SDK](https://docs.maptiler.com/sdk-js/).

`@maptiler/sdk` is a peer dependency, re-exported from this package so your app and this one always share a single copy of the MapTiler runtime. npm and Bun install it on their own; Yarn and pnpm do not, so the commands below name it explicitly.

**📖 Full documentation: [vue-maptiler-gl.pages.dev](https://vue-maptiler-gl.pages.dev/)**

## ✨ Features

- 🗺️ **Interactive maps** — high-performance vector tiles rendered with WebGL
- 🧩 **10 Vue components** — MapTiler, GeoJsonSource, FillLayer, CircleLayer, LineLayer, SymbolLayer, Marker, Popup, Image, GeolocateControls
- 🔧 **38 composables** — map lifecycle, camera animation, layers, sources, events and utilities
- 🎯 **Full TypeScript support** — comprehensive type definitions, with MapTiler's own types re-exported
- ⚡ **Automatic cleanup** — every composable tears down its map resources on unmount
- 📱 **Mobile-friendly** — touch controls and responsive sizing
- 🟢 **Nuxt module** — [`nuxt-maptiler-gl`](https://www.npmjs.com/package/nuxt-maptiler-gl) auto-imports everything, SSR-safe
- 🔄 **Reactive by default** — props, styles and data are watched and applied to the live map

## 📦 Installation

Requires Vue `^3.0.0` and `@maptiler/sdk` `^4.1.0`.

```bash
# bun (recommended)
bun add vue3-maptiler-gl @maptiler/sdk

# npm
npm install vue3-maptiler-gl @maptiler/sdk

# yarn
yarn add vue3-maptiler-gl @maptiler/sdk

# pnpm
pnpm add vue3-maptiler-gl @maptiler/sdk
```

### Import the stylesheets

Both are required, and neither is imported for you — importing CSS as a side effect of importing a component would defeat tree-shaking. Do this once, at your application entry:

```ts
import '@maptiler/sdk/dist/maptiler-sdk.css';
import 'vue3-maptiler-gl/dist/style.css';
```

Skip the first and controls, markers and popups render unstyled.

> **ESM only.** `@maptiler/sdk` ships an ES module and nothing else — its `exports` map offers a single `"import"` condition and no browser global — so this package ships no UMD build and cannot be loaded from a plain `<script>` tag. For a CDN setup that works, see [Installation](https://vue-maptiler-gl.pages.dev/guide/installation).

## 🔑 MapTiler API key

The key is **optional**. Any `http(s)` style URL is passed through untouched, so a self-hosted or third-party keyless style works with no MapTiler account at all — which is why the package default is a keyless style.

You need a key only for `maptiler://` styles, MapTiler Cloud style ids such as `streets-v2`, or `api.maptiler.com` URLs. Set it once, before any map is created:

```ts
import { useMapTilerConfig } from 'vue3-maptiler-gl';

useMapTilerConfig({ apiKey: 'YOUR_MAPTILER_CLOUD_KEY' });
```

See [Configuration](https://vue-maptiler-gl.pages.dev/guide/configuration) for where the key can be set and how a per-map override behaves.

## 🚀 Quick start

```vue
<template>
  <MapTiler :options="mapOptions" style="height: 500px" @load="onMapLoad">
    <!-- GeoJSON data source -->
    <GeoJsonSource :data="geoJsonData">
      <FillLayer :style="fillStyle" />
      <CircleLayer :style="circleStyle" />
    </GeoJsonSource>

    <!-- Interactive marker -->
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

    <!-- Geolocation control -->
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

const fillStyle = ref({ 'fill-color': '#088', 'fill-opacity': 0.8 });
const circleStyle = ref({ 'circle-radius': 6, 'circle-color': '#007cbf' });

function onMapLoad(map) {
  console.log('Map loaded:', map);
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

> **The SDK brings its own controls.** `MapOptions.navigationControl` and `MapOptions.geolocateControl` both default to `true`, so a bare `<MapTiler>` already shows zoom, compass and locate buttons. Pass `navigationControl: false` / `geolocateControl: false` when you place your own.

> **An inline style object does not work in the constructor.** The SDK's `style` option accepts a URL string, a MapTiler Cloud style id or a `ReferenceMapStyle` — a plain `StyleSpecification` object silently yields no map. Build the map first and call `setStyle()` with the object instead. See [Migration v1 → v2](https://vue-maptiler-gl.pages.dev/guide/migration-v1-to-v2).

## 🟢 Nuxt

Use the [`nuxt-maptiler-gl`](https://www.npmjs.com/package/nuxt-maptiler-gl) module — it auto-imports all 10 components and all 38 composables, pulls in both stylesheets, and keeps the map client-only for SSR.

```bash
bun add nuxt-maptiler-gl
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-maptiler-gl'],
});
```

```vue
<template>
  <ClientOnly>
    <MapTiler :options="{ center: [0, 0], zoom: 2 }" style="height: 500px" />
  </ClientOnly>
</template>
```

No imports needed. See [SSR & Nuxt](https://vue-maptiler-gl.pages.dev/guide/ssr-nuxt) for configuration options and the full setup.

## 🧩 Components

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

Full props, slots and events: [Components API](https://vue-maptiler-gl.pages.dev/api/components).

## 🔧 Composables

All 38, grouped by what they do:

**Map instance** — `useCreateMapTiler`, `useMapTiler`, `useMapTilerConfig`

**Layers** — `useCreateLayer`, `useCreateFillLayer`, `useCreateCircleLayer`, `useCreateLineLayer`, `useCreateSymbolLayer`, `useLayer`

**Sources** — `useCreateGeoJsonSource`, `useGeoJsonSource`

**Map objects** — `useCreateMarker`, `useCreatePopup`, `useCreateImage`

**Controls** — `useGeolocateControl`

**Events** — `useMapEventListener`, `useLayerEventListener`, `useGeolocateEventListener`, `useMapReloadEvent`

**Camera** — `useFlyTo`, `useEaseTo`, `useJumpTo`, `useFitBounds`, `useFitScreenCoordinates`, `useCameraForBounds`, `useZoomTo`, `useZoomIn`, `useZoomOut`, `usePanBy`, `usePanTo`, `useRotateTo`, `useResetNorth`, `useResetNorthPitch`, `useSnapToNorth`

**Utilities** — `useDebounce`, `useDebouncedRef`, `useDebouncedWatch`, `useLogger`

Signatures and return types: [Composables API](https://vue-maptiler-gl.pages.dev/api/composables).

## 🎯 TypeScript

```typescript
import { ref } from 'vue';
import {
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

## 🌟 Composables example

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

const { mapInstance } = useCreateMapTiler(mapContainer, mapStyle, {
  onLoad: (map) => console.log('Map loaded:', map),
  onError: (error) => console.error('Map error:', error),
  debug: true,
});

const { flyTo } = useFlyTo({ map: mapInstance });

const { setData } = useCreateGeoJsonSource({
  map: mapInstance,
  id: 'my-source',
  data: { type: 'FeatureCollection', features: [] },
});

useMapEventListener({
  map: mapInstance,
  event: 'click',
  on: (event) => {
    flyTo({ center: event.lngLat, zoom: 12, duration: 2000 });
  },
});
</script>
```

## 📚 Documentation

- **[Getting Started](https://vue-maptiler-gl.pages.dev/guide/getting-started)** — learn the basics and see examples
- **[Installation](https://vue-maptiler-gl.pages.dev/guide/installation)** — detailed setup, including CDN
- **[Configuration](https://vue-maptiler-gl.pages.dev/guide/configuration)** — API key, global config, per-map overrides
- **[SSR & Nuxt](https://vue-maptiler-gl.pages.dev/guide/ssr-nuxt)** — server-side rendering and the Nuxt module
- **[Migration v1 → v2](https://vue-maptiler-gl.pages.dev/guide/migration-v1-to-v2)** — breaking changes and how to move
- **[Components API](https://vue-maptiler-gl.pages.dev/api/components)** — complete component reference
- **[Composables API](https://vue-maptiler-gl.pages.dev/api/composables)** — all 38 composables
- **[TypeScript Types](https://vue-maptiler-gl.pages.dev/api/types)** — type definitions
- **[Live Examples](https://vue-maptiler-gl.pages.dev/examples/)** — interactive demos

## 🛠️ Development

```bash
git clone https://github.com/danh121097/vue-maptiler-gl.git
cd vue-maptiler-gl

bun install      # install dependencies
bun run dev      # start the example app
bun run test     # run the unit test suite
bun run build    # build the library
bun run docs:dev # run the documentation site
```

## 🤝 Contributing

Contributions are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

MIT — see [LICENSE](LICENSE).

Built on the [MapTiler SDK](https://docs.maptiler.com/sdk-js/) (BSD-3-Clause), which wraps [MapLibre GL JS](https://maplibre.org/) and adds MapTiler Cloud styles, geocoding and helpers.

## 📞 Support

- 📖 [Documentation](https://vue-maptiler-gl.pages.dev/) — guides and API reference
- 🐛 [Issues](https://github.com/danh121097/vue-maptiler-gl/issues) — bug reports and feature requests
- 💬 [Discussions](https://github.com/danh121097/vue-maptiler-gl/discussions) — questions and community
- ⭐ [GitHub](https://github.com/danh121097/vue-maptiler-gl) — star the project if you find it useful

---

**Made with ❤️ for the Vue.js community**
