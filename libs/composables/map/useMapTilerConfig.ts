import { useLogger } from '@libs/composables';
import {
  clearPrewarmedResources,
  config,
  prewarm,
  setMaxParallelImageRequests,
  setWorkerCount,
} from '@maptiler/sdk';
import { onUnmounted } from 'vue';

/**
 * Configuration options for MapTiler SDK performance optimization
 */
export interface MapTilerConfigOptions {
  /**
   * MapTiler Cloud API key, applied globally via the SDK's `config.apiKey`.
   *
   * Only needed to reach MapTiler Cloud -- a `MapStyle` preset, a
   * `maptiler://` shorthand, or any `api.maptiler.com` URL. A style served
   * from your own host passes through untouched and needs no key, which is
   * why this is optional and why the component's default style is keyless.
   *
   * Per-map override: pass `apiKey` inside `<MapTiler :options>` instead,
   * which the SDK applies to that map alone.
   *
   * This option has no counterpart in `vue3-maplibre-gl`; MapLibre has no
   * hosted tile service to authenticate against.
   */
  apiKey?: string;
  /** Number of web workers for tile loading (default: 4) */
  workerCount?: number;
  /** Maximum parallel image requests (default: 16) */
  maxParallelImageRequests?: number;
  /** Whether to prewarm MapTiler resources on initialization (default: true) */
  prewarmResources?: boolean;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Actions returned by useMapTilerConfig
 */
export interface MapTilerConfigActions {
  /** Clears prewarmed resources - call on app unmount to release memory */
  clearPrewarmedResources: () => void;
}

/**
 * Composable for configuring MapTiler SDK global performance settings.
 *
 * This should be called once at the application level (e.g., in App.vue or main.ts)
 * to optimize MapTiler performance across all map instances.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useMapTilerConfig } from 'vue3-maptiler-gl';
 *
 * // Initialize MapTiler with optimized settings
 * useMapTilerConfig({
 *   apiKey: 'YOUR_MAPTILER_CLOUD_KEY', // optional; omit for keyless styles
 *   workerCount: 4,
 *   maxParallelImageRequests: 16,
 *   prewarmResources: true,
 * });
 * </script>
 * ```
 *
 * @param options - Configuration options for MapTiler performance
 * @returns Actions for managing MapTiler configuration
 */
export function useMapTilerConfig(
  options: MapTilerConfigOptions = {},
): MapTilerConfigActions {
  const {
    apiKey,
    workerCount = 4,
    maxParallelImageRequests = 16,
    prewarmResources = true,
    debug = false,
  } = options;

  const { log, logError } = useLogger(debug);

  try {
    // Apply the MapTiler Cloud API key before anything can issue a request.
    if (apiKey) {
      config.apiKey = apiKey;
      log('MapTiler Cloud API key configured');
    }

    // Configure web worker count for parallel tile loading
    setWorkerCount(workerCount);
    log('MapTiler worker count set to:', workerCount);

    // Configure maximum parallel image requests
    setMaxParallelImageRequests(maxParallelImageRequests);
    log(
      'MapTiler max parallel image requests set to:',
      maxParallelImageRequests,
    );

    // Prewarm MapTiler resources for faster initial map render
    if (prewarmResources) {
      prewarm();
      log('MapTiler resources prewarmed');
    }
  } catch (error) {
    logError('Error configuring MapTiler:', error);
  }

  // Cleanup prewarmed resources on unmount
  onUnmounted(() => {
    try {
      clearPrewarmedResources();
      log('MapTiler prewarmed resources cleared');
    } catch (error) {
      logError('Error clearing prewarmed resources:', error);
    }
  });

  return {
    clearPrewarmedResources,
  };
}
