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
                    case e.detail.actions.NEW_PROJECT:
                    case e.detail.actions.SET_PROJECT:
                        setProcessors(e.detail.state.processors);
                        break;

                    case e.detail.actions.ADD_PROCESSOR:
                        createProcessor(e.detail.state.processors);
                        break;
                    
                    case e.detail.actions.DELETE_PROCESSOR:
                        deleteProcessor(e.detail.action.id);
                        break;
                    
                    case e.detail.actions.CONNECT_PROCESSORS:
                        connectProcessors(e.detail.action.payload);
                        break;
                    
                    case e.detail.actions.DISCONNECT_PROCESSORS:
                        // TODO: disconnect the actual processors
                        break;
                }
            });
        },

        /**
         * Create a new processor in the network.
         * @param {Array} state Array of all processor data.
         */
        createProcessor = function(procsState) {
            procsState.allIds.forEach((id, i) => {
                const processorData = procsState.byId[id];
                if (!processors[i] || (id !== processors[i].getID())) {
                    const module = require(`../processors/${processorData.type}/processor`);
                    const processor = module.createProcessor({
                        data: processorData,
                        store: store
                    });
                    processors.splice(i, 0, processor);
                }
            });
            numProcessors = processors.length;
        },

        /**
         * Delete a processor.
         * @param {String} id ID of processor to delete.
         */
        deleteProcessor = function(id) {
            var processor;
            for (var i = 0, n = processors.length; i < n; i++) {
                if (processors[i].getID() === id) {
                    processor = processors[i];
                    if (typeof processor.terminate === 'function') {
                        processor.terminate();
                    }
                    processors.splice(processors.indexOf(processor), 1);
                    break;
                }
            }
            numProcessors = processors.length;

            // TODO: if a processor is deleted select the next processor 
        },
        
        connectProcessors = function(payload) {
            const sourceProcessor = processors.find(processor => processor.getID() === payload.sourceProcessorID);
            const destinationProcessor = processors.find(processor => processor.getID() === payload.destinationProcessorID);
            
            if (sourceProcessor && destinationProcessor) {
                sourceProcessor.connect(destinationProcessor);
            }
        },
        
        disconnectProcessors = function(sourceProcessor, destinationProcessor) {
            if (sourceProcessor.getDestinations().includes(destinationProcessor)) {
                sourceProcessor.disconnect(destinationProcessor);
            }
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
        },

        setProcessors = function(newProcessors) {
            clearProcessors();
            newProcessors.allIds.forEach(id => {
                let processor = newProcessors.byId[id];
                if (processor.type !== 'input' && processor.type !== 'output') {
                    createProcessor(newProcessors);
                }
            });
        },

        /**
         * Clear the whole network.
         * Remove all processors except the inputs and outputs.
         * Remove all the connections.
         */
        clearProcessors = function() {
            let type, n = numProcessors;
            while (--n >= 0) {
                type = processors[n].getType();
                if (type !== 'input' && type !== 'output') {
                    deleteProcessor(processors[n]);
                }
            }
        };

    my = my || {};

    that = specs.that;

    init();

    that.process = process;

    return that;
}
