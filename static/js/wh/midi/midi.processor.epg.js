/**
 * MIDI processor o generate Euclidean rhythm patterns.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIProcessorEPG(specs, my) {
        var that,
            position = 0,
            duration = 0,
            noteOffEvents = [],
            pulsesOnly = [],
            renderCallback,
            processCallback,
            selectCallbacks = [],
            isSelected = false,
            
            initialize = function() {
                updatePattern();
            },
            
            terminate = function() {},
            
            /**
             * Process events to happen in a time slice 
             * timeline start        now      scanStart     scanEnd
             * |----------------------|-----------|------------|
             *                        |-----------| 
             *                        nowToScanStart
             * @param {Number} scanStart Timespan start in ticks from timeline start.
             * @param {Number} scanEnd   Timespan end in ticks from timeline start.
             * @param {Number} nowToScanStart Timespan between current timeline position and scanStart.
             * @param {Number} ticksToMsMultiplier Duration of one tick in milliseconds.
             */
            process = function(scanStart, scanEnd, nowToScanStart, ticksToMsMultiplier) {
                
                // check for scheduled note off events
                var i = noteOffEvents.length;
                while (--i > -1) {
                    var noteOffTime = noteOffEvents[i].timestamp;
                    if (scanStart <= noteOffTime && scanEnd > noteOffTime) {
                        my.setOutputData(noteOffEvents.splice(i, 1)[0]);
                    }
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
                        
                        // send the Note On message
                        my.setOutputData({
                            timestampTicks: pulseStartTime,
                            channel: my.props.channel,
                            type: 'noteon',
                            pitch: my.props.pitch,
                            velocity: my.props.velocity
                        });
                        
                        // store the Note Off message to send later
                        noteOffEvents.push({
                            timestampTicks: pulseStartTime + 240,
                            channel: my.props.channel,
                            type: 'noteoff',
                            pitch: my.props.pitch,
                            velocity: 0
                        });
                        
                        // update pattern graphic view
                        var stepIndex = pulsesOnly[i].stepIndex,
                            // scanStartToNoteStart = pulseStartTime - localStart,
                            // delayFromNowToNoteStart = (nowToScanStart + scanStartToNoteStart) * ticksToMsMultiplier,
                            delayFromNowToNoteStart = (nowToScanStart + scanStartToNoteStart) * ticksToMsMultiplier,
                            delayFromNowToNoteEnd = (delayFromNowToNoteStart + 240) * ticksToMsMultiplier;
                        processCallback(stepIndex, delayFromNowToNoteStart, delayFromNowToNoteEnd);
                    }
                }
                
                if (localStart2 !== false) {
                    localStart = localStart2;
                }
            },
            
            render = function(pos) {
                position = pos % duration;
                if (renderCallback) {
                    renderCallback(position, duration);
                }
            },
            
            /**
             * Add callback to update a view each time the processor has processed.
             * @param {Function} callback Callback function.
             */
            addRenderCallback = function(callback) {
                renderCallback = callback;
            },
            
            /**
             * Add callback to update a view each time the processor has processed 
             * something worthwhile for a view to know.
             * In this case for the Pattern wheel graphic to show played notes.
             * @param {Function} callback Callback function.
             */
            addProcessCallback = function(callback) {
                processCallback = callback;
            },
            
            /**
             * Add callback to update the selected state of the processor's views.
             * @param {Function} callback Callback function.
             */
            addSelectCallback = function(callback) {
                selectCallbacks.push(callback);
            },
            
            /**
             * Set processor's selected state.
             * @param {Boolean} isSelected Selected state.
             */
            setSelected = function(selected) {
                if (selected != isSelected) {
                    isSelected = selected;
                    let n = selectCallbacks.length;
                    while (--n >= 0) {
                        selectCallbacks[n](isSelected);
                    }
                }
            },
            
            updatePattern = function() {
                // euclidean pattern properties, changes in steps, pulses, rotation
                my.props.euclid = createBjorklund(my.params.steps.getValue(), my.params.pulses.getValue());
                var elementsToShift = my.props.euclid.splice(my.params.rotation.getValue());
                my.props.euclid = elementsToShift.concat(my.props.euclid);
                
                // playback properties, changes in isTriplets, rate, noteLength
                var ppqn = WH.conf.getPPQN(),
                    rate = my.params.is_triplets.getValue() ? my.params.rate.getValue() * (2 / 3) : my.params.rate.getValue(),
                    stepDuration = rate * ppqn,
                    noteDuration = my.params.note_length.getValue() * ppqn;
                duration = my.params.steps.getValue() * stepDuration;
                position = position % duration;
                
                // create array of note start times in ticks
                pulsesOnly.length = 0;
                var n = my.props.euclid.length;
                for (var i = 0; i < n; i++) {
                    if (my.props.euclid[i]) {
                        pulsesOnly.push({
                            startTime: i * stepDuration,
                            stepIndex: i
                        });
                    }
                }
            },
            
            /**
             * Create Euclidean rhythm pattern.
             * Code from withakay/bjorklund.js
             * @see https://gist.github.com/withakay/1286731
             */
            createBjorklund = function(steps, pulses) {
                var pattern = [],
                    counts = [],
                	remainders = [],
                	divisor = steps - pulses,
                	level = 0;
                
            	steps = Math.round(steps);
            	pulses = Math.round(pulses);
                remainders.push(pulses);

            	if (pulses > steps || pulses == 0 || steps == 0) {
            		return new Array();
            	}
                
            	while(true) {
            		counts.push(Math.floor(divisor / remainders[level]));
            		remainders.push(divisor % remainders[level]);
            		divisor = remainders[level]; 
            	    level += 1;
            		if (remainders[level] <= 1) {
            			break;
            		}
            	}
            	
            	counts.push(divisor);

            	var r = 0;
            	var build = function(level) {
            		r++;
            		if (level > -1) {
            			for (var i=0; i < counts[level]; i++) {
            				build(level-1); 
            			}	
            			if (remainders[level] != 0) {
            	        	build(level-2);
            			}
            		} else if (level == -1) {
            	           pattern.push(0);	
            		} else if (level == -2) {
                       pattern.push(1);        
            		} 
            	};

            	build(level);
            	return pattern.reverse();
            };
       
        my = my || {};
        my.props = my.props || {};
        my.props.type = type;
        my.props.position3d = specs.position3d || null;
        my.props.euclid = specs.euclid || [];
        
        /**
         * Parameter change handlers.
         * @param {Number|String|Boolean} value New parameter value.
         * @param {Number} timestamp Possible delay for the change.
         */
        my.$steps = function(value, timestamp) {
            my.params['pulses'].setMax(value);
            my.params['rotation'].setMax(value - 1);
            if (my.params['pulses'].getValue() > value) {
                my.params['pulses'].setValue(value);
            }
            if (my.params['rotation'].getValue() > value - 1) {
                my.params['rotation'].setValue(value);
            }
            updatePattern();
        }
        my.$pulses = function(value, timestamp) {
            updatePattern();
        }
        my.$rotation = function(value, timestamp) {
            updatePattern();
        }
        my.$rate = function(value, timestamp) {}
        my.$note_length = function(value, timestamp) {}
        my.$is_triplets = function(value, timestamp) {}
        my.$is_mute = function(value, timestamp) {}
        my.$is_solo = function(value, timestamp) {}
        my.$channel_out = function(value, timestamp) {}
        my.$pitch_out = function(value, timestamp) {}
        my.$velocity_out = function(value, timestamp) {}

        that = ns.createMIDIProcessorBase(specs, my);
        that = ns.createMIDIConnectorIn(specs, my);
        that = ns.createMIDIConnectorOut(specs, my);
        
        my.defineParams({
            steps: {
                label: 'Steps',
                type: 'integer',
                default: 16,
                min: 1,
                max: 64
            },
            pulses: {
                label: 'Pulses',
                type: 'integer',
                default: 4,
                min: 0,
                max: 16
            },
            rotation: {
                label: 'Rotation',
                type: 'integer',
                default: 0,
                min: 0,
                max: 15
            },
            channel_out: {
                label: 'MIDI Channel',
                type: 'integer',
                default: 1,
                min: 1,
                max: 16
            },
            pitch_out: {
                label: 'MIDI Pitch',
                type: 'integer',
                default: 60,
                min: 0,
                max: 127
            },
            velocity_out: {
                label: 'MIDI Velocity',
                type: 'integer',
                default: 100,
                min: 0,
                max: 127
            },
            rate: {
                label: 'Rate',
                type: 'itemized',
                default: 0.25,
                model: [
                    {label: '1', value: 4},
                    {label: '1/2', value: 2},
                    {label: '1/4', value: 1},
                    {label: '1/8', value: 0.5},
                    {label: '1/16', value: 0.25},
                    {label: '1/32', value: 0.125}
                ]
            },
            is_triplets: {
                label: 'Triplets',
                type: 'boolean',
                default: false
            },
            note_length: {
                label: 'Note length',
                type: 'itemized',
                default: 0.25,
                model: [
                    {label: '1', value: 4},
                    {label: '1/2', value: 2},
                    {label: '1/4', value: 1},
                    {label: '1/8', value: 0.5},
                    {label: '1/16', value: 0.25},
                    {label: '1/32', value: 0.125}
                ]
            },
            is_solo: {
                label: 'Solo',
                type: 'boolean',
                default: false
            },
            is_mute: {
                label: 'Mute',
                type: 'boolean',
                default: false
            }
        });
        
        initialize();
        
        that.terminate = terminate;
        that.process = process;
        that.render = render;
        that.addRenderCallback = addRenderCallback;
        that.addProcessCallback = addProcessCallback;
        that.addSelectCallback = addSelectCallback;
        that.setSelected = setSelected;
        return that;
    };
    
    var type = 'epg';
    ns.midiProcessors = ns.midiProcessors || {};
    ns.midiProcessors[type] = {
        create: createMIDIProcessorEPG
    };

})(WH);
