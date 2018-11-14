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
      
    getID = function() {
      return my.id;
    };
  
  my.store = specs.store,
  my.id = specs.object3d.userData.id;
  my.object3d = specs.object3d;
  my.hitarea3d = my.object3d.getObjectByName('hitarea'),
  my.label3d = my.object3d.getObjectByName('label'),
  my.updateLabel = updateLabel;

  that = specs.that || {};
  that.getID = getID;
  return that;
}
