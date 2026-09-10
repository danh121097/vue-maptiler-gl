# SSR / Nuxt

vue3-maptiler-gl is **SSR-safe out of the box**. Map creation is guarded with `isBrowser` checks and all `window.*` references have been removed.

## Why SSR Compatibility Matters

MapTiler SDK requires:

- WebGL context (browser exclusive)
- DOM manipulation (render phase only)
- window/document APIs

Without SSR guards, rendering on the server would fail. Vue3 MapTiler SDK handles this automatically.

## Nuxt Module (Recommended)

The official Nuxt module handles SSR configuration automatically. Install it for the best DX:

::: code-group

```bash [bun]
bun add nuxt-maptiler-gl
```

```bash [npm]
npm install nuxt-maptiler-gl
```

```bash [yarn]
yarn add nuxt-maptiler-gl
```

```bash [pnpm]
pnpm add nuxt-maptiler-gl
```

:::

### Setup

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-maptiler-gl'],

  maptiler: {
    /**
     * Auto-import vue3-maptiler-gl CSS styles
     * @default true
     */
    css: true,

    /**
     * Prefix for auto-imported composables
     * Set to 'map' to use mapUseMapTiler, mapUseFlyTo, etc.
     * @default '' (no prefix)
     */
    prefix: '',
  },
});
```

### Module Features

The module automatically configures:

1. **CSS Auto-Import** - `vue3-maptiler-gl/dist/style-with-maptiler.css` injected, which carries the SDK's own rules and the library's
2. **Component Auto-Import** - All 10 components available without imports
3. **Composable Auto-Import** - All 38 composables available without imports
4. **SSR Support** - Map components rendered only on client
5. **Build Configuration**:
   - vue3-maptiler-gl transpiled for SSR
   - @maptiler/sdk excluded from SSR bundle (requires WebGL)
   - vite.optimizeDeps.exclude configured

### Usage

With the module installed, use components and composables directly in templates/scripts without imports:

```vue
<template>
  <ClientOnly>
    <!-- Components available without imports -->
    <MapTiler :options="mapOptions" style="height: 500px">
      <GeoJsonSource :data="geoData">
        <FillLayer :style="fillStyle" />
      </GeoJsonSource>
    </MapTiler>
  </ClientOnly>
</template>

<script setup>
// No imports needed - all auto-imported by module
import { ref } from 'vue';

const mapOptions = ref({
  style: 'https://demotiles.maplibre.org/style.json',
  center: [0, 0],
  zoom: 2,
});

const geoData = ref({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [0, 0] },
      properties: { name: 'Center' },
    },
  ],
});

const fillStyle = ref({
  'fill-color': '#088',
  'fill-opacity': 0.8,
});

// Composables auto-imported
const { mapInstance, isMapReady } = useMapTiler();

watch(isMapReady, async () => {
  // Map is ready
  const { flyTo } = useFlyTo({ map: mapInstance });
  await flyTo({ center: [100, 50], zoom: 10 });
});
</script>
```

### Auto-Imported Composables

The Nuxt module auto-imports these composables by default:

```typescript
// Map Management
(useCreateMapTiler, useMapTiler, useMapTilerConfig);

// Camera Animations (7)
(useFlyTo,
  useEaseTo,
  useJumpTo,
  useFitBounds,
  useCameraForBounds,
  usePanBy,
  usePanTo,
  useZoomTo,
  // Zoom/Rotation (6)
  useZoomIn,
  useZoomOut,
  useRotateTo,
  useResetNorth,
  useResetNorthPitch,
  useSnapToNorth);

// Layers (4)
(useCreateFillLayer,
  useCreateCircleLayer,
  useCreateLineLayer,
  useCreateSymbolLayer);

// Events (3)
(useMapEventListener, useLayerEventListener, useGeolocateEventListener);

// Sources (2)
(useCreateGeoJsonSource, useGeoJsonSource);

// Controls
useGeolocateControl;
```

### Auto-Imported Components

```typescript
// Core
(MapTiler, GeoJsonSource);

// Layers (4)
(FillLayer, CircleLayer, LineLayer, SymbolLayer);

// Overlays
(Marker, Popup, Image);

// Controls
GeolocateControls;
```

### Using Composable Prefix

Optionally add a prefix to avoid conflicts:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  maptiler: {
    prefix: 'map',
  },
});
```

Then use with prefix:

```typescript
// Composables now prefixed
mapUseMapTiler(); // instead of useMapTiler()
mapUseFlyTo(); // instead of useFlyTo()
mapUseMapEventListener(); // instead of useMapEventListener()
```

## Manual Setup (Without Module)

If you prefer not to use the module, follow these steps:

### 1. Install Package

::: code-group

```bash [bun]
bun add vue3-maptiler-gl @maptiler/sdk
```

```bash [npm]
npm install vue3-maptiler-gl @maptiler/sdk
```

```bash [yarn]
yarn add vue3-maptiler-gl @maptiler/sdk
```

```bash [pnpm]
pnpm add vue3-maptiler-gl @maptiler/sdk
```

:::

### 2. Configure Nuxt

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  css: ['vue3-maptiler-gl/dist/style-with-maptiler.css'],
  build: {
    transpile: ['vue3-maptiler-gl'],
  },
  vite: {
    optimizeDeps: {
      exclude: ['@maptiler/sdk'],
    },
  },
});
```

### 3. Wrap Components in ClientOnly

```vue
<template>
  <!-- Critical: Wrap map components in ClientOnly -->
  <ClientOnly>
    <MapTiler :options="mapOptions" style="height: 500px">
      <GeoJsonSource :data="geoData">
        <FillLayer :style="fillStyle" />
      </GeoJsonSource>
    </MapTiler>
  </ClientOnly>
</template>

<script setup>
import { ref } from 'vue';
import { MapTiler, GeoJsonSource, FillLayer } from 'vue3-maptiler-gl';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import 'vue3-maptiler-gl/dist/style.css';

const mapOptions = ref({
  style: 'https://demotiles.maplibre.org/style.json',
  center: [0, 0],
  zoom: 2,
});

const geoData = ref({ type: 'FeatureCollection', features: [] });

const fillStyle = ref({ 'fill-color': '#088', 'fill-opacity': 0.8 });
</script>
```

## SSR Internals

Understanding what happens under the hood:

### Browser Guards

All components check `isBrowser` before creating map instances:

```typescript
import { isBrowser } from 'vue3-maptiler-gl';
import { Map } from 'vue3-maptiler-gl/maptiler';

if (isBrowser) {
  // Safe to create MapTiler instance
  const map = new Map({ container: el, style: 'url' });
}
// On server: skipped, no error
```

### @maptiler/sdk Exclusion

The @maptiler/sdk package is excluded from SSR bundling:

```typescript
// Usually removed from server bundle
import { Map, GeoJSONSource } from '@maptiler/sdk';
// Server: import fails gracefully (never called)
// Client: import succeeds (WebGL available)
```

### ClientOnly Wrapper

Ensures components only render in the browser:

```vue
<ClientOnly>
  <!-- Rendered only on client -->
  <MapTiler ... />
</ClientOnly>
<!-- Fallback shown during hydration -->
```

## Deployment Considerations

### Nuxt SSR Deployment (Cloudflare, Vercel, Netlify, etc.)

1. **Module handles everything** - Deploy as normal
2. **Check build logs** - Verify @maptiler/sdk excluded from server build
3. **Test locally first** - `nuxi generate` for static generation

### Hybrid Rendering (Nuxt)

Use route rules for optimal performance:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/maps/**': { swr: 3600 }, // ISR: revalidate hourly
  },
});
```

### Static Generation (SSG)

Maps can't be pre-rendered (client-only), use hybrid rendering:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    prerender: {
      crawlLinks: true,
      // Exclude map routes from prerendering
      ignore: ['/maps'],
    },
  },
});
```

## Troubleshooting

### "window is not defined"

**Cause**: Map component rendered on server

**Fix**: Wrap in `<ClientOnly>`

```vue
<ClientOnly>
  <MapTiler ... />
</ClientOnly>
```

### "WebGL context lost"

**Cause**: Usually transient, map recovers automatically

**Fix**: Use the `error` event (or the `onMapError` prop) to recover

```vue
<MapTiler :options="options" @error="handleMapError" />
```

### "@maptiler/sdk not found"

**Cause**: Not transpiled for SSR

**Fix**: Configure Nuxt

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  build: {
    transpile: ['vue3-maptiler-gl'],
  },
});
```

## Performance Tips

1. **Lazy load maps** - Use dynamic imports for map pages
2. **Use route preloading** - Prefetch map routes
3. **Optimize GeoJSON** - Simplify geometries before sending
4. **Enable data compression** - gzip GeoJSON responses
5. **Cache styles** - Browser cache map styles (long TTL)

## Further Reading

- [Nuxt SSR Documentation](https://nuxt.com/docs/guide/concepts/rendering)
- [MapTiler SDK Documentation](https://docs.maptiler.com/sdk-js/)
- [Nuxt Module Authoring](https://nuxt.com/docs/guide/going-further/modules)

```vue
<template>
  <ClientOnly>
    <MapTiler :options="mapOptions" style="height: 500px">
      <GeoJsonSource :data="geoData">
        <FillLayer :style="fillStyle" />
      </GeoJsonSource>
    </MapTiler>
  </ClientOnly>
</template>

<script setup>
import { ref } from 'vue';
import { MapTiler, GeoJsonSource, FillLayer } from 'vue3-maptiler-gl';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import 'vue3-maptiler-gl/dist/style.css';

const mapOptions = ref({
  style: 'https://demotiles.maplibre.org/style.json',
  center: [0, 0],
  zoom: 2,
});

const geoData = ref({ type: 'FeatureCollection', features: [] });
const fillStyle = ref({ 'fill-color': '#088', 'fill-opacity': 0.8 });
</script>
```

## Nuxt Config

If you encounter SSR build errors with @maptiler/sdk, add it to `noExternal`:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  vite: {
    optimizeDeps: {
      exclude: ['@maptiler/sdk'],
    },
  },
  // Transpile the library for SSR
  build: {
    transpile: ['vue3-maptiler-gl'],
  },
});
```

## How It Works

The library uses a simple `isBrowser` guard:

```typescript
// Exported from vue3-maptiler-gl
export const isBrowser =
  typeof window !== 'undefined' && typeof document !== 'undefined';
```

This guard is checked before:

- Map creation (`useCreateMapTiler`)
- Marker creation (`useCreateMarker`)
- Popup creation (`useCreatePopup`)

During SSR, these composables return early without creating DOM elements or WebGL contexts.

## Vue SPA (Non-Nuxt)

No special configuration needed. The library works normally in Vue SPA mode since `isBrowser` is always `true` in the browser.
