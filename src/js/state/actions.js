import convertLegacyFile from '../core/convert_xml.js';
import { createUUID, getProcessorDefaultName, midiControlToParameterValue, midiNoteToParameterValue, } from '../core/util.js';
import { getConfig, } from '../core/config.js';
import { getAllMIDIPorts, getMIDIAccessible, CONTROL_CHANGE, NOTE_ON,  } from '../midi/midi.js';
import { showDialog } from '../view/dialog.js';
import { getProcessorData, } from '../core/processor-loader.js';
import { testForInfiniteLoop, } from '../midi/network_ordering.js';

const ADD_PROCESSOR = 'ADD_PROCESSOR',
	ASSIGN_EXTERNAL_CONTROL = 'ASSIGN_EXTERNAL_CONTROL',
	CABLE_DRAG_END = 'CABLE_DRAG_END',
	CABLE_DRAG_MOVE = 'CABLE_DRAG_MOVE',
	CABLE_DRAG_START = 'CABLE_DRAG_START',
	CHANGE_PARAMETER = 'CHANGE_PARAMETER',
	CREATE_CONNECTION = 'CREATE_CONNECTION',
	CREATE_MIDI_PORT = 'CREATE_MIDI_PORT',
	CREATE_PROCESSOR = 'CREATE_PROCESSOR',
	CREATE_PROJECT = 'CREATE_PROJECT',
  DELETE_PROCESSOR = 'DELETE_PROCESSOR',
  DISCONNECT_PROCESSORS = 'DISCONNECT_PROCESSORS',
  DRAG_ALL_PROCESSORS = 'DRAG_ALL_PROCESSORS',
  DRAG_SELECTED_PROCESSOR = 'DRAG_SELECTED_PROCESSOR',
	LIBRARY_DROP = 'LIBRARY_DROP',
	LOAD_SNAPSHOT = 'LOAD_SNAPSHOT',
	PARAMETER_DRAG_MOVE = 'PARAMETER_DRAG_MOVE',
	PARAMETER_DRAG_START = 'PARAMETER_DRAG_START',
	PARAMETER_TOUCH_START = 'PARAMETER_TOUCH_START',
	RECEIVE_MIDI_CC = 'RECEIVE_MIDI_CC',
	RECEIVE_MIDI_NOTE = 'RECEIVE_MIDI_NOTE',
  RECREATE_PARAMETER = 'RECREATE_PARAMETER',
  SELECT_PROCESSOR = 'SELECT_PROCESSOR',
  SET_CAMERA_POSITION = 'SET_CAMERA_POSITION',
  SET_TEMPO = 'SET_TEMPO',
  SET_THEME = 'SET_THEME',
  SET_TRANSPORT = 'SET_TRANSPORT',
  STORE_SNAPSHOT = 'STORE_SNAPSHOT',
  TOGGLE_CONNECT_MODE = 'TOGGLE_CONNECT_MODE',
  TOGGLE_MIDI_LEARN_MODE = 'TOGGLE_MIDI_LEARN_MODE',
  TOGGLE_MIDI_LEARN_TARGET = 'TOGGLE_MIDI_LEARN_TARGET',
  TOGGLE_MIDI_PREFERENCE = 'TOGGLE_MIDI_PREFERENCE',
  TOGGLE_SNAPSHOTS_MODE = 'TOGGLE_SNAPSHOTS_MODE',
  TOGGLE_PANEL = 'TOGGLE_PANEL',
  UNASSIGN_EXTERNAL_CONTROL = 'UNASSIGN_EXTERNAL_CONTROL',
  UPDATE_MIDI_PORT = 'UPDATE_MIDI_PORT';

// actions
export default {

	ADD_PROCESSOR,
	addProcessor: data => ({ type: ADD_PROCESSOR, data }),

	ASSIGN_EXTERNAL_CONTROL,
	assignExternalControl: (assignId, processorId, paramKey, remoteType, remoteChannel, remoteValue) => ({type: ASSIGN_EXTERNAL_CONTROL, assignId, processorId, paramKey, remoteType, remoteChannel, remoteValue, }),

	CABLE_DRAG_END,
	cableDragEnd: (connectorId, processorId, x, y, z) => ({ type: CABLE_DRAG_END, connectorId, processorId, x, y, z, }),

	CABLE_DRAG_MOVE,
	cableDragMove: (x, y, z) => ({ type: CABLE_DRAG_MOVE, x, y, z, }),

	CABLE_DRAG_START,
	cableDragStart: (connectorId, processorId, x, y, z) => ({ type: CABLE_DRAG_START, connectorId, processorId, x, y, z, }),

	CHANGE_PARAMETER,
	changeParameter: (processorId, paramKey, paramValueRaw) => {
		return (dispatch, getState, getActions) => {
			const { processors } = getState();
			const { max, min, type, value } = processors.byId[processorId].params.byId[paramKey];
			let paramValue;
			switch (type) {
				case 'integer':
					paramValue = Math.max(min, Math.min(paramValueRaw, max));
					break;
				case 'boolean':
					paramValue = !!paramValueRaw;
					break;
				case 'itemized':
				case 'object':
				case 'string':
					paramValue = paramValueRaw;
					break;
			}
			if (paramValue !== value) {
				return { type: CHANGE_PARAMETER, processorId, paramKey, paramValue };
			}
		};
	},

	CREATE_CONNECTION,
	createConnection: () => {
		return (dispatch, getState, getActions) => {
			const state = getState();
			const { cableDrag, connections, } = state;
			const { destination, source, } = cableDrag;

			// check if the connection already exists
			let isExists = false;
			for (let i = 0, n = connections.allIds.length; i < n; i++) {
				const connection = connections.byId[connections.allIds[i]];
				if (connection.sourceConnectorId === source.connectorId &&
					connection.sourceProcessorId === source.processorId &&
					connection.destinationConnectorId === destination.connectorId &&
					connection.destinationProcessorId === destination.processorId) {
						isExists = true;
				} 
			}

			// check the connection destination (was the new cable dropped on an input?)
			const isDestinationSet = destination.connectorId && destination.processorId;

			// check if the connection won't cause an infinite loop.
			const isInfiniteLoop = testForInfiniteLoop(state, source.processorId, destination.processorId);

			if (isInfiniteLoop) {
				showDialog(
				  'Infinite loop warning', 
				  `This connection can't be made because it would create an infinite feedback loop.`,
				  'Ok');
			}

			if (!isExists && isDestinationSet && !isInfiniteLoop) {
				return {
					type: CREATE_CONNECTION,
					connectionId: `conn_${createUUID()}`,
					destinationConnectorId: destination.connectorId,
					destinationProcessorId: destination.processorId,
					sourceConnectorId: source.connectorId,
					sourceProcessorId: source.processorId,
				};
			}
		};
	},

	CREATE_MIDI_PORT,
	createMIDIPort: (portId, data) => { return { type: CREATE_MIDI_PORT, portId, data } },

	CREATE_PROCESSOR,
	createProcessor: data => {
		return (dispatch, getState, getActions) => {
			const configJson = getProcessorData(data.type, 'config');
			const id = data.id || `${data.type}_${createUUID()}`;
			const fullData = {
				...configJson,
				...data,
				id,
			};
			fullData.params.byId.name.value = data.name || getProcessorDefaultName(getState().processors);
			dispatch(getActions().addProcessor(fullData));
			dispatch(getActions().selectProcessor(id));
		}
	},

	CREATE_PROJECT,
	createProject: data => {
		return (dispatch, getState, getActions) => {
			const { themeSetting } = getConfig();
			const osTheme = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
				? 'dark' : 'light';
			const theme = themeSetting === 'os' ? osTheme : themeSetting;
			return { type: CREATE_PROJECT, data: { ...data, theme, }, };
		}
	},

	DELETE_PROCESSOR,
	deleteProcessor: id => ({ type: DELETE_PROCESSOR, id }),

	DISCONNECT_PROCESSORS,
	disconnectProcessors: id => ({ type: DISCONNECT_PROCESSORS, id }),

	DRAG_ALL_PROCESSORS,
	dragAllProcessors: (x, y) => ({ type: DRAG_ALL_PROCESSORS, x, y }),

	DRAG_SELECTED_PROCESSOR,
	dragSelectedProcessor: (x, y, z) => ({ type: DRAG_SELECTED_PROCESSOR, x, y, z }),

	exportProject: () => {
		return (dispatch, getState, getActions) => {
			const jsonString = JSON.stringify(getState()),
			blob = new Blob([jsonString], {type: 'application/json'}),
			a = document.createElement('a');
			a.download = 'mpg.json';
			a.href = URL.createObjectURL(blob);
			a.click();
		}
	},

  importProject: file => {
    return (dispatch, getState, getActions) => {

			// if no file was chosen
			if (!file) {
				return;
			}
				
      file.text()
        .then(text => {
          let isJSON = true, isXML = false;
          try {
            const data = JSON.parse(text);
            if (data) {
              dispatch(getActions().setProject(data));
            }
          } catch(errorMessage) {
            isJSON = false;
          }
          if (!isJSON) {

            // try if it's a legacy xml file
            const legacyData = convertLegacyFile(text);
            if (legacyData) {
              dispatch(getActions().setProject(legacyData));
              isXML = true;
            }
          }
          if (!isJSON && !isXML) {
            showDialog(
              'Import failed', 
              `The file to import wasn't recognised as a valid type for this application.`,
              'Ok');
          }
        })
        .catch(() =>{
          showDialog(
            'Import failed', 
            `The file could not be opened.`,
            'Ok');
      	});
    }
  },

	LIBRARY_DROP,
	libraryDrop: (processorType, x, y) => ({ type: LIBRARY_DROP, processorType, x, y, }),

	LOAD_SNAPSHOT,
	loadSnapshot: index => {
		return (dispatch, getState, getActions) => {
			if (getState().snapshots[index]) {
				return { type: LOAD_SNAPSHOT, index, };
			}
		}
	},

	midiAccessChange: (midiPort) => {
		return (dispatch, getState, getActions) => {

			// check if the port already exists
			const state = getState();
			const portExists = state.ports.allIds.indexOf(midiPort.id) > -1;

			// create port or update existing
			if (portExists) {

				// update existing port
				dispatch(getActions().updateMIDIPort(midiPort.id, {
					connection: midiPort.connection,
					state: midiPort.state
				}));
			} else {
				
				// restore settings from config
				const config = getConfig();
				let configPort = (config.ports && config.ports.byId) ? config.ports.byId[midiPort.id] : null;

				if (!configPort && config.ports && config.ports.allIds) {
					for (let i = config.ports.allIds.length - 1; i >= 0; i--) {
						const port = config.ports.byId[config.ports.allIds[i]];
						if (port.name === midiPort.name && port.type === midiPort.type) {
							configPort = port;
							break;
						}
					}
				}

				// create port
				dispatch(getActions().createMIDIPort(midiPort.id, {
					id: midiPort.id,
					type: midiPort.type,
					name: midiPort.name,
					connection: midiPort.connection,
					state: midiPort.state,
					networkEnabled: configPort ? configPort.networkEnabled : false,
					syncEnabled: configPort ? configPort.syncEnabled : false,
					remoteEnabled: configPort ? configPort.remoteEnabled : false
				}));
			}
		};
	},

	newProject: () => {
		return (dispatch, getState, getActions) => {

			// create an empty initial state
			dispatch(getActions().createProject());

			// add the existing MIDI ports
			if (getMIDIAccessible()) {
				const existingMIDIPorts = getAllMIDIPorts();
				existingMIDIPorts.forEach(port => {
					dispatch(getActions().midiAccessChange(port));
				});
			}

			// recreate the state with the existing ports
			// dispatch(getActions().createProject(getState()));
		}
	},

	RECEIVE_MIDI_CC,
	receiveMIDIControlChange: data => {
		return (dispatch, getState, getActions) => {
			const { assignExternalControl, changeParameter, loadSnapshot, unassignExternalControl, } = getActions();
			const { assignments, learnModeActive, learnTargetParameterKey, learnTargetProcessorId, processors, } = getState();
			const type = CONTROL_CHANGE;
			const channel = (data[0] & 0xf) + 1;
			const control = data[1];
			const value = data[2];

			if (learnModeActive) {
				dispatch(unassignExternalControl(learnTargetProcessorId, learnTargetParameterKey));
				dispatch(assignExternalControl(`assign_${createUUID()}`, learnTargetProcessorId, learnTargetParameterKey, type, channel, control));
			} else {
				assignments.allIds.forEach(assignId => {
					const { paramKey, processorId, remoteChannel, remoteValue } = assignments.byId[assignId];
					if (remoteChannel === channel && remoteValue === control) {
						if (processorId === 'snapshots') {
							dispatch(loadSnapshot(parseInt(paramKey, 10)));
						} else {
							const param = processors.byId[processorId].params.byId[paramKey];
							const paramValue = midiControlToParameterValue(param, value);
							dispatch(changeParameter(processorId, paramKey, paramValue));
						}
					}
				});
			}
		}
	},

	RECEIVE_MIDI_NOTE,
	receiveMIDINote: data => {
		return (dispatch, getState, getActions) => {
			const { assignExternalControl, changeParameter, loadSnapshot, unassignExternalControl, } = getActions();
			const { assignments, learnModeActive, learnTargetParameterKey, learnTargetProcessorId, processors, } = getState();

			// type can be note on or off
			const type = data[0] & 0xf0;
			const channel = (data[0] & 0xf) + 1;
			const pitch = data[1];
			const velocity = data[2];
			
			if (type === NOTE_ON && velocity > 0) {
				if (learnModeActive) {
					dispatch(unassignExternalControl(learnTargetProcessorId, learnTargetParameterKey));
					dispatch(assignExternalControl(`assign_${createUUID()}`, learnTargetProcessorId, learnTargetParameterKey, type, channel, pitch));
				} else {
					assignments.allIds.forEach(assignId => {
						const { paramKey, processorId, remoteChannel, remoteValue } = assignments.byId[assignId];
						if (remoteChannel === channel && remoteValue === pitch) {
							if (processorId === 'snapshots') {
								dispatch(loadSnapshot(parseInt(paramKey, 10)));
							} else {
								const param = processors.byId[processorId].params.byId[paramKey];
								const paramValue = midiNoteToParameterValue(param, velocity);
								dispatch(changeParameter(processorId, paramKey, paramValue));
							}
						}
					});
				}
			}
		}
	},

	RECREATE_PARAMETER,
	recreateParameter: (processorId, paramKey, paramObj) => ({ type: RECREATE_PARAMETER, processorId, paramKey, paramObj }),

	SELECT_PROCESSOR,
	selectProcessor: id => ({ type: SELECT_PROCESSOR, id }),

	SET_CAMERA_POSITION,
	setCameraPosition: (x, y, z, isRelative = false) => ({ type: SET_CAMERA_POSITION, x, y, z, isRelative, }),

	setProject: data => {
		return (dispatch, getState, getActions) => {

			// create an empty initial state
			dispatch(getActions().createProject());

			// if there's MIDI accees add all the MIDI port data.
			if (getMIDIAccessible()) {

				// add the existing MIDI ports
				const existingMIDIPorts = getAllMIDIPorts();
				existingMIDIPorts.forEach(port => {
					dispatch(getActions().midiAccessChange(port));
				});
	
				// copy the port settings of existing ports
				const existingPorts = { ...getState().ports };
	
				// copy the port settings defined in the project
				const projectPorts = { ...data.ports };

				// clear the loaded project's port settings
				data.ports = { allIds: [], byId: {}, };
	
				// add all existing ports to the project data
				existingPorts.allIds.forEach(existingPortId => {
					data.ports.allIds.push(existingPortId);
					data.ports.byId[existingPortId] = existingPorts.byId[existingPortId];
				});
	
				// set the existing ports to the project's settings,
				// and create ports that do not exist
				projectPorts.allIds.forEach(projectPortId => {
					const projectPort = projectPorts.byId[projectPortId];
					let portExists = false;
					existingPorts.allIds.forEach(existingPortId => {
						if (existingPortId === projectPortId) {
							portExists = true;
	
							// project port's settings exists, update the settings
							const existingPort = existingPorts.byId[existingPortId];
							existingPort.syncEnabled = projectPort.syncEnabled;
							existingPort.remoteEnabled = projectPort.remoteEnabled;
							existingPort.networkEnabled = projectPort.networkEnabled;
						}
					});
	
					// port settings object doesn't exist, so create it, but disabled
					if (!portExists) {
						data.ports.allIds.push(projectPortId);
						data.ports.byId[projectPortId] = {
							id: projectPortId,
							type: projectPort.type,
							name: projectPort.name,
							connection: 'closed', // closed | open | pending
							state: 'disconnected', // disconnected | connected
							syncEnabled: projectPort.syncEnabled,
							remoteEnabled: projectPort.remoteEnabled,
							networkEnabled: projectPort.networkEnabled
						}
					}
				});
			}

			// create the project with the merged ports
			dispatch(getActions().createProject(data));
		}
	},

	SET_TEMPO,
	setTempo: value => ({ type: SET_TEMPO, value: Math.round((value * 100)) / 100 }),

	SET_THEME,
	setTheme: (themeSetting, theme) => ({ type: SET_THEME, themeSetting, theme }),

	SET_TRANSPORT,
	setTransport: command => ({ type: SET_TRANSPORT, command }),

	STORE_SNAPSHOT,
	storeSnapshot: index => {
		return (dispatch, getState, getActions) => {
			const { processors, } = getState();

			// create parameter key value objects for all processors
			const snapshot = processors.allIds.reduce((accumulator, processorId) => {
				const { params } = processors.byId[processorId];
				return {
					...accumulator,
					[processorId]: params.allIds.reduce((acc, paramId) => {
						return {
							...acc,
							[paramId]: params.byId[paramId].value,
						};
					}, {}),
				};
			}, {});
			return { type: STORE_SNAPSHOT, index, snapshot };
		}
	},

	PARAMETER_DRAG_MOVE,
	parameterDragMove: (x, y, z) => ({ type: PARAMETER_DRAG_MOVE, x, y, z }),

	PARAMETER_DRAG_START,
	parameterDragStart: (x, y, z) => ({ type: PARAMETER_DRAG_START, x, y, z }),

	PARAMETER_TOUCH_START,
	parameterTouchStart: (name) => ({ type: PARAMETER_TOUCH_START, name }),

	TOGGLE_CONNECT_MODE,
	toggleConnectMode: () => ({ type: TOGGLE_CONNECT_MODE }),
	
	TOGGLE_MIDI_LEARN_MODE,
	toggleMIDILearnMode: () => ({ type: TOGGLE_MIDI_LEARN_MODE }),

	TOGGLE_MIDI_LEARN_TARGET,
	toggleMIDILearnTarget: (processorId, parameterKey) => {
		return (dispatch, getState, getActions) => {
			const { learnTargetProcessorId, learnTargetParameterKey } = getState();
			if (processorId === learnTargetProcessorId && parameterKey === learnTargetParameterKey) {
				return { type: TOGGLE_MIDI_LEARN_TARGET, processorId: null, parameterKey: null };
			}
			return { type: TOGGLE_MIDI_LEARN_TARGET, processorId, parameterKey };
		}
	},

	TOGGLE_MIDI_PREFERENCE,
	toggleMIDIPreference: (id, preferenceName, isEnabled) => ({ type: TOGGLE_MIDI_PREFERENCE, id, preferenceName, isEnabled }),

	TOGGLE_SNAPSHOTS_MODE,
	toggleSnapshotsMode: () => ({ type: TOGGLE_SNAPSHOTS_MODE }),
	
	TOGGLE_PANEL,
	togglePanel: panelName => ({type: TOGGLE_PANEL, panelName}),

	UNASSIGN_EXTERNAL_CONTROL,
	unassignExternalControl: (processorId, paramKey) => ({type: UNASSIGN_EXTERNAL_CONTROL, processorId, paramKey}),

	UPDATE_MIDI_PORT,
	updateMIDIPort: (portId, data) => { return { type: UPDATE_MIDI_PORT, portId, data } },
}
