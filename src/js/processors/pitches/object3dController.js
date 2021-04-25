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
    id,
    object3d,
    updateSelectCircle,
  } = createObject3dControllerBase(obj3d, data, isConnectMode);

  const centerDot3d = object3d.getObjectByName('centerDot');

  let colorLow,
    colorHigh,
    isBypass = false,
    centerScale = 0;

  /**
   * Redraw the pattern if needed.
   * @param {Number} position Transport playback position in ticks.
   * @param {Array} processorEvents Array of processor generated events to display.
   */
  const draw = (position, processorEvents) => {
    showPlaybackPosition(position);

    // start center dot animation
    if (processorEvents[id] && processorEvents[id].length) {
      const event = processorEvents[id][processorEvents[id].length - 1];
      const { delayFromNowToNoteEnd, delayFromNowToNoteStart, stepIndex, } = event;
      startNoteAnimation(stepIndex, delayFromNowToNoteStart, delayFromNowToNoteEnd);
    }

    // update center dot animation
    if (centerScale !== 0) {
      updateNoteAnimations();
    }
  };

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

      case actions.CHANGE_PARAMETER: {
          const { activeProcessorId, processors, } = state;
          if (activeProcessorId === id) {
            const { is_bypass, pulses, rate, rotation, steps, } = processors.byId[id].params.byId;
            switch (action.paramKey) {
              case 'is_bypass':
                updateBypass(is_bypass.value);
                break;
              default:
            }
          }
        }
        break;
      
      case actions.LOAD_SNAPSHOT: {
          const { processors, } = state;
          const { } = processors.byId[id].params.byId;
        }
        break;

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

    const { is_bypass, } = data.params.byId;
    updateBypass(is_bypass.value);
  };

  /**
   * Show the playback position within the pattern.
   * Indicated by the pointer's rotation.
   * @param  {Number} position Position within pattern in ticks.
   */
  const showPlaybackPosition = position => {
  };

  /**
   * Show animation of the pattern dot that is about to play.
   */
  const startNoteAnimation = (stepIndex, noteStartDelay, noteStopDelay) => {

    // delay start of animation
    setTimeout(() => {
      centerDot3d.visible = true;
      centerScale = 1;
    }, noteStartDelay);
  };

  /**
   * Store the bypass parameter value locally.
   * @param {Boolean} isBypassValue Bypass parameter value.
   */
  const updateBypass = isBypassValue => {
    isBypass = isBypassValue;
  };

  /**
   * Update the current nacklace dot animations.
   */
  const updateNoteAnimations = () => {
    if (centerScale > 0) {
      centerDot3d.scale.set(centerScale, centerScale, 1);
      centerScale -= 0.06;
      if (centerScale <= 0.05) {
        centerDot3d.visible = false;
        centerScale = 0;
      }
    }
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
      case 'input_connector':
      case 'input_active':
      case 'output_connector':
      case 'output_active':
        color = colorLow;
        break;
    }

    if (object3d.type === 'Line2') {
      redrawShape(object3d, object3d.userData.points, color);
    } else if (object3d.material) {
      object3d.material.color.set(color);
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
