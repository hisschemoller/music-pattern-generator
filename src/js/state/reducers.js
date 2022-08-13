import orderProcessors from '../midi/network_ordering.js';

/**
 * Temporary user interface state that should be available to multiple
 * components but isn't part of the app state.
 * I keep it separate here to have a cleaner view op the app state below.
 */
const userInterfaceInitialState = {
	activeProcessorId: null,
	cableDrag: {
		active: false,
		source: {
			processorId: null,
			connectorId: null,
			x: 0,
			y: 0,
			z: 0,
		},
		destination: {
			processorId: null,
			connectorId: null,
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
	parameterDrag: {
		objectName: null,
		start: {
			x: 0,
			y: 0,
			z: 0,
		},
		current: {
			x: 0,
			y: 0,
			z: 0,
		},
	},
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
	learnTargetProcessorId: null,
	ports: {
		allIds: [],
		byId: {},
	},
	snapshotIndex: null,
	snapshots: new Array(16),
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
	themeSetting: 'light', // 'light|dark|os'
	transport: 'stop', // 'play|pause|stop'
	version: '2.3.0-beta',
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

		case actions.ASSIGN_EXTERNAL_CONTROL: {
			const { assignId, processorId, paramKey, remoteType, remoteChannel, remoteValue, } = action;
			return {
				...state,
				assignments: {
					allIds: [...state.assignments.allIds, assignId],
					byId: {
						...state.assignments.byId,
						[assignId]: {
							remoteType,
							remoteChannel,
							remoteValue,
							processorId,
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
				activeProcessorId: processorId,
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
			const { connectionId, destinationConnectorId, destinationProcessorId, sourceConnectorId, sourceProcessorId, } = action;
			
			// add the new connection
			const newState = {
				...state,
				connections: {
					byId: { ...state.connections.byId, [connectionId]: {
						destinationConnectorId, destinationProcessorId, sourceConnectorId, sourceProcessorId,
					}},
					allIds: [ ...state.connections.allIds, connectionId ],
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
			
			// delete the processor
			const newState = { 
				...state,
				processors: {
					allIds: state.processors.allIds.filter(id => id !== processorId),
					byId: state.processors.allIds.reduce((accumulator, id) => {
						if (id !== processorId) {
							return { ...accumulator, [id]: state.processors.byId[id] };
						}
						return accumulator;
					}, {}),
				},
			};
			
			// delete all connections to and from the deleted processor
			newState.connections = {
				byId: { ...state.connections.byId },
				allIds: [ ...state.connections.allIds ],
			}
			for (let i = newState.connections.allIds.length -1, n = 0; i >= n; i--) {
				const connectionId = newState.connections.allIds[i];
				const connection = newState.connections.byId[connectionId];
				if (connection.sourceProcessorId === processorId || connection.destinationProcessorId === processorId) {
					newState.connections.allIds.splice(i, 1);
					delete newState.connections.byId[connectionId];
				}
			}

			// delete all assignments to the deleted processor's parameters
			newState.assignments = {
				byId: { ...state.assignments.byId },
				allIds: [ ...state.assignments.allIds ],
			}
			for (let i = newState.assignments.allIds.length -1, n = 0; i >= n; i--) {
				const assignmentId = newState.assignments.allIds[i];
				const assignment = newState.assignments.byId[assignmentId];
				if (assignment.processorId === processorId) {
					newState.assignments.allIds.splice(i, 1);
					delete newState.assignments.byId[assignmentId];
				}
			}

			// delete all snapshot values referencing the deleted processor
			newState.snapshots = state.snapshots.map(snapshot => {
				if (snapshot && snapshot[processorId]) {
					delete snapshot[processorId];
				}
				return snapshot;
			});

			// select the next processor, if any, or a previous one
			const index = state.processors.allIds.indexOf(processorId);
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
							return [ ...accumulator, connectionId ];
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

		case actions.PARAMETER_DRAG_MOVE: {
			const { x, y, z } = action;
			return { ...state, parameterDrag: { ...state.parameterDrag, current: { x, y, z }}};
		}

		case actions.PARAMETER_DRAG_START: {
			const { x, y, z } = action;
			return { ...state, parameterDrag: { ...state.parameterDrag, start: { x, y, z }, current: { x, y, z }}};
		}

		case actions.PARAMETER_TOUCH_START:
			return { ...state, parameterDrag: { ...state.parameterDrag, objectName: action.name } };
		
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

		case actions.SET_THEME: {
			const { theme, themeSetting } = action;
			return { ...state, theme, themeSetting };
		}
		
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
			const snapshots = [ ...state.snapshots ];
			snapshots[index] = snapshot;
			return {
				...state,
				snapshotIndex: index,
				snapshots,
			};
		}
		
		case actions.TOGGLE_CONNECT_MODE:
			return { ...state, connectModeActive: !state.connectModeActive };
		
		case actions.TOGGLE_MIDI_LEARN_MODE:
			return { ...state, learnModeActive: !state.learnModeActive };
		
		case actions.TOGGLE_MIDI_LEARN_TARGET: {
			const { parameterKey: learnTargetParameterKey, processorId: learnTargetProcessorId } = action;
			return { ...state, learnTargetParameterKey, learnTargetProcessorId };
		}
		
		case actions.TOGGLE_MIDI_PREFERENCE: {
			const { id, isEnabled, preferenceName } = action;
			return {
				...state,
				ports: {
					allIds: [ ...state.ports.allIds ],
					byId: state.ports.allIds.reduce((accumulator, portId) => {
						if (portId === id) {
							accumulator[portId] = {
								...state.ports.byId[portId],
								[preferenceName]: (typeof isEnabled === 'boolean') ? isEnabled : !state.ports.byId[id][preferenceName],
							};
						} else {
							accumulator[portId] = { ...state.ports.byId[portId] };
						}
						return accumulator;
					}, {}),
				},
			};
		}

		case actions.TOGGLE_SNAPSHOTS_MODE:
			return { ...state, snapshotsEditModeActive: !state.snapshotsEditModeActive };
		
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
					allIds: state.assignments.allIds.reduce((accumulator, assignId) => {
						const assignment = state.assignments.byId[assignId];
						if (assignment.processorId !== action.processorId || assignment.paramKey !== action.paramKey) {
							accumulator.push(assignId);
						}
						return accumulator;
					}, []),
					byId: state.assignments.allIds.reduce((accumulator, assignId) => {
						const assignment = state.assignments.byId[assignId];
						if (assignment.processorId !== action.processorId || assignment.paramKey !== action.paramKey) {
							accumulator[assignId] = { ...assignment };
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
