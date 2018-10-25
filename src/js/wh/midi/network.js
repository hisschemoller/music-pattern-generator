/**
 * Manages the graph of midi processors.
 */
export default function createMIDINetwork(specs, my) {
    var that,
        store = specs.store,
        processors = [],
        numProcessors = 0,

        init = function() {
            document.addEventListener(store.STATE_CHANGE, (e) => {
                switch (e.detail.action.type) {
                    case e.detail.actions.CREATE_PROJECT:
                        disconnectProcessors(e.detail.state.connections);
                        deleteProcessors(e.detail.state.processors);
                        createProcessors(e.detail.state.processors);
                        connectProcessors(e.detail.state.connections);
                        orderProcessors(e.detail.state.processors);
                        break;

                    case e.detail.actions.ADD_PROCESSOR:
                        createProcessors(e.detail.state.processors);
                        break;
                    
                    case e.detail.actions.DELETE_PROCESSOR:
                        disconnectProcessors(e.detail.state.connections);
                        deleteProcessors(e.detail.state.processors);
                        orderProcessors(e.detail.state.processors);
                        break;
                    
                    case e.detail.actions.CONNECT_PROCESSORS:
                        connectProcessors(e.detail.state.connections);
                        orderProcessors(e.detail.state.processors);
                        break;
                    
                    case e.detail.actions.DISCONNECT_PROCESSORS:
                        disconnectProcessors(e.detail.state.connections);
                        orderProcessors(e.detail.state.processors);
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
        createProcessors = function(procsState) {
            procsState.allIds.forEach((id, i) => {
                const processorData = procsState.byId[id];
                let exists = false;
                processors.forEach(processor => {
                    if (processor.getID() === id) {
                        exists = true;
                    }
                });
                if (!exists) {
                    import(`../processors/${processorData.type}/processor.js`)
                        .then((module) => {
                            const processor = module.createProcessor({
                                that: {},
                                data: processorData,
                                store: store
                            });
                            processors.splice(i, 0, processor);
                            numProcessors = processors.length;
                        });
                }
            });
        },

        /**
         * Delete a processor.
         * @param {Object} state State processors table.
         */
        deleteProcessors = function(procsState) {
            for (let i = processors.length - 1, n = 0; i >= n; i--) {
                // search for the processor in the state
                let exists = false;
                procsState.allIds.forEach(processorID => {
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
        orderProcessors = function(processorsState) {
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
