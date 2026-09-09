<script lang="ts" setup>
import { computed } from 'vue';
import {
  GeolocateControls,
  MapTiler,
  useMapTiler,
  type MapOptions,
} from 'vue3-maptiler-gl';
import '@maptiler/sdk/dist/maptiler-sdk.css';
// A consumer also imports the package stylesheet, 'vue3-maptiler-gl/dist/style.css'.
// This demo resolves the package to libs/ (see vite.config.ts), where that
// stylesheet is the <style> block of MapTiler.vue and the component applies it.

const options = computed<MapOptions>(() => ({
  container: 'map',
  // OpenFreeMap: a free, keyless, public style. Deliberately not a MapTiler
  // Cloud style, so this demo runs with no account and no API key. Set
  // `config.apiKey` and pass e.g. 'streets-v2' to use MapTiler Cloud.
  style: 'https://tiles.openfreemap.org/styles/liberty',
  // The SDK adds its own geolocate control by default, so `<GeolocateControls>`
  // below would render a second locate button beside it.
  geolocateControl: false,
  center: [103.8198, 1.3521],
  zoom: 12,
  minZoom: 9,
  maxZoom: 20,
}));

const { register: registerMap } = useMapTiler();
</script>
<template>
  <MapTiler :options="options" debug @register="registerMap">
    <GeolocateControls
      :options="{
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showAccuracyCircle: false,
      }"
    />
  </MapTiler>
</template>
