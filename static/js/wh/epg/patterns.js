/**
 * @description Patterns modele.
 * @author Wouter Hisschemöller
 * @version 0.0.0
 * 
 * @namespace WH.epg
 */
 
 window.WH = window.WH || {};
 window.WH.epg = window.WH.epg || {};

(function (ns) {
    
    function createPatternData(specs) {
        var that = {};
        specs = specs || {};
        
        that.steps = specs.steps || 16;
        that.pulses = specs.pulses || 4;
        that.rotation = specs.rotation || 0;
        
        that.euclidPattern = [];
        
        // position and duration in ticks
        that.position = specs.position || 0;
        that.duration = (that.steps / WH.conf.getStepsPerBeat()) * WH.conf.getPPQN();
        
        that.channel = specs.channel || 0;
        
        return that;
    }
    
    function createPatterns(specs) {
        var that,
            arrangement = specs.arrangement,
            patternCanvas = specs.patternCanvas,
            patterns = [],
            numPatterns = patterns.length,
            
            /**
             * Create a Euclidean step sequence from a pattern's steps and fills data.
             * @param {Array} euclidPattern Array of 0 and 1 values indicating pulses or silent steps.
             * @return {Array} Data objects to create arrangement steps with.
             */
            createArrangementSteps = function(euclidPattern) {
                var i,
                    numSteps = euclidPattern.length,
                    steps = [],
                    stepDuration = Math.floor( WH.conf.getPPQN() / WH.conf.getStepsPerBeat() );
                for (i = 0; i < numSteps; i++) {
                    steps.push({
                        pitch: 60,
                        velocity: !!euclidPattern[i] ? 100 : 0,
                        start: stepDuration * i,
                        duration: stepDuration
                    });
                }
                return steps;
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
            }, 
            
            /**
             * Create a pattern and add it to the list.
             */
            createPattern = function(specs) {
                specs = specs || {};
                var patternData = createPatternData({
                        steps: specs.steps,
                        pulses: specs.pulses,
                        channel: patterns.length
                    }),
                    euclidPattern = createBjorklund(patternData.steps, patternData.pulses),
                    arrangementSteps = createArrangementSteps(euclidPattern),
                    trackIndex = arrangement.createTrack();
                
                patternData.euclidPattern = euclidPattern;
                
                // rotate pattern
                
                patterns.push(patternData);
                
                arrangement.updateTrack(trackIndex, arrangementSteps);
                patternCanvas.drawB(patterns);
                numPatterns = patterns.length;
                // console.log(euclidPattern);
            },
            
            /**
             * Update pattern data and view while transport runs.
             * @param {Number} transportPosition Playhead position in ticks.
             */
            onTransport = function(transportPosition) {
                var i,
                    pattern;
                for (i = 0; i < numPatterns; i++) {
                    pattern = patterns[i];
                    pattern.position = transportPosition % pattern.duration;
                }
                patternCanvas.drawA(patterns);
            };
        
        that = specs.that;
        
        that.onTransport = onTransport;
        that.createPattern = createPattern;
        return that;
    }

    ns.createPatterns = createPatterns;

})(WH.epg);
