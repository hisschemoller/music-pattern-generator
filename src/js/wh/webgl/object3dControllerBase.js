import setText3d from './text3d.js';
import { getThemeColors } from '../state/selectors.js';

/**
 * Base object for all processor WebGL object controllers.
 *
 * @export
 * @param {Object} specs
 * @param {Object} my Shared properties.
 */
export default function createObject3dControllerBase(specs, my) {
  let that,
        
    /**
     * Update the pattern's name.
     */
    updateLabel = function(labelString) {
      setText3d(my.label3d, labelString.toUpperCase(), getThemeColors().colorHigh);
    },

    /** 
     * Set the 3D pattern's position in the scene.
     */
    updatePosition = function(state) {
      if (state.selectedID === my.id) {
        const data = state.processors.byId[my.id];
        my.object3d.position.set(data.positionX, data.positionY, data.positionZ);
      }
    },

    updateConnectMode = function(state) {
      my.object3d.children.forEach(child3d => {
        if (child3d.name === 'input' || child3d.name === 'output') {
          child3d.getObjectByName('active').visible = state.connectModeActive;
        }
      });
    },

    getID = function() {
      return my.id;
    };
  
  my.store = specs.store,
  my.id = specs.object3d.userData.id;
  my.object3d = specs.object3d;
  my.hitarea3d = my.object3d.getObjectByName('hitarea'),
  my.label3d = my.object3d.getObjectByName('label'),
  my.updateLabel = updateLabel;
  my.updatePosition = updatePosition;
  my.updateConnectMode = updateConnectMode;

  that = specs.that || {};
  that.getID = getID;
  return that;
}
