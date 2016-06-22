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
        specs = specs || {};
        
        var that = {
            steps: specs.steps || 16,
            pulses: specs.pulses || 4,
            rotation: specs.rotation || 0,
            
            euclidPattern: [],
            
            channel: specs.channel || 0,
            
            // position and duration in ticks
            position: specs.position || 0,
            duration: specs.duration || 0,
            
            isOn: false,
            isSelected: false,
            
            offPosition: 0,
            lastPosition: 0,
            
            canvasX: specs.canvasX || 0,
            canvasY: specs.canvasY || 0,
            canvasWidth: 0,
            canvasHeight: 0
        };
        
        return that;
    }
    
    function createPatterns(specs) {
        var that,
            arrangement = specs.arrangement,
            patternCanvas = specs.patternCanvas,
            patterns = [],
            numPatterns = patterns.length,
            selectedPattern,
            
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
                        rotation: specs.rotation,
                        channel: patterns.length,
                        canvasX: specs.canvasX,
                        canvasY: specs.canvasY
                    }),
                    euclidPattern = createBjorklund(patternData.steps, patternData.pulses),
                    arrangementSteps,
                    trackIndex = arrangement.createTrack();
                
                // rotate pattern
                var elementsToShift = euclidPattern.splice(euclidPattern.length - patternData.rotation);
                euclidPattern = elementsToShift.concat(euclidPattern);
                
                patternData.euclidPattern = euclidPattern;
                patternData.duration = (patternData.steps / WH.conf.getStepsPerBeat()) * WH.conf.getPPQN();
                patterns.push(patternData);
                numPatterns = patterns.length;
                console.log(euclidPattern);
                
                // create arrangement steps from euclidean pattern
                arrangementSteps = createArrangementSteps(euclidPattern)
                arrangement.updateTrack(trackIndex, arrangementSteps);
                
                // selectPatternByIndex will also redraw the canvas
                selectPatternByIndex(trackIndex);
            },
            
            selectPatternByIndex = function(index) {
                var i;
                
                if(!isNaN(index) && index >= 0 && index < patterns.length && patterns.length) {
                    selectedPattern = patterns[index];
                } else {
                    selectedPattern = null;
                }
                
                for (i = 0; i < numPatterns; i++) {
                    patterns[i].isSelected = (i === index);
                }
                
                // update view
                patternCanvas.drawB(patterns);
            },
            
            deleteSelectedPattern = function() {
                if (!selectedPattern) {
                    return;
                }
                
                var index = patterns.indexOf(selectedPattern);
                
                // remove track from arrangement
                arrangement.deleteTrack(index);
                
                // find and delete patternData.
                patterns.splice(index, 1);
                numPatterns = patterns.length;
                
                // selectPatternByIndex will also redraw the canvas
                selectPatternByIndex(null);
            },
            
            /**
             * Select a pattern by occupying a given coordinate on the canvas.
             * @return {Object} Pattern data object.
             */
            selectPatternByCoordinate = function(x, y) {
                var ptrn = getPatternByCoordinate(x, y);
                if (ptrn) {
                    selectPatternByIndex(patterns.indexOf(ptrn));
                }
            },
            
            /**
             * Get pattern occupying a given coordinate on the canvas.
             * @return {Object} Pattern data object.
             */
            getPatternByCoordinate = function(x, y) {
                var i, ptrn;
                for (i = 0; i < numPatterns; i++) {
                    ptrn = patterns[i]
                    if (x >= ptrn.canvasX && x <= ptrn.canvasX + ptrn.canvasWidth &&
                        y >= ptrn.canvasY && y <= ptrn.canvasY + ptrn.canvasHeight) {
                        return ptrn;
                    }
                }
            }
            
            /**
             * Update pattern data and view while transport runs.
             * @param {Number} transportPosition Playhead position in ticks.
             */
            onTransportRun = function(transportPosition) {
                var i,
                    pattern;
                for (i = 0; i < numPatterns; i++) {
                    ptrn = patterns[i];
                    ptrn.position = transportPosition % ptrn.duration;
                    
                    if (ptrn.isOn && ptrn.lastPosition <= ptrn.offPosition && ptrn.position >= ptrn.offPosition) {
                        ptrn.isOn = false;
                    }
                    
                    ptrn.lastPosition = ptrn.position;
                }
                patternCanvas.drawA(patterns);
            },
            
            onTransportScan = function(playbackQueue) {
                var i,
                    numSteps = playbackQueue.length;
                for (i = 0; i < numSteps; i++) {
                    var step = playbackQueue[i],
                        ptrn = patterns[step.getTrackIndex()];
                    
                    if (step.getVelocity()) {
                        ptrn.isOn = true;
                        ptrn.offPosition = (ptrn.position + step.getDuration()) % ptrn.duration;
                    }
                }
            },
            
            /**
             * Redraw both canvasses.
             */
            refreshCanvas = function() {
                patternCanvas.drawA(patterns);
                patternCanvas.drawB(patterns);
            };
        
        that = specs.that;
        
        that.createPattern = createPattern;
        that.selectPatternByIndex = selectPatternByIndex;
        that.selectPatternByCoordinate = selectPatternByCoordinate;
        that.getPatternByCoordinate = getPatternByCoordinate;
        that.deleteSelectedPattern = deleteSelectedPattern;
        that.onTransportRun = onTransportRun;
        that.onTransportScan = onTransportScan;
        that.refreshCanvas = refreshCanvas;
        return that;
    }

    ns.createPatterns = createPatterns;

})(WH.epg);
