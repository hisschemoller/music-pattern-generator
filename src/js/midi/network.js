import { dispatch, getActions, STATE_CHANGE, } from '../state/store.js';
import { getProcessorData } from '../core/processor-loader.js';

export function setup() {
    addEventListeners();
}

function addEventListeners() {
  document.addEventListener(STATE_CHANGE, handleStateChanges);
}

/**
 * Handle state changes.
 * @param {Object} e 
 */
function handleStateChanges(e) {
  const { state, action, actions, } = e.detail;
  switch (action.type) {
		case actions.CREATE_PROJECT:
			disconnectProcessors(state.connections);
			deleteProcessors(state.processors);
			createProcessors(state);
			break;

		case actions.ADD_PROCESSOR:
			createProcessors(state);
			break;
	
		case actions.DELETE_PROCESSOR:
			disconnectProcessors(state.connections);
			deleteProcessors(state.processors);
			reorderProcessors(state.processors);
			break;
	
		case actions.CONNECT_PROCESSORS:
			connectProcessors(state.connections);
			reorderProcessors(state.processors);
			break;
	
		case actions.DISCONNECT_PROCESSORS:
			disconnectProcessors(state.connections);
			reorderProcessors(state.processors);
			break;
  }
}

/**
 * Create a new processor in the network.
 * @param {Object} state State processors table.
 */
function createProcessors(state) {
	let loaded = 0;
	for (let id of state.processors.allIds) {
		const processorData = state.processors.byId[id];
		const isExists = processors.find(processor => processor.getID() === id);
		if (!isExists) {
			const module = getProcessorData(processorData.type, 'processor');
			const processor = module.createProcessor({
				that: {},
				data: processorData,
				store,
			});
			processors.push(processor);
			numProcessors = processors.length;

			loaded += 1;
			if (loaded === state.processors.allIds.length) {
				connectProcessors(state.connections);
				reorderProcessors(state.processors);
			}
		}
	};
}

/**
 * Go through all connection data and create the connections 
 * that don't yet exist.
 */
function connectProcessors(connections) {
	connections.allIds.forEach(connectionID => {
		const connection = connections.byId[connectionID];
		processors.forEach(sourceProcessor => {
			if (sourceProcessor.getID() === connection.sourceProcessorID) {
				let exists = false;
				sourceProcessor.getDestinations().forEach(destinationProcessor => {
					if (destinationProcessor.getID() === connection.destinationProcessorID) {
						exists = true;
					}
				});
				if (!exists) {
					processors.forEach(destinationProcessor => {
						if (destinationProcessor.getID() === connection.destinationProcessorID) {
							sourceProcessor.connect(destinationProcessor);
						}
					});
				}
			}
		});
	});
}

/**
 * Go through all processor outputs and check if 
 * they still exist in the state. If not, disconnect them.
 * 
 * TODO: allow for processors with multiple inputs or outputs.
 */
function disconnectProcessors(connections) {
		processors.forEach(sourceProcessor => {
				if (sourceProcessor.getDestinations instanceof Function) {
						const destinationProcessors = sourceProcessor.getDestinations();
						destinationProcessors.forEach(destinationProcessor => {
								let exists = false;
								connections.allIds.forEach(connectionID => {
										const connection = connections.byId[connectionID];
										if (connection.sourceProcessorID === sourceProcessor.getID() &&
												connection.destinationProcessorID === destinationProcessor.getID()) {
												exists = true;
										}
								});
								if (!exists) {
										sourceProcessor.disconnect(destinationProcessor);
								}
						});
				}
		});
},

/**
 * Delete a processor.
 * @param {Object} state State processors table.
 */
function deleteProcessors(processorsState) {
	for (let i = processors.length - 1, n = 0; i >= n; i--) {

		// search for the processor in the state
		let exists = false;
		processorsState.allIds.forEach(processorID => {
			if (processorID === processors[i].getID()) {
				exists = true;
			}
		});

		// remove processor if it doesn't exist in the state
		if (!exists) {
			const processor = processors[i];
			if (processor.terminate instanceof Function) {
				processor.terminate();
			}
			processors.splice(i, 1);
		}
	}
	numProcessors = processors.length;
}

/**
 * Manages the graph of midi processors.
 */
export default function createMIDINetwork(specs, my) {
    var that,
        processors = [],
        numProcessors = 0,

        init = function() {
            document.addEventListener(store.STATE_CHANGE, (e) => {
                const { action, actions, state } = e.detail;
                switch (action.type) {
                    case actions.CREATE_PROJECT:
                        disconnectProcessors(state.connections);
                        deleteProcessors(state.processors);
                        createProcessors(state);
                        break;

                    case actions.ADD_PROCESSOR:
                        createProcessors(state);
                        break;
                    
                    case actions.DELETE_PROCESSOR:
                        disconnectProcessors(state.connections);
                        deleteProcessors(state.processors);
                        reorderProcessors(state.processors);
                        break;
                    
                    case actions.CONNECT_PROCESSORS:
                        connectProcessors(state.connections);
                        reorderProcessors(state.processors);
                        break;
                    
                    case actions.DISCONNECT_PROCESSORS:
                        disconnectProcessors(state.connections);
                        reorderProcessors(state.processors);
                        break;
                }
            });

            document.addEventListener('keyup', function(e) {
                switch (e.keyCode) {
                    case 83: // s
                        console.log('    ++++    ');
                        processors.forEach(processor => {
                            console.log('network processor', processor.getID());
                        });
                        break;
                }
            });
        },

        /**
         * Create a new processor in the network.
         * @param {Object} state State processors table.
         */
        createProcessors = async state => {
          let loaded = 0;
          for (let id of state.processors.allIds) {
            const processorData = state.processors.byId[id];
            const isExists = processors.find(processor => processor.getID() === id);
            if (!isExists) {
              const module = await import(`../processors/${processorData.type}/processor.js`);
              const processor = module.createProcessor({
                that: {},
                data: processorData,
                store,
              });
              processors.push(processor);
              numProcessors = processors.length;

              loaded += 1;
              if (loaded === state.processors.allIds.length) {
                connectProcessors(state.connections);
                reorderProcessors(state.processors);
              }
            }
          };
        },

        /**
         * Delete a processor.
         * @param {Object} state State processors table.
         */
        deleteProcessors = function(processorsState) {
            for (let i = processors.length - 1, n = 0; i >= n; i--) {
                // search for the processor in the state
                let exists = false;
                processorsState.allIds.forEach(processorID => {
                    if (processorID === processors[i].getID()) {
                        exists = true;
                    }
                });

                // remove processor if it doesn't exist in the state
                if (!exists) {
                    const processor = processors[i];
                    if (processor.terminate instanceof Function) {
                        processor.terminate();
                    }
                    processors.splice(i, 1);
                }
            }
            numProcessors = processors.length;
        },
        
        /**
         * Go through all connection data and create the connections 
         * that don't yet exist.
         */
        connectProcessors = function(connections) {
            connections.allIds.forEach(connectionID => {
                const connection = connections.byId[connectionID];
                processors.forEach(sourceProcessor => {
                    if (sourceProcessor.getID() === connection.sourceProcessorID) {
                        let exists = false;
                        sourceProcessor.getDestinations().forEach(destinationProcessor => {
                            if (destinationProcessor.getID() === connection.destinationProcessorID) {
                                exists = true;
                            }
                        });
                        if (!exists) {
                            processors.forEach(destinationProcessor => {
                                if (destinationProcessor.getID() === connection.destinationProcessorID) {
                                    sourceProcessor.connect(destinationProcessor);
                                }
                            });
                        }
                    }
                });
            });
        },

        /**
         * Go through all processor outputs and check if 
         * they still exist in the state. If not, disconnect them.
         * 
         * TODO: allow for processors with multiple inputs or outputs.
         */
        disconnectProcessors = function(connections) {
            processors.forEach(sourceProcessor => {
                if (sourceProcessor.getDestinations instanceof Function) {
                    const destinationProcessors = sourceProcessor.getDestinations();
                    destinationProcessors.forEach(destinationProcessor => {
                        let exists = false;
                        connections.allIds.forEach(connectionID => {
                            const connection = connections.byId[connectionID];
                            if (connection.sourceProcessorID === sourceProcessor.getID() &&
                                connection.destinationProcessorID === destinationProcessor.getID()) {
                                exists = true;
                            }
                        });
                        if (!exists) {
                            sourceProcessor.disconnect(destinationProcessor);
                        }
                    });
                }
            });
        },

        /**
         * Reorder the processors according to their order in the state.
         * @param {Object} State processor table.
         */
        reorderProcessors = function(processorsState) {
            const orderedProcessors = [];
            processorsState.allIds.forEach(processorID => {
                processors.forEach(processor => {
                    if (processor.getID() === processorID) {
                        orderedProcessors.push(processor);
                    }
                });
            });
            processors = orderedProcessors;
        },

        /**
         * Let all processors process their data.
         * @param {Number} start Start time in ticks of timespan to process.
         * @param {Number} end End time in ticks of timespan to process.
         * @param {Number} nowToScanStart Duration from now until start time in ticks.
         * @param {Number} ticksToMsMultiplier Ticks to ms. conversion multiplier.
         * @param {Number} offset Position of transport playhead in ticks.
         * @param {Object} processorEvents Object to collect processor generated events to displayin the view.
         */
        process = function(start, end, nowToScanStart, ticksToMsMultiplier, offset, processorEvents) {
            for (var i = 0; i < numProcessors; i++) {
                processors[i].process(start, end, nowToScanStart, ticksToMsMultiplier, offset, processorEvents);
            }
        };

    my = my || {};

    that = specs.that;

    init();

    that.process = process;

    return that;
}
