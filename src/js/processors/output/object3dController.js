import { dispatch, getActions, STATE_CHANGE, } from '../../state/store.js';
import { getTheme } from '../../state/selectors.js';
import createObject3dControllerBase from '../../webgl/object3dControllerBase.js';
import { redrawShape, } from '../../webgl/draw3dHelper.js';

/**
 * 
 * @param {Object} obj3d The 3D object to control.
 * @param {Object} data Processor data.
 * @param {Boolean} isConnectMode True if app is in connect mode.
 */
export function createObject3dController(obj3d, data, isConnectMode) {
  const {
    handleStateChangesOnBase,
    hitarea3d,
    id,
    label3d,
    object3d,
    updateSelectCircle,
  } = createObject3dControllerBase(obj3d, data, isConnectMode);

  let colorLow,
    colorHigh;

  /**
   * Redraw the pattern if needed.
   * @param {Number} position Transport playback position in ticks.
   * @param {Array} processorEvents Array of processor generated events to display.
   */
  const draw = (position, processorEvents) => {};

  /**
   * @returns {String} The processor's id.
   */
  const getId = () => id;

  /**
   * The app's state has changed.
   * @param {Object} e Custom STATE_CHANGE event.
   */
  const handleStateChanges = e => {
    const { action, actions, state, } = e.detail;
    switch (action.type) {

      case actions.TOGGLE_THEME:
        updateTheme();
        break;
    }

    handleStateChangesOnBase(action, actions, state);
  };

  /**
   * Internal initialization.
   */
  const initialize = () => {
    document.addEventListener(STATE_CHANGE, handleStateChanges);

    ({ colorLow, colorHigh, } = getTheme());
  };

  /** 
   * Set theme colors on the 3D pattern.
   */
  const updateTheme = () => {
    ({ colorLow, colorHigh, } = getTheme());
    updateThemeColorRecursively(object3d, colorLow, colorHigh);
  };

  /** 
   * Loop through all the object3d's children to set the color.
   * @param {Object3d} object3d An Object3d of which to change the color.
   * @param {String} colorLow Hex color string of the low contrast color.
   * @param {String} colorHigh Hex color string of the high contrast color.
   */
  const updateThemeColorRecursively = (object3d, colorLow, colorHigh) => {
    let color = colorHigh;
    switch (object3d.name) {
      case 'polygonLine':
      case 'input_connector':
      case 'input_active':
        color = colorLow;
        break;
      default:
        if (object3d.type === 'Line2') {
          redrawShape(object3d, object3d.userData.points, colorHigh);
        } else if (object3d.material) {
          object3d.material.color.set(colorHigh);
        }
    }

    object3d.children.forEach(childObject3d => {
      updateThemeColorRecursively(childObject3d, colorLow, colorHigh);
    });
  };

  /**
   * Perform cleanup before this controller is destroyed.
   */
  const terminate = () => {
    document.removeEventListener(STATE_CHANGE, handleStateChanges);
  };

  initialize();

  return {
    draw,
    getId,
    terminate,
    updateSelectCircle,
  };
}
