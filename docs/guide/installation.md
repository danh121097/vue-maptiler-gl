# Installation

## Package Manager Installation

Vue3 MapTiler GL is available on npm and can be installed using your preferred package manager. The package includes all dependencies and is self-contained with bundled CSS.

### Using Yarn (Recommended)

```bash
yarn add vue3-maptiler-gl
```

### Using npm

```bash
npm install vue3-maptiler-gl
```

### Using pnpm

```bash
pnpm add vue3-maptiler-gl
```

## CDN Installation

You can also use Vue MapTiler GL directly from a CDN:

```html
<!-- Vue MapTiler GL (includes MapTiler GL JS) -->
<script src="https://unpkg.com/vue3-maptiler-gl@latest/dist/index.umd.cjs"></script>
<link
  href="https://unpkg.com/vue3-maptiler-gl@latest/dist/style.css"
  rel="stylesheet"
/>
```

## Setup in Vue 3

### Global Registration

Register the components globally in your main.js:

```js
import { createApp } from 'vue';
import VueMapTilerGl from 'vue3-maptiler-gl';
import 'vue3-maptiler-gl/dist/style.css';

const app = createApp(App);
app.use(VueMapTilerGl);
app.mount('#app');
```

### Local Registration (Recommended)

Import components as needed in your components for better tree-shaking:

```vue
<script setup>
import {
  MapTiler,
  GeoJsonSource,
  FillLayer,
  CircleLayer,
  Marker,
  PopUp,
} from 'vue3-maptiler-gl';
import 'vue3-maptiler-gl/dist/style.css';
</script>
```

### Available Components

All components are exported from the main package:

```js
import {
  // Main Components
  MapTiler,
  GeoJsonSource,

  // Layer Components
  FillLayer,
  CircleLayer,
  LineLayer,
  SymbolLayer,

  // Interactive Components
  Marker,
  PopUp,

  // Utility Components
  Image,
  GeolocateControls,

  // Composables
  useCreateMapTiler,
  useMapTiler,
  useCreateGeoJsonSource,
  useGeoJsonSource,
  useCreateFillLayer,
  useCreateCircleLayer,
  useCreateLineLayer,
  useCreateSymbolLayer,
  useGeolocateControl,
  useMapEventListener,
  useLayerEventListener,
  useFlyTo,
  useEaseTo,
  useJumpTo,
  useBounds,
  useZoom,
  useLogger,
} from 'vue3-maptiler-gl';
```

## TypeScript Support

Vue MapTiler GL includes full TypeScript support. If you're using TypeScript, you'll get automatic type checking and IntelliSense support.

### Type Definitions

The package includes comprehensive type definitions for:

- All component props and events
- MapTiler GL JS types
- Composable return types
- Configuration options

### Example with TypeScript

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { MapTiler, GeoJsonSource, FillLayer } from 'vue3-maptiler-gl';
import type {
  LngLatLike,
  StyleSpecification,
  FillLayerStyle,
  GeoJSONSourceSpecification,
} from 'vue3-maptiler-gl';

const center = ref<LngLatLike>([0, 0]);
const mapStyle = ref<string | StyleSpecification>('YOUR_STYLE');

const geoJsonData = ref<GeoJSONSourceSpecification['data']>({
  type: 'FeatureCollection',
  features: [],
});

const fillStyle = ref<FillLayerStyle>({
  'fill-color': '#088',
  'fill-opacity': 0.8,
});
</script>
```

### Type Definitions

Vue3 MapTiler GL exports comprehensive TypeScript definitions:

```typescript
// Component Props Types
import type {
  MapTilerProps,
  GeoJsonSourceProps,
  FillLayerProps,
  CircleLayerProps,
  LineLayerProps,
  SymbolLayerProps,
  MarkerProps,
  PopUpProps,
} from 'vue3-maptiler-gl';

// Style Types
import type {
  FillLayerStyle,
  CircleLayerStyle,
  LineLayerStyle,
  SymbolLayerStyle,
} from 'vue3-maptiler-gl';

// Composable Types
import type {
  CreateMapTilerActions,
  CreateGeoJsonSourceActions,
  CreateLayerActions,
} from 'vue3-maptiler-gl';

// Re-exported MapTiler GL Types
import type {
  Map,
  LngLat,
  LngLatLike,
  MapOptions,
  StyleSpecification,
  GeoJSONSourceSpecification,
} from 'vue3-maptiler-gl';
```

## Vite Configuration

If you're using Vite, you might need to add some configuration for optimal performance:

```js
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    include: ['maptiler-gl'],
  },
});
```

## Nuxt 3 Setup

For Nuxt 3 applications, create a plugin:

```js
import VueMapTilerGl from 'vue3-maptiler-gl';
import 'vue3-maptiler-gl/dist/style.css';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueMapTilerGl);
});
```

## Troubleshooting

### Common Issues

1. **CSS not loading**: Make sure to import the MapTiler GL CSS file
2. **Module not found**: Ensure both `vue3-maptiler-gl` and `@maptiler/sdk` are installed
3. **TypeScript errors**: Update your TypeScript configuration to include the package types

### Browser Compatibility

Vue MapTiler GL supports all modern browsers that support:

- ES6+ features
- WebGL
- Vue 3

Minimum browser versions:

- Chrome 51+
- Firefox 53+
- Safari 10+
- Edge 79+
