import {
  Geometry,
  LineBasicMaterial,
  Shape,
  ShapeGeometry,
  Vector3,
} from '../../../lib/three.module.js';
import { getThemeColors } from '../../state/selectors.js';
import createObject3dControllerBase from '../../webgl/object3dControllerBase.js';
import { getEuclidPattern, rotateEuclidPattern } from './euclid.js';
import { PPQN } from '../../core/config.js';
import {
  createCircleOutline,
  createCircleOutlineFilled,
} from '../../webgl/util3d.js';

const TWO_PI = Math.PI * 2;

export function createObject3dController(specs, my) {
  let that,
    centreCircle3d,
    centreDot3d,
    dots3d,
    pointer3d,
    polygon3d,
    rotatedMarker3d,
    select3d,
    zeroMarker3d,
    radius3d,
    lineMaterial,
    duration,
    pointerRotation,
    pointerRotationPrevious = 0,
    dotAnimations = {},
    defaultColor,

    initialize = function() {
      centreCircle3d = my.object3d.getObjectByName('centreCircle'),
      centreDot3d = my.object3d.getObjectByName('centreDot'),
      dots3d = my.object3d.getObjectByName('dots'),
      pointer3d = my.object3d.getObjectByName('pointer'),
      polygon3d = my.object3d.getObjectByName('polygon'),
      rotatedMarker3d = my.object3d.getObjectByName('rotatedMarker'),
      select3d = my.object3d.getObjectByName('select'),
      zeroMarker3d = my.object3d.getObjectByName('zeroMarker'),

      document.addEventListener(my.store.STATE_CHANGE, handleStateChanges);
    
      defaultColor = getThemeColors().colorHigh;
      lineMaterial = new LineBasicMaterial({
        color: defaultColor,
      });

      const params = specs.processorData.params.byId;
      my.updateLabel(params.name.value);
      updateNecklace(params.steps.value, params.pulses.value, params.rotation.value, params.is_mute.value);
      updateDuration(params.steps.value, params.rate.value);
    },

    terminate = function() {
      document.removeEventListener(my.store.STATE_CHANGE, handleStateChanges);
    },

    handleStateChanges = function(e) {
      switch (e.detail.action.type) {
        case e.detail.actions.CHANGE_PARAMETER:
          if (e.detail.action.processorID === my.id) {
            let params = e.detail.state.processors.byId[my.id].params.byId;
            switch (e.detail.action.paramKey) {
              case 'steps':
              case 'pulses':
                updateDuration(params.steps.value, params.rate.value);
                // fall through intended
              case 'rotation':
                updateNecklace(params.steps.value, params.pulses.value, params.rotation.value, params.is_mute.value);
                break;
              case 'is_triplets':
              case 'rate':
              case 'note_length':
                updateDuration(params.steps.value, params.rate.value);
                break;
              case 'name':
                my.updateLabel(params.name.value);
                break;
              case 'is_mute':
                updatePointer(params.is_mute.value);
                break;
            }
          }
          break;

        case e.detail.actions.DRAG_SELECTED_PROCESSOR:
          updatePosition(e.detail.state);
          break;

        case e.detail.actions.SET_THEME:
          updateTheme();
          break;
      }
    },

    /** 
     * Set theme colors on the 3D pattern.
     */
    updateTheme = function() {
      const themeColors = getThemeColors();
      setThemeColorRecursively(my.object3d, themeColors.colorHigh);
    },

    updatePosition = function(state) {
      if (state.selectedID === my.id) {
        const data = state.processors.byId[my.id];
        my.object3d.position.set(data.positionX, data.positionY, data.positionZ);
      }
    },

    /** 
     * Loop through all the object3d's children to set the color.
     * @param {Object3d} An Object3d of which to change the color.
     * @param {String} HEx color string of the new color.
     */
    setThemeColorRecursively = function(object3d, color) {
      if (object3d.material && object3d.material.color) {
        object3d.material.color.set( color );
      }
      object3d.children.forEach(childObject3d => {
        setThemeColorRecursively(childObject3d, color);
      });
    },

    updateNecklace = function(steps, pulses, rotation, isMute) {
      // create the pattern
      let euclid = getEuclidPattern(steps, pulses);
      euclid = rotateEuclidPattern(euclid, rotation);

      // remove all existing necklace dots
      for (let i = 0, n = dots3d.children.length; i < n; i++) {
        dots3d.remove(dots3d.children[0]);
      }

      // 
      const polygonPoints = [];

      // add new dots
      radius3d = 8 + (steps > 16 ? (steps - 16) * 0.5 : 0);
      for (let i = 0; i < steps; i++) {
        let dot;
        const rad = TWO_PI * (i / steps);
        if (euclid[i]) {
          dot = createCircleOutlineFilled(lineMaterial, defaultColor, 1);
        } else {
          dot = createCircleOutline(lineMaterial, 1);
        }
        // dot.scale.set(0.1, 0.1, 1);
        dot.translateX(Math.sin(rad) * radius3d);
        dot.translateY(Math.cos(rad) * radius3d);
        dot.visible = true;
        dots3d.add(dot);
        
        // add coordinate of filled dot to polygon points
        if (euclid[i]) {
          polygonPoints.push(dot.position.clone());
        }
      }
      
      polygonPoints.push(polygonPoints[0].clone());

      updatePolygon(polygonPoints);
      updateHitarea();
      updatePointer(isMute);
      updateZeroMarker(steps, rotation);
      updateRotatedMarker(rotation);
      updateLabelPosition();
    },
            
    /**
     * Update the polygon shape that connects the dots.
     * @param {array} points Coordinates of the shape points.
     */
    updatePolygon = function(points) {
        let i, n, line, lineGeom, fillShape, fillGeom;
        
        if (points.length > 2) {
            polygon3d.visible = true;
        } else {
            polygon3d.visible = false;
            return;
        }
        
        const fill = polygon3d.getObjectByName('polygonFill');

        if (points.length > 3) {
            fillShape = new Shape();
            fillShape.moveTo(points[0].x, points[0].y);
            n = points.length;
            for (i = 1; i < n; i++) {
                fillShape.lineTo(points[i].x, points[i].y);
            }
            fillShape.lineTo(points[0].x, points[0].y);
            fillGeom = new  ShapeGeometry(fillShape);
            fill.geometry = fillGeom;
            fill.visible = true;
        } else {
            fill.visible = false;
        }
        
        line = polygon3d.getObjectByName('polygonLine');
        line.geometry.dispose();
        line.geometry = new Geometry();
        line.geometry.vertices = points;
        line.geometry.verticesNeedUpdate = true;
    },
            
    /**
     * Update the hitarea used for mouse detection.
     */
    updateHitarea = function() {
        const scale = (radius3d + 3) * 0.1;
        my.hitarea3d.scale.set(scale, scale, 1);
    },
            
    /**
     * Update the pointer that connects the dots.
     */
    updatePointer = function(isMute) {
      let isSolo = false,
        isNotSolo = false,
        isNoteInControlled = false,
        isMutedByNoteInControl = false,
        mutedRadius = 4.5,
        radius = (isMute || isNotSolo || isMutedByNoteInControl) ? mutedRadius : radius3d;
      pointer3d.geometry.dispose();
      pointer3d.geometry = createPointerGeometry(radius, isSolo, isNoteInControlled);
    },
            
    /**
     * Create geometry for the pointer.
     * Also used by the pointer update function.
     * @param {Number} radius Pointer radius.
     * @param {Boolean} isSolo Pointer shows solo state.
     * @param {Boolean} isNoteInControlled Pointer shows external control state.
     * @return {Object} Three.js Geometry object.
     */
    createPointerGeometry = function(radius, isSolo, isNoteInControlled) {
      var geometry = new Geometry();
      if (isNoteInControlled) {
        var halfRadius = centreRadius + ((radius - centreRadius) / 2);
        geometry.vertices.push(
            new Vector3(0.0, centreRadius, 0.0),
            new Vector3(-0.9, halfRadius, 0.0),
          new Vector3(0.0, radius, 0.0),
            new Vector3(0.9, halfRadius, 0.0),
            new Vector3(0.0, centreRadius, 0.0)
        );
      } else {
        geometry.vertices.push(
          new Vector3(-2.9, 0.7, 0.0),
          new Vector3(0.0, radius, 0.0),
          new Vector3(2.9, 0.7, 0.0)
        );
        
        if (isSolo) {
          geometry.vertices.push(
            new Vector3(0.0, radius, 0.0),
            new Vector3(0.0, 1.0, 0.0)
          );
        }
      }
      
      return geometry;
    },
            
    /**
     * Update the zero marker.
     * @param {Number} steps Euclidean necklace node amount.
     * @param {Number} rotation Euclidean necklace rotation.
     */
    updateZeroMarker = function(steps, rotation) {
        var rad = TWO_PI * (-rotation / steps),
            radius = radius3d + 3;
        zeroMarker3d.position.x = Math.sin(rad) * radius;
        zeroMarker3d.position.y = Math.cos(rad) * radius;
    },
            
    /**
     * Update the marker that indicates if the pattern is rotated.
     * @param {Number} rotation Euclidean necklace rotation.
     */
    updateRotatedMarker = function(rotation) {
        rotatedMarker3d.position.y = radius3d + 3;
        rotatedMarker3d.visible = rotation !== 0;
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
    
    draw = function(position, processorEvents) {
      showPlaybackPosition(position);
      updateNoteAnimations();

      if (processorEvents[my.id] && processorEvents[my.id].length) {
        for (let i = 0, n = processorEvents[my.id].length; i < n; i++) {
          const event = processorEvents[my.id][i];
          startNoteAnimation(event.stepIndex, event.delayFromNowToNoteStart, event.delayFromNowToNoteEnd);
        }
      }
    },
        
    /**
     * Show the playback position within the pattern.
     * Indicated by the pointer's rotation.
     * @param  {Number} position Position within pattern in ticks.
     */
    showPlaybackPosition = function(position) {
        pointerRotationPrevious = pointerRotation;
        pointerRotation = TWO_PI * (-position % duration / duration);
        pointer3d.rotation.z = pointerRotation;
    },
        
    /**
     * Show animation of the pattern dot that is about to play. 
     * @param {Number} stepIndex Index of the step to play.
     * @param {Number} noteStartDelay Delay from now until note start in ms.
     * @param {Number} noteStopDelay Delay from now until note end in ms.
     */
    startNoteAnimation = function(stepIndex, noteStartDelay, noteStopDelay) {
      const dot = dots3d.children[stepIndex];
      
      // retain necklace dot state in object
      dotAnimations[stepIndex] = {
          dot,
          scale: 0.1,
          isActive: false,
      }

      // delay start of animation
      setTimeout(() => {
          let tweeningDot = dotAnimations[stepIndex];
          tweeningDot.scale = 0.2;
          tweeningDot.isActive = true;
      }, noteStartDelay);
    },

    /**
     * Update the current nacklace dot animations.
     */
    updateNoteAnimations = function() {
      let largestScale = 0;
      let isNoteActive = false;

      Object.keys(dotAnimations).forEach(key => {
        const obj = dotAnimations[key];
        obj.scale /= 1.07;
        obj.dot.scale.set(obj.scale, obj.scale, 1);
        largestScale = Math.max(largestScale, obj.scale);
        isNoteActive = true;
        if (obj.isActive && obj.scale <= 0.1) {
          obj.dot.scale.set(0.1, 0.1, 1);
          delete dotAnimations[key];
        }
      });
            
      // center dot
      centreDot3d.visible = isNoteActive;
      if (isNoteActive) {
        centreDot3d.scale.set(largestScale, largestScale, 1);
      }
    };
  
  my = my || {};

  that = createObject3dControllerBase(specs, my);

  initialize();

  that.terminate = terminate;
  that.updateSelectCircle = updateSelectCircle;
  that.draw = draw;
  return that;
}
