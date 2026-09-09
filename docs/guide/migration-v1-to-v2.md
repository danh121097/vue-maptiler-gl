# Migration from v1 to v2

v2 rebuilds this package on the API of [`vue3-maplibre-gl`](https://github.com/danh121097/vue-maplibre-gl) v6, swapping the engine for the [MapTiler SDK](https://docs.maptiler.com/sdk-js/). Everything that library offers is now here, under MapTiler names.

That brings in every change from its own v4 → v5 → v6 history at once, so read [Migration from v4](/guide/migration-v5) and [Migration from v5](/guide/migration-v6) as well — the reactivity fix described there is the largest behavioural change in this release.

Three breaking changes are specific to _this_ package and are not covered by those pages.

## 1. The stylesheet is no longer imported for you

v1 shipped `libs/style.css` and pulled it in from the package entry point:

```
// v1 - libs/index.ts
import './style.css';
```

That made a CSS import a side effect of importing any component, which defeats tree-shaking for consumers who bundle their own styles. v2 drops the file. Component styles now live in each SFC's `<style>` block, exactly as upstream ships them, and the map's own chrome comes from the SDK.

Import both stylesheets yourself, once, at your application entry:

```ts
import '@maptiler/sdk/dist/maptiler-sdk.css';
import 'vue3-maptiler-gl/dist/style.css';
```

Miss the first and controls, markers and popups render unstyled. The `vue3-maptiler-gl/style.css` export subpath still resolves, so an existing import of it keeps working.

<!-- names-skip: a v1 export this page exists to say was removed -->

## 2. `useOptimizedComputed` is gone

<!-- names-skip: a v1 export this page exists to say was removed -->

v1 exported a `useOptimizedComputed` helper that has no counterpart upstream. It was a thin wrapper over Vue's own `computed`, and Vue already caches and invalidates computed values on its own, so the wrapper bought nothing that the framework does not.

Replace it with `computed` from Vue:

```ts
import { computed, ref } from 'vue';

const zoom = ref(12);
const label = computed(() => `zoom ${zoom.value}`);
```

## 3. An inline style **object** no longer works in the map constructor

This one is a limitation of the MapTiler SDK rather than a decision taken here, and it is silent, which makes it worth spelling out: the map simply never loads, `getStyle()` returns `undefined`, and nothing throws.

The SDK routes the constructor's `style` through an internal converter that understands a URL string, a `MapStyleVariant` and a `ReferenceMapStyle`. A plain [`StyleSpecification`](https://maplibre.org/maplibre-style-spec/) object falls through it and yields `undefined`. MapLibre accepts one; the SDK does not.

So this stops working:

```
// Silently renders nothing under the MapTiler SDK.
const options = { container: 'map', style: { version: 8, sources: {}, layers: [] } };
```

Pass a URL, a MapTiler Cloud style id, or a `ReferenceMapStyle` instead:

```ts
import type { MapOptions } from 'vue3-maptiler-gl';

const options: MapOptions = {
  container: 'map',
  style: 'https://tiles.openfreemap.org/styles/liberty',
};
```

If you must build the style as an object, construct the map first and apply it afterwards — `setStyle()` accepts an object normally:

```ts
import type { StyleSpecification } from '@maptiler/sdk';
import { useMapTiler } from 'vue3-maptiler-gl';

const style: StyleSpecification = { version: 8, sources: {}, layers: [] };
const { setStyle } = useMapTiler();

function applyStyle() {
  setStyle(style);
}
```

## What is new: `apiKey`

MapTiler Cloud styles need an API key, which MapLibre had no concept of. `useMapTilerConfig` accepts one and applies it globally before any request goes out:

```ts
import { useMapTilerConfig } from 'vue3-maptiler-gl';

useMapTilerConfig({ apiKey: 'YOUR_MAPTILER_CLOUD_KEY' });
```

The key is **optional**. Any `http(s)` style URL is passed through untouched, so a self-hosted or third-party keyless style works with no MapTiler account at all — which is why the package default is a keyless style rather than a Cloud one. You only need a key to use `maptiler://` styles, MapTiler Cloud style ids such as `streets-v2`, or `api.maptiler.com` URLs.

See [Configuration](/guide/configuration) for where the key can be set and how a per-map override behaves.
