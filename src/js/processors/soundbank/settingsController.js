import { dispatch, getActions, getState, STATE_CHANGE, } from '../../state/store.js';

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
            case 'bank':
              updateBankParameter(state);
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
    updateBankParameter(getState());
  };
		
  /**
   * Change the bank of samples.
   * @param {Object} state Application state.
   */
  const updateBankParameter = state => {
    const { banks, params, } = state.processors.byId[id];
    const param = params.byId.bank;
    const bank = banks[param.value];
    const soundsListEl = el.querySelector('.sounds-list .setting__value');
    let htmlString = '<table>';
    bank.forEach((sound, index) => {
      htmlString += `<tr>
        <td style="text-align:right;padding-right:8px;">${index + 1}.</td>
        <td>${sound.label}</td>
        </tr>`;
    });
    htmlString += '</table>';
    soundsListEl.innerHTML = htmlString;
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
