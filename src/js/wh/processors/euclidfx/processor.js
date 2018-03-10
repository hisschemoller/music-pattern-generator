import createMIDIProcessorBase from '../../midi/processorbase';
import { PPQN } from '../../core/config';
import { getEuclidPattern, rotateEuclidPattern } from './euclid';

export function createProcessor(specs, my) {
    let that,
        store = specs.store,
        position = 0,
        duration = 0,
        stepDuration = 0,
        euclidPattern = [],
        params = {};

    const initialize = function() {
            document.addEventListener(store.STATE_CHANGE, handleStateChanges);
            updateEffectParameters(specs.data.params.byId);
            updateRelativeSetting(specs.data.params.byId);
            updatePattern(true);
        },

        terminate = function() {
            document.removeEventListener(store.STATE_CHANGE, handleStateChanges);
        },

        handleStateChanges = function(e) {
            switch (e.detail.action.type) {
                case e.detail.actions.CHANGE_PARAMETER:
                    if (e.detail.action.processorID === my.id) {
                        my.params = e.detail.state.processors.byId[my.id].params.byId;
                        switch (e.detail.action.paramKey) {
                            case 'steps':
                                updatePulsesAndRotation();
                                updatePattern(true);
                                break;
                            case 'pulses':
                                updatePattern(true);
                                break;
                            case 'rotation':
                            case 'is_triplets':
                            case 'rate':
                                updatePattern();
                                break;
                            case 'target':
                                updateTarget(e.detail.state.processors.byId[my.id].params.byId);
                                break;
                            case 'low':
                            case 'high':
                                updateEffectParameters(e.detail.state.processors.byId[my.id].params.byId);
                                break;
                            case 'relative':
                                updateRelativeSetting(e.detail.state.processors.byId[my.id].params.byId);
                                break;
                        }
                    }
                    break;
            }
        },
            
        /**
         * Process events to happen in a time slice. This will
         * - Get events waiting at the input
         * - Process them according to the current parameter settings.
         * - Send the processed events to the output.
         * - Add the events to the processorEvents parameter for display in the view.
         * 
         * Events are plain objects with properties:
         * @param {String} type 'note'
         * @param {Number} timestampTicks Event start time, meaured from timeline start
         * @param {Number} durationTicks
         * @param {Number} channel 1 - 16
         * @param {Number} velocity 0 - 127
         * @param {Number} pitch 0 - 127
         * 
         * This method's parameters:
         * @param {Number} scanStart Timespan start in ticks from timeline start.
         * @param {Number} scanEnd   Timespan end in ticks from timeline start.
         * @param {Number} nowToScanStart Timespan from current timeline position to scanStart, in ticks
         * @param {Number} ticksToMsMultiplier Duration of one tick in milliseconds.
         * @param {Number} offset Time from doc start to timeline start in ticks.
         * @param {Array} processorEvents Array to collect processor generated events to display in the view.
         */
        process = function(scanStart, scanEnd, nowToScanStart, ticksToMsMultiplier, offset, processorEvents) {
            // retrieve events waiting at the processor's input
            const inputData = my.getInputData();

            // abort if there's nothing to process
            if (inputData.length === 0) {
                return;
            }

            // calculate the processed timespan's position within the pattern, 
            // taking into account the pattern looping during this timespan.
            var localScanStart = scanStart % duration,
                localScanEnd = scanEnd % duration,
                localScanStart2 = false,
                localScanEnd2;
            if (localScanStart > localScanEnd) {
                localScanStart2 = 0,
                localScanEnd2 = localScanEnd;
                localScanEnd = duration;
            }

            for (let i = 0, n = inputData.length; i < n; i++) {
                const event = inputData[i];

                // handle only MIDI Note events
                if (event.type === 'note') {

                    // calculate the state of the effect at the event's time within the pattern
                    const stepIndex = Math.floor((event.timestampTicks % duration) / stepDuration);
                    const state = euclidPattern[stepIndex];
                    
                    // apply the effect to the event's target parameter
                    switch (params.target) {
                        case 'velocity':
                            event.velocity = state ? params.high : params.low;
                            break;
                        case 'pitch':
                            event.pitch = state ? params.high : params.low;
                            break;
                        case 'channel':
                            event.channel = state ? params.high : params.low;
                            break;
                    }

                    // add events to processorEvents for the canvas to show them
                    if (!processorEvents[my.id]) {
                        processorEvents[my.id] = [];
                    }
                    
                    const delayFromNowToNoteStart = (event.timestampTicks - scanStart) * ticksToMsMultiplier;
                    processorEvents[my.id].push({
                        stepIndex: stepIndex,
                        delayFromNowToNoteStart: delayFromNowToNoteStart,
                        delayFromNowToNoteEnd: delayFromNowToNoteStart + (event.durationTicks * ticksToMsMultiplier)
                    });
                }

                // push the event to the processor's output
                my.setOutputData(event);
            }
        },

        /**
         * After a change of the steps parameter update the pulses and rotation parameters.
         */
        updatePulsesAndRotation = function() {
            store.dispatch(store.getActions().recreateParameter(my.id, 'pulses', { max: my.params.steps.value }));
            store.dispatch(store.getActions().recreateParameter(my.id, 'rotation', { max: my.params.steps.value - 1 }));
            store.dispatch(store.getActions().changeParameter(my.id, 'pulses', my.params.pulses.value));
            store.dispatch(store.getActions().changeParameter(my.id, 'rotation', my.params.rotation.value));
        },
            
        /**
         * Update all pattern properties.
         * @param {Boolean} isEuclidChange Steps, pulses or rotation change.
         */
        updatePattern = function(isEuclidChange) {
            // euclidean pattern properties, changes in steps, pulses, rotation
            if (isEuclidChange) {
                euclidPattern = getEuclidPattern(my.params.steps.value, my.params.pulses.value);
                euclidPattern = rotateEuclidPattern(euclidPattern, my.params.rotation.value);
            }
            
            // playback properties, changes in isTriplets and rate
            var rate = my.params.is_triplets.value ? my.params.rate.value * (2 / 3) : my.params.rate.value;
            stepDuration = rate * PPQN;
            duration = my.params.steps.value * stepDuration;
        },

        /**
         * Effect target changed.
         * @param {Object} parameters Parameters object from state.
         */
        updateTarget = function(parameters) {
            params.target = parameters.target.value;

            let min, max, lowValue, highValue;

            // set minimum and maximum value according to target type
            switch (parameters.target.value) {
                case 'velocity':
                case 'pitch':
                    min = parameters.relative.value ? -127 : 0;
                    max = 127;
                    break;
                case 'channel':
                    min = parameters.relative.value ? -16 : 1;
                    max = 16;
                    break;
                case 'length':
                    min = 0;
                    max = 1;
                    break;
                case 'output':
                    min = 0;
                    max = 1;
                    break;
            }

            // clamp parameter's value between minimum and maximum value
            lowValue = Math.max(min, Math.min(parameters.low.value, max));
            highValue = Math.max(min, Math.min(parameters.high.value, max));

            // apply all new settings to the effect parameters 
            store.dispatch(store.getActions().recreateParameter(my.id, 'low', { min: min, max: max, value: lowValue }));
            store.dispatch(store.getActions().recreateParameter(my.id, 'high', { min: min, max: max, value: highValue }));
        },
        
        updateEffectParameters = function(parameters) {
            params.high = parameters.high.value;
            params.low = parameters.low.value;
        },
        
        updateRelativeSetting = function(parameters) {
            params.relative = parameters.relative.value;

            let min, max, lowValue, highValue;
            
            // set minimum and maximum value according to target type
            switch (parameters.target.value) {
                case 'velocity':
                case 'pitch':
                    min = parameters.relative.value ? -127 : 0;
                    max = 127;
                    lowValue = parameters.relative.value ? 0 : 50;
                    highValue = parameters.relative.value ? 0 : 100;
                    break;
                case 'channel':
                    min = parameters.relative.value ? -16 : 1;
                    max = 16;
                    lowValue = parameters.relative.value ? 0 : 1;
                    highValue = parameters.relative.value ? 0 : 1;
                    break;
                case 'length':
                    min = 0;
                    max = 1;
                    lowValue = parameters.relative.value ? 0 : 1;
                    highValue = parameters.relative.value ? 0 : 1;
                    break;
                case 'output':
                    min = 0;
                    max = 1;
                    lowValue = parameters.relative.value ? 0 : 0;
                    highValue = parameters.relative.value ? 0 : 0;
                    break;
            }

            // apply all new settings to the effect parameters 
            store.dispatch(store.getActions().recreateParameter(my.id, 'low', { min: min, max: max, value: lowValue }));
            store.dispatch(store.getActions().recreateParameter(my.id, 'high', { min: min, max: max, value: highValue }));
        };

    my = my || {};
    
    that = createMIDIProcessorBase(specs, my);

    initialize();

    that.terminate = terminate;
    that.process = process;
    return that;
}
