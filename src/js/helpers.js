import { REQUEST_TIMEOUT_SEC } from './config.js';
import { async } from 'regenerator-runtime';

const timeout = sec =>
  new Promise((_, reject) =>
    setTimeout(
      () => reject(Error(`Request timed out. Please try again later`)),
      sec * 1000
    )
  );

export const AJAX = async url => {
  try {
    const res = await Promise.race([fetch(url), timeout(REQUEST_TIMEOUT_SEC)]);

    if (!res.ok)
      throw Error(
        'Unable to get requested data from the server. Please try later'
      );

    const data = await res.json();

    return data;
  } catch (err) {
    if (err.message === 'Failed to fetch')
      err.message = `Unable to reach the server. Please check your internet connection`;
    throw err;
  }
};

export const GEOLOCATION = options =>
  new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  );
