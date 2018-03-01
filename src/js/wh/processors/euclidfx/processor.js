import createMIDIProcessorBase from '../../midi/processorbase';
import { PPQN } from '../../core/config';
import { getEuclidPattern, rotateEuclidPattern } from './euclid';

export function createProcessor(specs, my) {
    let that,
        store = specs.store,
        position = 0,
        duration = 0,
        euclidPattern = [];

    const initialize = function() {},

        terminate = function() {},
            
        /**
         * Process events to happen in a time slice. This will
         * - Get events waiting at the input
         * - Process them according to the current parameter settings.
         * - Send the processed events to the output.
         * - Add the events to the processorEvents parameter for display in the view.
         * @param {Number} scanStart Timespan start in ticks from timeline start.
         * @param {Number} scanEnd   Timespan end in ticks from timeline start.
         * @param {Number} nowToScanStart Timespan from current timeline position to scanStart.
         * @param {Number} ticksToMsMultiplier Duration of one tick in milliseconds.
         * @param {Number} offset Time from doc start to timeline start in ticks.
         * @param {Array} processorEvents Array to collect processor generated events to display in the view.
         */
        process = function(scanStart, scanEnd, nowToScanStart, ticksToMsMultiplier, offset, processorEvents) {};

    my = my || {};
    
    that = createMIDIProcessorBase(specs, my);

    initialize();

    that.terminate = terminate;
    that.process = process;
    return that;
}
