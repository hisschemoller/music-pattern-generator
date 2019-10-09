import createMIDIProcessorBase from '../../midi/processorbase.js';
import { PPQN } from '../../core/config.js';
import { getEuclidPattern, rotateEuclidPattern } from './utils.js';

export function createProcessor(specs, my) {
    let that,
        store = specs.store,
        position = 0,
        duration = 0,
        noteDuration,
        params = {},
        euclidPattern = [],
        pulsesOnly = [];

    const initialize = function() {
            document.addEventListener(store.STATE_CHANGE, handleStateChanges);
            updateAllParams(specs.data.params.byId);
            updatePattern(true);
        },

        terminate = function() {
            document.removeEventListener(store.STATE_CHANGE, handleStateChanges);
        },

        handleStateChanges = function(e) {
            switch (e.detail.action.type) {
                case e.detail.actions.CHANGE_PARAMETER:
                    if (e.detail.action.processorID === my.id) {
                        updateAllParams(e.detail.state.processors.byId[my.id].params.byId);
                        switch (e.detail.action.paramKey) {
                            case 'steps':
                                updatePulsesAndRotation();
                                updatePattern(true);
                                break;
                            case 'pulses':
                            case 'rotation':
                                updatePattern(true);
                                break;
                            case 'is_triplets':
                            case 'rate':
                            case 'note_length':
                                updatePattern();
                                break;
                            case 'is_mute':
                                break;
                        }
                    }
                    break;
            }
        },
            
        /**
         * Process events to happen in a time slice.
         * timeline start        now      scanStart     scanEnd
         * |----------------------|-----------|------------|
         *                        |-----------| 
         *                        nowToScanStart
         * @param {Number} scanStart Timespan start in ticks from timeline start.
         * @param {Number} scanEnd   Timespan end in ticks from timeline start.
         * @param {Number} nowToScanStart Timespan from current timeline position to scanStart, in ticks.
         * @param {Number} ticksToMsMultiplier Duration of one tick in milliseconds.
         * @param {Number} offset Time from doc start to timeline start in ticks.
         * @param {Array} processorEvents Array to collect processor generated events to displaying the view.
         */
        process = function(scanStart, scanEnd, nowToScanStart, ticksToMsMultiplier, offset, processorEvents) {

            // clear the output event stack
            my.clearOutputData();
            
            // abort if the processor is muted
            if (params.is_mute) {
                return;
            }
            
            // if the pattern loops during this timespan.
            var localScanStart = scanStart % duration,
                localScanEnd = scanEnd % duration,
                localScanStart2 = false,
                localScanEnd2;
            if (localScanStart > localScanEnd) {
                localScanStart2 = 0,
                localScanEnd2 = localScanEnd;
                localScanEnd = duration;
            }
            
            // check if notes occur during the current timespan
            var n = pulsesOnly.length;
            for (let i = 0; i < n; i++) {
                var pulseStartTime = pulsesOnly[i].startTime,
                    scanStartToNoteStart = pulseStartTime - localScanStart,
                    isOn = (localScanStart <= pulseStartTime) && (pulseStartTime < localScanEnd);
                    
                // if pattern looped back to the start
                if (localScanStart2 !== false && isOn === false) {
                    scanStartToNoteStart = pulseStartTime - localScanStart + duration;
                    isOn = isOn || (localScanStart2 <= pulseStartTime) && (pulseStartTime < localScanEnd2);
                } 
                
                // if a note should play
                if (isOn) {
                    var channel = params.channel_out,
                        pitch = params.pitch_out,
                        velocity = params.velocity_out,
                        pulseStartTimestamp = scanStart + scanStartToNoteStart;
                    
                    // send the Note On message
                    // subtract 1 from duration to avoid overlaps
                    my.setOutputData({
                        timestampTicks: pulseStartTimestamp,
                        durationTicks: noteDuration - 1,
                        channel: channel,
                        type: 'note',
                        pitch: pitch,
                        velocity: velocity
                    });
                    
                    // add events to processorEvents for the canvas to show them
                    if (!processorEvents[my.id]) {
                        processorEvents[my.id] = [];
                    }
                    
                    const delayFromNowToNoteStart = (nowToScanStart + scanStartToNoteStart) * ticksToMsMultiplier;
                    processorEvents[my.id].push({
                        stepIndex: pulsesOnly[i].stepIndex,
                        delayFromNowToNoteStart: delayFromNowToNoteStart,
                        delayFromNowToNoteEnd: delayFromNowToNoteStart + (noteDuration * ticksToMsMultiplier)
                    });
                }
            }
            
            if (localScanStart2 !== false) {
                localScanStart = localScanStart2;
            }
        },

        updateAllParams = function(parameters) {
            params.steps = parameters.steps.value;
            params.pulses = parameters.pulses.value;
            params.rotation = parameters.rotation.value;
            params.isTriplets = parameters.is_triplets.value;
            params.rate = parameters.rate.value;
            params.note_length = parameters.note_length.value;
            params.is_mute = parameters.is_mute.value;
            params.channel_out = parameters.channel_out.value;
            params.pitch_out = parameters.pitch_out.value;
            params.velocity_out = parameters.velocity_out.value;
        },

        /**
         * After a change of the steps parameter update the pulses and rotation parameters.
         */
        updatePulsesAndRotation = function() {
            store.dispatch(store.getActions().recreateParameter(my.id, 'pulses', { 
                max: params.steps,
                value: Math.min(params.pulses, params.steps),
            }));
            store.dispatch(store.getActions().recreateParameter(my.id, 'rotation', {
                max: params.steps - 1,
                value: Math.min(params.rotation, params.steps - 1),
            }));
            
            store.dispatch(store.getActions().changeParameter(my.id, 'pulses', params.pulses));
            store.dispatch(store.getActions().changeParameter(my.id, 'rotation', params.rotation));
        },
            
        /**
         * Update all pattern properties.
         * @param {Boolean} isEuclidChange Steps, pulses or rotation change.
         */
        updatePattern = function(isEuclidChange) {
            // euclidean pattern properties, changes in steps, pulses, rotation
            if (isEuclidChange) {
                euclidPattern = getEuclidPattern(params.steps, params.pulses);
                euclidPattern = rotateEuclidPattern(euclidPattern, params.rotation);
            }
            
            // playback properties, changes in isTriplets, rate, noteLength
            var rate = params.is_triplets ? params.rate * (2 / 3) : params.rate,
                stepDuration = rate * PPQN;
            noteDuration = params.note_length * PPQN;
            duration = params.steps * stepDuration;
            position = position % duration;
            
            // create array of note start times in ticks
            pulsesOnly.length = 0;
            var n = euclidPattern.length;
            for (var i = 0; i < n; i++) {
                if (euclidPattern[i]) {
                    pulsesOnly.push({
                        startTime: i * stepDuration,
                        stepIndex: i
                    });
                }
            }
        };

    my = my || {};
    
    that = createMIDIProcessorBase(specs, my);

    initialize();

    that.terminate = terminate;
    that.process = process;
    return that;
}