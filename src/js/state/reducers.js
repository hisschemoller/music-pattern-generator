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
			const { paramKey, paramValue, processorId } = action;
			return { 
				...state,
				activeProcessorID: processorId,
				snapshotIndex: null,
				processors: {
					allIds: [ ...state.processors.allIds ],
					byId: state.processors.allIds.reduce((accumulator, procId) => {
						if (procId === processorId) {
							const processor = state.processors.byId[procId];
							return { ...accumulator, [procId]: {
									...processor,
									params: {
										allIds: [ ...processor.params.allIds ],
										byId: processor.params.allIds.reduce((acc2, paramId) => {
											const param = processor.params.byId[paramId];
											if (paramId === paramKey) {
												return { ...acc2, [paramId]: { ...param, value: paramValue, }, };
											}
											return { ...acc2, [paramId]: param };
										}, {}),
									},
								}
							};
						}
						return { ...accumulator, [procId]: state.processors.byId[procId] };
					}, {}),
				}
			};
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

		case actions.CREATE_MIDI_PORT: {
			const { data, portId, } = action;
			return {
				...state,
				ports: {
					allIds: [ ...state.ports.allIds, portId ],
					byId: { ...state.ports.byId, [portId]: data },
				},
			};
		}

		case actions.CREATE_PROJECT: {
			const { data = {}, } = action;
			const { transport, } = initialState;
			return { ...initialState, ...data, transport, };
		}
		
		case actions.DELETE_PROCESSOR: {
			const { id: processorId } = action;
			const index = state.processors.allIds.indexOf(processorId);
			
			// delete the processor
			const newState = { 
				...state,
				processors: {
					byId: { ...state.processors.byId },
					allIds: state.processors.allIds.filter(id => id !== processorId)
				} };
			delete newState.processors.byId[processorId];
			
			// delete all connections to and from the deleted processor
			newState.connections = {
				byId: { ...state.connections.byId },
				allIds: [ ...state.connections.allIds ]
			}
			for (let i = newState.connections.allIds.length -1, n = 0; i >= n; i--) {
				const connectionID = newState.connections.allIds[i];
				const connection = newState.connections.byId[connectionID];
				if (connection.sourceProcessorID === processorId || connection.destinationProcessorID === processorId) {
					newState.connections.allIds.splice(i, 1);
					delete newState.connections.byId[connectionID];
				}
			}

			// select the next processor, if any, or a previous one
			let newIndex;
			if (newState.selectedId === processorId && newState.processors.allIds.length) {
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
		
		case actions.DISCONNECT_PROCESSORS: {
			const { id } = action;
			const newState = {
				...state,
				connections: {
					allIds: state.connections.allIds.reduce((accumulator, connectionId) => {
						if (connectionId !== id) {
							return { ...accumulator, connectionId };
						}
						return accumulator;
					}, []),
					byId: state.connections.allIds.reduce((accumulator, connectionId) => {
						if (connectionId !== id) {
							return { ...accumulator, [connectionId]: { ...state.connections.byId[connectionId] }, };
						}
						return accumulator;
					}, {}),
				},
			};
			
			// reorder the processors
			orderProcessors(newState);
			return newState;
		}

		case actions.DRAG_ALL_PROCESSORS: {
			const { x, y, } = action;
			return {
				...state,
				processors: {
					allIds: [ ...state.processors.allIds ],
					byId: state.processors.allIds.reduce((accumulator, processorId) => {
						const processor = state.processors.byId[processorId];
						return { 
							...accumulator,
							[processorId]: { 
								...processor, 
								positionX: processor.positionX + x, 
								positionY: processor.positionY + y,
							},
						};
					}, {}),
				}
			};
		}
		
		case actions.DRAG_SELECTED_PROCESSOR: {
			const { x, y, z, } = action;
			return {
				...state,
				processors: {
					allIds: [ ...state.processors.allIds ],
					byId: state.processors.allIds.reduce((accumulator, processorId) => {
						const processor = state.processors.byId[processorId];
						if (processorId === state.selectedId) {
							return { ...accumulator, [processorId]: { ...processor, positionX: x, positionY: y, positionZ: z } };
						}
						return { ...accumulator, [processorId]: { ...processor } };
					}, {}),
				}
			};
		}

		case actions.LIBRARY_DROP: {
			const { processorType, x, y, } = action;
			return { 
				...state, 
				libraryDropPosition: { type: processorType, x, y, },
			};
		}

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
		
		case actions.RECREATE_PARAMETER: {
			const { paramKey, paramObj, processorId } = action;
			return {
				...state,
				processors: {
					allIds: [ ...state.processors.allIds ],
					byId: state.processors.allIds.reduce((accumulator, procId) => {
						if (procId === processorId) {
							const processor = state.processors.byId[procId];
							return { 
								...accumulator, 
								[procId]: { 
									...processor,
									params: {
										allIds: [ ...processor.params.allIds ],
										byId: processor.params.allIds.reduce((acc, paramId) => {
											if (paramId === paramKey) {

												// clone parameter, overwrite with new settings.
												return { ...acc, [paramId]: { ...processor.params.byId[paramId], ...paramObj }, };
											} else {
												return { ...acc, [paramId]: processor.params.byId[paramId] };
											}
										}, {}),
									},
							 }, 
							};
						}
						return { ...accumulator, [procId]: state.processors.byId[procId] };
					}, {}),
				},
			};
		}
		
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
			return {
				...state,
				snapshotIndex: index,
				snapshots: state.snapshots.reduce((accumulator, snap, i) => {
					return [ ...accumulator, (i === index) ? snapshot : snap ];
				}, []),
			};
		}
		
		case actions.TOGGLE_CONNECT_MODE:
			return { ...state, connectModeActive: !state.connectModeActive };
		
		case actions.TOGGLE_MIDI_LEARN_MODE:
			return { ...state, learnModeActive: !state.learnModeActive };
		
		case actions.TOGGLE_MIDI_LEARN_TARGET: {
			const { parameterKey: learnTargetParameterKey, processorID: learnTargetProcessorID } = action;
			return { ...state, learnTargetParameterKey, learnTargetProcessorID };
		}
		
		case actions.TOGGLE_MIDI_PREFERENCE: {
			const { id, isEnabled, preferenceName } = action;
			return {
				...state,
				ports: {
					allIds: [ ...state.ports.allIds ],
					byId: state.ports.allIds.reduce((accumulator, portID) => {
						if (portID === id) {
							accumulator[portID] = {
								...state.ports.byId[portID],
								[preferenceName]: (typeof isEnabled === 'boolean') ? isEnabled : !state.ports.byId[id][preferenceName],
							};
						} else {
							accumulator[portID] = { ...state.ports.byId[portID] };
						}
						return accumulator;
					}, {}),
				},
			};
		}

		case actions.TOGGLE_SNAPSHOTS_MODE:
			return { ...state, snapshotsEditModeActive: !state.snapshotsEditModeActive };

		case actions.ADD_PROCESSOR: {
			const { data } = action; 
			const newState = { 
				...state,
				showSettingsPanel: true,
				processors: {
					allIds: [ ...state.processors.allIds ],
					byId: { 
						...state.processors.byId,
						[data.id]: data,
					},
				},
			};

			// array index depends on processor type
			let numInputProcessors = newState.processors.allIds.filter(id => { newState.processors.byId[id].type === 'input' }).length;
			switch (data.type) {
				case 'input':
					newState.processors.allIds.unshift(data.id);
					numInputProcessors++;
					break;
				case 'output':
					newState.processors.allIds.push(data.id);
					break;
				default:
					newState.processors.allIds.splice(numInputProcessors, 0, data.id);
			}
			
			return newState;
		}
		
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
							accumulator[assignID] = { ...assignment };
						}
						return accumulator;
					}, {}),
				}
			};

		case actions.UPDATE_MIDI_PORT: {
			const { data, portId } = action;
			return {
				...state,
				ports: {
					allIds: [ ...state.ports.allIds ],
					byId: state.ports.allIds.reduce((accumulator, pId) => {
						const port = state.ports.byId[pId];
						if (pId === portId) {
							return { ...accumulator, [pId]: { ...port, ...data } };
						}
						return { ...accumulator, [pId]: { ...port }  };
					}, {}),
				},
			};
		}

		default:
			return state ? state : initialState;
	}
};
