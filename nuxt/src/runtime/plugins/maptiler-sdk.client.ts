import { defineNuxtPlugin } from '#app';
import {
  MapTiler,
  GeoJsonSource,
  FillLayer,
  CircleLayer,
  LineLayer,
  SymbolLayer,
  Marker,
  Popup,
  Image,
  GeolocateControls,
} from 'vue3-maptiler-gl';

/**
 * Client-only plugin that registers vue3-maptiler-gl components globally.
 * Runs only in browser — MapTiler SDK requires WebGL/canvas.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const components = {
    MapTiler,
    GeoJsonSource,
    FillLayer,
    CircleLayer,
    LineLayer,
    SymbolLayer,
    Marker,
    Popup,
    Image: Image,
    GeolocateControls,
  };

  for (const [name, component] of Object.entries(components)) {
    nuxtApp.vueApp.component(name, component as any);
  }
});
