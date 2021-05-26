import { dispatch, getActions, STATE_CHANGE, } from '../../state/store.js';
import { getTheme } from '../../state/selectors.js';
import { PPQN, TWO_PI, } from '../../core/config.js';
import { getEuclidPattern, rotateEuclidPattern } from './utils.js';
import createObject3dControllerBase from '../../webgl/object3dControllerBase.js';
import {
  createCircleOutline,
  createCircleOutlineFilled,
  redrawShape,
} from '../../webgl/draw3dHelper.js';
import {
  Shape,
  ShapeGeometry,
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
    label3d,
    object3d,
    updateSelectCircle,
  } = createObject3dControllerBase(obj3d, data, isConnectMode);

  const centerDot3d = object3d.getObjectByName('centerDot');
  const dots3d = object3d.getObjectByName('dots');
  const pointer3d = object3d.getObjectByName('pointer');
  const polygon3d = object3d.getObjectByName('polygon');
  const rotatedMarker3d = object3d.getObjectByName('rotatedMarker');
  const zeroMarker3d = object3d.getObjectByName('zeroMarker');

  let radius3d,
    duration,
    pointerRotation,
    dotAnimations = {},
    dotMaxRadius = 1,
    colorLow,
    colorHigh,
    centerScale = 0;

  /**
   * Redraw the pattern if needed.
   * @param {Number} position Transport playback position in ticks.
   * @param {Array} processorEvents Array of processor generated events to display.
   */
  const draw = (position, processorEvents) => {
    showPlaybackPosition(position);
    updateNoteAnimations();

    if (processorEvents[id] && processorEvents[id].length) {
      for (let i = 0, n = processorEvents[id].length; i < n; i++) {
        const { delayFromNowToNoteEnd, delayFromNowToNoteStart, stepIndex, } = processorEvents[id][i];
        startNoteAnimation(stepIndex, delayFromNowToNoteStart, delayFromNowToNoteEnd);
      }
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
        const { activeProcessorId, processors, } = state;
        if (activeProcessorId === id) {
          const { is_mute, pulses, rate, rotation, steps, } = processors.byId[id].params.byId;
          switch (action.paramKey) {
            case 'steps':
            case 'pulses':
              updateDuration(steps.value, rate.value);

              // fall through intended
            case 'rotation':
              updateNecklace(steps.value, pulses.value, rotation.value, is_mute.value);
              break;
            case 'is_triplets':
            case 'rate':
            case 'note_length':
              updateDuration(steps.value, rate.value);
              break;
            case 'is_mute':
              updatePointer(is_mute.value);
              break;
          }
        }
        break;
        
      case actions.LOAD_SNAPSHOT:
        const { is_mute, pulses, rate, rotation, steps, } = state.processors.byId[id].params.byId;
        updateDuration(steps.value, rate.value);
        updateNecklace(steps.value, pulses.value, rotation.value, is_mute.value);
        updatePointer(is_mute.value);
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

    const { is_mute, pulses, rate, rotation, steps, } = data.params.byId;
    updateNecklace(steps.value, pulses.value, rotation.value, is_mute.value);
    updateDuration(steps.value, rate.value);
  };

  /**
   * Show the playback position within the pattern.
   * Indicated by the pointer's rotation.
   * @param  {Number} position Position within pattern in ticks.
   */
  const showPlaybackPosition = position => {
    pointerRotation = TWO_PI * (-position % duration / duration);
    pointer3d.rotation.z = pointerRotation;
  };
 
  /**
   * Show animation of the pattern dot that is about to play. 
   * @param {Number} stepIndex Index of the step to play.
   * @param {Number} noteStartDelay Delay from now until note start in ms.
   * @param {Number} noteStopDelay Delay from now until note end in ms.
   */
  const startNoteAnimation = (stepIndex, noteStartDelay, noteStopDelay) => {
    const dot = dots3d.children[stepIndex];

    // retain necklace dot state in object
    dotAnimations[stepIndex] = {
      dot,
      scale: 1,
      isActive: false,
    }

    // delay start of animation
    setTimeout(() => {

      // necklace dot
      const tweeningDot = dotAnimations[stepIndex];
      tweeningDot.scale = 2;
      tweeningDot.isActive = true;

      // center dot
      centerDot3d.visible = true;
      centerScale = 1;
    }, noteStartDelay);
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
   * Update the label's position according to the size of the pattern necklace.
   */
  const updateLabelPosition = () => {
    label3d.position.y = -radius3d - 2;
  };

  /**
   * Update necklace.
   * @param {*} steps 
   * @param {*} pulses 
   * @param {*} rotation 
   * @param {*} isMute 
   */
  const updateNecklace = (steps, pulses, rotation, isMute) => {
 
    // create the pattern
    let euclid = getEuclidPattern(steps, pulses);
    euclid = rotateEuclidPattern(euclid, rotation);

    // remove all existing necklace dots
    for (let i = 0, n = dots3d.children.length; i < n; i++) {
      dots3d.remove(dots3d.children[0]);
    }

    // the points of the polygon shape
    const polygonPoints = [];

    // add new dots
    const dotRadius = dotMaxRadius - 0 - (Math.max(0, steps - 16) * 0.009);
    const dotRadiusRounded = Math.round(dotRadius * 10) / 10;
    radius3d = 8 + (steps > 16 ? (steps - 16) * 0.1 : 0);
    for (let i = 0; i < steps; i++) {
      let dot;
      const rad = TWO_PI * (i / steps);
      if (euclid[i]) {
        dot = createCircleOutlineFilled(dotRadiusRounded, colorHigh);
      } else {
        dot = createCircleOutline(dotRadiusRounded, colorHigh);
      }
      dot.name = 'dot';
      dot.translateX(Math.sin(rad) * radius3d);
      dot.translateY(Math.cos(rad) * radius3d);
      dot.visible = true;
      dots3d.add(dot);
      
      // add coordinate of filled dot to polygon points
      if (euclid[i]) {
        polygonPoints.push(dot.position.clone());
      }
    };
    
    // polygon is only drawn if there are at least 2 points
    if (polygonPoints.length > 1) {
      polygonPoints.push(polygonPoints[0].clone());
    }
    
    updatePolygon(polygonPoints);
    updateHitarea();
    updatePointer(isMute);
    updateZeroMarker(steps, rotation);
    updateRotatedMarker(rotation);
    updateLabelPosition();
  };

  /**
   * Update the current nacklace dot animations.
   */
  const updateNoteAnimations = () => {

    // dot animations
    Object.keys(dotAnimations).forEach(key => {
      const obj = dotAnimations[key];
      obj.scale -= 0.1;
      obj.dot.scale.set(obj.scale, obj.scale, 1);
      if (obj.isActive && obj.scale <= 1) {
        obj.dot.scale.set(1, 1, 1);
        delete dotAnimations[key];
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
   * Update the pointer that connects the dots.
   * @param {Boolean} isMute Show muted state.
   */
  const updatePointer = isMute => {
    const isSolo = false;
    const isNotSolo = false;
    const isNoteInControlled = false;
    const isMutedByNoteInControl = false;
    const mutedRadius = 4.5;
    const radius = (isMute || isNotSolo || isMutedByNoteInControl) ? mutedRadius : radius3d;
    const x = (isMute || isNotSolo || isMutedByNoteInControl) ? 1.5 : 2.9;
    const y = (isMute || isNotSolo || isMutedByNoteInControl) ? 2.5 : 0.7;
    
    const points = [];
    if (isNoteInControlled) {
      const halfRadius = centerRadius + ((radius - centerRadius) / 2);
      points.push(
        new Vector2(0, centerRadius),
        new Vector2(-0.9, halfRadius),
        new Vector2(0, radius),
        new Vector2(0.9, halfRadius),
        new Vector2(0, centerRadius),
      );
    } else {
      points.push(
        new Vector2(-x, y),
        new Vector2(0, radius),
        new Vector2(x, y),
      );
      if (isSolo) {
        points.push(
          new Vector2(0, radius),
          new Vector2(0, 1),
        );
      }
    }
    
    redrawShape(pointer3d, points, colorHigh);
  };
      
  /**
   * Update the polygon shape that connects the dots.
   * @param {array} points Coordinates of the shape points.
   */
  const updatePolygon = points => {
    if (points.length > 2) {
      polygon3d.visible = true;
    } else {
      polygon3d.visible = false;
      return;
    }
    
    const fill = polygon3d.getObjectByName('polygonFill');
    
    if (points.length > 3) {
        const fillShape = new Shape();
        fillShape.moveTo(points[0].x, points[0].y);
        for (let i = 1, n = points.length; i < n; i++) {
            fillShape.lineTo(points[i].x, points[i].y);
        }
        fillShape.lineTo(points[0].x, points[0].y);
        const fillGeom = new ShapeGeometry(fillShape);
        // TODO: only update vertices: https://threejs.org/docs/#manual/en/introduction/How-to-update-things
        // const fillBufferGeom = new BufferGeometry();
        // fillBufferGeom.fromGeometry(fillGeom);
        fill.geometry.dispose();
        fill.geometry = fillGeom;
        fill.visible = true;
    } else {
        fill.visible = false;
    }
    
    const line = polygon3d.getObjectByName('polygonLine');
    redrawShape(line, points, getTheme().colorLow);
  };

  /**
   * Update the marker that indicates if the pattern is rotated.
   * @param {Number} rotation Euclidean necklace rotation.
   */
  const updateRotatedMarker = rotation => {
    rotatedMarker3d.position.y = radius3d + 3;
    rotatedMarker3d.visible = rotation !== 0;
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
      case 'output_connector':
      case 'output_active':
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
   * Update the zero marker.
   * @param {Number} steps Euclidean necklace node amount.
   * @param {Number} rotation Euclidean necklace rotation.
   */
  const updateZeroMarker = (steps, rotation) => {
    const rad = TWO_PI * (rotation / steps);
    const radius = radius3d + 3;
    zeroMarker3d.position.x = Math.sin(rad) * radius;
    zeroMarker3d.position.y = Math.cos(rad) * radius;
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
