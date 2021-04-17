import { GEOLOCATION } from './helpers.js';
import { GEO_OPTIONS } from './config.js';

import sidebarView from './views/sidebarView.js';
import mapView from './views/mapView.js';
import * as model from './model.js';

// Import CSS from Leaflet
import 'leaflet/dist/leaflet.css';

// Import JS from Leaflet
import L from 'leaflet';

// Polyfilling
import 'regenerator-runtime/runtime';
import 'core-js/stable';

import { async } from 'regenerator-runtime/runtime';

const controlMap = async () => {
  try {
    mapView.renderSpinner();

    if (!navigator.geolocation)
      throw Error('Geolocation not available. Please update your browser');

    const geolocation = await GEOLOCATION(GEO_OPTIONS);

    model.setGeolocation(geolocation);
    mapView.renderMap(model.state.geolocation, model.getStoredWorkouts());

    mapView.addHandlerClick(controlAddWaypoint);
  } catch (err) {
    mapView.renderAlert(err.message);
    console.error(err.message);
  }
};

const controlAddWaypoint = mapEvent => {
  sidebarView.showForm();

  const { lat, lng } = mapEvent.latlng;
  const coords = [lat, lng];

  model.addWaypoint(coords);
  mapView.renderPolyline(model.state.workout.waypointCoords);
};

const controlAddWorkout = async workoutInfo => {
  try {
    sidebarView.hideForm();

    model.setWorkoutInfo(workoutInfo);
    await model.addWorkout();

    mapView.renderWorkoutMarkers(
      model.state.workout.waypointCoords,
      model.state.workout.info,
      model.state.workout.id
    );

    sidebarView.renderWorkout(model.state.workout);

    model.resetWorkoutState();
  } catch (err) {
    err.message === 'Workout should have at least 2 waypoints'
      ? mapView.renderAlert(err.message, 'message')
      : mapView.renderAlert(err.message);

    err.message === 'Workout should have at least 2 waypoints'
      ? console.warn(err.message)
      : console.error(err.message);

    model.resetWorkoutState();
  }
};

const controlRemoveWorkout = id => {
  sidebarView.removeWorkout(id);
  mapView.removeLayer(id);
  model.removeWorkout(id);
};

const controlMoveToWorkout = id => {
  const workout = model.findWorkout(id);
  const [startCoords] = workout.waypointCoords;

  mapView.moveToMarker(startCoords);
};

const controlSearchWorkout = keyword =>
  sidebarView.searchWorkout(keyword, model.getStoredWorkouts());

const controlRenderWorkouts = e => {
  const workouts = model.getStoredWorkouts();

  if (!workouts && e.type === 'click')
    return sidebarView.renderAlert(undefined, 'message');

  if (!workouts) return;
  sidebarView.renderWorkouts(workouts);
};

// Set '--vh' Custom Property equivalent to 1vh
const setVh = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};
const setVhListeners = () =>
  ['load', 'resize'].forEach(e => addEventListener(e, setVh));

const init = () => {
  try {
    setVhListeners();

    model.init();
    mapView.addHandlerRender(controlMap);
    sidebarView.addHandlerLoad(controlRenderWorkouts);
    sidebarView.addHandlerClick(controlMoveToWorkout, controlRemoveWorkout);
    sidebarView.addHandlerSearch(controlSearchWorkout);
    sidebarView.addHandlerReset(controlRenderWorkouts);
    sidebarView.addHandlerSubmit(controlAddWorkout);
    sidebarView.addHandlerChange();
  } catch (err) {
    const errMsg =
      'Local storage not available. Please update your browser or reconfigure your cookie settings';

    err.message.includes(`Failed to read the 'localStorage'`)
      ? mapView.renderAlert(errMsg)
      : mapView.renderAlert(err.message);

    console.error(err.message);
  }
};

init();
