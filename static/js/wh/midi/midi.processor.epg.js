/**
 * MIDI processor o generate Euclidean rhythm patterns.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIProcessorEPG(specs, my) {
        var that,
            noteOffEvents = [],
            pulseStartTimes = [],
            
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
                my.props.euclid = createBjorklund(my.props.steps, my.props.pulses);
                var elementsToShift = my.props.euclid.splice(my.props.rotation);
                my.props.euclid = elementsToShift.concat(my.props.euclid);
                
                // playback properties, changes in isTriplets, rate, noteLength
                var ppqn = WH.conf.getPPQN(),
                    rate = my.props.isTriplets ? my.props.rate * (2 / 3) : my.props.rate,
                    stepDuration = rate * ppqn,
                    noteDuration = my.props.noteLength * ppqn;
                my.props.duration = my.props.steps * stepDuration;
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
        // general properties
        my.props.type = type;
        my.props.position3d = specs.position3d || null;
        // euclidean properties
        my.props.steps = specs.steps || 16;
        my.props.steps = specs.pulses || 4;
        my.props.rotation = specs.rotation || 0;
        my.props.euclid = specs.euclid || [];
        // midi properties
        my.props.channel = 1;
        my.props.pitch = 60;
        my.props.velocity = 100;
        // playback properties
        // rate in beats, quarter note multiplier
        my.props.rate = specs.rate || 0.25;
        // convert to triplets by multiplying rate with 2/3
        my.props.isTriplets = specs.isTriplets || false;
        // note length in beats, quarter note multiplier
        my.props.noteLength = specs.noteLength || 0.25;
        // position and duration in ticks
        my.props.position = specs.position || 0;
        my.props.duration = specs.duration || 0;

        that = ns.createMIDIProcessorBase(specs, my);
        that = ns.createMIDIConnectorIn(specs, my);
        that = ns.createMIDIConnectorOut(specs, my);
        
        that.process = process;
        return that;
    };
    
    var type = 'epg';
    ns.midiProcessors = ns.midiProcessors || {};
    ns.midiProcessors[type] = {
        create: createMIDIProcessorEPG
    };

})(WH);
