import { dispatch, getActions, STATE_CHANGE, } from '../../state/store.js';
import { getTheme } from '../../state/selectors.js';
import createObject3dControllerBase from '../../webgl/object3dControllerBase.js';
import { redrawShape, } from '../../webgl/draw3dHelper.js';
import {
  Vector2,
} from '../../lib/threejs/build/three.module.js';

/**
 * 
 * @param {Object} obj3d The 3D object to control.
 * @param {Object} data Processor data.
 * @param {Boolean} isConnectMode True if app is in connect mode.
 */
export function createObject3dController(obj3d, data, isConnectMode) {
  const {
    getId,
    handleStateChangesOnBase,
    id,
    object3d,
    updateSelectCircle,
  } = createObject3dControllerBase(obj3d, data, isConnectMode);

  const centerDot3d = object3d.getObjectByName('centerDot');
  const stick3d = object3d.getObjectByName('stick');
  const pointer3d = object3d.getObjectByName('pointer');
  const stickX = stick3d.position.x;

  let centerScale = 0,
    colorLow,
    colorHigh,
    isBypass = false,
    stepIndex = 0,
    stepWidth = 0;

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
      const { delayFromNowToNoteEnd, delayFromNowToNoteStart, stepIndex: index, } = event;
      stepIndex = index;
      startNoteAnimation(delayFromNowToNoteStart, delayFromNowToNoteEnd);
    }

    // update center dot animation
    if (centerScale !== 0) {
      updateNoteAnimations();
    }
  };

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
            const { is_bypass, steps } = processors.byId[id].params.byId;
            switch (action.paramKey) {
              case 'is_bypass':
                updateBypass(is_bypass.value);
                break;
              case 'steps':
                updateStick(steps.value);
                break;
              default:
            }
          }
        }
        break;
      
      case actions.LOAD_SNAPSHOT: {
          const { processors, } = state;
          const { is_bypass, steps } = processors.byId[id].params.byId;
          updateBypass(is_bypass.value);
          updateStick(steps.value);
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

    const { is_bypass, steps } = data.params.byId;
    updateBypass(is_bypass.value);
    updateStick(steps.value);
  };

  /**
   * Show the playback position within the pattern.
   * Indicated by the pointer's rotation.
   * @param  {Number} position Position within pattern in ticks.
   */
  const showPlaybackPosition = position => {};

  /**
   * Show animation of the pattern dot that is about to play.
   */
  const startNoteAnimation = (noteStartDelay, noteStopDelay) => {
    console.log('stepIndex', stepIndex);

    // delay start of animation
    setTimeout(() => {
      centerDot3d.visible = true;
      centerScale = 1;
      pointer3d.position.x = stickX + (stepWidth * (stepIndex + 0.5));
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
   * Update the steps stick.
   * @param {Number} steps Number of steps in the pattern./
   */
  const updateStick = (steps) => {
    const stickLength = Math.min(steps * 4, 30);
    stepWidth = stickLength / steps;
    const points = [
      new Vector2(0, 0),
      new Vector2(stickLength, 0),
    ];
    redrawShape(stick3d, points, colorHigh);

    pointer3d.position.x = stickX + (stepWidth * (stepIndex + 0.5));
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
