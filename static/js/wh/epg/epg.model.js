/**
 * @description EPG patterns model.
 * @author Wouter Hisschemöller
 * @version 0.0.0
 * 
 * @namespace WH.epg
 */
 
 window.WH = window.WH || {};

(function (ns) {
    
    function createEPGPatternData(specs) {
        specs = specs || {};
        
        var that = {
            // euclidean settings
            steps: specs.steps || 16,
            pulses: specs.pulses || 4,
            rotation: specs.rotation || 0,
            euclidPattern: [],
            
            // midi settings
            channel: specs.channel || 0,
            
            // misc settings
            // rate in beats, quarter note multiplier
            rate: specs.rate || 0.25,
            // convert to triplets by multiplying rate with 2/3
            isTriplets: false,
            name: specs.name || '',
            isMute: false,
            
            // position and duration in ticks
            position: specs.position || 0,
            duration: specs.duration || 0,
            
            isOn: false,
            isNoteOn: false,
            isSelected: false,
            
            offPosition: 0,
            lastPosition: 0,
            
            // delay in milliseconds before note start
            startDelay: 0,
            
            // 
            pulseIndex: 0,
            
            // canvas position and size
            canvasX: specs.canvasX || 0,
            canvasY: specs.canvasY || 0,
            canvasWidth: 0,
            canvasHeight: 0,
            
            // 3D object properties
            object3d: specs.object3d || null,
            centreCircle3d: specs.centreCircle3d || null,
            select3d: specs.select3d || null,
            centreDot3d: specs.centreDot3d || null,
            pointer3d: specs.pointer3d || null,
            polygon3d: specs.polygon3d || null,
            dots3d: specs.dots3d || null,
            position3d: specs.position3d || null,
            hitarea3d: specs.hitarea3d || null,
            zeroMarker3d: specs.zeroMarker3d || null,
            zeroMarker3d: specs.rotatedMarker3d || null,
            radius3d: specs.radius3d || 1,
        };
        
        return that;
    }
    
    function createEPGModel(specs) {
        var that,
            arrangement = specs.arrangement,
            epgCanvas = specs.epgCanvas,
            epgSettings = specs.epgSettings,
            file = specs.file,
            patterns = [],
            numPatterns = patterns.length,
            selectedPattern,
            
            /**
             * Create a Euclidean step sequence from a pattern's steps and fills data.
             * @param {Array} euclidPattern Array of 0 and 1 values indicating pulses or silent steps.
             * @param {Number} stepDuration Duration in ticks of 1 step.
             * @return {Array} Data objects to create arrangement steps with.
             */
            createArrangementSteps = function(euclidPattern, stepDuration) {
                var i,
                    numSteps = euclidPattern.length,
                    steps = [];
                for (i = 0; i < numSteps; i++) {
                    if (!!euclidPattern[i]) {
                        steps.push({
                            pitch: 60,
                            velocity: 100,
                            start: stepDuration * i,
                            duration: stepDuration
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
             * @return {object} The pattern data object that was just created.
             */
            createPattern = function(specs) {
                var patternData, euclidPattern, arrangementSteps;
                
                specs = specs || {};
                specs.channel = patterns.length;
                
                patternData = createEPGPatternData(specs);
                patterns.push(patternData);
                numPatterns = patterns.length;
                
                arrangement.createTrack();
                updatePattern(patternData);
                
                return patternData;
                
                // selectPattern will also redraw the canvas
                // selectPattern(patternData);
                // file.autoSave();
            },
            
            /**
             * Update the pattern if one of the Euclidean settings have changed.
             * @param {Object} ptrn Pattern data object.
             */
            updatePattern = function(ptrn) {
                var ptrnIndex, elementsToShift, arrangementSteps, stepDuration, rate,
                    euclidPattern = createBjorklund(ptrn.steps, ptrn.pulses);
                
                // rotation
                elementsToShift = euclidPattern.splice(ptrn.rotation),
                euclidPattern = elementsToShift.concat(euclidPattern);
                
                rate = ptrn.isTriplets ? ptrn.rate * (2 / 3) : ptrn.rate;
                stepDuration = rate * WH.conf.getPPQN();
                ptrn.euclidPattern = euclidPattern;
                ptrn.duration = ptrn.steps * stepDuration;
                ptrn.position = ptrn.position % ptrn.duration;
                
                // create arrangement steps from euclidean pattern
                ptrnIndex = patterns.indexOf(ptrn);
                arrangementSteps = createArrangementSteps(euclidPattern, stepDuration);
                arrangement.updateTrack(ptrnIndex, arrangementSteps, ptrn.duration);
                // file.autoSave();
            },
            
            /**
             * Set a pattern as selected.
             * @param {Object} ptrn Pattern data object.
             */
            selectPattern = function(ptrn) {
                var i,
                    index = patterns.indexOf(ptrn);
                
                for (i = 0; i < numPatterns; i++) {
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
                
                // unselect pattern
                selectPattern(null);
                
                // file.autoSave();
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
                    case 'canvasX':
                    case 'canvasY':
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
                    case 'isMute':
                        selectedPattern[name] = value;
                        epgCanvas.updatePattern3D(selectedPattern);
                        break;
                    case 'name':
                        selectedPattern[name] = value;
                        epgSettings.updateSetting(name, value);
                        break;
                }
                
                // file.autoSave();
            },

            /**§
             * Create an pattern data from data object.
             * @param {Object} data Data object.
             */
            setData = function(data) {
                if (data === undefined) {
                    return;
                }
                
                patterns = data;
                numPatterns = patterns.length;
                selectedPattern = patterns.filter(function(ptrn){
                    return ptrn.isSelected;
                })[0];
                
                epgSettings.setPattern(selectedPattern);
            },

            /**
             * Collect all project data and save it in localStorage.
             */
            getData = function() {
                return patterns;
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
                var i, now, start, duration,
                    numSteps = playbackQueue.length;
                for (i = 0; i < numSteps; i++) {
                    var step = playbackQueue[i],
                        ptrn = patterns[step.getTrackIndex()];
                    
                    if (step.getVelocity() && !ptrn.isMute) {
                        ptrn.isOn = true;
                        ptrn.isNoteOn = true;
                        ptrn.pulseIndex = Math.round(((step.getStart() / ptrn.duration) % 1) * ptrn.steps) % ptrn.steps;
                        ptrn.offPosition = (ptrn.position + step.getDuration()) % ptrn.duration;
                        ptrn.startDelay = step.getStartDelay();
                        
                        // now for the MIDI...
                        start = step.getStartMidi();
                        duration = step.getDurationMidi();
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
