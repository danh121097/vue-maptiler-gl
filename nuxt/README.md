# nuxt-maptiler-gl

[![npm](https://img.shields.io/npm/v/nuxt-maptiler-gl)](https://www.npmjs.com/package/nuxt-maptiler-gl)

[Nuxt](https://nuxt.com) module for [vue3-maptiler-gl](https://github.com/danh121097/vue-maptiler-gl) — interactive maps with MapTiler SDK.

**📖 Full documentation: [vue-maptiler-gl.pages.dev](https://vue-maptiler-gl.pages.dev/)**

## Features

- Auto-import all 10 map components (MapTiler, GeoJsonSource, FillLayer, etc.)
- Auto-import 38 composables (useFlyTo, useMapEventListener, etc.)
- Auto-import CSS — no manual style import needed
- SSR-safe — components register client-only, composables have browser guards
- Zero configuration required

## Installation

### Using Bun (Recommended)

```bash
bun add nuxt-maptiler-gl
```

### Using npm

```bash
npm install nuxt-maptiler-gl
```

### Using Yarn

```bash
yarn add nuxt-maptiler-gl
```

### Using pnpm

```bash
pnpm add nuxt-maptiler-gl
```

## MapTiler API key

The key is **optional**. Any `http(s)` style URL is passed through untouched, so a
self-hosted or third-party keyless style works with no MapTiler account at all. You
need a key only for `maptiler://` styles, MapTiler Cloud style ids such as
`streets-v2`, or `api.maptiler.com` URLs.

Set it in a client plugin, before any map is created:

```ts
// plugins/maptiler.client.ts
export default defineNuxtPlugin(() => {
  useMapTilerConfig({ apiKey: 'YOUR_MAPTILER_CLOUD_KEY' });
});
```

`useMapTilerConfig` is auto-imported like every other composable. See
[Configuration](https://vue-maptiler-gl.pages.dev/guide/configuration).

## Setup

Add to `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-maptiler-gl'],

  // Optional configuration
  maptiler: {
    css: true, // auto-import CSS (default: true)
    prefix: '', // composable prefix (default: none)
  },
});
```

## Usage

Components and composables are auto-imported. Wrap map in `<ClientOnly>`:

```vue
<template>
  <ClientOnly>
    <MapTiler :options="mapOptions" style="height: 500px">
      <GeoJsonSource :data="geoData">
        <FillLayer :style="fillStyle" />
        <CircleLayer :style="circleStyle" />
      </GeoJsonSource>
      <Marker :lnglat="[0, 0]" :draggable="true" />
    </MapTiler>
  </ClientOnly>
</template>

<script setup>
const mapOptions = ref({
  style: 'https://demotiles.maplibre.org/style.json',
  center: [0, 0],
  zoom: 2,
});

const geoData = ref({
  type: 'FeatureCollection',
  features: [],
});

const fillStyle = ref({ 'fill-color': '#088', 'fill-opacity': 0.8 });
const circleStyle = ref({ 'circle-radius': 6, 'circle-color': '#007cbf' });
</script>
```

> **The SDK brings its own controls.** `MapOptions.navigationControl` and
> `MapOptions.geolocateControl` both default to `true`, so a bare `<MapTiler>` already
> shows zoom, compass and locate buttons. Pass `navigationControl: false` /
> `geolocateControl: false` in `:options` when you place your own.

## Auto-imported Components

| Component           | Description         |
| ------------------- | ------------------- |
| `MapTiler`          | Main map container  |
| `GeoJsonSource`     | GeoJSON data source |
| `FillLayer`         | Fill polygons       |
| `CircleLayer`       | Circle points       |
| `LineLayer`         | Line features       |
| `SymbolLayer`       | Icons and text      |
| `Marker`            | HTML markers        |
| `Popup`             | Popup windows       |
| `Image`             | Map images          |
| `GeolocateControls` | Geolocation         |

## Auto-imported Composables

All 38 composables from vue3-maptiler-gl are auto-imported:
`useCreateMapTiler`, `useFlyTo`, `useEaseTo`, `useJumpTo`, `useMapEventListener`, etc.
The full list with signatures is in the
[Composables API](https://vue-maptiler-gl.pages.dev/api/composables).

## Releasing

This module depends on `vue3-maptiler-gl` by version range, and both are published from the same repository. Release them in this order, from the repository root:

1. `bun run publish:vue` — publishes the root package.
2. `bun run publish:nuxt` — refuses to run until the `vue3-maptiler-gl` range in `nuxt/package.json` resolves on npm, then refreshes `nuxt/bun.lock`, builds, and publishes.

Neither script picks a version. Set `version` in the manifest yourself before releasing, so the bump reflects what actually changed — this module tracks `vue3-maptiler-gl` by major, so a new major there is a new major here.

Commit the refreshed `nuxt/bun.lock` afterwards.

## License

MIT
