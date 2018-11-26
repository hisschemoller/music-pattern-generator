import {
  Geometry,
  Color,
  CubicBezierCurve,
  BufferGeometry,
  Line,
  LineBasicMaterial,
  Object3D,
  Shape,
  Vector2,
  Vector3,
  Group,
} from '../../lib/three.module.js';
import { getThemeColors } from '../state/selectors.js';
import { createCircleOutline } from './util3d.js';

export default function addConnections3d(specs, my) {
  let that,
    store = specs.store,
    state = {
      sourceProcessorID: null,
      sourceConnectorID: null,
      sourceConnectorPosition: null,
    },
    defaultColor,
    lineMaterial,
    currentCable,
    currentCableDragHandle,
    cablesGroup,
    dragHandleRadius = 1.5,
    
    init = function() {
      currentCableDragHandle = createCircleOutline(lineMaterial, dragHandleRadius);
      currentCableDragHandle.name = 'dragHandle';

      document.addEventListener(store.STATE_CHANGE, (e) => {
        switch (e.detail.action.type) {

          case e.detail.actions.TOGGLE_CONNECT_MODE:
            toggleConnectMode(e.detail.state.connectModeActive);
            // drawConnectCanvas(e.detail.state);
            // drawCables(e.detail.state);
            break;
          
          case e.detail.actions.ADD_PROCESSOR:
          case e.detail.actions.DELETE_PROCESSOR:
          case e.detail.actions.DRAG_SELECTED_PROCESSOR:
          case e.detail.actions.DRAG_ALL_PROCESSORS:
          case e.detail.actions.CONNECT_PROCESSORS:
          case e.detail.actions.DISCONNECT_PROCESSORS:
            // drawConnectCanvas(e.detail.state);
            clearCables();
            drawCables(e.detail.state);
            break;
          
          case e.detail.actions.CREATE_PROJECT:
            setTheme();
            clearCables();
            drawCables(e.detail.state);
            break;
          case e.detail.actions.SET_THEME:
            // createConnectorGraphic();
            setTheme();
            toggleConnectMode(e.detail.state.connectModeActive);
            // drawConnectCanvas(e.detail.state);
            break;
        }
      });
    },
        
    /**
     * Start dragging a connection cable.
     * @param {String} sourceProcessorID
     * @param {String} sourceConnectorID
     * @param {Vector3} sourceConnectorPosition
     */
    dragStartConnection = function(sourceProcessorID, sourceConnectorID, sourceConnectorPosition) {
      state = { ...state, sourceProcessorID, sourceConnectorID, sourceConnectorPosition, };
      currentCable = new Line(new BufferGeometry(), lineMaterial);
      currentCable.name = 'currentCable';
      cablesGroup.add(currentCable);

      currentCableDragHandle.position.copy(sourceConnectorPosition);
      cablesGroup.add(currentCableDragHandle);
    },
        
    /**
     * Drag a connection cable.
     * @param {Vector3} position3d
     */
    dragMoveConnection = function(position3d) {
      drawCable(
        currentCable.name,
        new Vector2(state.sourceConnectorPosition.x, state.sourceConnectorPosition.y), 
        new Vector2(position3d.x, position3d.y));
      currentCableDragHandle.position.copy(position3d);
    },

    dragEndConnection = function() {
      currentCable.geometry.dispose();
      currentCable.geometry = new Geometry();
      cablesGroup.remove(currentCable);
      cablesGroup.remove(currentCableDragHandle);
    },

    createConnection = function(destinationProcessorID, destinationConnectorID) {
      store.dispatch(store.getActions().connectProcessors({
        sourceProcessorID: state.sourceProcessorID, 
        sourceConnectorID: state.sourceConnectorID,
        destinationProcessorID: destinationProcessorID,
        destinationConnectorID: destinationConnectorID,
      }));
      state.sourceProcessorID = null;
      state.sourceConnectorID = null;
    },

    clearCables = function() {
      if (cablesGroup) {
        while (cablesGroup.children.length) {
          cablesGroup.remove(cablesGroup.children[0]);
        }
      }
    },

    drawCables = function(state) {
      if (!cablesGroup) {
        cablesGroup = new Group();
        my.scene.add(cablesGroup);
      }
      
      state.connections.allIds.forEach(connectionID => {
        const connection = state.connections.byId[connectionID];
        const sourceProcessor = state.processors.byId[connection.sourceProcessorID];
        const destinationProcessor = state.processors.byId[connection.destinationProcessorID];

        if (sourceProcessor && destinationProcessor) {
          const sourceConnector = sourceProcessor.outputs.byId[connection.sourceConnectorID];
          const destinationConnector = destinationProcessor.inputs.byId[connection.destinationConnectorID];
          
          const cable = createCable(connectionID);
          drawCable(
            connectionID,
            new Vector2(
              sourceProcessor.positionX + sourceConnector.x,
              sourceProcessor.positionY + sourceConnector.y,), 
            new Vector2(
              destinationProcessor.positionX + destinationConnector.x,
              destinationProcessor.positionY + destinationConnector.y,));
        }
      });
    },

    createCable = function(connectionID) {
      const cable = new Line(new BufferGeometry(), lineMaterial);
      cable.name = connectionID;
      cable.userData.type = 'cable';
      cablesGroup.add(cable);
      return cable;
    },

    /**
     * Enter or leave application connect mode.
     * @param {Vector3} sourcePosition Cable start position.
     * @param {Vector3} destinationPosition Cable end position.
     */
    drawCable = function(connectionID, sourcePosition, destinationPosition) {
      const cable = cablesGroup.getObjectByName(connectionID);
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
        cable.geometry.dispose();
        cable.geometry.setFromPoints(points);
      }
    },

    /**
     * Enter or leave application connect mode.
     * @param {Boolean} isEnabled True to enable connect mode.
     */
    toggleConnectMode = function(isEnabled) {
        my.isConnectMode = isEnabled;
    },
    
    setTheme = function() {
      defaultColor = getThemeColors().colorHigh;
      lineMaterial = new LineBasicMaterial({
        color: defaultColor,
      });
      currentCableDragHandle.material.color.set( defaultColor );
    };

  my = my || {};
  my.isConnectMode = false,
  // my.resizeConnections = resizeConnections;
  my.dragStartConnection = dragStartConnection;
  my.dragMoveConnection = dragMoveConnection;
  my.dragEndConnection = dragEndConnection;
  my.createConnection = createConnection;
  // my.intersectsConnector = intersectsConnector;
  // my.intersectsCableHandle = intersectsCableHandle;
  // my.addConnectionsToCanvas = addConnectionsToCanvas;
  
  that = specs.that || {};
  
  init();
  
  return that;
}
