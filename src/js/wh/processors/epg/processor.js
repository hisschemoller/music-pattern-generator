import createMIDIProcessorBase from '../../midi/processorbase';
import { PPQN } from '../../core/config';
import { getProcessorByID } from '../../state/selectors';
import { getEuclidPattern, rotateEuclidPattern } from './euclid';

export function createProcessor(specs, my) {
    let that,
        store = specs.store,
        position = 0,
        duration = 0,
        noteDuration,
        euclidPattern = [],
        noteOffEvents = [],
        pulsesOnly = [];

    const initialize = function() {
            document.addEventListener(store.STATE_CHANGE, (e) => {
                switch (e.detail.action.type) {
                    case e.detail.actions.CHANGE_PARAMETER:
                        if (e.detail.action.processorID === my.id) {
                            my.params = getProcessorByID(my.id).params;
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
                                case 'is_mute':
                                    break;
                            }
                        }
                        break;
                }
                updatePattern(true);
            });        
        },

        terminate = function() {},
            
        /**
         * Process events to happen in a time slice.
         * timeline start        now      scanStart     scanEnd
         * |----------------------|-----------|------------|
         *                        |-----------| 
         *                        nowToScanStart
         * @param {Number} scanStart Timespan start in ticks from timeline start.
         * @param {Number} scanEnd   Timespan end in ticks from timeline start.
         * @param {Number} nowToScanStart Timespan from current timeline position to scanStart.
         * @param {Number} ticksToMsMultiplier Duration of one tick in milliseconds.
         * @param {Number} offset Time from doc start to timeline start in ticks.
         * @param {Array} processorEvents Array to collect processor generated events to displayin the view.
         */
        process = function(scanStart, scanEnd, nowToScanStart, ticksToMsMultiplier, offset, processorEvents) {
            
            // if the processor is muted only process remaining note offs.
            if (my.params.is_mute.value) {
                processNoteOffs(scanStart, scanEnd);
                return;
            }
            
            // if the pattern loops during this timespan.
            var localStart = scanStart % duration,
                localEnd = scanEnd % duration,
                localStart2 = false,
                localEnd2;
            if (localStart > localEnd) {
                localStart2 = 0,
                localEnd2 = localEnd;
                localEnd = duration;
            }
            
            // check if notes occur during the current timespan
            var n = pulsesOnly.length;
            for (var i = 0; i < n; i++) {
                var pulseStartTime = pulsesOnly[i].startTime,
                    scanStartToNoteStart = pulseStartTime - localStart,
                    isOn = (localStart <= pulseStartTime) && (pulseStartTime < localEnd);
                    
                // if pattern looped back to the start
                if (localStart2 !== false) {
                    scanStartToNoteStart = pulseStartTime - localStart + duration;
                    isOn = isOn || (localStart2 <= pulseStartTime) && (pulseStartTime < localEnd2);
                } 
                
                // if a note should play
                if (isOn) {
                    var channel = my.params.channel_out.value,
                        pitch = my.params.pitch_out.value,
                        velocity = my.params.velocity_out.value,
                        pulseStartTimestamp = scanStart + scanStartToNoteStart;
                    
                    // send the Note On message
                    my.setOutputData({
                        timestampTicks: pulseStartTimestamp,
                        channel: channel,
                        type: 'noteon',
                        pitch: pitch,
                        velocity: velocity
                    });
                    
                    // store the Note Off message to send later
                    noteOffEvents.push({
                        timestampTicks: pulseStartTimestamp + noteDuration,
                        channel: channel,
                        type: 'noteoff',
                        pitch: pitch,
                        velocity: 0
                    });
                    
                    if (!processorEvents[my.id]) {
                        processorEvents[my.id] = [];
                    }
                    const delayFromNowToNoteStart = (nowToScanStart + scanStartToNoteStart) * ticksToMsMultiplier;
                    processorEvents[my.id].push({
                        stepIndex: pulsesOnly[i].stepIndex,
                        delayFromNowToNoteStart: delayFromNowToNoteStart,
                        delayFromNowToNoteEnd: (delayFromNowToNoteStart + noteDuration) * ticksToMsMultiplier
                    });
                }
            }
            
            if (localStart2 !== false) {
                localStart = localStart2;
            }
            
            processNoteOffs(scanStart, scanEnd);
        },
            
        /**
         * Check for scheduled note off events.
         * @param {Number} scanStart Timespan start in ticks from timeline start.
         * @param {Number} scanEnd   Timespan end in ticks from timeline start.
         */
        processNoteOffs = function(scanStart, scanEnd) {
            var i = noteOffEvents.length;
            while (--i > -1) {
                var noteOffTime = noteOffEvents[i].timestampTicks;
                if (scanStart <= noteOffTime && scanEnd > noteOffTime) {
                    my.setOutputData(noteOffEvents.splice(i, 1)[0]);
                }
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
            
            // playback propertie)s, changes in isTriplets, rate, noteLength
            var rate = my.params.is_triplets.value ? my.params.rate.value * (2 / 3) : my.params.rate.value,
                stepDuration = rate * PPQN;
            noteDuration = my.params.note_length.value * PPQN;
            duration = my.params.steps.value * stepDuration;
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