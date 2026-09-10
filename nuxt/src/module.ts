import {
  defineNuxtModule,
  createResolver,
  addPlugin,
  addImports,
} from '@nuxt/kit';
import { existsSync } from 'node:fs';

export interface ModuleOptions {
  /** Auto-import the combined MapTiler SDK + vue3-maptiler-gl stylesheet (default: true) */
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

    // Auto-import CSS. `style-with-maptiler.css` is the SDK's own stylesheet
    // followed by the library's container rules, so one entry replaces the two
    // this module used to push. That also removes the `@maptiler/sdk`
    // resolution from this path entirely: the file lives inside
    // vue3-maptiler-gl, so it cannot go missing while the library itself
    // resolves. It requires vue3-maptiler-gl >= 2.1.0, which is the floor this
    // module's dependency range declares.
    //
    // The specifier is still resolved to an absolute path from here rather than
    // pushed bare: a bare specifier is resolved from the app root, which under
    // pnpm's isolated node_modules cannot see this module's own dependencies.
    if (options.css) {
      const stylesheet = await resolvePath(
        'vue3-maptiler-gl/dist/style-with-maptiler.css',
      );
      // `resolvePath` does not fail on a file it cannot find: it returns the
      // specifier joined onto this module's own source directory, which then
      // surfaces much later as a Vite resolution error naming a path inside
      // nuxt-maptiler-gl that no one wrote. An app that hoisted an older
      // vue3-maptiler-gl than the dependency range asks for lands exactly
      // there, so say so here instead.
      if (!existsSync(stylesheet)) {
        throw new Error(
          'nuxt-maptiler-gl could not find vue3-maptiler-gl/dist/style-with-maptiler.css. ' +
            'That file ships from vue3-maptiler-gl 2.1.0 onwards — upgrade it, ' +
            'or set `maptiler: { css: false }` and import the stylesheets yourself.',
        );
      }
      nuxt.options.css.push(stylesheet);
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
