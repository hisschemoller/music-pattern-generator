import { dispatch, getActions, STATE_CHANGE, } from '../state/store.js';
import { getProcessorData, getProcessorTypes, } from '../core/processor-loader.js';

const libraryEl = document.querySelector('.library');
const listEl = document.querySelector('.library__list');

let dragEl, dragType;

export function setup() {
  populateLibrary();

  const draggerTemplate = document.querySelector('#template-library-dragger');
  dragEl = draggerTemplate.content.cloneNode(true).firstElementChild;
}

function onTouchEnd(e) {
  e.preventDefault();
  document.removeEventListener('touchmove', onTouchMove);
  document.removeEventListener('mousemove', onTouchMove);
  document.removeEventListener('touchend', onTouchEnd);
  document.removeEventListener('mouseup', onTouchEnd);
  document.body.removeChild(dragEl);
  const x = e.type === 'mouseup' ? e.clientX : e.changedTouches[0].clientX;
  const y = e.type === 'mouseup' ? e.clientY : e.changedTouches[0].clientY;

  // test to prevent dropping inside library panel
  const rect = libraryEl.getBoundingClientRect();
  const isInRect = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  if (!isInRect) {
    dispatch(getActions().libraryDrop(dragType, x, y));
  }
  dragType = null;
}

function onTouchMove(e) {
  setDragElPosition(e);
}

function onTouchStart(e) {
  e.preventDefault();
  const el = e.currentTarget;
  dragType = el.dataset.type;
  document.addEventListener('touchmove', onTouchMove);
  document.addEventListener('mousemove', onTouchMove);
  document.addEventListener('touchend', onTouchEnd);
  document.addEventListener('mouseup', onTouchEnd);

  dragEl.querySelector('.library__dragger-label').textContent = el.textContent;
  document.body.appendChild(dragEl);
  setDragElPosition(e);
}

setDragElPosition = e => {
  const x = e.type.indexOf('mouse') !== -1 ? e.clientX : e.touches[0].clientX;
  const y = e.type.indexOf('mouse') !== -1 ? e.clientY : e.touches[0].clientY;
  dragEl.setAttribute('style', `left: ${x - (dragEl.offsetWidth * 0.5)}px; top: ${y - (dragEl.offsetHeight * 0.9)}px;`);
}
        
/**
 * Populate the library with all available processor types.
 * Processor types are not shown in the libray 
 * if they have the flag excludedFromLibrary = true
 * in their config.json file.
 */
function populateLibrary() {
  const template = document.querySelector('#template-library-item');

  getProcessorTypes().forEach(type => {
    const clone = template.content.cloneNode(true);
    const el = clone.firstElementChild;
    listEl.appendChild(el);

    const { name } = getProcessorData(type, 'config');

    el.querySelector('.library__item-label').innerHTML = name;
    el.dataset.type = type;
    el.addEventListener('touchstart', onTouchStart);
    el.addEventListener('mousedown', onTouchStart);
  });
}

/**
 * set the dragged element position.
 * @param {Object} e 
 */
function setDragElPosition(e) {
    const x = e.type.indexOf('mouse') !== -1 ? e.clientX : e.touches[0].clientX;
    const y = e.type.indexOf('mouse') !== -1 ? e.clientY : e.touches[0].clientY;
    dragEl.setAttribute('style', `left: ${x - (dragEl.offsetWidth * 0.5)}px; top: ${y - (dragEl.offsetHeight * 0.9)}px;`);
}
