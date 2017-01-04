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
            pulseStartTimes = [],
            
            init = function() {
                updatePattern();
            },
            
            /**
             * [process description]
             * @param {Number} start Timespan start in ticks from timeline start.
             * @param {Number} end   Timespan end in ticks from timeline start.
             */
            process = function(start, end) {
                
                // check for scheduled note off events
                var i = noteOffEvents.length;
                while (--i > -1) {
                    var noteOffTime = noteOffEvents[i].timestamp;
                    if (start <= noteOffTime && end > noteOffTime) {
                        my.setOutputData(noteOffEvents.splice(i, 1)[0]);
                    }
                }
                
                // check to create note events
                var localStart = start % my.props.duration,
                    localEnd = end % my.props.duration,
                    n = pulseStartTimes.length;
                for (var i = 0; i < n; i++) {
                    var time = pulseStartTimes[i];
                    if (localStart <= time < localEnd) {
                        my.setOutputData({
                            timestampTicks: time,
                            channel: my.props.channel,
                            type: 'noteon',
                            pitch: my.props.pitch,
                            velocity: my.props.velocity
                        });
                        noteOffEvents.push({
                            timestampTicks: time + 500,
                            channel: my.props.channel,
                            type: 'noteoff',
                            pitch: my.props.pitch,
                            velocity: 0
                        });
                    }
                }
                
                // once a second 
                // if (start % 1000 > end % 1000 || start % 1000 == 0 ) {
                //     
                //     // note event with duration of 500ms
                //     var noteOnEvent = {
                //         timestamp: start,
                //         channel: my.props.channel,
                //         type: 'noteon',
                //         pitch: my.props.pitch,
                //         velocity: my.props.velocity
                //     }
                //     var noteOffEvent = {
                //         timestamp: start + 500,
                //         channel: my.props.channel,
                //         type: 'noteoff',
                //         pitch: my.props.pitch,
                //         velocity: 0
                //     }
                //     
                //     noteOffEvents.push(noteOffEvent);
                //     my.setOutputData(noteOnEvent);
                // }
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
                my.props.duration = my.params.steps.getValue() * stepDuration;
                my.props.position = my.props.position % my.props.duration;
                
                // create array of note start times in ticks
                pulseStartTimes.length = 0;
                var n = my.props.euclid.length;
                for (var i = 0; i < n; i++) {
                    if (my.props.euclid[i]) {
                        pulseStartTimes.push(i * stepDuration);
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
            updatePattern();
        }
        my.$pulses = function(value, timestamp) {
            updatePattern();
        }
        my.$rotation = function(value, timestamp) {
            updatePattern();
        }
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
                max: 16
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
                default: 0,
                min: 0,
                max: 16
            },
            pitch_out: {
                label: 'MIDI Pitch',
                type: 'integer',
                default: 0,
                min: 0,
                max: 127
            },
            velocity_out: {
                label: 'MIDI Velocity',
                type: 'integer',
                default: 0,
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
            }
        });
        
        init();
        
        that.process = process;
        return that;
    };
    
    var type = 'epg';
    ns.midiProcessors = ns.midiProcessors || {};
    ns.midiProcessors[type] = {
        create: createMIDIProcessorEPG
    };

})(WH);
