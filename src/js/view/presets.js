import { dispatch, getActions, STATE_CHANGE, } from '../state/store.js';

const listEl = document.querySelector('.presets__list');

export function setup() {
  addEventListeners();
  build();
}

function addEventListeners() {
  document.addEventListener(STATE_CHANGE, handleStateChanges);
}

function build() {
  const template = document.querySelector('#template-presets-item');
  for (let i = 0, n = 16; i < n; i++) {
    const clone = template.content.cloneNode(true);
    const el = clone.firstElementChild;
    listEl.appendChild(el);

    el.querySelector('.presets__item-label').innerHTML = `${i + 1}.`;
    el.dataset.index = i;
    el.addEventListener('touchend', handleClick);
    el.addEventListener('click', handleClick);
  }
}

function handleClick(e) {
  dispatch(getActions().storePreset(e.target.dataset.index));
}

/**
 * Handle state changes.
 * @param {Object} e 
 */
function handleStateChanges(e) {
  const { state, action, actions, } = e.detail;
  switch (action.type) {
  }
}
