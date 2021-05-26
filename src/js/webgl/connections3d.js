import { dispatch, getActions, STATE_CHANGE, } from '../state/store.js';
import { getTheme } from '../state/selectors.js';
import {
  createCircleFilled,
  createCircleOutline,
  createShape,
  redrawShape,
} from './draw3dHelper.js';
import { getScene } from './canvas3d.js';
import {
  CubicBezierCurve,
  Group,
  Vector2,
  Vector3,
} from '../lib/threejs/build/three.module.js';

const deleteButtonRadius = 2.0,
  deleteCrossRadius = 0.8,
  dragHandleRadius = 1.5;

let currentCable,
  currentCableDragHandle,
  cablesGroup
    
/**
 * Drag connection cable ended.
 */
function dragEndConnection() {
  currentCable.geometry.dispose();
  cablesGroup.remove(currentCable);
  cablesGroup.remove(currentCableDragHandle);
}

/**
 * Drag a connection cable.
 * @param {Vector3} position3d
 */
function dragMoveConnection(state) {
  const { source, destination, } = state.cableDrag;
  drawCable(
    currentCable.name,
    new Vector2(source.x, source.y), 
    new Vector2(destination.x, destination.y));
  currentCableDragHandle.position.copy(new Vector3(destination.x, destination.y, destination.z));
}

/**
 * Start dragging a connection cable.
 * @param {String} sourceProcessorId
 * @param {String} sourceConnectorId
 * @param {Vector3} sourceConnectorPosition
 */
function dragStartConnection(state) {
  const { source, } = state.cableDrag;
  currentCable = createShape();
  currentCable.name = 'currentCable';
  cablesGroup.add(currentCable);

  currentCableDragHandle.position.copy(new Vector3(source.x, source.y, source.z));
  cablesGroup.add(currentCableDragHandle);
}

/**
 * Provide Canvas3D with the cablesGroup for mouseclick intersection.
 */
export function getCablesGroup() {
  return cablesGroup;
}

export function setup() {
  currentCableDragHandle = createCircleOutline(dragHandleRadius, getTheme().colorHigh);
  currentCableDragHandle.name = 'dragHandle';

  addEventListeners();
}

function addEventListeners() {
  document.addEventListener(STATE_CHANGE, handleStateChanges);
}

/**
 * Draw all cables acctording to the (local) state.
 * @param {String} connectionId Connection ID.
 * @return {Object} Cable object3d.
 */
function createCable(connectionId, isConnectMode) {
  const { colorLow } = getTheme();

  const cable = createShape();
  cable.name = connectionId;
  cablesGroup.add(cable);

  const deleteBtn = createCircleFilled(deleteButtonRadius, colorLow, 0);
  deleteBtn.name = 'delete';
  deleteBtn.userData.connectionId = connectionId;
  deleteBtn.visible = isConnectMode;
  cable.add(deleteBtn);

  const deleteBtnBorder = createCircleOutline(deleteButtonRadius, colorLow);
  deleteBtnBorder.name = 'deleteBorder';
  deleteBtn.add(deleteBtnBorder);

  const points1 = [
    new Vector2(-deleteCrossRadius, -deleteCrossRadius),
    new Vector2(deleteCrossRadius,  deleteCrossRadius),
  ];
  const line1 = createShape(points1, colorLow);
  line1.name = 'deleteCross1';
  deleteBtn.add(line1);

  const points2 = [
    new Vector2(-deleteCrossRadius,  deleteCrossRadius),
    new Vector2(deleteCrossRadius, -deleteCrossRadius),
  ];
  const line2 = createShape(points2, colorLow);
  line2.name = 'deleteCross2';
  deleteBtn.add(line2);

  return cable;
}

/**
 * Enter or leave application connect mode.
 * @param {Vector3} sourcePosition Cable start position.
 * @param {Vector3} destinationPosition Cable end position.
 */
function drawCable(connectionId, sourcePosition, destinationPosition) {
  const cable = cablesGroup.getObjectByName(connectionId);
  if (cable) {
    const distance = sourcePosition.distanceTo(destinationPosition);
    const curveStrength = Math.min(distance / 2, 30);
    const curve = new CubicBezierCurve(
      sourcePosition.clone(),
      sourcePosition.clone().sub(new Vector2(0, curveStrength)),
      destinationPosition.clone().add(new Vector2(0, curveStrength)),
      destinationPosition.clone()
    );
    const points = curve.getPoints(50);
    
    redrawShape(cable, points, getTheme().colorLow);

    const deleteBtn = cable.getObjectByName('delete');
    if (deleteBtn) {
      
      // get mid point on cable
      const position = points[Math.floor(points.length / 2)];
      deleteBtn.position.set(position.x, position.y, 0);
    }
  }
}

/**
 * Draw all cables acctording to the state.
 * @param {Object} state Application state.
 */
function drawCables(state) {
  state.connections.allIds.forEach(connectionId => {
    const connection = state.connections.byId[connectionId];
    const sourceProcessor = state.processors.byId[connection.sourceProcessorId];
    const destinationProcessor = state.processors.byId[connection.destinationProcessorId];

    if (sourceProcessor && destinationProcessor) {
      const sourceConnector = sourceProcessor.outputs.byId[connection.sourceConnectorId];
      const destinationConnector = destinationProcessor.inputs.byId[connection.destinationConnectorId];
      
      drawCable(
        connectionId,
        new Vector2(
          sourceProcessor.positionX + sourceConnector.x,
          sourceProcessor.positionY + sourceConnector.y,), 
        new Vector2(
          destinationProcessor.positionX + destinationConnector.x,
          destinationProcessor.positionY + destinationConnector.y,));
    }
  });
}

/**
 * Handle state changes.
 * @param {Object} e 
 */
function handleStateChanges(e) {
  const { state, action, actions, } = e.detail;
  switch (action.type) {
    case actions.TOGGLE_CONNECT_MODE:
      toggleConnectMode(state);
      break;
    
    case actions.DELETE_PROCESSOR:
    case actions.CREATE_CONNECTION:
    case actions.DISCONNECT_PROCESSORS:
      updateCables(state);
      drawCables(state);
      break;
    
    case actions.DRAG_SELECTED_PROCESSOR:
    case actions.DRAG_ALL_PROCESSORS:
      drawCables(state);
      break;
    
    case actions.CABLE_DRAG_END:
      dragEndConnection();
      break;

    case actions.CABLE_DRAG_MOVE:
      dragMoveConnection(state);
      break;

    case actions.CABLE_DRAG_START:
      dragStartConnection(state);
      break;
    
    case actions.CREATE_PROJECT:
      updateTheme();
      updateCables(state);
      drawCables(state);
      toggleConnectMode(state);
      break;

    case actions.SET_THEME:
      updateTheme();
      toggleConnectMode(state);
      break;
  }
}

/**
 * Enter or leave application connect mode.
 * @param {Boolean} isEnabled True to enable connect mode.
 */
function toggleConnectMode(state) {

    // toggle cable delete buttons
    cablesGroup.children.forEach(cable => {
      const deleteBtn = cable.getObjectByName('delete');
      deleteBtn.visible = state.connectModeActive;
    });
}

/**
 * Create and delete cables acctording to the state.
 * @param {Object} state Application state.
 */
function updateCables(state) {
  if (!cablesGroup) {
    cablesGroup = new Group();
    getScene().add(cablesGroup);
  }

  // delete all removed cables
  let count = cablesGroup.children.length;
  while (--count >= 0) {
    const cable = cablesGroup.children[count];
    if (state.connections.allIds.indexOf(cable.name) === -1) {
      cablesGroup.remove(cable);
    }
  }

  // create all new cables
  state.connections.allIds.forEach(connectionId => {
    if (!cablesGroup.getObjectByName(connectionId)) {
      createCable(connectionId, state.isConnectMode);
    }
  });
}

/**
 * Update theme colors.
 */
function updateTheme() {
  if (cablesGroup) {
    const { colorLow, colorHigh } = getTheme();
    setThemeColorRecursively(cablesGroup, colorLow, colorHigh);
  }
}

/** 
 * Loop through all the object3d's children to set the color.
 * @param {Object3d} object3d An Object3d of which to change the color.
 * @param {String} colorLow Hex color string of the low contrast color.
 * @param {String} colorHigh Hex color string of the high contrast color.
 */
function setThemeColorRecursively(object3d, colorLow, colorHigh) {
  redrawShape(object3d, object3d.userData.points, colorLow);
  
  object3d.children.forEach(childObject3d => {
    setThemeColorRecursively(childObject3d, colorLow, colorHigh);
  });
}
