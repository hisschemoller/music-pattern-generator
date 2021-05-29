

import { STATE_CHANGE, } from '../../state/store.js';

/**
 * Controller for the settings panel view.
 * @param {Object} el Settings panel DOM element.
 * @param {Object} data Processor data.
 */
export function createSettingsController(el, data) {
  const { id, } = data;

  const getId = () => {
    return id;
  };

  const updateMode = (mode) => {
    let elems=el.querySelectorAll('.mode_note,.mode_cc');
    for(let elem of elems)
      elem.style.display = elem.classList.contains('mode_'+mode) ? 'block' : 'none';
  }

  /**
   * The app's state has changed.
   * @param {Object} e Custom STATE_CHANGE event.
   */
  const handleStateChanges = e => {
    const { action, actions, state, } = e.detail;
    switch (action.type) {
      case actions.CHANGE_PARAMETER:
        if (action.processorId === id && action.paramKey == 'mode') {
          updateMode(action.paramValue);
        }
        break;
    }
  };

  /**
   * Internal initialization.
   */
  const initialize = () => {
    document.addEventListener(STATE_CHANGE, handleStateChanges);
    updateMode( data.params.byId.mode ? data.params.byId.mode.value : 'note' );
  };

  /**
   * Perform cleanup before this controller is destroyed.
   */
  const terminate = () => {
    document.removeEventListener(STATE_CHANGE, handleStateChanges);
  };

  initialize();

  return Object.freeze({
    getId,
    initialize,
    terminate,
  });
}
