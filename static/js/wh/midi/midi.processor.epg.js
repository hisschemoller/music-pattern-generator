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
            noteDuration,
            euclidPattern = [],
            noteOffEvents = [],
            pulsesOnly = [],
            renderCallback,
            processCallback,
            selectCallbacks = [],
            isSelected = false,
            
            initialize = function() {
                updatePattern(true);
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
             */
            process = function(scanStart, scanEnd, nowToScanStart, ticksToMsMultiplier, offset) {
                
                // if the processor is muted only process remaining note offs.
                if (my.params.is_mute.getValue()) {
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
                        var channel = my.params.channel_out.getValue(),
                            pitch = my.params.pitch_out.getValue(),
                            velocity = my.params.velocity_out.getValue(),
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
                        
                        // update pattern graphic view
                        var stepIndex = pulsesOnly[i].stepIndex,
                            delayFromNowToNoteStart = (nowToScanStart + scanStartToNoteStart) * ticksToMsMultiplier,
                            delayFromNowToNoteEnd = (delayFromNowToNoteStart + noteDuration) * ticksToMsMultiplier;
                        processCallback(stepIndex, delayFromNowToNoteStart, delayFromNowToNoteEnd);
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
             * Update view. At requestAnimationFrame speed.
             * @param  {Number} pos Transport playback position in ticks.
             */
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
            
            /**
             * Update all pattern properties.
             * @param {Boolean} isEuclidChange Steps, pulses or rotation change.
             */
            updatePattern = function(isEuclidChange) {
                // euclidean pattern properties, changes in steps, pulses, rotation
                if (isEuclidChange) {
                    euclidPattern = createBjorklund(my.params.steps.getValue(), my.params.pulses.getValue());
                    var elementsToShift = euclidPattern.splice(my.params.rotation.getValue());
                    euclidPattern = elementsToShift.concat(euclidPattern);
                }
                
                // playback properties, changes in isTriplets, rate, noteLength
                var ppqn = WH.conf.getPPQN(),
                    rate = my.params.is_triplets.getValue() ? my.params.rate.getValue() * (2 / 3) : my.params.rate.getValue(),
                    stepDuration = rate * ppqn;
                noteDuration = my.params.note_length.getValue() * ppqn;
                duration = my.params.steps.getValue() * stepDuration;
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
            },
            
            /**
             * Create Euclidean rhythm pattern.
             * @param {Number} steps Total amount of tsteps in the pattern.
             * @param {Number} pulses Pulses to spread over the pattern.
             * @return {Array} Array of Booleans that form the pattern.
             */
            createBjorklund = function(steps, pulses) {
                var pauses = steps - pulses;
                if (pulses >= steps) {
                    return buildPatternListFilledWith(steps, true);
                } else if (steps == 1) {
                    return buildPatternListFilledWith(steps, pulses == 1);
                } else if (steps == 0 || pulses == 0) {
                    return buildPatternListFilledWith(steps, false);
                } else {
                    let distribution = [];
                    for (let i = 0; i < steps; i++) {
                        distribution.push([i < pulses]);
                    }
                    return splitDistributionAndContinue(distribution, pauses);
                }
            },
            
            /**
             * Divide as much as possible of the remainder over the distribution arrays.
             * @param {Array} distributionArray Two dimensional array of booleans.
             * @param {Number} remainder Amount of items not yet in distribution array.
             * @return {Function} One dimensional array of booleans, the Euclidean pattern.
             */
            splitDistributionAndContinue = function(distributionArray, remainder) {
                let newDistributionArray = [],
                    newRemainderArray = [];
                if (remainder == 0) {
                    newDistributionArray = distributionArray;
                } else {
                    let newDistributionSize = distributionArray.length - remainder;
                    for (let i = 0, n = distributionArray.length; i < n; i++) {
                        if (i < newDistributionSize) {
                            newDistributionArray.push(distributionArray[i]);
                        } else {
                            newRemainderArray.push(distributionArray[i]);
                        }
                    }
                }
                return bjorklund(newDistributionArray, newRemainderArray);
            },
            
            /**
             * Divide as much as possible of the remainder over the distribution arrays.
             * @param {Object} distributionArray Two dimensional array.
             * @param {Object} remainderArray Two dimensional array.
             * @return {Object} One dimensional array of booleans, the Euclidean pattern.
             */
            bjorklund = function(distributionArray, remainderArray) {
                // handy for debugging
        		// console.log('distributionArray', toStringArrayList(distributionArray)); 
                // console.log('remainderArray', toStringArrayList(remainderArray));
                
                if (remainderArray.length <= 1) {
                    return flattenArrays([distributionArray, remainderArray]);
                } else {
                    let fullRounds = Math.floor(remainderArray.length / distributionArray.length),
                        remainder = remainderArray.length % distributionArray.length,
                        newRemainder = remainder == 0 ? 0 : distributionArray.length - remainder;
                    for (let i = 0; i < fullRounds; i++) {
                        let p = distributionArray.length;
                        for (let j = 0; j < p; j++) {
                            distributionArray[j].push(remainderArray.shift());
                        }
                    }
                    for (i = 0; i < remainder; i++ ) {
        				distributionArray[i].push(remainderArray.shift());
        			}
                    
                    return splitDistributionAndContinue(distributionArray, newRemainder);
                }
            },
            
            /**
             * Create a pattern filled with only pulses or silences.
             * @param {Number} steps Total amount of tsteps in the pattern.
             * @param {Boolen} value Value to fill the array with, true for pulses.
             * @return {Array} Array of Booleans that form the pattern.
             */
            buildPatternListFilledWith = function(steps, value) {
                let distribution = [];
                for (let i = 0; i < steps; i++) {
                    distribution.push(value);
                }
                return distribution;
            },
            
            /**
             * Flatten a multidimensional array.
             * @param {Object} arr The array to flatten.
             * @return {Object} One dimensional flattened array.
             */
            flattenArrays = function(arr) {
                return arr.reduce(function (flat, toFlatten) {
                    return flat.concat(Array.isArray(toFlatten) ? flattenArrays(toFlatten) : toFlatten);
                }, []);
            },
            
            toStringArrayList = function(arrayList) {
        		var str = '';
        		for (let i = 0, n = arrayList.length; i < n; i++) {
                    str += '[' + arrayList[i] + ']';
        		}
        		return str;
        	}
            
            /**
             * Create Euclidean rhythm pattern.
             * Code from withakay/bjorklund.js
             * @see https://gist.github.com/withakay/1286731
             */
            // createBjorklundOld = function(steps, pulses) {
            //     var pattern = [],
            //         counts = [],
            //     	remainders = [],
            //     	divisor = steps - pulses,
            //     	level = 0;
            //     
            // 	steps = Math.round(steps);
            // 	pulses = Math.round(pulses);
            //     remainders.push(pulses);
            // 
            // 	if (pulses > steps || pulses == 0 || steps == 0) {
            // 		return new Array();
            // 	}
            //     
            // 	while (true) {
            // 		counts.push(Math.floor(divisor / remainders[level]));
            // 		remainders.push(divisor % remainders[level]);
            // 		divisor = remainders[level]; 
            // 	    level += 1;
            // 		if (remainders[level] <= 1) {
            // 			break;
            // 		}
            // 	}
            // 	
            // 	counts.push(divisor);
            // 
            // 	var r = 0;
            // 	var build = function(level) {
            // 		r++;
            // 		if (level > -1) {
            // 			for (var i=0; i < counts[level]; i++) {
            // 				build(level-1); 
            // 			}	
            // 			if (remainders[level] != 0) {
            // 	        	build(level-2);
            // 			}
            // 		} else if (level == -1) {
            // 	           pattern.push(0);	
            // 		} else if (level == -2) {
            //            pattern.push(1);        
            // 		} 
            // 	};
            // 
            // 	build(level);
            // 	return pattern.reverse();
            // },
            
            /**
             * @return {Array} Euclidean pattern this processor plays.
             */
            getEuclidPattern = function() {
                return euclidPattern;
            };
       
        my = my || {};
        my.info = {
            inputs: 0,
            outputs: 1
        };
        
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
            updatePattern(true);
        }
        my.$pulses = function(value, timestamp) {
            updatePattern(true);
        }
        my.$rotation = function(value, timestamp) {
            updatePattern(true);
        }
        my.$rate = function(value, timestamp) {
            updatePattern(false);
        }
        my.$note_length = function(value, timestamp) {
            updatePattern(false);
        }
        my.$is_triplets = function(value, timestamp) {
            updatePattern(false);
        }
        my.$is_mute = function(value, timestamp) {}
        my.$channel_out = function(value, timestamp) {}
        my.$pitch_out = function(value, timestamp) {}
        my.$velocity_out = function(value, timestamp) {}
        my.$name = function(value, timestamp) {}
        my.$position2d = function(value, timestamp) {}

        that = ns.createMIDIProcessorBase(specs, my);
        
        my.defineParams({
            steps: {
                label: 'Steps',
                type: 'integer',
                default: 16,
                min: 1,
                max: 64,
                isMidiControllable: true
            },
            pulses: {
                label: 'Pulses',
                type: 'integer',
                default: 4,
                min: 0,
                max: 16,
                isMidiControllable: true
            },
            rotation: {
                label: 'Rotation',
                type: 'integer',
                default: 0,
                min: 0,
                max: 15,
                isMidiControllable: true
            },
            channel_out: {
                label: 'Channel',
                type: 'integer',
                default: 1,
                min: 1,
                max: 16,
                isMidiControllable: false
            },
            pitch_out: {
                label: 'Pitch',
                type: 'integer',
                default: 60,
                min: 0,
                max: 127,
                isMidiControllable: false
            },
            velocity_out: {
                label: 'Velocity',
                type: 'integer',
                default: 100,
                min: 0,
                max: 127,
                isMidiControllable: false
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
                ],
                isMidiControllable: false
            },
            is_triplets: {
                label: 'Triplets',
                type: 'boolean',
                default: false,
                isMidiControllable: false
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
                ],
                isMidiControllable: false
            },
            is_mute: {
                label: 'Mute',
                type: 'boolean',
                default: false,
                isMidiControllable: true
            },
            name: {
                label: 'Name',
                type: 'string',
                default: 'Unnamed',
                isMidiControllable: false
            },
            position2d: {
                label: '2D position',
                type: 'vector2d',
                default: {x: 0, y: 0},
                isMidiControllable: false
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
        that.getEuclidPattern = getEuclidPattern;
        return that;
    };
    
    var type = 'epg';
    ns.midiProcessors = ns.midiProcessors || {};
    ns.midiProcessors[type] = {
        create: createMIDIProcessorEPG
    };

})(WH);
