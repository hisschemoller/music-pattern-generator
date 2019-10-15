import orderProcessors from '../midi/network_ordering.js';

const initialState = {
  assignments: {
    allIds: [],
    byId: {},
  },
  bpm: 120,
  camera: {
    x: 0,
    y: 0,
    z: 0,
  },
  connections: {
    allIds: [],
    byId: {},
  },
  connectModeActive: false,
  learnModeActive: false,
  learnTargetParameterKey: null,
  learnTargetProcessorID: null,
  libraryDropPosition: {
    type: null,
    x: 0,
    y: 0,
  },
  ports: {
    allIds: [],
    byId: {},
  },
  processors: {
    allIds: [],
    byId: {},
  },
  selectedID: null,
  showHelpPanel: false,
  showLibraryPanel: true,
  showPreferencesPanel: false,
  showSettingsPanel: false,
  theme: 'dev', // 'light|dark' 
  transport: 'stop', // 'play|pause|stop'
  version: '2.1.0-beta.2',
};

/**
 * 
 * @param {Object} state 
 * @param {Object} action 
 * @param {String} action.type
 */
export default function reduce(state = initialState, action, actions = {}) {
  let newState;
  switch(action.type) {

    case actions.CREATE_PROJECT:
      return { 
        ...initialState, 
        ...(action.data || {}),
        transport: initialState.transport,
      };

    case actions.SET_THEME:
      return { 
        ...state, 
        theme: state.theme === 'light' ? 'dark' : 'light',
      };

      case actions.ADD_PROCESSOR:
          newState = { 
              ...state,
              showSettingsPanel: true,
              processors: {
                  byId: { 
                      ...state.processors.byId,
                      [action.data.id]: action.data
                  },
                  allIds: [ ...state.processors.allIds ]
              } };

          // array index depends on processor type
          let numInputProcessors = newState.processors.allIds.filter(id => { newState.processors.byId[id].type === 'input' }).length;
          switch (action.data.type) {
              case 'input':
                  newState.processors.allIds.unshift(action.data.id);
                  numInputProcessors++;
                  break;
              case 'output':
                  newState.processors.allIds.push(action.data.id);
                  break;
              default:
                  newState.processors.allIds.splice(numInputProcessors, 0, action.data.id);
          }
          
          return newState;
      
      case actions.DELETE_PROCESSOR:
          const index = state.processors.allIds.indexOf(action.id);
          
          // delete the processor
          newState = { 
              ...state,
              processors: {
                  byId: { ...state.processors.byId },
                  allIds: state.processors.allIds.filter(id => id !== action.id)
              } };
          delete newState.processors.byId[action.id];
          
          // delete all connections to and from the deleted processor
          newState.connections = {
              byId: { ...state.connections.byId },
              allIds: [ ...state.connections.allIds ]
          }
          for (let i = newState.connections.allIds.length -1, n = 0; i >= n; i--) {
              const connectionID = newState.connections.allIds[i];
              const connection = newState.connections.byId[connectionID];
              if (connection.sourceProcessorID === action.id || connection.destinationProcessorID === action.id) {
                  newState.connections.allIds.splice(i, 1);
                  delete newState.connections.byId[connectionID];
              }
          }

          // select the next processor, if any, or a previous one
          let newIndex;
          if (newState.selectedID === action.id && newState.processors.allIds.length) {
              if (newState.processors.allIds[index]) {
                  newIndex = index;
              } else if (index > 0) {
                  newIndex = index - 1;
              } else {
                  newIndex = 0;
              }
              newState.selectedID = newState.processors.allIds[newIndex];
          }
          
          // reorder the processors
          orderProcessors(newState);

          return newState;
      
      case actions.SELECT_PROCESSOR:
          return { ...state, selectedID: action.id };
      
      case actions.DRAG_SELECTED_PROCESSOR:
          return {
              ...state,
              processors: {
                  allIds: [ ...state.processors.allIds ],
                  byId: Object.values(state.processors.byId).reduce((accumulator, processor) => {
                      if (processor.id === state.selectedID) {
                          accumulator[processor.id] = { ...processor, positionX: action.x, positionY: action.y, positionZ: action.z };
                      } else {
                          accumulator[processor.id] = { ...processor };
                      }
                      return accumulator;
                  }, {})
              } };

      case actions.DRAG_ALL_PROCESSORS:
          return {
              ...state,
              processors: {
                  allIds: [ ...state.processors.allIds ],
                  byId: Object.values(state.processors.byId).reduce((accumulator, processor) => {
                      accumulator[processor.id] = { 
                          ...processor, 
                          positionX: processor.positionX + action.x, 
                          positionY: processor.positionY + action.y };
                      return accumulator;
                  }, {})
              } };
      
      case actions.CHANGE_PARAMETER:
          newState = { 
              ...state,
              processors: {
                  byId: { ...state.processors.byId },
                  allIds: [ ...state.processors.allIds ]
              } };
          const param = newState.processors.byId[action.processorID].params.byId[action.paramKey];
          switch (param.type) {
              case 'integer':
                  param.value = Math.max(param.min, Math.min(action.paramValue, param.max));
                  break;
              case 'boolean':
                  param.value = !!action.paramValue;
                  break;
              case 'itemized':
                  param.value = action.paramValue;
                  break;
              case 'string':
                  param.value = action.paramValue;
                  break;
          }
          return newState;
      
      case actions.RECREATE_PARAMETER:
          // clone state
          newState = { 
              ...state,
              processors: {
                  byId: { ...state.processors.byId },
                  allIds: [ ...state.processors.allIds ]
              } };
          
          // clone parameter, overwrite with new settings.
          newState.processors.byId[action.processorID].params.byId[action.paramKey] = {
              ...newState.processors.byId[action.processorID].params.byId[action.paramKey],
              ...action.paramObj
          };
          
          return newState;
      
      case actions.SET_TEMPO:
          return { ...state, bpm: action.value };

      case actions.CREATE_MIDI_PORT:
          return {
              ...state,
              ports: {
                  allIds: [ ...state.ports.allIds, action.portID ],
                  byId: { 
                      ...state.ports.byId,
                      [action.portID]: action.data
                  }
              }
          };

      case actions.UPDATE_MIDI_PORT:
          return {
              ...state,
              ports: {
                  allIds: [ ...state.ports.allIds ],
                  byId: Object.values(state.ports.byId).reduce((returnObject, port) => {
                      if (port.id === action.portID) {
                          returnObject[port.id] = { ...port, ...action.data };
                      } else {
                          returnObject[port.id] = { ...port };
                      }
                      return returnObject;
                  }, {})
              }
          };
      
      case actions.TOGGLE_MIDI_PREFERENCE:
          return {
              ...state,
              ports: {
                  allIds: [ ...state.ports.allIds ],
                  byId: Object.values(state.ports.allIds).reduce((accumulator, portID) => {
                      if (portID === action.id) {
                          accumulator[portID] = { 
                              ...state.ports.byId[portID],
                              [action.preferenceName]: typeof action.isEnabled === 'boolean' ? isEnabled : !state.ports.byId[action.id][action.preferenceName]
                          };
                      } else {
                          accumulator[portID] = { ...state.ports.byId[portID] };
                      }
                      return accumulator;
                  }, {})
              }
          };
      
      case actions.TOGGLE_MIDI_LEARN_MODE:
          return { ...state, learnModeActive: !state.learnModeActive };
      
      case actions.TOGGLE_MIDI_LEARN_TARGET:
          return { 
              ...state, 
              learnTargetProcessorID: action.processorID, 
              learnTargetParameterKey: action.parameterKey 
          };
      
      case actions.SET_TRANSPORT:
          let value = action.command;
          if (action.command === 'toggle') {
              value = state.transport === 'play' ? 'pause' : 'play';
          }
          return Object.assign({}, state, { 
              transport: value
          });

      case actions.ASSIGN_EXTERNAL_CONTROL:
          return {
              ...state,
              assignments: {
                  allIds: [...state.assignments.allIds, action.assignID],
                  byId: {
                      ...state.assignments.byId,
                      [action.assignID]: {
                          remoteChannel: action.remoteChannel,
                          remoteCC: action.remoteCC,
                          processorID: action.processorID,
                          paramKey: action.paramKey
                      }
                  }
              }
          };
      
      case actions.UNASSIGN_EXTERNAL_CONTROL:
          return {
              ...state,
              assignments: {
                  allIds: state.assignments.allIds.reduce((accumulator, assignID) => {
                      const assignment = state.assignments.byId[assignID];
                      if (assignment.processorID !== action.processorID || assignment.paramKey !== action.paramKey) {
                          accumulator.push(assignID);
                      }
                      return accumulator;
                  }, []),
                  byId: state.assignments.allIds.reduce((accumulator, assignID) => {
                      const assignment = state.assignments.byId[assignID];
                      if (assignment.processorID !== action.processorID || assignment.paramKey !== action.paramKey) {
                          accumulator[assignID] = {...assignment};
                      }
                      return accumulator;
                  }, {})
              }
          };
      
      case actions.TOGGLE_PANEL:
          return {
              ...state,
              showHelpPanel: action.panelName === 'help' ? !state.showHelpPanel : state.showHelpPanel,
              showPreferencesPanel: action.panelName === 'preferences' ? !state.showPreferencesPanel : state.showPreferencesPanel,
              showSettingsPanel: action.panelName === 'settings' ? !state.showSettingsPanel : state.showSettingsPanel,
              showLibraryPanel: action.panelName === 'library' ? !state.showLibraryPanel : state.showLibraryPanel
          };
      
      case actions.TOGGLE_CONNECT_MODE:
          return {
              ...state,
              connectModeActive: !state.connectModeActive
          };
      
      case actions.CONNECT_PROCESSORS:

          // abort if the connection already exists
          for (let i = 0, n = state.connections.allIds.length; i < n; i++) {
              const connection = state.connections.byId[state.connections.allIds[i]];
              if (connection.sourceProcessorID === action.payload.sourceProcessorID &&
                  connection.sourceConnectorID === action.payload.sourceConnectorID &&
                  connection.destinationProcessorID === action.payload.destinationProcessorID &&
                  connection.destinationConnectorID === action.payload.destinationConnectorID) {
                  return state;
              } 
          }

          // add new connection
          newState = {
              ...state,
              connections: {
                  byId: { ...state.connections.byId, [action.id]: action.payload },
                  allIds: [ ...state.connections.allIds, action.id ]
              },
              processors: {
                  byId: { ...state.processors.byId },
                  allIds: [ ...state.processors.allIds ]
              }
          };

          // reorder the processors
          orderProcessors(newState);
          return newState;
      
      case actions.DISCONNECT_PROCESSORS:
          newState =  {
              ...state,
              connections: {
                  allIds: state.connections.allIds.reduce((accumulator, connectionID) => {
                      if (connectionID !== action.id) {
                          accumulator.push(connectionID)
                      }
                      return accumulator;
                  }, []),
                  byId: Object.values(state.connections.allIds).reduce((accumulator, connectionID) => {
                      if (connectionID !== action.id) {
                          accumulator[connectionID] = { ...state.connections.byId[connectionID] };
                      }
                      return accumulator;
                  }, {})
              }
          };
          
          // reorder the processors
          orderProcessors(newState);
          return newState;
      
      case actions.SET_CAMERA_POSITION:
          const { x, y, z, isRelative } = action;
          return {
              ...state,
              camera: {
                  x: isRelative ? state.camera.x + x : x,
                  y: isRelative ? state.camera.y + y : y,
                  z: isRelative ? state.camera.z + z : z,
              }
          };
      
      case actions.LIBRARY_DROP:
          return {
              ...state,
              libraryDropPosition: {
                  type: action.processorType,
                  x: action.x,
                  y: action.y,
              }
          };

    default:
      return state ? state : initialState;
  }
};
