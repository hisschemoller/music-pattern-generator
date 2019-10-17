import { dispatch, getActions, STATE_CHANGE, } from '../../state/store.js';
import {
  EllipseCurve,
  Vector2,
} from '../../lib/three.module.js';
import { getTheme } from '../../state/selectors.js';
import createObject3dControllerBase from '../../webgl/object3dControllerBase.js';
import { getEuclidPattern, rotateEuclidPattern } from './utils.js';
import { PPQN } from '../../core/config.js';
import { redrawShape } from '../../webgl/draw3dHelper.js';

const TWO_PI = Math.PI * 2;

export function createObject3dController(data, that = {}, my = {}) {
  let centreCircle3d,
    centreDot3d,
    select3d,
    pointer3d,
    necklace3d,
    defaultColor,
    duration,
    pointerRotation,
    status = true,
    euclid,
    steps,
    rotation,
    centerRadius = 3,
    centerScale = 0,
    innerRadius = 4,
    outerRadius = 6,
    locatorRadius = 8,
    zeroMarkerRadius = 0.5,
    doublePI = Math.PI * 2,

    initialize = function() {
      centreCircle3d = my.object3d.getObjectByName('centreCircle'),
      centreDot3d = my.object3d.getObjectByName('centreDot'),
      select3d = my.object3d.getObjectByName('select'),
      pointer3d = my.object3d.getObjectByName('pointer'),
      necklace3d = my.object3d.getObjectByName('necklace'),

      document.addEventListener(STATE_CHANGE, handleStateChanges);
    
      defaultColor = getTheme().colorHigh;

      const params = data.processorData.params.byId;
      my.updateLabel(params.name.value);
      updateNecklace(params.steps.value, params.pulses.value, params.rotation.value);
      updateDuration(params.steps.value, params.rate.value);
      updateRotation(params.rotation.value);  
      updatePointer();
      my.updateConnectMode(data.isConnectMode);
    },

    terminate = function() {
      document.removeEventListener(STATE_CHANGE, handleStateChanges);
    },

    handleStateChanges = function(e) {
      const { action, actions, state, } = e.detail;
      switch (action.type) {
        case actions.CHANGE_PARAMETER:
          if (action.processorID === my.id) {
            const params = state.processors.byId[my.id].params.byId;
            switch (action.paramKey) {
              case 'steps':
              case 'pulses':
                updateDuration(params.steps.value, params.rate.value);
                updateNecklace(params.steps.value, params.pulses.value, params.rotation.value);
                break;
              case 'rotation':
                updateRotation(params.rotation.value);  
                break;
              case 'is_triplets':
              case 'rate':
                updateDuration(params.steps.value, params.rate.value);
                break;
              case 'name':
                my.updateLabel(params.name.value);
                break;
              default:
            }
          }

        case actions.DRAG_SELECTED_PROCESSOR:
          my.updatePosition(state);
          break;
        
        case actions.LOAD_PRESET:
          const params = state.processors.byId[my.id].params.byId;
          updateDuration(params.steps.value, params.rate.value);
          updateNecklace(params.steps.value, params.pulses.value, params.rotation.value, params.is_mute.value);
          updateRotation(params.rotation.value);  
          break;

        case actions.TOGGLE_CONNECT_MODE:
          my.updateConnectMode(state.connectModeActive);
          break;

        case actions.SET_THEME:
          updateTheme();
          break;
      }
    },

    updateNecklace = function(numSteps, pulses, rotation, isMute = false) {
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
          ((i / n) * doublePI) + (Math.PI * 0.5),
          (((i + 1) / n) * doublePI) + (Math.PI * 0.5),
          false,
          0,
        );
        points = [...points, ...curve.getPoints(5)];
      }
      points = [...points, points[0].clone()];
      
      redrawShape(necklace3d, points, defaultColor);
    },

    updateRotation = function(numRotation) {
      rotation = numRotation;
      pointer3d.rotation.z = (rotation / steps) * doublePI;
    },

    /**
     * Redraw the location pointer and the status dot.
     */
    updatePointer = function() {
      const necklacePos = status ? outerRadius : innerRadius;
      const halfWayPos = necklacePos + ((locatorRadius - necklacePos) / 2);
      const statusWidth = status ? 2.5 : 1;
      const sides = status ? locatorRadius : halfWayPos;

      const points = [

        // position locator
        new Vector2(0, centerRadius),
        new Vector2(0, locatorRadius),

        // status indicator
        new Vector2(-statusWidth, sides),
        new Vector2(0, necklacePos),
        new Vector2(statusWidth, sides),
        new Vector2(0, locatorRadius),
      ];

      redrawShape(pointer3d, points, defaultColor);
    },

    /** 
     * Set theme colors on the 3D pattern.
     */
    updateTheme = function() {
      const { colorLow, colorHigh } = getTheme();
      setThemeColorRecursively(my.object3d, colorLow, colorHigh);
    },

    /** 
     * Loop through all the object3d's children to set the color.
     * @param {Object3d} An Object3d of which to change the color.
     * @param {String} HEx color string of the new color.
     */
    setThemeColorRecursively = function(object3d, colorLow, colorHigh) {
      if (object3d.material && object3d.material.color) {
        object3d.material.color.set(colorHigh);
      }
      object3d.children.forEach(childObject3d => {
        setThemeColorRecursively(childObject3d, colorLow, colorHigh);
      });
    },
            
    /**
     * Update the hitarea used for mouse detection.
     */
    updateHitarea = function() {
        const scale = (radius3d + 3) * 0.1;
        my.hitarea3d.scale.set(scale, scale, 1);
    },

    updateLabelPosition = function() {
      my.label3d.position.y = -radius3d - 2;
    },

    /**
     * Show circle if the processor is selected, else hide.
     * @param {Boolean} isSelected True if selected.
     */
    updateSelectCircle = function(selectedId) {
      select3d.visible = my.id === selectedId;
    },

    /**
     * Calculate the pattern's duration in milliseconds.
     */
    updateDuration = function(steps, rate) {
      // const rate = my.params.is_triplets.value ? my.params.rate.value * (2 / 3) : my.params.rate.value;
      const stepDuration = rate * PPQN;
      duration = steps * stepDuration;
    },
        
    /**
     * Show the playback position within the pattern.
     * Indicated by the necklace's rotation.
     * @param  {Number} position Position within pattern in ticks.
     */
    showPlaybackPosition = function(position) {
      pointerRotation = TWO_PI * (-position % duration / duration);
      necklace3d.rotation.z = pointerRotation;
    },
        
    /**
     * Show animation of the pattern dot that is about to play. 
     * @param {Number} stepIndex Index of the step to play.
     * @param {Number} noteStartDelay Delay from now until note start in ms.
     * @param {Number} noteStopDelay Delay from now until note end in ms.
     */
    startNoteAnimation = function(stepIndex, noteStartDelay, noteStopDelay) {
      // delay start of animation
      setTimeout(() => {
        centreDot3d.visible = true;
        centerScale = 1;
      }, noteStartDelay);
    },

    /**
     * Update the current nacklace dot animations.
     */
    updateNoteAnimation = function() {
      centreDot3d.scale.set(centerScale, centerScale, 1);
      centerScale *= 0.90;
      if (centerScale <= 0.05) {
        centreDot3d.visible = false;
        centerScale = 0;
      }
    },

    /**
     * Redraw the pattern if needed.
     * @param {Number} position Transport playback position in ticks.
     * @param {Array} processorEvents Array of processor generated events to display.
     */
    draw = function(position, processorEvents) {
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
      if (processorEvents[my.id] && processorEvents[my.id].length) {
        const event = processorEvents[my.id][processorEvents[my.id].length - 1];
        startNoteAnimation(event.stepIndex, event.delayFromNowToNoteStart, event.delayFromNowToNoteEnd);
      }

      // update center dot animation
      if (centerScale !== 0) {
        updateNoteAnimation();
      }
    };

  that = createObject3dControllerBase(data, that, my);

  initialize();

  that.terminate = terminate;
  that.updateSelectCircle = updateSelectCircle;
  that.draw = draw;
  return that;
}
