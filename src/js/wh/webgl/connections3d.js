import {
  Geometry,
  Color,
  BufferGeometry,
  Line,
  LineBasicMaterial,
  Object3D,
  Shape,
  Vector3,
  Group,
} from '../../lib/three.module.js';
import { getThemeColors } from '../state/selectors.js';

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
    cablesGroup,
    
    init = function() {
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
      currentCable = new Line(new Geometry(), lineMaterial);
      my.scene.add(currentCable);
    },
        
    /**
     * Drag a connection cable.
     * @param {Vector3} position3d
     */
    dragMoveConnection = function(position3d) {
      const geometry = new Geometry();
      geometry.vertices.push(state.sourceConnectorPosition.clone(), position3d.clone());
      currentCable.geometry.dispose();
      currentCable.geometry = geometry;
    },

    dragEndConnection = function() {
      currentCable.geometry.dispose();
      currentCable.geometry = new Geometry();
      my.scene.remove(currentCable);
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
        const sourceProcessor = my.scene.children.find(object3d => object3d.userData.id === connection.sourceProcessorID);
        const destinationProcessor = my.scene.children.find(object3d => object3d.userData.id === connection.destinationProcessorID);
        
        if (sourceProcessor && destinationProcessor) {
          const sourceConnector = sourceProcessor.children.find(object3d => object3d.userData.id === connection.sourceConnectorID);
          const destinationConnector = destinationProcessor.children.find(object3d => object3d.userData.id === connection.destinationConnectorID);
          const sourcePosition = new Vector3().addVectors(sourceProcessor.position, sourceConnector.position);
          const destinationPosition = new Vector3().addVectors(destinationProcessor.position, destinationConnector.position);
          const handlePosition = drawCable(sourcePosition, destinationPosition);

          // cableData.byId[connectionID] = {
          //     handleX: handlePosition.x,
          //     handleY: handlePosition.y
          // };
          // cableData.allIds.push(connectionID);
        }
      });
    },

    drawCable = function(sourcePosition, destinationPosition) {
      const geometry = new Geometry();
      geometry.vertices.push(sourcePosition, destinationPosition);
      const cable = new Line(geometry, lineMaterial);
      cablesGroup.add(cable);
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
