

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

  /**
   * The app's state has changed.
   * @param {Object} e Custom STATE_CHANGE event.
   */
  const handleStateChanges = e => {
    const { action, actions, state, } = e.detail;
    switch (action.type) {

      case actions.CHANGE_PARAMETER:
        if (action.processorId === id) {
          switch (action.paramKey) {
            case 'target':
              el.querySelector('.target_cc').style.display= action.paramValue=='cc_value' ? 'block' : 'none';
              break;
          }
        }
        break;
    }
  };

  /**
   * Internal initialization.
   */
  const initialize = () => {
    document.addEventListener(STATE_CHANGE, handleStateChanges);
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
