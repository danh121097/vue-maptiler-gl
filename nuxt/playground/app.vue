<template>
  <div>
    <h1>nuxt-maptiler-gl Playground</h1>
    <ClientOnly>
      <MapTiler :options="mapOptions" style="height: 500px; width: 100%">
        <Marker :lnglat="[0, 0]" :draggable="true" />
      </MapTiler>
    </ClientOnly>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const mapOptions = ref({
  style: 'https://demotiles.maplibre.org/style.json',
  center: [0, 0],
  zoom: 2,
});
</script>
