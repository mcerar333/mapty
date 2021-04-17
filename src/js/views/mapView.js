import {
  MAP_ZOOM,
  MAP_ICON_START,
  MAP_ICON_FINISH,
  MAP_ZOOM_OPTIONS,
  MAP_POPUP_OPTIONS,
  MAP_POLYLINE_COLOR,
} from '../config.js';

import View from './View';

class MapView extends View {
  // _map
  // _mapZoom

  constructor(parentEl, alertEl) {
    super(parentEl, alertEl);
    this._polylines = [];
    this._mapLayers = [];
    this._layerGroup = null;
  }

  addHandlerRender(handler) {
    addEventListener('load', handler);
  }
  addHandlerClick(handler) {
    this._map.on('click', handler);
  }

  moveToMarker(coords) {
    this._map.setView(coords, MAP_ZOOM, MAP_ZOOM_OPTIONS);
  }

  removeLayer(id) {
    const layer = this._mapLayers.find(layer => layer.id === id);
    layer.layerGroup.removeFrom(this._map);
  }

  renderWorkoutMarkers(coordsArray, workoutInfo, workoutID) {
    const finish = coordsArray[coordsArray.length - 1];
    const start = coordsArray[0];

    const markerFinish = L.marker(finish, { icon: L.icon(MAP_ICON_FINISH) });
    const markerStart = L.marker(start, { icon: L.icon(MAP_ICON_START) });

    this._addToLayerGroup(...this._polylines, markerFinish, markerStart);
    this._layerGroup.addTo(this._map);

    markerStart
      .bindPopup(
        L.popup({
          ...MAP_POPUP_OPTIONS,
          className: `${workoutInfo.type}-popup`,
        })
      )
      .setPopupContent(
        `${workoutInfo.type === 'hiking' ? '🚶‍♂️' : '🚴‍♀️'} ${
          workoutInfo.description
        }`
      )
      .openPopup();

    this._mapLayers.push({
      id: workoutID,
      layerGroup: this._layerGroup,
    });

    this._resetLayers();
  }

  _addToLayerGroup(...layers) {
    layers.forEach(layer => this._layerGroup.addLayer(layer));
  }
  _resetLayers() {
    this._polylines = [];
    this._layerGroup = L.layerGroup();
  }

  renderPolyline(coordsArray) {
    const polyline = L.polyline(coordsArray, {
      color: MAP_POLYLINE_COLOR,
    }).addTo(this._map);

    this._polylines.push(polyline);
  }

  renderMap(geolocation, workouts) {
    const { latitude, longitude } = geolocation.coords;
    const coords = [latitude, longitude];

    this._clearParentHTML(this._parentEl);

    const tileLayer = this._initMap(coords);
    tileLayer.addTo(this._map);

    if (!workouts) return;

    workouts.forEach(workout => {
      this.renderPolyline(workout.waypointCoords);
      this.renderWorkoutMarkers(
        workout.waypointCoords,
        workout.info,
        workout.id
      );
    });

    const waypoints = workouts.flatMap(workout => workout.waypointCoords);
    this._map.fitBounds(waypoints);
  }

  _initMap(coords) {
    this._map = L.map(this._parentEl).setView(coords, MAP_ZOOM);
    this._layerGroup = L.layerGroup();

    return L.tileLayer(
      'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    );

    // Google Maps
    // return L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    //   maxZoom: 20,
    //   subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    // });
  }
}

export default new MapView('#map', '.alert');
