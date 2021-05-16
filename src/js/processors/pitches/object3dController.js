import { dispatch, getActions, STATE_CHANGE, } from '../../state/store.js';
import { getTheme } from '../../state/selectors.js';
import createObject3dControllerBase from '../../webgl/object3dControllerBase.js';
import { createRectFilled, createRectOutline, redrawShape, } from '../../webgl/draw3dHelper.js';
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
    pitchAtDragStart,
    stepIndex = 0,
    stepWidth = 0,
    stepsX = 2;

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
            const { is_bypass, sequence, steps } = processors.byId[id].params.byId;
            switch (action.paramKey) {
              case 'is_bypass':
                updateBypass(is_bypass.value);
                break;

              case 'sequence':
                updateSequence(sequence.value, steps.value);
                break;

              case 'steps':
                updateStick(steps.value);
                updateSequence(sequence.value, steps.value);
                updatePointer();
                break;

              default:
            }
          }
        }
        break;
      
      case actions.LOAD_SNAPSHOT: {
          const { processors, } = state;
          const { is_bypass, sequence, steps } = processors.byId[id].params.byId;
          updateBypass(is_bypass.value);
          updateStick(steps.value);
          updateSequence(sequence.value, steps.value);
          updatePointer();
        }
        break;
      
      case actions.PARAMETER_DRAG_MOVE:
        pitchParameterDragMove(state);
        break;
      
      case actions.PARAMETER_DRAG_START:
        pitchParameterDragStart(state);
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

    const { is_bypass, sequence, steps } = data.params.byId;
    updateBypass(is_bypass.value);
    updateStick(steps.value);
    updateSequence(sequence.value, steps.value);
    updatePointer();
  };

  /**
   * Start dragging a pitch slider.
   * @param {String} state Application state.
   */
  const pitchParameterDragMove = (state) => {
    const { parameterDrag, processors } = state;
    const { current, objectName, start } = parameterDrag;
    const data = objectName.split(':');
    if (data[1] === id) {
      const stepIndex = data[3];
      const sequence = [ ...processors.byId[id].params.byId['sequence'].value ];
      const dragDistance = Math.round(current.y - start.y);
      const newPitch = Math.max(-24, Math.min(pitchAtDragStart + dragDistance, 24));
      sequence[stepIndex] = { ...sequence[stepIndex], pitch: newPitch };
      dispatch(getActions().changeParameter(id, 'sequence', sequence));
    }
  }

  /**
   * Start dragging a pitch slider.
   * @param {String} state Application state.
   */
  const pitchParameterDragStart = (state) => {
    const { parameterDrag, processors } = state;
    const { objectName } = parameterDrag;
    const data = objectName.split(':');
    if (data[1] === id) {
      const stepIndex = data[3];
      pitchAtDragStart = processors.byId[id].params.byId['sequence'].value[stepIndex].pitch;
    }
  }

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

    // delay start of animation
    setTimeout(() => {
      centerDot3d.visible = true;
      centerScale = 1;
      updatePointer();
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
   * Update the sequence step rectangles.
   * @param {Array} sequence Sequence of pitch values.
   * @param {Number} steps Number of steps in the pattern.
   */
  const updateSequence = (sequence, steps) => {
  
    // remove all existing sequence steps
    for (let i = 0, n = stick3d.children.length; i < n; i++) {
      stick3d.remove(stick3d.children[0]);
    }

    for (let i = 0; i < steps; i++) {
      const stepHeight = sequence[i].pitch * 0.5;

      const step3d = createRectOutline(stepWidth, stepHeight, colorHigh);
      step3d.name = `step${i}`;
      step3d.translateX(stepsX + (i * stepWidth));
      step3d.translateY(0);
      stick3d.add(step3d);

      const stepHitArea3d = createRectFilled(stepWidth, Math.abs(stepHeight) + 4, colorHigh, 0);
      stepHitArea3d.name = `processor:${id}:step:${i}`;
      stepHitArea3d.userData.stepIndex = i;
      stepHitArea3d.translateX(stepsX + ((i + 0.5) * stepWidth));
      stepHitArea3d.translateY(stepHeight * 0.5);
      stick3d.add(stepHitArea3d);
    }
  };

  /** 
   * Update the steps stick.
   * @param {Number} steps Number of steps in the pattern.
   */
  const updateStick = (steps) => {
    const stickLength = Math.min(steps * 4, 30);
    stepWidth = (stickLength - stepsX) / steps;
    const points = [
      new Vector2(0, 0),
      new Vector2(stickLength, 0),
    ];
    redrawShape(stick3d, points, colorHigh);
  };

  /** 
   * Set pointer position to current step.
   */
  const updatePointer = () => {
    pointer3d.position.x = stickX + stepsX + (stepWidth * (stepIndex + 0.5));
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
