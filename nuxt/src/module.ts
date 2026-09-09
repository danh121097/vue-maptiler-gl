import {
  defineNuxtModule,
  createResolver,
  addPlugin,
  addImports,
} from '@nuxt/kit';

export interface ModuleOptions {
  /** Auto-import the MapTiler SDK and vue3-maptiler-gl stylesheets (default: true) */
  css?: boolean;
  /** Prefix for auto-imported composables (default: none) */
  prefix?: string;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-maptiler-gl',
    configKey: 'maptiler',
    description:
      'Nuxt module for vue3-maptiler-gl with auto-import, SSR support, and full TypeScript',
    // `docs` is what nuxt.com/modules reads out of the published
    // dist/module.json to link the listing at the documentation site; without
    // it the listing falls back to the GitHub repository.
    docs: 'https://vue-maptiler-gl.pages.dev/',
    links: {
      documentation: 'https://vue-maptiler-gl.pages.dev/',
      repository: 'https://github.com/danh121097/vue-maptiler-gl',
    },
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },
  defaults: {
    css: true,
    prefix: '',
  },
  async setup(options, nuxt) {
    const { resolve, resolvePath } = createResolver(import.meta.url);

    // Auto-import CSS. MapTiler's own stylesheet is no longer re-bundled into
    // the library's style.css, so both are pushed: upstream first, then this
    // package's container rules. Both stylesheets are dependencies of this
    // module, not of the consuming app, so they are resolved to absolute
    // paths from here — a bare specifier is resolved from the app root, which
    // under pnpm's isolated node_modules cannot see them at all.
    if (options.css) {
      nuxt.options.css.push(
        await resolvePath('@maptiler/sdk/dist/maptiler-sdk.css'),
        await resolvePath('vue3-maptiler-gl/dist/style.css'),
      );
    }

    // Transpile vue3-maptiler-gl for SSR
    nuxt.options.build.transpile.push('vue3-maptiler-gl');

    // Exclude @maptiler/sdk from SSR bundle (requires WebGL)
    nuxt.options.vite.optimizeDeps ??= {};
    nuxt.options.vite.optimizeDeps.exclude ??= [];
    if (!nuxt.options.vite.optimizeDeps.exclude.includes('@maptiler/sdk')) {
      nuxt.options.vite.optimizeDeps.exclude.push('@maptiler/sdk');
    }

    // Add client-only plugin that registers components
    addPlugin({
      src: resolve('./runtime/plugins/maptiler-sdk.client'),
      mode: 'client',
    });

    // Auto-import composables. This list is every `use*` the package exports
    // from its root; a name missing here is silently not auto-imported, which
    // looks to a consumer like the composable does not exist.
    const composables = [
      // Map instance
      'useCreateMapTiler',
      'useMapTiler',
      'useMapTilerConfig',
      // Layers
      'useCreateLayer',
      'useCreateFillLayer',
      'useCreateCircleLayer',
      'useCreateLineLayer',
      'useCreateSymbolLayer',
      'useLayer',
      // Sources
      'useCreateGeoJsonSource',
      'useGeoJsonSource',
      // Map objects
      'useCreateMarker',
      'useCreatePopup',
      'useCreateImage',
      // Controls
      'useGeolocateControl',
      // Events
      'useMapEventListener',
      'useLayerEventListener',
      'useGeolocateEventListener',
      'useMapReloadEvent',
      // Camera
      'useFlyTo',
      'useEaseTo',
      'useJumpTo',
      'useFitBounds',
      'useFitScreenCoordinates',
      'useCameraForBounds',
      'useZoomTo',
      'useZoomIn',
      'useZoomOut',
      'usePanBy',
      'usePanTo',
      'useRotateTo',
      'useResetNorth',
      'useResetNorthPitch',
      'useSnapToNorth',
      // Utilities
      'useDebounce',
      'useDebouncedRef',
      'useDebouncedWatch',
      'useLogger',
    ];

    addImports(
      composables.map((name) => ({
        name,
        as: options.prefix ? `${options.prefix}${name}` : name,
        from: 'vue3-maptiler-gl',
      })),
    );
  },
});
