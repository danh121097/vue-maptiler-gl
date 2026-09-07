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
  style: 'https://worldwidemaps.sqkii.com/api/maps/test/style.json',
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
