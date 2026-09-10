/**
 * The combined stylesheet is only correct if the SDK's rules come first and
 * this package's come after: both style ancestors of the map container, and a
 * reversed concatenation would let upstream defaults win over the container
 * sizing. Nothing about the file's shape says that, so the order is asserted
 * here rather than left to the next person editing the emitter.
 */
import { describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { emitStylesheetWithMaptiler } from '../emit-stylesheet-with-maptiler';

/** A root with a `dist/` holding the given `style.css`, or none at all. */
function fakePackageRoot(ownStylesheet?: string): string {
  const rootDir = mkdtempSync(resolve(tmpdir(), 'vue-maptiler-gl-css-'));
  if (ownStylesheet !== undefined) {
    mkdirSync(resolve(rootDir, 'dist'));
    writeFileSync(resolve(rootDir, 'dist/style.css'), ownStylesheet);
  }
  return rootDir;
}

describe('emitStylesheetWithMaptiler', () => {
  it('writes dist/style-with-maptiler.css next to the stylesheet it read', () => {
    const rootDir = fakePackageRoot('.maptiler-container{position:relative}');

    const outputPath = emitStylesheetWithMaptiler(rootDir);

    expect(outputPath).toBe(resolve(rootDir, 'dist/style-with-maptiler.css'));
  });

  it("puts the SDK's rules before this package's", () => {
    const rootDir = fakePackageRoot('.maptiler-container{position:relative}');

    const css = readFileSync(emitStylesheetWithMaptiler(rootDir), 'utf8');

    expect(css).toContain('.maplibregl-map');
    expect(css).toContain('.maptiler-container{position:relative}');
    expect(css.indexOf('.maplibregl-map')).toBeLessThan(
      css.indexOf('.maptiler-container{position:relative}'),
    );
  });

  it('credits MapTiler and names the version it bundled', () => {
    const rootDir = fakePackageRoot('.maptiler-container{}');

    const css = readFileSync(emitStylesheetWithMaptiler(rootDir), 'utf8');
    const header = css.slice(0, css.indexOf('*/'));

    expect(header).toMatch(/MapTiler SDK v\d+\.\d+\.\d+/);
    expect(header).toContain('BSD-3-Clause');
  });

  it('fails with the build order to run when dist/style.css is missing', () => {
    const rootDir = fakePackageRoot();

    expect(() => emitStylesheetWithMaptiler(rootDir)).toThrow(/bun run build/);
  });
});
