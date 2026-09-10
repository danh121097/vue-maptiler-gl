# Installation

## Package Manager Installation

Vue3 MapTiler SDK is available on npm and can be installed using your preferred package manager.

Every command below installs two packages, because `@maptiler/sdk` is a peer dependency as of v2. npm and Bun would pull it in on their own, but Yarn and pnpm would not, and naming it explicitly is the one command that is correct everywhere — it also pins the MapTiler version your app runs against.

::: tip Why a peer dependency
This package re-exports MapTiler's own classes and types, and your app imports MapTiler's stylesheet directly. If both your app and this package resolved their own copy of `@maptiler/sdk`, a `Map` produced by one would fail an `instanceof` check in the other and two copies of the runtime would ship. Declaring it as a peer means there is exactly one, on a version you choose.
:::

Since v2 the two stylesheets are separate: this package ships only its own rules, and you import MapTiler's own stylesheet the way MapTiler documents it. A combined `dist/style-with-maptiler.css` is published for apps that would rather import one file. See [Stylesheets](#stylesheets).

::: warning pnpm
pnpm's isolated `node_modules` does not expose a dependency your app did not install itself, so `import '@maptiler/sdk/dist/maptiler-sdk.css'` fails unless `@maptiler/sdk` is in your own `package.json`. This has been true since v2 split the stylesheets, independently of the peer dependency. Importing [`vue3-maptiler-gl/dist/style-with-maptiler.css`](#stylesheets) sidesteps it, since that specifier resolves inside this package.
:::

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

## CDN Installation

You can use Vue MapTiler SDK from a CDN, but only as **ES modules**, and only
from a CDN that rewrites dependencies.

::: warning No UMD / classic `<script>` build
`@maptiler/sdk` ships an ES module only — its `package.json` exposes a single
`"import"` condition and no UMD bundle, so there is no global `maptilersdk`
script to load, and `require('@maptiler/sdk')` fails with
`ERR_PACKAGE_PATH_NOT_EXPORTED`. A UMD build of this package could therefore
never resolve its own peer dependency, so this package does not ship one
either: there is no `dist/index.umd.cjs` and no `require` export condition.
:::

::: warning A raw file CDN is not enough
The published modules import `vue` and `@maptiler/sdk` by bare name, the way
every npm package does. A browser cannot resolve a bare name, so loading
`unpkg.com/vue3-maptiler-gl/dist/index.js` straight into a `<script
type="module">` fails at the first import. Use an ESM CDN that rewrites those
specifiers — the example below uses [esm.sh](https://esm.sh) — or an import map
that names every dependency, or a bundler.
:::

```html
<link
  href="https://unpkg.com/@maptiler/sdk@4/dist/maptiler-sdk.css"
  rel="stylesheet"
/>
<link
  href="https://unpkg.com/vue3-maptiler-gl@2/dist/style.css"
  rel="stylesheet"
/>

<script type="module">
  import { createApp } from 'https://esm.sh/vue@3';
  import { MapTiler } from 'https://esm.sh/vue3-maptiler-gl@2';
</script>
```

Pin a major rather than `@latest`: an ESM CDN resolves the peer dependency for
you, and `@latest` lets it resolve a different Vue than the page already has,
which ends in two Vue runtimes and components that never mount.

## Stylesheets

The build externalises the MapTiler SDK entirely, so `dist/style.css` carries
only this package's own rules — the map container's sizing. The SDK's controls,
popups and markers are styled by the SDK's own stylesheet, and omitting it
produces an unstyled map rather than an error.

`dist/style-with-maptiler.css` is the SDK's stylesheet followed by this
package's, so one import covers both:

```js
import 'vue3-maptiler-gl/dist/style-with-maptiler.css';
```

Import `dist/style.css` instead when your app already loads
`@maptiler/sdk/dist/maptiler-sdk.css` — through another map library, a shared
stylesheet, or a `<link>` tag — so that ~103KB is not shipped twice:

```js
import '@maptiler/sdk/dist/maptiler-sdk.css';
import 'vue3-maptiler-gl/dist/style.css';
```

Never import both `style-with-maptiler.css` and `maptiler-sdk.css`; the second
copy wins on identical rules and changes nothing, but it doubles the CSS
payload.

## Setup in Vue 3

### Global Registration

Register the components globally in your main.js:

```js
import { createApp } from 'vue';
import VueMapTilerGl from 'vue3-maptiler-gl';
import '@maptiler/sdk/dist/maptiler-sdk.css';
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
  Popup,
} from 'vue3-maptiler-gl';
import '@maptiler/sdk/dist/maptiler-sdk.css';
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
  Popup,

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
  useFitBounds,
  useCameraForBounds,
  useZoomTo,
  useZoomIn,
  useZoomOut,
  useLogger,
} from 'vue3-maptiler-gl';
```

## TypeScript Support

Vue MapTiler SDK includes full TypeScript support. If you're using TypeScript, you'll get automatic type checking and IntelliSense support.

### Type Definitions

The package includes comprehensive type definitions for:

- All component props and events
- MapTiler SDK types
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
const mapStyle = ref<string | StyleSpecification>(
  'https://demotiles.maplibre.org/style.json',
);

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

Vue3 MapTiler SDK exports comprehensive TypeScript definitions:

Component prop types are **not** exported. Each component declares its props
interface locally, so `MapTilerProps`, `FillLayerProps` and the rest cannot be
imported — use `defineProps` inference in your own wrapper, or read the shapes
in the [components API reference](/api/components).

What is exported:

```typescript
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

// Re-exported MapTiler SDK Types
import type {
  Map,
  LngLat,
  LngLatLike,
  MapOptions,
  StyleSpecification,
  GeoJSONSourceSpecification,
} from 'vue3-maptiler-gl';
```

Raw MapTiler SDK **classes** come from the `/maptiler` subpath rather than the root. Keeping them off the root is what lets a bundler drop the MapTiler runtime when you only use components:

```ts
import {
  Map,
  NavigationControl,
  GeolocateControl,
  MapTilerMarker,
} from 'vue3-maptiler-gl/maptiler';
```

`Marker` and `Popup` are already used by Vue components, so the raw MapTiler SDK classes are available as `MapTilerMarker`, `MapTilerPopup`, or under the `maptilersdk` namespace:

```ts
import { MapTilerPopup, maptilersdk } from 'vue3-maptiler-gl/maptiler';

const popup = new MapTilerPopup();
const marker = new maptilersdk.Marker();
```

Importing them directly from `@maptiler/sdk` works just as well.

## Vite Configuration

If you're using Vite, you might need to add some configuration for optimal performance:

```js
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    include: ['@maptiler/sdk'],
  },
});
```

## Webpack Configuration

For Webpack users, you might need to configure module resolution:

```js
// webpack.config.js
module.exports = {
  resolve: {
    alias: {
      '@maptiler/sdk': '@maptiler/sdk/dist/maptiler-sdk.mjs',
    },
  },
};
```

## Nuxt 3 Setup

For Nuxt 3 applications, create a plugin:

```js
// plugins/vue-maptiler-gl.client.js
import VueMapTilerGl from 'vue3-maptiler-gl';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import 'vue3-maptiler-gl/dist/style.css';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueMapTilerGl);
});
```

## Troubleshooting

### Common Issues

1. **CSS not loading**: Import `vue3-maptiler-gl/dist/style-with-maptiler.css`, or both `@maptiler/sdk/dist/maptiler-sdk.css` and `vue3-maptiler-gl/dist/style.css`. See [Stylesheets](#stylesheets).
2. **Module not found**: `@maptiler/sdk` is a peer dependency, so reinstalling this package will not supply it — install it in your own app (`bun add @maptiler/sdk`)
3. **TypeScript errors**: Update your TypeScript configuration to include the package types

### Browser Compatibility

Vue MapTiler SDK supports all modern browsers that support:

- ES6+ features
- WebGL
- Vue 3

Minimum browser versions:

- Chrome 51+
- Firefox 53+
- Safari 10+
- Edge 79+
