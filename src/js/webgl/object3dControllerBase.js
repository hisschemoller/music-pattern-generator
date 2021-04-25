import setText3d from './text3d.js';
import { getTheme } from '../state/selectors.js';

/**
 * Base functionality for processor 3D object controller.
 * @param {Object} obj3d The 3D object to control.
 * @param {Object} data Processor data.
 * @param {Boolean} isConnectMode True if app is in connect mode.
 */
export default function createObject3dControllerBase(obj3d, data, isConnectMode) {
  const object3d = obj3d;
  const id = object3d.userData.id;
  const hitarea3d = object3d.getObjectByName('hitarea');
  const label3d = object3d.getObjectByName('label');
  const select3d = object3d.getObjectByName('select');

  /**
   * @returns {String} The processor's ID.
   */
   const getId = () => id;

  /**
   * The app's state has changed.
   * @param {*} action 
   * @param {*} actions 
   * @param {*} state 
   */
  const handleStateChangesOnBase = (action, actions, state) => {
    switch (action.type) {

      case actions.CABLE_DRAG_END:
        updateConnectors(state.connectModeActive, false);
        break;
        
      case actions.CABLE_DRAG_START:
        updateConnectors(state.connectModeActive, true);
        break;

      case actions.CHANGE_PARAMETER:
        const { activeProcessorId, processors, } = state;
        if (activeProcessorId === id) {
          switch (action.paramKey) { 
            case 'name':
              updateLabel(processors.byId[id].params.byId.name.value);
              break;
          }
        }
        break;

      case actions.DRAG_SELECTED_PROCESSOR:
        updatePosition(state);
        break;

      case actions.TOGGLE_CONNECT_MODE:
        updateConnectors(state.connectModeActive, false);
        break;
    }
  };

  /**
   * Internal initialization.
   */
  const initialize = () => {
    const { name } = data.params.byId;
    updateLabel(name.value);
    updateConnectors(isConnectMode, false);
  };

  /**
   * Show connect mode on the precessor's connectors.
   * @param {Boolean} isConnectMode 
   */
  const updateConnectors = (isConnectMode, isDraggingCable) => {
    object3d.children.forEach(child3d => {
      if (child3d.name === 'input_hitarea') {
        child3d.getObjectByName('input_active').visible = isConnectMode && isDraggingCable;
      }
      if (child3d.name === 'output_hitarea') {
        child3d.getObjectByName('output_active').visible = isConnectMode && !isDraggingCable;
      }
    });
  }

  /**
   * Update the pattern's name.
   */
  const updateLabel = textContent => {
    setText3d(label3d, textContent.toUpperCase(), getTheme().colorHigh);
  };

  /** 
   * Set the 3D pattern's position in the scene.
   */
  const updatePosition = state => {
    const { processors, selectedId } = state;
    if (selectedId === id) {
      const { positionX, positionY, positionZ } = processors.byId[id];
      object3d.position.set(positionX, positionY, positionZ);
    }
  };

  /**
   * Show circle if the processor is selected, else hide.
   * @param {Boolean} isSelected True if selected.
   */
  const updateSelectCircle = selectedId => {
    select3d.visible = id === selectedId;
  };

  initialize();

  return {
    getId,
    handleStateChangesOnBase,
    hitarea3d,
    id,
    label3d,
    object3d,
    updateLabel,
    updateSelectCircle,
  };
}
