
import { getThemeColors } from '../../state/selectors.js';
import createObject3dControllerBase from '../../webgl/object3dControllerBase.js';

export function createObject3dController(specs, my) {
  let that,
    centreCircle3d,
    select3d,

    initialize = function() {
      centreCircle3d = my.object3d.getObjectByName('centreCircle'),
      select3d = my.object3d.getObjectByName('select'),

      document.addEventListener(my.store.STATE_CHANGE, handleStateChanges);

      const params = specs.processorData.params.byId;
      my.updateLabel(params.name.value);
      my.updateConnectMode(specs.isConnectMode);
    },

    terminate = function() {
      document.removeEventListener(my.store.STATE_CHANGE, handleStateChanges);
    },

    handleStateChanges = function(e) {
      const processor = e.detail.state.processors.byId[my.id];
      switch (e.detail.action.type) {
        
        case e.detail.actions.CHANGE_PARAMETER:
          if (e.detail.action.processorID === my.id) {
            const params = e.detail.state.processors.byId[my.id].params.byId;
            switch (e.detail.action.paramKey) {
              case 'name':
                my.updateLabel(params.name.value);
                break;
            }
          }
          break;

        case e.detail.actions.DRAG_SELECTED_PROCESSOR:
          my.updatePosition(e.detail.state);
          break;

        case e.detail.actions.TOGGLE_CONNECT_MODE:
          my.updateConnectMode(e.detail.state.connectModeActive);
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
              
    /**
     * Show circle if the processor is selected, else hide.
     * @param {Boolean} isSelected True if selected.
     */
    updateSelectCircle = function(selectedId) {
      select3d.visible = my.id === selectedId;
    },
      
    draw = function(position, processorEvents) {
      
    };
  
  my = my || {};

  that = createObject3dControllerBase(specs, my);

  initialize();

  that.terminate = terminate;
  that.updateSelectCircle = updateSelectCircle;
  that.draw = draw;
  return that;
}
