import { async } from 'regenerator-runtime';
import { AJAX } from './helpers.js';

import API_KEY from './api_key.js';

const workoutState = () => {
  return {
    id: null,
    info: {},
    waypoints: 0,
    totalDistance: 0,
    waypointCoords: [],
    weather: null,
    location: null,
  };
};

export const state = {
  geolocation: {},
  workout: workoutState(),
  storedWorkouts: [],
};

export const resetWorkoutState = () => (state.workout = workoutState());

export const addWaypoint = coords => {
  state.workout.waypointCoords.push(coords);
  state.workout.waypoints++;

  if (state.workout.waypoints < 2) return;

  const sectorDistance = calcSectorDistance(
    state.workout.waypointCoords,
    state.workout.waypoints
  );

  state.workout.totalDistance += Math.round(sectorDistance);
};

export const addWorkout = async () => {
  if (state.workout.waypoints < 2)
    throw Error('Workout should have at least 2 waypoints');

  state.workout.id = generateUID();

  state.workout.info.pace = calcPace(
    state.workout.totalDistance,
    state.workout.info.duration
  );

  state.workout.info.speed = calcSpeed(
    state.workout.totalDistance,
    state.workout.info.duration
  );

  state.workout.info.description = setDescription(state.workout.info.type);

  const { weather, location } = await getWeatherAndLocation(
    state.workout.waypointCoords
  );
  state.workout.weather = weather;
  state.workout.location = location;

  state.storedWorkouts.push(state.workout);
  persistWorkouts(state.storedWorkouts);
};

export const findWorkout = id =>
  state.storedWorkouts.find(workout => workout.id === id);

export const removeWorkout = id => {
  state.storedWorkouts = state.storedWorkouts.filter(
    workout => workout.id !== id
  );
  persistWorkouts(state.storedWorkouts);
};

export const setGeolocation = geolocation => (state.geolocation = geolocation);
export const setWorkoutInfo = info => (state.workout.info = info);

const calcSectorDistance = (coordsArray, sector) => {
  const [[lat1, lon1], [lat2, lon2]] = coordsArray.slice(sector - 2, sector);

  const R = 6371e3; // meters
  const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // d in meters
};

// Input: m/min - Output: min/km (rounded to 1 decimal)
const calcPace = (distance, duration) =>
  Math.round((duration / (distance / 1000) + Number.EPSILON) * 10) / 10;

// Input: m/min - Output: km/h (rounded to integer)
const calcSpeed = (distance, duration) =>
  Math.round(distance / 1000 / (duration / 60));

const setDescription = type => {
  const now = new Date();

  // prettier-ignore
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const activity = type[0].toUpperCase() + type.slice(1);
  const date = `${months[now.getMonth()]} ${now.getDate()}`;

  let ordinal;
  switch (now.getDate()) {
    case 1:
      ordinal = 'st';
      break;
    case 2:
      ordinal = 'nd';
      break;
    case 3:
      ordinal = 'rd';
      break;
    default:
      ordinal = 'th';
  }

  return `${activity} on ${date}${ordinal}`;
};

const getWeatherAndLocation = async coordsArray => {
  const [[lat, lon]] = coordsArray;

  const [weather, [location]] = await Promise.all([
    AJAX(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    ),
    AJAX(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
    ),
  ]);

  const {
    weather: [details],
  } = weather;

  return {
    weather: {
      icon: details.icon,
      description: details.main,
      wind: Math.round(weather.wind.speed),
      temperature: Math.round(weather.main.temp),
    },
    location: location.name,
  };
};

const generateUID = () =>
  new Date().getTime().toString(36) + Math.random().toString(36).slice(2);

export const getStoredWorkouts = () => {
  const workouts = state.storedWorkouts;

  if (!workouts || (Array.isArray(workouts) && !workouts.length)) return;
  return workouts;
};

const persistWorkouts = () =>
  localStorage.setItem('storedWorkouts', JSON.stringify(state.storedWorkouts));

export const init = () => {
  if (!localStorage)
    throw Error(
      'Local storage not available. Please update your browser or reconfigure your cookie settings'
    );

  if (!localStorage?.storedWorkouts) return;
  state.storedWorkouts = JSON.parse(localStorage.storedWorkouts);
};
