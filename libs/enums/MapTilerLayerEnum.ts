import type { MapLayerEventType } from '@maptiler/sdk';

export const MapTilerLayerEvents: (keyof MapLayerEventType)[] = [
  'click',
  'dblclick',
  'mousedown',
  'mouseup',
  'mousemove',
  'mouseenter',
  'mouseleave',
  'mouseover',
  'mouseout',
  'contextmenu',
  'touchstart',
  'touchend',
  'touchcancel',
];
