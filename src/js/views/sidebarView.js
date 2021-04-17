import View from './View';

class SidebarView extends View {
  constructor(parentEl, alertEl, formEl, searchEl) {
    super(parentEl, alertEl);
    this._form = document.querySelector(formEl);
    this._search = document.querySelector(searchEl);
    this._reset = this._search.querySelector('.search__reset');
    this._alertMessage = `You don't have any stored workouts. Start by adding a new workout`;
  }

  addHandlerLoad(handler) {
    addEventListener('load', handler);
  }
  addHandlerClick(handlerMove, handlerRemove) {
    this._parentEl.addEventListener('click', e => {
      const workout = e.target.closest('.workout');

      if (!workout) return;
      const id = workout.dataset.id;

      e.target.tagName === 'BUTTON' ? handlerRemove(id) : handlerMove(id);
    });
  }
  addHandlerChange() {
    const handler = e => {
      if (e.type === 'reset')
        return (this._form.cadence.placeholder = 'step/min');

      this._form.cadence.placeholder =
        this._form.type.value === 'cycling' ? 'rpm' : 'step/min';
    };

    ['change', 'reset'].forEach(e => addEventListener(e, handler.bind(this)));
  }
  addHandlerSubmit(handler) {
    this._form.addEventListener('submit', e => {
      e.preventDefault();

      const type = e.target.type.value;
      const cadence = e.target.cadence.value;
      const duration = e.target.duration.value;
      const elevation = e.target.elevation.value;

      const errMsg = this._validateForm(cadence, duration, elevation);
      if (errMsg) return this.renderAlert(errMsg, 'message');

      handler({
        type,
        cadence: +cadence,
        duration: +duration,
        elevation: +elevation,
      });
    });
  }
  addHandlerSearch(handler) {
    this._search.addEventListener('submit', e => {
      e.preventDefault();

      const keyword = e.target.search.value.trim().toLowerCase();
      handler(keyword);
    });
  }
  addHandlerReset(handler) {
    this._reset.addEventListener('click', handler);
  }

  showForm() {
    if (!this._form.classList.contains('hidden')) return;
    this._form.classList.remove('hidden');

    if (this._isTouchDevice()) return;
    this._form.elevation.focus({ preventScroll: true });
  }
  hideForm() {
    this._form.classList.add('hidden');
    this._form.style.display = 'none';
    this._form.reset();

    setTimeout(() => (this._form.style.display = 'grid'), 300);
  }

  _validateForm(...inputs) {
    if (inputs.some(input => input === ''))
      return `Please fill all the required fields`;
    else if (inputs.some(input => !Number.isFinite(+input)))
      return `Inputs should only contain positive numbers`;
    else if (inputs.some(input => input <= 0))
      return `Inputs should only contain positive numbers`;
    return undefined;
  }

  renderWorkouts(workouts) {
    this._search.reset();
    this._clearParentHTML();
    workouts.forEach(workout => this.renderWorkout(workout));
  }
  renderWorkout(workout) {
    const markup = this._generateMarkup(workout);
    this._insertHTML('afterbegin', markup);
  }

  removeWorkout(id) {
    const workout = this._parentEl.querySelector(`.workout[data-id=${id}]`);
    workout.remove();
  }

  searchWorkout(keyword, workouts) {
    if (!workouts) {
      this._search.reset();
      this._search.search.blur();
      return this.renderAlert(undefined, 'message');
    }
    if (workouts && !keyword)
      return this.renderAlert(
        'You can filter workouts by specifying their location, activity or date',
        'message'
      );
    if (workouts && keyword && keyword.length < 3)
      return this.renderAlert(
        'Search terms should contain at least 3 characters',
        'message'
      );

    const filtered = workouts.filter(
      workout =>
        workout.info.description.toLowerCase().includes(keyword) ||
        workout.location.toLowerCase().includes(keyword)
    );

    if (!filtered.length)
      return this.renderAlert(
        'There are no workouts matching your search query. You can filter workouts by specifying their location, activity or date',
        'message'
      );

    this.renderWorkouts(filtered);
  }

  _generateMarkup(data) {
    const icon = data.info.type === 'hiking' ? '🚶‍♂️' : '🚴‍♀️';
    const durationUnit = data.info.duration >= 60 ? 'h' : 'min';
    const distanceUnit = data.totalDistance >= 1000 ? 'km' : 'm';
    const cadenceUnit = data.info.type === 'hiking' ? 'spm' : 'rpm';
    const cadenceIcon = data.info.type === 'hiking' ? '👟' : '⚙&nbsp;';

    const title = `${data.info.type[0].toUpperCase()}${data.info.type.slice(
      1
    )} in ${data.location}`;

    const distance =
      data.totalDistance >= 1000
        ? this._roundNumber(data.totalDistance / 1000)
        : data.totalDistance;

    const duration =
      data.info.duration >= 60
        ? this._roundNumber(data.info.duration / 60)
        : data.info.duration;

    const snippetSpecific =
      data.info.type === 'hiking'
        ? this._generateMarkupHiking(data)
        : this._generateMarkupCycling(data);

    const snippet = `
      <li class="workout workout--${data.info.type}" data-id="${data.id}">
        <h2 class="workout__title">${title}</h2>
        <button class="btn btn--delete" data-tooltip="Remove workout?">🎯</button>
        <div class="workout__details">
          <span class="workout__icon">${icon}</span>
          <span class="workout__value">${distance}</span>
          <span class="workout__unit">${distanceUnit}</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${duration}</span>
          <span class="workout__unit">${durationUnit}</span>
        </div>${snippetSpecific}
        <div class="workout__details">
          <span class="workout__icon">${cadenceIcon}</span>
          <span class="workout__value">${data.info.cadence}</span>
          <span class="workout__unit">${cadenceUnit}</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🗻</span>
          <span class="workout__value">${data.info.elevation}</span>
          <span class="workout__unit">m</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🌡</span>
          <span class="workout__value">${data.weather.temperature}</span>
          <span class="workout__unit">°C</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">💨</span>
          <span class="workout__value">${data.weather.wind}</span>
          <span class="workout__unit">m/s</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">${this._generateWeatherIcon(
            data.weather.description
          )}</span>
          <span class="workout__value"></span>
          <span class="workout__unit">${data.weather.description}</span>
        </div>
      </li>`;

    return snippet;
  }
  _generateWeatherIcon(weather) {
    let icon;
    switch (weather) {
      case 'Thunderstorm':
        icon = '🌩';
        break;
      case 'Rain':
      case 'Drizzle':
        icon = '🌧';
        break;
      case 'Snow':
        icon = '🌨';
        break;
      case 'Clear':
        icon = '☀';
        break;
      case 'Clouds':
        icon = '☁';
        break;
      default:
        icon = '🌫';
    }
    return icon;
  }
  _generateMarkupHiking(data) {
    return `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${data.info.pace}</span>
          <span class="workout__unit">min/km</span>
        </div>`;
  }
  _generateMarkupCycling(data) {
    return `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${data.info.speed}</span>
          <span class="workout__unit">km/h</span>
        </div>`;
  }

  _roundNumber(num, decimals = 1) {
    return Math.round((num + Number.EPSILON) * decimals * 10) / decimals / 10;
  }

  _isTouchDevice() {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    );
  }
}

export default new SidebarView('.workouts__list', '.alert', '.form', '.search');
