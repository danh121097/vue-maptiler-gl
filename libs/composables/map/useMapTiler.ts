import {
  computed,
  effectScope,
  onUnmounted,
  ref,
  shallowRef,
  unref,
  watch,
  type ComputedRef,
  type EffectScope,
} from 'vue';
import type {
  FeatureIdentifier,
  LngLatBoundsLike,
  LngLatLike,
  Map,
  MapOptions,
  PaddingOptions,
  PointLike,
  QueryRenderedFeaturesOptions,
  QuerySourceFeatureOptions,
} from '@maptiler/sdk';

import { useLogger } from '@libs/composables';
import { MapCreationStatus } from '@libs/enums';
import type { MapTilerActions, MapTilerMethods, Nullable } from '@libs/types';

interface UseMapTilerOptions {
  /** Enable debug logging */
  debug?: boolean;
  /** Automatically cleanup resources on unmount */
  autoCleanup?: boolean;
}

interface UseMapTilerReturn
  extends Omit<
    MapTilerMethods,
    | 'mapCreationStatus'
    | 'isMapReady'
    | 'isMapLoading'
    | 'hasMapError'
    | 'mapInstance'
  > {
  /** Reactive map instance reference */
  readonly mapInstance: ComputedRef<Map | null>;
  /** Current map creation status */
  readonly mapStatus: ComputedRef<MapCreationStatus>;
  /** Whether the map is ready for operations */
  readonly isMapReady: ComputedRef<boolean>;
  /** Whether the map is currently loading */
  readonly isMapLoading: ComputedRef<boolean>;
  /** Whether the map has encountered an error */
  readonly hasMapError: ComputedRef<boolean>;
  /** Whether a map instance is registered and ready */
  readonly isRegistered: ComputedRef<boolean>;

  /** Register a MapTiler actions instance */
  register: (instance: MapTilerActions) => Promise<void>;
  /** Set map options on the registered instance */
  setMapOptions: (options: Partial<MapOptions>) => void;
}

/**
 * Composable for managing MapTiler GL Map instances
 *
 * Provides reactive state management and a clean API for interacting with MapTiler GL maps.
 * Handles registration, lifecycle management, and provides reactive access to map state.
 *
 * @param options - Configuration options for the composable
 * @returns Reactive map management interface
 */
export function useMapTiler(
  options: UseMapTilerOptions = {},
): UseMapTilerReturn {
  const { debug = false, autoCleanup = true } = options;
  const { logError } = useLogger(debug);

  // Internal state
  const instanceRef = ref<MapTilerActions>();
  const mapStatus = ref<MapCreationStatus>(MapCreationStatus.NotInitialized);
  const mapInstance = shallowRef<Nullable<Map>>(null);

  let watchScope: EffectScope | undefined;

  // Reactive computed properties
  const isMapReady = computed(
    () => mapStatus.value === MapCreationStatus.Loaded,
  );
  const isMapLoading = computed(
    () => mapStatus.value === MapCreationStatus.Loading,
  );
  const hasMapError = computed(
    () => mapStatus.value === MapCreationStatus.Error,
  );
  const isRegistered = computed(
    () => isMapReady.value && mapInstance.value !== null,
  );

  /**
   * Registers a MapTiler actions instance with enhanced error handling and validation
   * @param instance - MapTiler actions instance to register
   */
  async function register(instance: MapTilerActions): Promise<void> {
    try {
      // Validate instance
      if (!instance) {
        throw new Error('Cannot register: instance is null or undefined');
      }

      if (!instance.mapInstance) {
        throw new Error(
          'Cannot register: instance missing mapInstance property',
        );
      }

      // Prevent duplicate registration
      if (instance === unref(instanceRef)) {
        if (debug) {
          console.log('Skipping duplicate registration for same instance');
        }
        return;
      }

      if (debug) {
        console.log('🔄 Registering MapTiler instance with useMapTiler', {
          hasMapInstance: !!instance.mapInstance,
          currentMapCreationStatus: instance.mapCreationStatus,
          isMapReady: instance.isMapReady,
          isMapLoading: instance.isMapLoading,
          hasMapError: instance.hasMapError,
        });
      }
      instanceRef.value = instance;

      // Clean up previous watch scope
      watchScope?.stop();

      // Set up new watch scope for instance changes
      watchScope = effectScope();
      watchScope.run(() => {
        // Watch for map instance changes
        watch(
          () => instance.mapInstance.value,
          (map) => {
            try {
              mapInstance.value = map;
              if (debug) {
                console.log('🗺️ Map instance updated in useMapTiler', {
                  hasMap: !!map,
                  mapLoaded: map?.loaded?.(),
                });
              }
            } catch (error) {
              mapStatus.value = MapCreationStatus.Error;
              logError('Error updating map instance:', error);
            }
          },
          {
            immediate: true,
          },
        );

        // Set initial status from instance
        mapStatus.value = instance.mapCreationStatus;

        // Watch for map instance changes to determine status
        watch(
          () => instance.mapInstance.value,
          (map) => {
            try {
              if (map) {
                // Map instance exists, check if it's loaded
                if (map.loaded()) {
                  mapStatus.value = MapCreationStatus.Loaded;
                  if (debug) {
                    console.log('Map successfully registered with useMapTiler');
                  }
                } else {
                  // Map exists but not loaded yet
                  mapStatus.value = MapCreationStatus.Loading;

                  // Listen for load event
                  const onLoad = () => {
                    mapStatus.value = MapCreationStatus.Loaded;
                    if (debug) {
                      console.log('Map loaded and registered with useMapTiler');
                    }
                    map.off('load', onLoad);
                  };

                  map.on('load', onLoad);
                }
              } else {
                // No map instance
                if (instance.hasMapError) {
                  mapStatus.value = MapCreationStatus.Error;
                } else if (instance.isMapLoading) {
                  mapStatus.value = MapCreationStatus.Loading;
                } else {
                  mapStatus.value = MapCreationStatus.NotInitialized;
                }
              }
            } catch (error) {
              mapStatus.value = MapCreationStatus.Error;
              logError('Error updating map status:', error);
            }
          },
          {
            immediate: true,
          },
        );
      });
    } catch (error) {
      mapStatus.value = MapCreationStatus.Error;
      logError('Error registering MapTiler instance:', error);
      throw error; // Re-throw to allow caller to handle
    }
  }

  // Helper functions
  const getMapInstance = (): Map | null => mapInstance.value;
  const getInstance = (): MapTilerActions | undefined => instanceRef.value;

  // Map methods that delegate to the current instance
  const methods = {
    getContainer: () => getMapInstance()?.getContainer(),
    getCanvasContainer: () => getMapInstance()?.getCanvasContainer(),
    getCanvas: () => getMapInstance()?.getCanvas(),
    getStyle: () => getMapInstance()?.getStyle(),
    getBounds: () => getMapInstance()?.getBounds(),
    getCenter: () => getMapInstance()?.getCenter(),
    getZoom: () => getMapInstance()?.getZoom(),
    getBearing: () => getMapInstance()?.getBearing(),
    getPadding: () => getMapInstance()?.getPadding(),
    getPitch: () => getMapInstance()?.getPitch(),
    getMinZoom: () => getMapInstance()?.getMinZoom(),
    getMaxZoom: () => getMapInstance()?.getMaxZoom(),
    getMinPitch: () => getMapInstance()?.getMinPitch(),
    getMaxPitch: () => getMapInstance()?.getMaxPitch(),
    getFilter: (layerId: string) => getMapInstance()?.getFilter(layerId),
    getLayer: (layerId: string) => getMapInstance()?.getLayer(layerId),
    getLayoutProperty: (layerId: string, name: string) =>
      getMapInstance()?.getLayoutProperty(layerId, name),
    getPaintProperty: (layerId: string, name: string) =>
      getMapInstance()?.getPaintProperty(layerId, name),
    getSource: (sourceId: string) => getMapInstance()?.getSource(sourceId),
    project: (lnglat: LngLatLike) => getMapInstance()?.project(lnglat),
    unproject: (point: PointLike) => getMapInstance()?.unproject(point),
    queryRenderedFeatures: (
      point: PointLike | [PointLike, PointLike],
      options?: QueryRenderedFeaturesOptions,
    ) => getMapInstance()?.queryRenderedFeatures(point, options),
    querySourceFeatures: (
      sourceId: string,
      parameters?: QuerySourceFeatureOptions,
    ) => getMapInstance()?.querySourceFeatures(sourceId, parameters),
    queryTerrainElevation: (lnglat: LngLatLike) =>
      getMapInstance()?.queryTerrainElevation(lnglat),
    isStyleLoaded: () => getMapInstance()?.isStyleLoaded(),
    isMoving: () => getMapInstance()?.isMoving(),
    isZooming: () => getMapInstance()?.isZooming(),
    isRotating: () => getMapInstance()?.isRotating(),
    isEasing: () => getMapInstance()?.isEasing(),
    resize: () => getMapInstance()?.resize(),
    remove: () => getMapInstance()?.remove(),
    triggerRepaint: () => getMapInstance()?.triggerRepaint(),
    setFeatureState: (options: FeatureIdentifier, state: Record<string, any>) =>
      getMapInstance()?.setFeatureState(options, state),
    removeFeatureState: (options: FeatureIdentifier, key: string) =>
      getMapInstance()?.removeFeatureState(options, key),
    getFeatureState: (options: FeatureIdentifier) =>
      getMapInstance()?.getFeatureState(options),
    setPadding: (padding?: PaddingOptions) =>
      padding && getMapInstance()?.setPadding(padding),

    // Setter methods that delegate to instance
    setRenderWorldCopies: (val: boolean) =>
      getInstance()?.setRenderWorldCopies?.(val),
    setMinZoom: (zoom: number) => getInstance()?.setMinZoom?.(zoom),
    setMinPitch: (pitch: number) => getInstance()?.setMinPitch?.(pitch),
    setMaxZoom: (zoom: number) => getInstance()?.setMaxZoom?.(zoom),
    setMaxPitch: (pitch: number) => getInstance()?.setMaxPitch?.(pitch),
    setMaxBounds: (bounds: LngLatBoundsLike) =>
      getInstance()?.setMaxBounds?.(bounds),
    setStyle: (style: Exclude<MapOptions['style'], undefined>) =>
      getInstance()?.setStyle?.(style),
    setPitch: (pitch: number) => getInstance()?.setPitch?.(pitch),
    setZoom: (zoom: number) => getInstance()?.setZoom?.(zoom),
    setBearing: (bearing: number) => getInstance()?.setBearing?.(bearing),
    setCenter: (center: LngLatLike) => getInstance()?.setCenter?.(center),
  };

  // Cleanup on component unmount
  onUnmounted(() => {
    if (autoCleanup) {
      // Stop watching
      watchScope?.stop();

      // Clear references
      instanceRef.value = undefined;
      mapInstance.value = null;
      mapStatus.value = MapCreationStatus.NotInitialized;
    }
  });

  /**
   * Sets map options on the registered instance
   */
  const setMapOptions = (options: Partial<MapOptions>): void => {
    const instance = getInstance();
    if (instance?.setMapOptions) {
      instance.setMapOptions(options);
      if (debug) console.log('Map options updated', options);
    } else {
      logError('Cannot set map options: no registered instance');
    }
  };

  return {
    ...methods,
    mapInstance: computed(() => mapInstance.value),
    mapStatus: computed(() => mapStatus.value),
    isMapReady,
    isMapLoading,
    hasMapError,
    isRegistered,
    register,
    setMapOptions,
  };
}
