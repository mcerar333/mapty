import { DISPLAY_ALERT_SEC } from '../config.js';

export default class View {
  // _parentEl
  // _alertEl

  // _message
  // _errorMessage

  constructor(parentEl, alertEl) {
    this._parentEl = document.querySelector(parentEl);
    this._alertEl = document.querySelector(alertEl);
    this._alertMessage = 'Woops, something went wrong';
    this._alertIsVisible = false;
  }

  renderSpinner() {
    const markup = `
      <div class="bouncer">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>`;

    this._clearParentHTML();
    this._insertHTML('afterbegin', markup);
  }

  renderAlert(message = this._alertMessage, type = 'error') {
    if (this._alertIsVisible) return;
    this._alertIsVisible = true;

    const markup = `${message}... ${type === 'error' ? '😓' : '🙂'}`;

    this._clearParentHTML(this._alertEl);
    this._insertHTML('afterbegin', markup, this._alertEl);

    type === 'error'
      ? this._alertEl.classList.remove('alert--success')
      : this._alertEl.classList.remove('alert--error');

    type === 'error'
      ? this._alertEl.classList.add('alert--error', 'alert--visible')
      : this._alertEl.classList.add('alert--success', 'alert--visible');

    setTimeout(() => {
      this._alertIsVisible = false;
      this._alertEl.classList.remove('alert--visible');
    }, DISPLAY_ALERT_SEC * 1000);
  }

  _clearParentHTML(parentEl = this._parentEl) {
    parentEl.innerHTML = '';
  }
  _insertHTML(position, markup, parentEl = this._parentEl) {
    parentEl.insertAdjacentHTML(position, markup);
  }
}
