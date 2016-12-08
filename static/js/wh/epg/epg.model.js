/**
 * @description EPG patterns model.
 * @author Wouter Hisschemöller
 * @version 0.0.0
 * 
 * @namespace WH
 */
 
window.WH = window.WH || {};

(function (ns) {
    
    function createEPGModel(specs) {
        var that,
            arrangement = specs.arrangement,
            epgCanvas = specs.epgCanvas,
            epgSettings = specs.epgSettings,
            file = specs.file,
            midi = specs.midi,
            patterns = [],
            numPatterns = patterns.length,
            selectedPattern,
            
            /**
             * Create a Euclidean step sequence from a pattern's steps and fills data.
             * @param {Array} euclidPattern Array of 0 and 1 values indicating pulses or silent steps.
             * @param {Number} stepDuration Duration in ticks of 1 step.
             * @return {Number} noteDuration Duration in ticks of the note that an active step plays.
             * @return {Array} Data objects to create arrangement steps with.
             */
            createArrangementSteps = function(euclidPattern, stepDuration, noteDuration) {
                var i,
                    numSteps = euclidPattern.length,
                    steps = [];
                for (i = 0; i < numSteps; i++) {
                    if (!!euclidPattern[i]) {
                        steps.push({
                            pitch: 60,
                            velocity: 100,
                            start: stepDuration * i,
                            duration: noteDuration
                        });
                    }
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
             * @param {object} specs Optional properties for the pattern.
             * @param {Boolean} isRestore True if the pattern is created during restore or loading project.
             * @return {object} The pattern data object that was just created.
             */
            createPattern = function(specs) {
                specs = specs || {};
                specs.outchannel = specs.outchannel || patterns.length;
                
                // check if there's a soloed pattern
                if (patterns.length && (patterns[0].isSolo || patterns[0].isNotSolo)) {
                    specs.isNotSolo = true;
                }
                
                // create the new pattern's data object
                var patternData = WH.createEPGPatternData(specs);
                patterns.push(patternData);
                numPatterns = patterns.length;
                
                arrangement.createTrack();
                updatePattern(patternData);
                epgCanvas.createPattern3D(patternData, true);
                
                return patternData;
            },
            
            /**
             * Update the pattern if one of the Euclidean settings have changed.
             * @param {Object} ptrn Pattern data object.
             */
            updatePattern = function(ptrn) {
                var euclidPattern = createBjorklund(ptrn.steps, ptrn.pulses);
                
                // rotation
                var elementsToShift = euclidPattern.splice(ptrn.rotation),
                euclidPattern = elementsToShift.concat(euclidPattern);
                
                var rate = ptrn.isTriplets ? ptrn.rate * (2 / 3) : ptrn.rate;
                var stepDuration = rate * WH.conf.getPPQN();
                var noteDuration = ptrn.noteLength * WH.conf.getPPQN();
                ptrn.euclidPattern = euclidPattern;
                ptrn.duration = ptrn.steps * stepDuration;
                ptrn.position = ptrn.position % ptrn.duration;
                
                // create arrangement steps from euclidean pattern
                var ptrnIndex = patterns.indexOf(ptrn);
                var arrangementSteps = createArrangementSteps(euclidPattern, stepDuration, noteDuration);
                arrangement.updateTrack(ptrnIndex, arrangementSteps, ptrn.duration);
            },
            
            /**
             * Set a pattern as selected.
             * @param {Object} ptrn Pattern data object.
             */
            selectPattern = function(ptrn) {
                var index = patterns.indexOf(ptrn);
                
                for (var i = 0; i < numPatterns; i++) {
                    patterns[i].isSelected = (i === index);
                }
                
                selectedPattern = ptrn;
                
                // update view
                epgSettings.setPattern(selectedPattern);
            },
            
            /**
             * Delete the selected pattern.
             */
            deleteSelectedPattern = function() {
                if (!selectedPattern) {
                    return;
                }
                
                var index = patterns.indexOf(selectedPattern);
                
                // remove track from arrangement
                arrangement.deleteTrack(index);
                
                // remove object from the 3D world
                epgCanvas.deletePattern3D(selectedPattern);
                
                // find and delete patternData
                patterns.splice(index, 1);
                numPatterns = patterns.length;
                
                // select previous pattern in array
                var newIndex = index > 0 ? index - 1 : (numPatterns ? numPatterns - 1 : null);
                selectPattern(patterns[newIndex]);
            },
            
            /**
             * Find the pattern that has the property with the value.
             * @param {string} propKey Property key.
             * @param {string} propValue Property value.
             * @return {object} Pattern data object if found.
             */
            getPatternByProperty = function(propKey, propValue) {
                var i, ptrn, n = patterns.length;
                for (i = 0; i < n; i++) {
                    ptrn = patterns[i];
                    if (ptrn[propKey] === propValue) {
                        return ptrn;
                    }
                }
            }
            
            /**
             * Update the value of a single property of the selected pattern.
             * @param {String} name Property name.
             * @param {Number} value Property value.
             */
            setPatternProperty = function(name, value) {
                switch (name) {
                    case 'steps':
                        value = Math.min(value, 64);
                        selectedPattern[name] = value;
                        epgSettings.updateSetting('pulses', value, 'max');
                        epgSettings.updateSetting('rotation', value - 1, 'max');
                        if (selectedPattern.pulses > value) {
                            selectedPattern.pulses = value;
                            epgSettings.updateSetting('pulses', value);
                        }
                        if (selectedPattern.rotation > value) {
                            selectedPattern.rotation = value;
                            epgSettings.updateSetting('rotation', value);
                        }
                        updatePattern(selectedPattern);
                        epgSettings.updateSetting(name, value);
                        epgCanvas.updatePattern3D(selectedPattern);
                        break;
                    case 'pulses':
                    case 'rotation':
                        value = Math.min(value, selectedPattern.steps);
                        selectedPattern[name] = value;
                        updatePattern(selectedPattern);
                        epgSettings.updateSetting(name, value);
                        epgCanvas.updatePattern3D(selectedPattern);
                        break;
                    case 'position3d':
                        selectedPattern[name] = value;
                        break;
                    case 'rate':
                        value = parseFloat(value);
                        selectedPattern[name] = value;
                        updatePattern(selectedPattern);
                        break
                    case 'isTriplets':
                        selectedPattern[name] = value;
                        updatePattern(selectedPattern);
                    case 'noteLength':
                        selectedPattern[name] = value;
                        updatePattern(selectedPattern);
                        break;
                    case 'isMute':
                        selectedPattern[name] = value;
                        epgCanvas.updatePattern3D(selectedPattern);
                        break;
                    case 'isSolo':
                        setSolo(selectedPattern, value);
                        break;
                    case 'name':
                    case 'outchannel':
                    case 'outpitch':
                    case 'outvelocity':
                    case 'inchannel':
                    case 'inpitch':
                        selectedPattern[name] = value;
                        epgSettings.updateSetting(name, value);
                        break;
                }
            },
            
            /**
             * Set soloed pattern.
             * If a pattern goes solo, all other patterns go 'not solo', 
             * as an indicator that they should be muted.
             * @param {Object} ptrn Pattern data object.
             * @param {Boolean} isSolo True if the pattern is soloed.
             */
            setSolo = function(pattern, isSolo) {
                for (var i = 0; i < patterns.length; i++) {
                    var ptrn = patterns[i];
                    if (isSolo) {
                        ptrn.isSolo = (ptrn === pattern);
                        ptrn.isNotSolo = !ptrn.isSolo;
                    } else {
                        ptrn.isSolo = false;
                        ptrn.isNotSolo = false;
                    }
                    epgCanvas.updatePattern3D(ptrn);
                }
            },

            /**
             * Create an pattern data from data object.
             * @param {Object} data Data object.
             */
            setData = function(data) {
                if (data === undefined) {
                    return;
                }
                
                // create patterns
                patterns.length = 0;
                for (var i = 0; i < data.length; i++) {
                    var patternData = WH.createEPGPatternData(data[i]);
                    epgCanvas.createPattern3D(patternData);
                    patterns.push(patternData);
                }
                numPatterns = patterns.length;
                
                // restore selected pattern
                selectedPattern = patterns.filter(function(ptrn) {
                    return ptrn.isSelected;
                })[0];
                epgSettings.setPattern(selectedPattern);
            },

            /**
             * Collect all project data and save it in localStorage.
             */
            getData = function() {
                var data = [];
                for (var i = 0; i < patterns.length; i++) {
                    data.push(patterns[i].getData());
                }
                return data;
            },
            
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
                
                epgCanvas.draw(patterns);
            },
            
            /**
             * Update note activity.
             * @param {Array} playbackQueue Note data.
             */
            onTransportScan = function(playbackQueue) {
                var i, now, start, duration, isAlreadyOn,
                    numSteps = playbackQueue.length;
                for (i = 0; i < numSteps; i++) {
                    var step = playbackQueue[i],
                        ptrn = patterns[step.getTrackIndex()];
                    
                    if (step.getVelocity() && !ptrn.isMute && !ptrn.isNotSolo) {
                        isAlreadyOn = ptrn.isOn;
                        
                        ptrn.isOn = true;
                        ptrn.isNoteOn = true;
                        ptrn.pulseIndex = Math.round(((step.getStart() / ptrn.duration) % 1) * ptrn.steps) % ptrn.steps;
                        ptrn.offPosition = (ptrn.position + step.getDuration()) % ptrn.duration;
                        ptrn.noteStartDelay = step.getStartDelay();
                        ptrn.noteStopDelay = step.getStartDelay() + step.getDuration();
                        
                        // now for the MIDI
                        
                        // if a note is playing, stop it first...
                        if (isAlreadyOn) {
                            
                        }
                        // ... and then the new note On
                        start = step.getStartMidi();
                        duration = step.getDurationMidi();
                        midi.playNote(ptrn.outPitch, ptrn.outVelocity, ptrn.outChannel, start, duration);
                    }
                }
            };
        
        that = specs.that;
        
        that.createPattern = createPattern;
        that.selectPattern = selectPattern;
        that.getPatternByProperty = getPatternByProperty;
        that.deleteSelectedPattern = deleteSelectedPattern;
        that.setPatternProperty = setPatternProperty;
        that.setData = setData;
        that.getData = getData;
        that.onTransportRun = onTransportRun;
        that.onTransportScan = onTransportScan;
        return that;
    }

    ns.createEPGModel = createEPGModel;

})(WH);
