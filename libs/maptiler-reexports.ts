/**
 * MapTiler SDK runtime re-exports.
 *
 * These live on the `vue3-maptiler-gl/maptiler` subpath rather than the package
 * root. A namespace re-export (`export * as maptilersdk`) references every
 * upstream export, so keeping it at the root would pin the whole MapTiler
 * runtime surface into the module graph of any consumer that imports a single
 * component. Type-only re-exports stay at the root because they vanish at
 * compile time.
 */

// Expose the full runtime surface under a namespace to avoid collisions with
// Vue components such as Marker and Popup while still making the exact upstream
// API available from this package.
export * as maptilersdk from '@maptiler/sdk';

// Re-export the upstream runtime surface directly where names do not conflict
// with this package. Marker and Popup stay available via aliases below.
export {
  AJAXError,
  AttributionControl,
  BoxZoomHandler,
  CanvasSource,
  CooperativeGesturesHandler,
  DoubleClickZoomHandler,
  DragPanHandler,
  DragRotateHandler,
  EdgeInsets,
  Evented,
  FullscreenControl,
  GeoJSONSource,
  GeolocateControl,
  Hash,
  ImageSource,
  KeyboardHandler,
  LngLat,
  LngLatBounds,
  LogoControl,
  Map,
  MapMouseEvent,
  MapTouchEvent,
  MapWheelEvent,
  MercatorCoordinate,
  NavigationControl,
  Point,
  RasterDEMTileSource,
  RasterTileSource,
  ScaleControl,
  ScrollZoomHandler,
  Style,
  TerrainControl,
  TwoFingersTouchPitchHandler,
  TwoFingersTouchRotateHandler,
  TwoFingersTouchZoomHandler,
  TwoFingersTouchZoomRotateHandler,
  VectorTileSource,
  VideoSource,
  addProtocol,
  addSourceType,
  clearPrewarmedResources,
  config,
  getMaxParallelImageRequests,
  getRTLTextPluginStatus,
  getVersion,
  getWorkerCount,
  getWorkerUrl,
  importScriptInWorkers,
  prewarm,
  removeProtocol,
  setMaxParallelImageRequests,
  setRTLTextPlugin,
  setWorkerCount,
  setWorkerUrl,
} from '@maptiler/sdk';

/**
 * Values in MapLibre, types only in the MapTiler SDK.
 *
 * The SDK re-exports MapLibre's *types* wholesale (`export type * from
 * 'maplibre-gl'`) but hand-picks which runtime bindings it forwards, and these
 * seven did not make the cut. They therefore cannot be re-exported as values
 * from this subpath the way `vue3-maplibre-gl` does; the type side is all the
 * SDK has to give. A consumer that needs the constructors can reach them
 * through `maplibre-gl` directly -- the SDK depends on it, so it is already in
 * the tree.
 */
export type {
  Color,
  ErrorEvent,
  Event,
  Formatted,
  FormattedSection,
  GlobeControl,
  createTileMesh,
} from '@maptiler/sdk';

export {
  Marker as MapTilerMarker,
  Popup as MapTilerPopup,
} from '@maptiler/sdk';
