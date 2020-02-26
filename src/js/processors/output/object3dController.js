import { dispatch, getActions, STATE_CHANGE, } from '../../state/store.js';
import { getTheme } from '../../state/selectors.js';
import createObject3dControllerBase from '../../webgl/object3dControllerBase.js';
import { redrawShape, } from '../../webgl/draw3dHelper.js';

export function createObject3dController(data, that = {}, my = {}) {
  let centreCircle3d,
    select3d,

    initialize = function() {
      centreCircle3d = my.object3d.getObjectByName('centerCircle'),
      select3d = my.object3d.getObjectByName('select'),

      document.addEventListener(STATE_CHANGE, handleStateChanges);

      const params = data.processorData.params.byId;
      my.updateLabel(params.name.value);
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
              case 'name':
                my.updateLabel(params.name.value);
                break;
            }
          }
          break;

        case actions.DRAG_SELECTED_PROCESSOR:
          my.updatePosition(state);
          break;

        case actions.TOGGLE_CONNECT_MODE:
          my.updateConnectMode(state.connectModeActive);
          break;

        case actions.SET_THEME:
          updateTheme();
          break;
      }
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
     * @param {String} colorLow Hex color string of the new color.
     */
    setThemeColorRecursively = function(object3d, colorLow, colorHigh) {
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
        setThemeColorRecursively(childObject3d, colorLow, colorHigh);
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

  that = createObject3dControllerBase(data, that, my);

  initialize();

  that.terminate = terminate;
  that.updateSelectCircle = updateSelectCircle;
  that.draw = draw;
  return that;
}
