import convertLegacyFile from '../core/convert_xml.js';
import { createUUID, getProcessorDefaultName, midiControlToParameterValue, } from '../core/util.js';
import { getConfig, setConfig, } from '../core/config.js';
import { getAllMIDIPorts } from '../midi/midi.js';
import { showDialog } from '../view/dialog.js';
import { getProcessorData, } from '../core/processor-loader.js';

const ADD_PROCESSOR = 'ADD_PROCESSOR',
	ASSIGN_EXTERNAL_CONTROL = 'ASSIGN_EXTERNAL_CONTROL',
	CREATE_MIDI_PORT = 'CREATE_MIDI_PORT',
	CHANGE_PARAMETER = 'CHANGE_PARAMETER',
  CONNECT_PROCESSORS = 'CONNECT_PROCESSORS',
	CREATE_PROCESSOR = 'CREATE_PROCESSOR',
	CREATE_PROJECT = 'CREATE_PROJECT',
  DELETE_PROCESSOR = 'DELETE_PROCESSOR',
  DISCONNECT_PROCESSORS = 'DISCONNECT_PROCESSORS',
  DRAG_ALL_PROCESSORS = 'DRAG_ALL_PROCESSORS',
  DRAG_SELECTED_PROCESSOR = 'DRAG_SELECTED_PROCESSOR',
	LIBRARY_DROP = 'LIBRARY_DROP',
	LOAD_SNAPSHOT = 'LOAD_SNAPSHOT',
  RECEIVE_MIDI_CC = 'RECEIVE_MIDI_CC',
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

  importProject: file => {
    return (dispatch, getState, getActions) => {
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

	exportProject: () => {
		return (dispatch, getState, getActions) => {
			let jsonString = JSON.stringify(getState()),
			blob = new Blob([jsonString], {type: 'application/json'}),
			a = document.createElement('a');
			a.download = 'mpg.json';
			a.href = URL.createObjectURL(blob);
			a.click();
		}
	},

	newProject: () => {
		return (dispatch, getState, getActions) => {

			// create an empty initial state
			dispatch(getActions().createProject());

			// add the existing MIDI ports
			const existingMIDIPorts = getAllMIDIPorts();
			existingMIDIPorts.forEach(port => {
					dispatch(getActions().midiAccessChange(port));
			});

			// recreate the state with the existing ports
			dispatch(getActions().createProject(getState()));
		}
	},

	setProject: data => {
		return (dispatch, getState, getActions) => {

			// create an empty initial state
			dispatch(getActions().createProject());

			// add the existing MIDI ports
			const existingMIDIPorts = getAllMIDIPorts();
			existingMIDIPorts.forEach(port => {
				dispatch(getActions().midiAccessChange(port));
			});

			// copy the port settings of existing ports
			const existingPorts = { ...getState().ports }

			// copy the port settings defined in the project
			const projectPorts = { ...data.ports };

			// clear the project's port settings
			data.ports.allIds = [];
			data.ports.byId = {};

			// add all existing ports to the project data
			existingPorts.allIds.forEach(existingPortID => {
				data.ports.allIds.push(existingPortID);
				data.ports.byId[existingPortID] = existingPorts.byId[existingPortID];
			});

			// set the existing ports to the project's settings,
			// and create ports that do not exist
			projectPorts.allIds.forEach(projectPortID => {
				const projectPort = projectPorts.byId[projectPortID];
				let portExists = false;
				existingPorts.allIds.forEach(existingPortID => {
					if (existingPortID === projectPortID) {
						portExists = true;

						// project port's settings exists, update the settings
						const existingPort = existingPorts.byId[existingPortID];
						existingPort.syncEnabled = projectPort.syncEnabled;
						existingPort.remoteEnabled = projectPort.remoteEnabled;
						existingPort.networkEnabled = projectPort.networkEnabled;
					}
				});

				// port settings object doesn't exist, so create it, but disabled
				if (!portExists) {
					data.ports.allIds.push(projectPortID);
					data.ports.byId[projectPortID] = {
						id: projectPortID,
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

			// create the project with the merged ports
			dispatch(getActions().createProject(data));
		}
	},

	CREATE_PROJECT,
	createProject: data => ({ type: CREATE_PROJECT, data }),

	SET_THEME,
	setTheme: themeName => ({ type: SET_THEME, themeName }),

	CREATE_PROCESSOR,
	createProcessor: data => {
		return (dispatch, getState, getActions) => {
			const configJson = getProcessorData(data.type, 'config');
			const id = data.id || `${data.type}_${createUUID()}`;
			const fullData = {...configJson, ...data};
			fullData.id = id;
			fullData.positionX = data.positionX;
			fullData.positionY = data.positionY;
			fullData.params.byId.name.value = data.name || getProcessorDefaultName(getState().processors);
			dispatch(getActions().addProcessor(fullData));
			dispatch(getActions().selectProcessor(id));
		}
	},

	ADD_PROCESSOR,
	addProcessor: data => ({ type: ADD_PROCESSOR, data }),

	DELETE_PROCESSOR,
	deleteProcessor: id => ({ type: DELETE_PROCESSOR, id }),

	SELECT_PROCESSOR,
	selectProcessor: id => ({ type: SELECT_PROCESSOR, id }),

	DRAG_SELECTED_PROCESSOR,
	dragSelectedProcessor: (x, y, z) => ({ type: DRAG_SELECTED_PROCESSOR, x, y, z }),

	DRAG_ALL_PROCESSORS,
	dragAllProcessors: (x, y) => ({ type: DRAG_ALL_PROCESSORS, x, y }),

	CHANGE_PARAMETER,
	changeParameter: (processorID, paramKey, paramValue) => {
		return (dispatch, getState, getActions) => {
			const { processors } = getState();
			const param = processors.byId[processorID].params.byId[paramKey];
			if (paramValue !== param.value) {
				return { type: CHANGE_PARAMETER, processorID, paramKey, paramValue };
			}
		};
	},

	RECREATE_PARAMETER,
	recreateParameter: (processorID, paramKey, paramObj) => {
		return { type: RECREATE_PARAMETER, processorID, paramKey, paramObj };
	},

	SET_TEMPO,
	setTempo: value => ({ type: SET_TEMPO, value }),

	CREATE_MIDI_PORT,
	createMIDIPort: (portID, data) => { return { type: CREATE_MIDI_PORT, portID, data } },

	UPDATE_MIDI_PORT,
	updateMIDIPort: (portID, data) => { return { type: UPDATE_MIDI_PORT, portID, data } },

	midiAccessChange: midiPort => {
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

			// store the changes in configuration
			setConfig(getState());
		};
	},

	TOGGLE_MIDI_PREFERENCE,
	toggleMIDIPreference: (id, preferenceName, isEnabled) => ({ type: TOGGLE_MIDI_PREFERENCE, id, preferenceName, isEnabled }),
	
	TOGGLE_MIDI_LEARN_MODE,
	toggleMIDILearnMode: () => ({ type: TOGGLE_MIDI_LEARN_MODE }),

	TOGGLE_MIDI_LEARN_TARGET,
	toggleMIDILearnTarget: (processorID, parameterKey) => {
		return (dispatch, getState, getActions) => {
			const { learnTargetProcessorID, learnTargetParameterKey } = getState();
			if (processorID === learnTargetProcessorID && parameterKey === learnTargetParameterKey) {
				return { type: TOGGLE_MIDI_LEARN_TARGET, processorID: null, parameterKey: null };
			}
			return { type: TOGGLE_MIDI_LEARN_TARGET, processorID, parameterKey };
		}
	},

	TOGGLE_SNAPSHOTS_MODE,
	toggleSnapshotsMode: () => ({ type: TOGGLE_SNAPSHOTS_MODE }),

	SET_TRANSPORT,
	setTransport: command => ({ type: SET_TRANSPORT, command }),

	RECEIVE_MIDI_CC,
	receiveMIDIControlChange: data => {
		return (dispatch, getState, getActions) => {
			const state = getState();
			const remoteChannel = (data[0] & 0xf) + 1;
			const remoteCC = data[1];

			if (state.learnModeActive) {
				dispatch(getActions().unassignExternalControl(state.learnTargetProcessorID, state.learnTargetParameterKey));
				dispatch(getActions().assignExternalControl(`assign_${createUUID()}`, state.learnTargetProcessorID, state.learnTargetParameterKey, remoteChannel, remoteCC));
			} else {
				state.assignments.allIds.forEach(assignID => {
					const assignment = state.assignments.byId[assignID];
					if (assignment.remoteChannel === remoteChannel && assignment.remoteCC === remoteCC) {
						const param = state.processors.byId[assignment.processorID].params.byId[assignment.paramKey];
						const paramValue = midiControlToParameterValue(param, data[2]);
						dispatch(getActions().changeParameter(assignment.processorID, assignment.paramKey, paramValue));
					}
				});
			}
		}
	},

	ASSIGN_EXTERNAL_CONTROL,
	assignExternalControl: (assignID, processorID, paramKey, remoteChannel, remoteCC) => ({type: ASSIGN_EXTERNAL_CONTROL, assignID, processorID, paramKey, remoteChannel, remoteCC}),

	UNASSIGN_EXTERNAL_CONTROL,
	unassignExternalControl: (processorID, paramKey) => ({type: UNASSIGN_EXTERNAL_CONTROL, processorID, paramKey}),
	
	TOGGLE_PANEL,
	togglePanel: panelName => ({type: TOGGLE_PANEL, panelName}),

	TOGGLE_CONNECT_MODE,
	toggleConnectMode: () => ({ type: TOGGLE_CONNECT_MODE }),

	CONNECT_PROCESSORS,
	connectProcessors: payload => ({ type: CONNECT_PROCESSORS, payload, id: `conn_${createUUID()}` }),

	DISCONNECT_PROCESSORS,
	disconnectProcessors2: id => ({ type: DISCONNECT_PROCESSORS, id }),

	disconnectProcessors: id => {
		return (dispatch, getState, getActions) => {
			const { connections, processors, } = getState();
			const connection = connections.byId[id];
			const sourceProcessor = processors.byId[connection.sourceProcessorID];
			const destinationProcessor = processors.byId[connection.destinationProcessorID];

			// disconnect the processors
			dispatch(getActions().disconnectProcessors2(id));
		}
	},

	SET_CAMERA_POSITION,
	setCameraPosition: (x, y, z, isRelative = false) => ({ type: SET_CAMERA_POSITION, x, y, z, isRelative, }),

	LIBRARY_DROP,
	libraryDrop: (processorType, x, y) => ({ type: LIBRARY_DROP, processorType, x, y, }),

	LOAD_SNAPSHOT,
	loadSnapshot: index => ({ type: LOAD_SNAPSHOT, index, }),

	STORE_SNAPSHOT,
	storeSnapshot: index => {
		return (dispatch, getState, getActions) => {
			const { processors, } = getState();

			// create parameter key value objects for all processors
			const snapshot = processors.allIds.reduce((accumulator, processorId) => {
				const params = processors.byId[processorId].params;
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
	}
}
