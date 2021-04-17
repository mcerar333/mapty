import DEFAULT_SHADOW from 'url:leaflet/dist/images/marker-shadow.png';
import FINISH_ICON from 'url:../img/finish.png';
import START_ICON from 'url:../img/start.png';

// GEOLOCATION
const GEO_HIGH_ACCURACY = true;
const GEO_MAX_AGE_SEC = 60;
const GEO_TIMEOUT_SEC = 5;

export const GEO_OPTIONS = {
  enableHighAccuracy: GEO_HIGH_ACCURACY,
  maximumAge: GEO_MAX_AGE_SEC * 1000,
  timeout: GEO_TIMEOUT_SEC * 1000,
};

// LEAFLET
export const MAP_ICON_FINISH = {
  iconUrl: FINISH_ICON,
  shadowUrl: DEFAULT_SHADOW,
  iconSize: [30, 30], // size of the icon
  shadowSize: [40, 30], // size of the shadow
  iconAnchor: [1, 30], // point of the icon which will correspond to marker's location
  shadowAnchor: [11, 29], // the same for the shadow
  popupAnchor: [0, 0], // point from which the popup should open relative to the iconAnchor
};

export const MAP_ICON_START = {
  iconUrl: START_ICON,
  shadowUrl: DEFAULT_SHADOW,
  iconSize: [30, 30],
  shadowSize: [40, 30],
  iconAnchor: [28, 27],
  shadowAnchor: [36, 30],
  popupAnchor: [-13, -25],
};

const MAP_ANIMATE_DURATION = 1;
const MAP_ANIMATE = true;

export const MAP_ZOOM_OPTIONS = {
  duration: MAP_ANIMATE_DURATION,
  animate: MAP_ANIMATE,
};

const MAP_POPUP_MIN_WIDTH = 100;
const MAP_POPUP_MAX_WIDTH = 250;
const MAP_POPUP_AUTO_CLOSE = false;
const MAP_POPUP_CLOSE_ON_CLICK = false;

export const MAP_POPUP_OPTIONS = {
  minWidth: MAP_POPUP_MIN_WIDTH,
  maxWidth: MAP_POPUP_MAX_WIDTH,
  autoClose: MAP_POPUP_AUTO_CLOSE,
  closeOnClick: MAP_POPUP_CLOSE_ON_CLICK,
};

export const MAP_POLYLINE_COLOR = '#42484d';
export const MAP_ZOOM = 13;

// AJAX
export const API_KEY = '3c8b90fbaf75fd3f161492b32a86e82f';
export const REQUEST_TIMEOUT_SEC = 5;

// ALERTS
export const DISPLAY_ALERT_SEC = 5;
