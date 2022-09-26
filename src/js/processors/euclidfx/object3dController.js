import { dispatch, getActions, STATE_CHANGE, } from '../../state/store.js';
import { getTheme } from '../../state/selectors.js';
import { PPQN, TWO_PI, } from '../../core/config.js';
import { getEuclidPattern, rotateEuclidPattern } from './utils.js';
import createObject3dControllerBase from '../../webgl/object3dControllerBase.js';
import { redrawShape, } from '../../webgl/draw3dHelper.js';
import {
  EllipseCurve,
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
    hitarea3d,
    id,
    object3d,
    updateSelectCircle,
  } = createObject3dControllerBase(obj3d, data, isConnectMode);

  const centerDot3d = object3d.getObjectByName('centerDot');
  const pointer3d = object3d.getObjectByName('pointer');
  const necklace3d = object3d.getObjectByName('necklace');

  let colorLow,
    colorHigh,
    duration,
    pointerRotation,
    status = true,
    euclid,
    steps,
    rotation,
    isBypass = false,
    centerRadius = 3,
    centerScale = 0,
    innerRadius = 4,
    outerRadius = 6,
    locatorRadius = 8;

  /**
   * Redraw the pattern if needed.
   * @param {Number} position Transport playback position in ticks.
   * @param {Array} processorEvents Array of processor generated events to display.
   */
  const draw = (position, processorEvents) => {
    showPlaybackPosition(position);

    // calculate status and redraw locator if needed
    let currentStep = Math.floor(((position % duration) / duration) * steps);
    currentStep = (currentStep + rotation) % steps;
    const currentStatus = euclid[currentStep];
    if (currentStatus !== status) {
      status = currentStatus;
      updatePointer();
    }

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
              case 'steps':
              case 'pulses':
                updateDuration(steps.value, rate.value);
                updateNecklace(steps.value, pulses.value, rotation.value);
                break;
              case 'rotation':
                updateRotation(rotation.value);  
                break;
              case 'is_triplets':
              case 'rate':
                updateDuration(steps.value, rate.value);
                break;
              case 'is_bypass':
                updateBypass(is_bypass.value);
                updatePointer();
                break;
              default:
            }
          }
        }
        break;
      
      case actions.LOAD_SNAPSHOT: {
          const { processors, } = state;
          const { pulses, rate, rotation, steps, } = processors.byId[id].params.byId;
          updateDuration(steps.value, rate.value);
          updateNecklace(steps.value, pulses.value, rotation.value);
          updateRotation(rotation.value);
        }
        break;

      case actions.SET_THEME:
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

    const { pulses, rate, rotation, steps, is_bypass, } = data.params.byId;
    updateNecklace(steps.value, pulses.value, rotation.value);
    updateDuration(steps.value, rate.value);
    updateRotation(rotation.value);  
    updateBypass(is_bypass.value);
    updatePointer();
  };

  /**
   * Show the playback position within the pattern.
   * Indicated by the pointer's rotation.
   * @param  {Number} position Position within pattern in ticks.
   */
  const showPlaybackPosition = position => {
    pointerRotation = TWO_PI * (-position % duration / duration);
    necklace3d.rotation.z = pointerRotation;
  };

  /**
   * Show animation of the pattern dot that is about to play.
   */
  const startNoteAnimation = (stepIndex, noteStartDelay, noteStopDelay) => {

    // delay start of animation
    setTimeout(() => {

      // center dot
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
   * Calculate the pattern's duration in milliseconds.
   */
  const updateDuration = (steps, rate) => {
    const stepDuration = rate * PPQN;
    duration = steps * stepDuration;
  };

  /**
   * Update the hitarea used for mouse detection.
   */
  const updateHitarea = () => {
    const scale = (radius3d + 3) * 0.1;
    hitarea3d.scale.set(scale, scale, 1);
  };

  /**
   * Update necklace.
   * @param {*} steps 
   * @param {*} pulses 
   * @param {*} rotation 
   * @param {*} isMute 
   */
  const updateNecklace = (numSteps, pulses, rotation) => {
    steps = numSteps;

    // create the pattern
    euclid = getEuclidPattern(steps, pulses);
    euclid = rotateEuclidPattern(euclid, rotation);
    
    let points = [];

    for (let i = 0, n = euclid.length; i < n; i++) {
      const stepRadius = euclid[i] ? outerRadius : innerRadius;

      // ax, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation
      const curve = new EllipseCurve(
        0, 0, 
        stepRadius, stepRadius,
        ((i / n) * TWO_PI) + (Math.PI * 0.5),
        (((i + 1) / n) * TWO_PI) + (Math.PI * 0.5),
        false,
        0,
      );
      points = [...points, ...curve.getPoints(5)];
    }
    points = [...points, points[0].clone()];
    
    redrawShape(necklace3d, points, colorHigh);
  };

  /**
   * Update the current nacklace dot animations.
   */
  const updateNoteAnimations = () => {

    // center dot
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
   * Update the pointer that connects the dots.
   */
  const updatePointer = () => {
    const necklacePos = status ? outerRadius : innerRadius;
    const halfWayPos = necklacePos + ((locatorRadius - necklacePos) / 2);
    const statusWidth = status ? 2.5 : 1;
    const sides = status ? locatorRadius : halfWayPos;
    let points;

    if (isBypass) {
      points = [
  
        // position locator
        new Vector2(0, locatorRadius - 2),
        new Vector2(0, locatorRadius),

        // status indicator
        new Vector2(-1, locatorRadius - 1),
        new Vector2(0, locatorRadius - 2),
        new Vector2(1, locatorRadius - 1),
        new Vector2(0, locatorRadius),
        new Vector2(-1, locatorRadius - 1),

      ];
    } else {
      points = [
  
        // position locator
        new Vector2(0, centerRadius),
        new Vector2(0, locatorRadius),
  
        // status indicator
        new Vector2(-statusWidth, sides),
        new Vector2(0, necklacePos),
        new Vector2(statusWidth, sides),
        new Vector2(0, locatorRadius),
      ];
    }

    redrawShape(pointer3d, points, colorHigh);
  };

  /** 
   * Rotate the pointer to indicate pattern rotation.
   */
  const updateRotation = (numRotation) => {
    rotation = numRotation;
    pointer3d.rotation.z = (rotation / steps) * -TWO_PI;
  }

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
