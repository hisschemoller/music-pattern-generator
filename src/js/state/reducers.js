import orderProcessors from '../midi/network_ordering.js';

/**
 * Temporary user interface state that should be available to multiple
 * components but isn't part of the app state.
 * I keep it separate here to have a cleaner view op the app state below.
 */
const userInterfaceInitialState = {
	cableDrag: {
		active: false,
		source: {
			processorID: null,
			connectorID: null,
			x: 0,
			y: 0,
			z: 0,
		},
		destination: {
			processorID: null,
			connectorID: null,
			x: 0,
			y: 0,
			z: 0,
		},
	},
	libraryDropPosition: {
		type: null,
		x: 0,
		y: 0,
	},
	activeProcessorID: null,
};

/**
 * App state.
 */
const initialState = {
	...userInterfaceInitialState,
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
	ports: {
		allIds: [],
		byId: {},
	},
	snapshotIndex: null,
	snapshots: [],
	snapshotsEditModeActive: false,
	processors: {
		allIds: [],
		byId: {},
	},
	selectedId: null,
	showHelpPanel: false,
	showLibraryPanel: true,
	showPreferencesPanel: false,
	showSnapshotsPanel: false,
	showSettingsPanel: false,
	theme: 'light', // 'light|dark|dev' 
	transport: 'stop', // 'play|pause|stop'
	version: '2.2.0-beta',
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

		case actions.ASSIGN_EXTERNAL_CONTROL: {
			const { assignID, processorID, paramKey, remoteType, remoteChannel, remoteValue, } = action;
			return {
				...state,
				assignments: {
					allIds: [...state.assignments.allIds, assignID],
					byId: {
						...state.assignments.byId,
						[assignID]: {
							remoteType,
							remoteChannel,
							remoteValue,
							processorID,
							paramKey,
						},
					},
				},
			};
		}

		case actions.CABLE_DRAG_END: {
			const { connectorId, processorId, x, y, z, } = action;
			return {
				...state,
				active: false,
				cableDrag:{
					...state.cableDrag,
					destination: {
						processorId,
						connectorId,
						x, y, z,
					},
				},
			};
		}

		case actions.CABLE_DRAG_MOVE: {
			const { x, y, z, } = action;
			return {
				...state,
				active: false,
				cableDrag:{
					...state.cableDrag,
					destination: {
						...state.cableDrag.source,
						x, y, z,
					},
				},
			};
		}

		case actions.CABLE_DRAG_START: {
			const { connectorId, processorId, x, y, z, } = action;
			return {
				...state,
				active: false,
				cableDrag:{
					...state.cableDrag,
					source: {
						processorId,
						connectorId,
						x, y, z,
					},
				},
			};
		}
		
		case actions.CHANGE_PARAMETER: {
			const { paramKey, paramValue, processorID } = action;
			newState = { 
				...state,
				activeProcessorID: processorID,
				snapshotIndex: null,
				processors: {
					byId: { ...state.processors.byId },
					allIds: [ ...state.processors.allIds ]
				} };
			const param = newState.processors.byId[processorID].params.byId[paramKey];
			switch (param.type) {
				case 'integer':
					param.value = Math.max(param.min, Math.min(paramValue, param.max));
					break;
				case 'boolean':
					param.value = !!paramValue;
					break;
				case 'itemized':
					param.value = paramValue;
					break;
				case 'string':
					param.value = paramValue;
					break;
			}
			return newState;
		}

		case actions.CREATE_CONNECTION: {
			const { connectionID, destinationConnectorID, destinationProcessorID, sourceConnectorID, sourceProcessorID, } = action;
			
			// add the new connection
			const newState = {
				...state,
				connections: {
					byId: { ...state.connections.byId, [connectionID]: {
						destinationConnectorID, destinationProcessorID, sourceConnectorID, sourceProcessorID,
					}},
					allIds: [ ...state.connections.allIds, connectionID ],
				},
				processors: {
					...state.processors,
					allIds: [ ...state.processors.allIds ],
				},
			};

			// update the processors' order
			orderProcessors(newState);
			return newState;
		}

		case actions.CREATE_MIDI_PORT:
			return {
				...state,
				ports: {
					allIds: [ ...state.ports.allIds, action.portID ],
					byId: { 
						...state.ports.byId,
						[action.portID]: action.data
					},
				},
			};

		case actions.CREATE_PROJECT:
			return { 
				...initialState, 
				...(action.data || {}),
				transport: initialState.transport,
			};
		
		case actions.DELETE_PROCESSOR: {
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
			if (newState.selectedId === action.id && newState.processors.allIds.length) {
				if (newState.processors.allIds[index]) {
					newIndex = index;
				} else if (index > 0) {
					newIndex = index - 1;
				} else {
					newIndex = 0;
				}
				newState.selectedId = newState.processors.allIds[newIndex];
			}
			
			// reorder the processors
			orderProcessors(newState);

			return newState;
		}
		
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
					}, {}),
				},
			};
			
			// reorder the processors
			orderProcessors(newState);
			return newState;

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
				}
			};
		
		case actions.DRAG_SELECTED_PROCESSOR:
			return {
				...state,
				processors: {
					allIds: [ ...state.processors.allIds ],
					byId: Object.values(state.processors.byId).reduce((accumulator, processor) => {
						if (processor.id === state.selectedId) {
							accumulator[processor.id] = { ...processor, positionX: action.x, positionY: action.y, positionZ: action.z };
						} else {
							accumulator[processor.id] = { ...processor };
						}
						return accumulator;
					}, {})
				}
			};
		
		case actions.LIBRARY_DROP:
			return {
				...state,
				libraryDropPosition: {
					type: action.processorType,
					x: action.x,
					y: action.y,
				},
			};

		case actions.LOAD_SNAPSHOT: {
			const { index, } = action;
			const { snapshots, processors, } = state;
			const snapshot = snapshots[index];
			if (!snapshot) {
				return state;
			}
			return {
				...state,
				snapshotIndex: index,
				processors: {
					allIds: [ ...processors.allIds ],
					byId: processors.allIds.reduce((procAcc, processorId) => {
						const processor = processors.byId[processorId];
						const processorSnapshot = snapshot[processorId];
						return {
							...procAcc,
							[processorId]: { 
								...processor,
								params: {
									allIds: [ ...processor.params.allIds ],
									byId: processor.params.allIds.reduce((paramAcc, paramId) => {
										const param = processor.params.byId[paramId];
										let newValue = param.value;
										if (processorSnapshot && processorSnapshot.hasOwnProperty(paramId) && paramId !== 'name') {
											newValue = processorSnapshot[paramId];
										}
										return {
											...paramAcc,
											[paramId]: { 
												...param,
												value: newValue,
											},
										}
									}, {}),
								},
							},
						}
					}, {}),
				},
			};
		}
		
		case actions.RECREATE_PARAMETER:
			newState = { 
				...state,
				processors: {
					byId: { ...state.processors.byId },
					allIds: [ ...state.processors.allIds ],
				} };
			
			// clone parameter, overwrite with new settings.
			newState.processors.byId[action.processorID].params.byId[action.paramKey] = {
				...newState.processors.byId[action.processorID].params.byId[action.paramKey],
				...action.paramObj,
			};
			
			return newState;
		
		case actions.SELECT_PROCESSOR:
			return { ...state, selectedId: action.id };
		
		case actions.SET_CAMERA_POSITION:
			const { x, y, z, isRelative } = action;
			return {
				...state,
				camera: {
					x: isRelative ? state.camera.x + x : x,
					y: isRelative ? state.camera.y + y : y,
					z: isRelative ? state.camera.z + z : z,
				},
			};
		
		case actions.SET_TEMPO:
			return { ...state, bpm: action.value };

		case actions.SET_THEME:
			return { 
				...state, 
				theme: state.theme === 'light' ? 'dark' : 'light',
			};
		
		case actions.SET_TRANSPORT:
			let value = action.command;
			if (action.command === 'toggle') {
				value = state.transport === 'play' ? 'pause' : 'play';
			}
			return Object.assign({}, state, { 
				transport: value,
			});
		
		case actions.STORE_SNAPSHOT: {
			const { index, snapshot, } = action;
			const snapshots = [ ...state.snapshots, ];
			snapshots[index] = snapshot;
			return {
				...state,
				snapshotIndex: index,
				snapshots,
			};
		}
		
		case actions.TOGGLE_CONNECT_MODE:
			return {
				...state,
				connectModeActive: !state.connectModeActive,
			};
		
		case actions.TOGGLE_MIDI_LEARN_MODE:
			return { ...state, learnModeActive: !state.learnModeActive };
		
		case actions.TOGGLE_MIDI_LEARN_TARGET:
			return { 
				...state, 
				learnTargetProcessorID: action.processorID, 
				learnTargetParameterKey: action.parameterKey 
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
					}, {}),
				},
			};

		case actions.TOGGLE_SNAPSHOTS_MODE:
			return { ...state, snapshotsEditModeActive: !state.snapshotsEditModeActive };

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
		
		case actions.TOGGLE_PANEL:
			return {
				...state,
				showHelpPanel: action.panelName === 'help' ? !state.showHelpPanel : state.showHelpPanel,
				showPreferencesPanel: action.panelName === 'preferences' ? !state.showPreferencesPanel : state.showPreferencesPanel,
				showSettingsPanel: action.panelName === 'settings' ? !state.showSettingsPanel : state.showSettingsPanel,
				showLibraryPanel: action.panelName === 'library' ? !state.showLibraryPanel : state.showLibraryPanel,
				showSnapshotsPanel: action.panelName === 'snapshots' ? !state.showSnapshotsPanel : state.showSnapshotsPanel,
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
					}, {}),
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
				},
			};

		default:
			return state ? state : initialState;
	}
};
