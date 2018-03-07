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
                            case 'note_length':
                                updatePattern();
                                break;
                            case 'target':
                            case 'low':
                            case 'high':
                                updateEffectParameters(e.detail.state.processors.byId[my.id].params.byId);
                                break;
                            case 'relative':
                                setEffectParameters(e.detail.state.processors.byId[my.id].params.byId);
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
         * @param {String} type 'noteon | noteoff'
         * @param {Number} timestampTicks Event start time, meaured from timeline start
         * @param {Number} channel 1 - 16
         * @param {Number} velocity 0 - 127
         * @param {Number} pitch 0 - 127
         * 
         * This method's parameters:
         * @param {Number} scanStart Timespan start in ticks from timeline start.
         * @param {Number} scanEnd   Timespan end in ticks from timeline start.
         * @param {Number} nowToScanStart Timespan from current timeline position to scanStart.
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
            var localStart = scanStart % duration,
                localEnd = scanEnd % duration,
                localStart2 = false,
                localEnd2;
            if (localStart > localEnd) {
                localStart2 = 0,
                localEnd2 = localEnd;
                localEnd = duration;
            }

            for (let i = 0, n = inputData.length; i < n; i++) {
                const event = inputData[i];

                // handle only MIDI Note On events
                if (event.type === 'noteon') {

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

            // noteDuration = my.params.note_length.value * PPQN;
            // duration = my.params.steps.value * stepDuration;
            // position = position % duration;
            
            // create array of note start times in ticks
            // pulsesOnly.length = 0;
            // var n = euclidPattern.length;
            // for (var i = 0; i < n; i++) {
            //     if (euclidPattern[i]) {
            //         pulsesOnly.push({
            //             startTime: i * stepDuration,
            //             stepIndex: i
            //         });
            //     }
            // }
        },
        
        updateEffectParameters = function(_params) {
            params.target = _params.target.value;
            params.high = _params.high.value;
            params.low = _params.low.value;
        },
        
        updateRelativeSetting = function(params) {
            params.relative = params.relative.value;

            let min, max;
            
            switch (params.target) {
                case 'velocity':
                case 'pitch':
                    min = params.relative ? -127 : 0;
                    max = 127;
                    break;
                case 'channel':
                    min = params.relative ? -16 : 0;
                    max = 16;
                    break;
            }

            store.dispatch(store.getActions().recreateParameter(my.id, 'low', { min: min, max: max }));
            store.dispatch(store.getActions().recreateParameter(my.id, 'high', { min: min, max: max }));
            store.dispatch(store.getActions().changeParameter(my.id, 'low', params.low));
            store.dispatch(store.getActions().changeParameter(my.id, 'high', params.high));
        };

    my = my || {};
    
    that = createMIDIProcessorBase(specs, my);

    initialize();

    that.terminate = terminate;
    that.process = process;
    return that;
}
