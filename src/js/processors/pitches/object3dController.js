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
  const animatingSteps = {};

  let centerScale = 0,
    colorLow,
    colorHigh,
    isBypass = false,
    offset = 0,
    pitchAtDragStart,
    sequence = [],
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
      for (let i = 0, n = processorEvents[id].length; i < n; i++) {
        const { delayFromNowToNoteEnd, delayFromNowToNoteStart, stepIndex: index, } = processorEvents[id][i];
        startNoteAnimation(delayFromNowToNoteStart, delayFromNowToNoteEnd, index);
      }
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

      case actions.CHANGE_PARAMETER:
      case actions.RECREATE_PARAMETER: {
          const { activeProcessorId, processors, } = state;
          if (activeProcessorId === id) {
            const { is_bypass, offset, sequence, steps } = processors.byId[id].params.byId;
            switch (action.paramKey) {
              case 'is_bypass':
                updateBypass(is_bypass.value);
                break;
              
              case 'offset':
                updateOffset(offset.value);
                updatePointer();
                break;

              case 'sequence':
                updateOffset(offset.value);
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
          const { is_bypass, offset, sequence, steps } = processors.byId[id].params.byId;
          updateOffset(offset.value);
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

    const { is_bypass, offset, sequence, steps } = data.params.byId;
    updateOffset(offset.value);
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
  const startNoteAnimation = (noteStartDelay, noteStopDelay, index) => {
    stepIndex = index;

    // retain sequence step fill in object  
    if (animatingSteps[index]) {
      animatingSteps[index].stepFill3d.scale.y = 0;
      animatingSteps[index].isActive = false;
    } else {
      animatingSteps[index] = {
        stepFill3d: stick3d.getObjectByName(`step_fill${stepIndex}`),
        isActive: false,
      }
    }

    // delay start of animation
    setTimeout(() => {

      // step fill
      if (animatingSteps[index].stepFill3d) {
        animatingSteps[index].stepFill3d.scale.y = 1;
        animatingSteps[index].isActive = true;
        animatingSteps[index].isFirstRun = true;
      } else {
        delete animatingSteps[index];
      }

      // center dot
      centerDot3d.visible = true;
      centerScale = 1;

      // pointer
      // updatePointer();
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

    // sequence steps
    Object.keys(animatingSteps).forEach(key => {
      const obj = animatingSteps[key];
      if (obj.isActive ) {
        if (obj.stepFill3d.scale.y < 0.1) {
          obj.stepFill3d.scale.y = 0;
          delete animatingSteps[key];
        } else if (!obj.isFirstRun) {
          obj.stepFill3d.scale.y -= 0.1;
        }
        obj.isFirstRun = false;
      }
    });

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
   * Store the changed offset to set the pointer position.
   */
  const updateOffset = (offs) => {
    offset = offs;
  };

  /** 
   * Update the sequence step rectangles.
   * @param {Array} newSequence Sequence of pitch values.
   * @param {Number} steps Number of steps in the pattern.
   */
  const updateSequence = (newSequence, steps) => {

    // remove all existing sequence steps
    if (newSequence.length !== sequence) {
      for (let i = 0, n = stick3d.children.length; i < n; i++) {
        stick3d.remove(stick3d.children[0]);
      }
      sequence = [];
    }

    // update only the visible steps, not the possibly longer sequence.length
    for (let i = 0; i < steps; i++) {
      if (!sequence[i] || sequence[i].pitch !== newSequence[i].pitch) {
        const stepHeight = newSequence[i].pitch * 0.5;

        const stepFill3d = createRectFilled(stepWidth, Math.abs(stepHeight), colorHigh, 1);
        stepFill3d.geometry = stepFill3d.geometry.translate(0, stepHeight * 0.5, 0);
        stepFill3d.name = `step_fill${i}`;
        stepFill3d.translateX(stepsX + ((i + 0.5) * stepWidth));
        stepFill3d.scale.set(1, 0, 1);
        stick3d.add(stepFill3d);

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
    }

    sequence = newSequence.map((step) => ({ ...step }));
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
    const { pitch } = sequence[offset];
    pointer3d.rotation.set(0, 0, pitch >= 0 ? 0 : Math.PI);
    pointer3d.position.set(
      stickX + stepsX + (stepWidth * (offset + 0.5)),
      pitch >= 0 ? (pitch * 0.5) + 2 : (pitch * 0.5) - 2,
      0,
    );
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
