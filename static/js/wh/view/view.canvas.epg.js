
window.WH = window.WH || {};

(function (ns) {
    
    function createCanvasEPGView(specs) {
        let that,
            processor = specs.processor,
            dynamicCtx = specs.dynamicCtx,
            canvasDirtyCallback = specs.canvasDirtyCallback,
            staticCanvas,
            staticCtx,
            necklaceCanvas,
            necklaceCtx,
            pointerCanvas,
            pointerCtx,
            pointerRotation,
            radius = 100,
            necklaceMinRadius = 50,
            necklaceRadius,
            centreRadius = 30,
            selectRadius = 25,
            dotRadius = 8,
            centreDotFullRadius = 10,
            centreDotRadius,
            zeroMarkerRadius = 3,
            position2d,
            isSelected = false,
            doublePI = Math.PI * 2,
            dotAnimations = {},
            color = '#eeeeee',
            centreDotEndTween,
            isNoteActive = false,
            
            initialise = function() {
                // offscreen canvas for static shapes
                staticCanvas = document.createElement('canvas');
                staticCanvas.height = radius * 2;
                staticCanvas.width = radius * 2;
                staticCtx = staticCanvas.getContext('2d');
                
                // offscreen canvas for dots ring and polygon
                necklaceCanvas = document.createElement('canvas');
                necklaceCanvas.height = radius * 2;
                necklaceCanvas.width = radius * 2;
                necklaceCtx = necklaceCanvas.getContext('2d');
                
                // offscreen canvas for the pointer
                pointerCanvas = document.createElement('canvas');
                pointerCanvas.height = radius * 2;
                pointerCanvas.width = radius * 2;
                pointerCtx = pointerCanvas.getContext('2d');
                
                // add callback to update before render.
                processor.addRenderCallback(showPlaybackPosition);
                processor.addProcessCallback(showNote);
                processor.addSelectCallback(updateSelectCircle);
                
                // add listeners to parameters
                let params = processor.getParameters();
                params.steps.addChangedCallback(updateNecklace);
                params.pulses.addChangedCallback(updateNecklace);
                params.rotation.addChangedCallback(updateNecklace);
                params.is_mute.addChangedCallback(updatePointer);
                params.position2d.addChangedCallback(updatePosition);
                
                // set drawing values
                position2d = params.position2d.getValue();
                updateNecklace();
                redrawStaticCanvas();
            },
            
            /**
             * Called before this view is deleted.
             */
            terminate = function() {},
            
            /**
             * Show the playback position within the pattern.
             * Indicated by the pointer's rotation.
             * @param  {Number} position Position within pattern in ticks.
             * @param  {Number} duration Pattern length in ticks.
             */
            showPlaybackPosition = function(position, duration) {
                pointerRotation = doublePI * (position / duration);
            },
            
            /**
             * Show animation of the pattern dot that is about to play. 
             * @param {Number} stepIndex Index of the step to play.
             * @param {Number} noteStartDelay Delay from now until note start in ms.
             * @param {Number} noteStopDelay Delay from now until note end in ms.
             */
            showNote = function(stepIndex, noteStartDelay, noteStopDelay) {
                // get the coordinates of the dot for this step
                let steps = processor.getParamValue('steps'),
                    position2d = {};
                
                // fill position2d with the dot coordinate
                calculateCoordinateForStepIndex(position2d, stepIndex, steps, necklaceRadius);
                
                // retain necklace dot state in object
                dotAnimations[stepIndex] = {
                    position2d: position2d,
                    dotRadius: 0
                }
                
                // animate the necklace dot
                let t = new TWEEN.Tween({currentRadius: dotRadius * 1.5})
                    .to({currentRadius: dotRadius}, 300)
                    .onUpdate(function() {
                            // store new dot size
                            try {
                                dotAnimations[stepIndex].dotRadius = this.currentRadius;
                            } catch(errMsg) {
                                console.log(errMsg);
                                console.log(steps, stepIndex, dotAnimations);
                                debugger
                            }
                            
                        })
                    .onComplete(function() {
                            // delete dot state object
                            delete dotAnimations[stepIndex];
                        })
                    .delay(noteStartDelay)
                    .start();
                    
                // stop centre dot animation, if any
                if (centreDotEndTween) {
                    centreDotEndTween.stop();
                }
                
                // centre dot start animation
                var startTween = new TWEEN.Tween({centreRadius: 0.01})
                    .to({centreRadius: centreDotFullRadius}, 10)
                    .onStart(function() {
                            isNoteActive = true;
                        })
                    .onUpdate(function() {
                            centreDotRadius = this.centreRadius;
                        })
                    .delay(noteStartDelay);
                    
                // centre dot end animation
                var stopTween = new TWEEN.Tween({scale: centreDotFullRadius})
                    .to({scale: 0.01}, 150)
                    .onUpdate(function() {
                            centreDotRadius = this.centreRadius;
                        })
                    .onComplete(function() {
                            isNoteActive = false;
                        })
                    .delay(noteStopDelay - noteStartDelay);
                
                // start centre dot animation
                startTween.chain(stopTween);
                startTween.start();
                
                centreDotEndTween = stopTween;
            },
            
            /**
             * Update the pattern dots.
             * If the steps, pulses or rotation properties have changed.
             * If steps change it might invalidate the pointer.
             */
            updateNecklace = function() {
                let steps = processor.getParamValue('steps'),
                    rotation = processor.getParamValue('rotation'),
                    euclid = processor.getEuclidPattern(),
                    position2d = {x: 0, y:0},
                    rad, point,
                    necklacePoints = [];
                    
                // calculate the dot positions
                necklaceRadius = necklaceMinRadius + (steps > 16 ? (steps - 16) * 3 : 0);
                for (let i = 0; i < steps; i++) {
                    point = {};
                    calculateCoordinateForStepIndex(point, i, steps, necklaceRadius);
                    necklacePoints.push(point);
                }
                
                necklaceCtx.clearRect(0, 0, necklaceCanvas.width, necklaceCanvas.height);
                necklaceCtx.fillStyle = color;
                necklaceCtx.strokeStyle = color;
                
                updatePolygon(steps, euclid, necklacePoints);
                updateDots(steps, euclid, necklacePoints);
                updatePointer();
                updateZeroMarker(steps, rotation);
                updateRotatedMarker(steps, rotation);
                redrawStaticCanvas();
                canvasDirtyCallback();
            },
            
            /**
             * Show circle if the processor is selected, else hide.
             * @param {Boolean} isSelectedView True if selected.
             */
            updateSelectCircle = function(isSelectedView) {
                isSelected = isSelectedView;
                redrawStaticCanvas();
                canvasDirtyCallback();
            },
            
            /**
             * Update pattern's position on the 2D canvas.
             * @param  {Object} param Processor 2D position parameter.
             * @param  {Object} oldValue Previous 2D position as object.
             * @param  {Object} newValue New 2D position as object.
             */
            updatePosition = function(param, oldValue, newValue) {
                position2d = newValue;
                redrawStaticCanvas();
                canvasDirtyCallback();
            },
            
            updatePolygon = function(steps, euclid, necklacePoints) {
                // draw polygon
                necklaceCtx.beginPath();
                let isFirstPoint = true,
                    firstPoint;
                for (let i = 0; i < steps; i++) {
                    if (euclid[i]) {
                        if (isFirstPoint) {
                            isFirstPoint = false;
                            firstPoint = necklacePoints[i];
                            necklaceCtx.moveTo(radius + firstPoint.x, radius - firstPoint.y);
                        } else {
                            necklaceCtx.lineTo(radius + necklacePoints[i].x, radius - necklacePoints[i].y);
                        }
                    }
                }
                necklaceCtx.lineTo(radius + firstPoint.x, radius - firstPoint.y);
                necklaceCtx.stroke();
                necklaceCtx.globalAlpha = 0.2;
                necklaceCtx.fill();
                necklaceCtx.globalAlpha = 1.0;
            },
            
            updateDots = function(steps, euclid, necklacePoints) {
                for (let i = 0; i < steps; i++) {
                    point = necklacePoints[i];
                    if (euclid[i]) {
                        // active dot
                        necklaceCtx.beginPath();
                        necklaceCtx.moveTo(radius + point.x + dotRadius, radius - point.y);
                        necklaceCtx.arc(radius + point.x, radius - point.y, dotRadius, 0, doublePI, true);
                        necklaceCtx.fill();
                        necklaceCtx.stroke();
                    } else {
                        // passive dot
                        necklaceCtx.beginPath();
                        necklaceCtx.moveTo(radius + point.x + dotRadius, radius - point.y);
                        necklaceCtx.arc(radius + point.x, radius - point.y, dotRadius, 0, doublePI, true);
                        necklaceCtx.stroke();
                    }
                }
            },
            
            /**
             * Update the pointer that connects the dots.
             */
            updatePointer = function() {
                var isMute = processor.getParamValue('is_mute'),
                    isNoteInControlled = false, /* processor.getProperty('isNoteInControlled'), */
                    isMutedByNoteInControl = false,
                    mutedRadius = 4.5,
                    pointerRadius = (isMute || isMutedByNoteInControl) ? mutedRadius : radius;
                
                pointerCtx.strokeStyle = color;
                pointerCtx.clearRect(0, 0, pointerCanvas.width, pointerCanvas.height);
                pointerCtx.beginPath();
                pointerCtx.moveTo(radius, radius);
                pointerCtx.lineTo(radius, radius - necklaceRadius);
                pointerCtx.stroke();
            },
            
            /**
             * Update the zero marker.
             * @param {Number} steps Euclidean necklace node amount.
             * @param {Number} rotation Euclidean necklace rotation.
             */
            updateZeroMarker = function(steps, rotation) {
                var rad = doublePI * (-rotation / steps),
                    markerRadius = necklaceRadius + 15,
                    x = radius + (Math.sin(rad) * markerRadius),
                    y = radius - (Math.cos(rad) * markerRadius);
                
                necklaceCtx.beginPath();
                necklaceCtx.moveTo(x, y + zeroMarkerRadius);
                necklaceCtx.arc(x, y, zeroMarkerRadius, 0, doublePI, true);
                necklaceCtx.stroke();
            },
            
            /**
             * Update the marker that indicates if the pattern is rotated.
             * @param {Number} steps Euclidean necklace node amount.
             * @param {Number} rotation Euclidean necklace rotation.
             */
            updateRotatedMarker = function(steps, rotation) {
                if (rotation !== 0) {
                    var x = radius,
                        y = radius - necklaceRadius - 10;
                    
                    necklaceCtx.beginPath();
                    necklaceCtx.moveTo(x, y);
                    necklaceCtx.lineTo(x, y - 10);
                    necklaceCtx.lineTo(x + 6, y - 7);
                    necklaceCtx.lineTo(x, y - 4);
                    necklaceCtx.stroke();
                }
            },
            
            redrawStaticCanvas = function() {
                staticCtx.strokeStyle = color;
                staticCtx.clearRect(0, 0, staticCanvas.width, staticCanvas.height);
                staticCtx.beginPath();
                
                // necklace
                staticCtx.drawImage(necklaceCanvas, 0, 0);
                
                // centre ring
                staticCtx.moveTo(radius + centreRadius, radius);
                staticCtx.arc(radius, radius, centreRadius, 0, doublePI, true);
                
                // select circle
                if (isSelected) {
                    staticCtx.moveTo(radius + selectRadius, radius);
                    staticCtx.arc(radius, radius, selectRadius, 0, doublePI, true);
                }
                staticCtx.stroke();
            },
            
            addToStaticView = function(mainStaticCtx) {
                mainStaticCtx.drawImage(
                    staticCanvas,
                    position2d.x - radius,
                    position2d.y - radius);
            },
            
            addToDynamicView = function(mainDynamicCtx) {
                // draw rotating pointer
                mainDynamicCtx.translate(position2d.x, position2d.y);
                mainDynamicCtx.rotate(pointerRotation);
                mainDynamicCtx.drawImage(pointerCanvas, -radius, -radius);
                mainDynamicCtx.rotate(-pointerRotation);
                mainDynamicCtx.translate(-position2d.x, -position2d.y);
                
                mainDynamicCtx.fillStyle = color;
                mainDynamicCtx.strokeStyle = color;
                mainDynamicCtx.beginPath();
                
                // necklace dots
                let n = dotAnimations.length,
                    dotState, x, y;
                for (let key in dotAnimations) {
                    if (dotAnimations.hasOwnProperty(key)) {
                        dotState = dotAnimations[key];
                        x = position2d.x + dotState.position2d.x;
                        y = position2d.y - dotState.position2d.y;
                        mainDynamicCtx.moveTo(x + dotState.dotRadius, y);
                        mainDynamicCtx.arc(x, y, dotState.dotRadius, 0, doublePI, true);
                    }
                }
                
                // centre dot
                if (isNoteActive) {
                    mainDynamicCtx.moveTo(position2d.x + centreDotRadius, position2d.y);
                    mainDynamicCtx.arc(position2d.x, position2d.y, centreDotRadius, 0, doublePI, true);
                }
                
                mainDynamicCtx.fill();
                mainDynamicCtx.stroke();
            },
            
            intersectsWithPoint = function(x, y) {
                let distance = Math.sqrt(Math.pow(x - position2d.x, 2) + Math.pow(y - position2d.y, 2));
                return distance <= radius;
            },
            
            /**
             * Calculate the 2D coordinates of the dot for a certain step.
             * @param  {Object} position2d 2D point vector to be set in this function.
             * @param  {Number} stepIndex Index of the step within the pattern.
             * @param  {Number} numSteps Number of steps in the pattern.
             * @param  {Number} necklaceRadius Distance of the dots from the centre.
             */
            calculateCoordinateForStepIndex = function(position2d, stepIndex, numSteps, necklaceRadius) {
                let rad = doublePI * (stepIndex / numSteps);
                position2d.x = Math.sin(rad) * necklaceRadius;
                position2d.y = Math.cos(rad) * necklaceRadius;
            }
            
            getProcessor = function() {
                return processor;
            },
            
            setPosition2d = function(position2d) {
                processor.setParamValue('position2d', position2d);
            },
            
            getPosition2d = function() {
                return processor.getParamValue('position2d');
            };
        
        that = specs.that || {};
        
        initialise();
        
        that.addToStaticView = addToStaticView;
        that.addToDynamicView = addToDynamicView;
        that.intersectsWithPoint = intersectsWithPoint;
        that.getProcessor = getProcessor;
        that.setPosition2d = setPosition2d;
        that.getPosition2d = getPosition2d;
        return that;
    }

    ns.createCanvasEPGView = createCanvasEPGView;

})(WH);
