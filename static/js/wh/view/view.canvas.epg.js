
window.WH = window.WH || {};

(function (ns) {
    
    const dotMaxRadius = 10;
    let centerDotSize;
    
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
            nameCanvas,
            nameCtx,
            pointerRotation,
            radius = 110,
            necklaceMinRadius = 50,
            necklaceRadius,
            centreDotFullRadius = 10,
            centreDotRadius,
            centerDotX,
            centerDotY,
            selectRadius = 15,
            centreRadius = 20,
            dotRadius,
            zeroMarkerRadius = 3,
            pointerMutedRadius = 30,
            colorHigh = '#cccccc',
            colorMid = '#dddddd',
            colorLow = '#eeeeee',
            lineWidth = 2,
            position2d,
            isSelected = false,
            doublePI = Math.PI * 2,
            dotAnimations = {},
            centreDotStartTween,
            centreDotEndTween,
            isNoteActive = false,
            necklace = [],
            
            initialise = function() {
                // offscreen canvas for static shapes
                staticCanvas = document.createElement('canvas');
                staticCanvas.height = radius * 2;
                staticCanvas.width = radius * 2;
                staticCtx = staticCanvas.getContext('2d');
                staticCtx.lineWidth = lineWidth;
                staticCtx.strokeStyle = colorHigh;
                
                // offscreen canvas for dots ring and polygon
                necklaceCanvas = document.createElement('canvas');
                necklaceCanvas.height = radius * 2;
                necklaceCanvas.width = radius * 2;
                necklaceCtx = necklaceCanvas.getContext('2d');
                necklaceCtx.fillStyle = colorHigh;
                necklaceCtx.lineWidth = lineWidth;
                necklaceCtx.strokeStyle = colorHigh;
                
                // offscreen canvas for the pointer
                pointerCanvas = document.createElement('canvas');
                pointerCanvas.height = radius * 2;
                pointerCanvas.width = radius * 2;
                pointerCtx = pointerCanvas.getContext('2d');
                pointerCtx.lineWidth = lineWidth;
                pointerCtx.strokeStyle = colorHigh;
                
                // offscreen canvas for the name
                nameCanvas = document.createElement('canvas');
                nameCanvas.height = 40;
                nameCanvas.width = radius * 2;
                nameCtx = nameCanvas.getContext('2d');
                nameCtx.fillStyle = colorMid;
                nameCtx.font = '14px sans-serif';
                nameCtx.textAlign = 'center';
                
                // width and height to clear center dot 
                centerDotSize = (centreDotFullRadius + 1) * 2;
                
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
                params.name.addChangedCallback(updateName);
                
                // set drawing values
                const position = params.position2d.getValue();
                updatePosition(params.position2d, position, position)
                updateName();
                updateNecklace();
                redrawStaticCanvas();
            },
            
            /**
             * Called before this view is deleted.
             */
            terminate = function() {
                let params = processor.getParameters();
                params.steps.removeChangedCallback(updateNecklace);
                params.pulses.removeChangedCallback(updateNecklace);
                params.rotation.removeChangedCallback(updateNecklace);
                params.is_mute.removeChangedCallback(updatePointer);
                params.position2d.removeChangedCallback(updatePosition);
                params.name.removeChangedCallback(updateName);
            },
            
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
                let steps = processor.getParamValue('steps');
                
                // fill position2d with the dot coordinate
                let position2d = necklace[stepIndex];
                
                // retain necklace dot state in object
                dotAnimations[stepIndex] = {
                    position2d: position2d,
                    dotRadius: 0
                }
                
                let tweeningDot = dotAnimations[stepIndex];
                
                // animate the necklace dot
                new TWEEN.Tween({currentRadius: dotRadius * 2})
                    .to({currentRadius: dotRadius}, 300)
                    .onUpdate(function() {
                            // store new dot size
                            tweeningDot.dotRadius = this.currentRadius;
                        })
                    .onComplete(function() {
                            // delete dot state object
                            delete dotAnimations[stepIndex];
                        })
                    .delay(noteStartDelay)
                    .start();
                
                // stop centre dot animation, if any
                if (centreDotStartTween) {
                    centreDotStartTween.stop();
                    centreDotStartTween = null;
                }
                if (centreDotEndTween) {
                    centreDotEndTween.stop();
                    centreDotEndTween = null;
                }
                
                // centre dot start animation
                centreDotStartTween = new TWEEN.Tween({centreRadius: 0.01})
                    .to({centreRadius: centreDotFullRadius}, 10)
                    .onStart(function() {
                            isNoteActive = true;
                        })
                    .onUpdate(function() {
                            centreDotRadius = this.centreRadius;
                        })
                    .delay(noteStartDelay);
                    
                // centre dot end animation
                centreDotEndTween = new TWEEN.Tween({centreRadius: centreDotFullRadius})
                    .to({centreRadius: 0.01}, 150)
                    .onUpdate(function() {
                            centreDotRadius = this.centreRadius;
                        })
                    .onComplete(function() {
                            isNoteActive = false;
                        })
                    .delay(noteStopDelay - noteStartDelay);
                
                // start centre dot animation
                centreDotStartTween.chain(centreDotEndTween);
                centreDotStartTween.start();
            },
            
            /**
             * Update the pattern dots.
             * If the steps, pulses or rotation properties have changed.
             * If steps change it might invalidate the pointer.
             */
            updateNecklace = function() {
                let steps = processor.getParamValue('steps'),
                    pulses = processor.getParamValue('pulses'),
                    rotation = processor.getParamValue('rotation'),
                    euclid = processor.getEuclidPattern(),
                    position2d = {x: 0, y:0},
                    rad;
                
                necklace = [];
                    
                // calculate the dot positions
                necklaceRadius = necklaceMinRadius + (Math.max(0, steps - 16) * 0.8);
                for (let i = 0; i < steps; i++) {
                    rad = doublePI * (i / steps);
                    necklace.push({
                        center: {
                            x: Math.sin(rad) * necklaceRadius,
                            y: Math.cos(rad) * necklaceRadius
                        }
                    });
                }
                
                necklaceCtx.clearRect(0, 0, necklaceCanvas.width, necklaceCanvas.height);
                
                updatePolygon(steps, pulses, euclid, necklace);
                updateDots(steps, euclid, necklace);
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
                centerDotX = position2d.x - centreDotFullRadius - 1;
                centerDotY = position2d.y - centreDotFullRadius - 1;
                redrawStaticCanvas();
                canvasDirtyCallback();
            },
            
            /**
             * Draw polygon.
             */
            updatePolygon = function(steps, pulses, euclid, necklace) {
                if (pulses > 1) {
                    necklaceCtx.fillStyle = colorLow;
                    necklaceCtx.strokeStyle = colorLow;
                    necklaceCtx.beginPath();
                    let isFirstPoint = true,
                        firstPoint,
                        dotCenter;
                    for (let i = 0; i < steps; i++) {
                        if (euclid[i]) {
                            dotCenter = necklace[i].center;
                            if (isFirstPoint) {
                                isFirstPoint = false;
                                firstPoint = dotCenter;
                                necklaceCtx.moveTo(radius + firstPoint.x, radius - firstPoint.y);
                            } else {
                                necklaceCtx.lineTo(radius + dotCenter.x, radius - dotCenter.y);
                            }
                        }
                    }
                    necklaceCtx.lineTo(radius + firstPoint.x, radius - firstPoint.y);
                    necklaceCtx.stroke();
                    necklaceCtx.globalAlpha = 0.6;
                    necklaceCtx.fill();
                    necklaceCtx.globalAlpha = 1.0;
                }
            },
            
            updateDots = function(steps, euclid, necklace) {
                dotRadius = dotMaxRadius - (Math.max(0, steps - 16) * 0.09);
                
                necklaceCtx.fillStyle = colorHigh;
                necklaceCtx.strokeStyle = colorHigh;
                for (let i = 0; i < steps; i++) {
                    point = necklace[i].center;
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
                let isMute = processor.getParamValue('is_mute'),
                    isNoteInControlled = false, /* processor.getProperty('isNoteInControlled'), */
                    isMutedByNoteInControl = false,
                    isMutedSize = isMute || isMutedByNoteInControl,
                    pointerRadius = isMutedSize ? pointerMutedRadius : necklaceRadius,
                    pointerX = isMutedSize ? 15 : 19,
                    pointerY = isMutedSize ? 15 : 6;
                
                pointerCtx.clearRect(0, 0, pointerCanvas.width, pointerCanvas.height);
                pointerCtx.beginPath();
                pointerCtx.moveTo(radius - pointerX, radius - pointerY);
                pointerCtx.lineTo(radius, radius - pointerRadius);
                pointerCtx.lineTo(radius + pointerX, radius - pointerY);
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
            
            updateName = function() {
                let name = processor.getParamValue('name');
                nameCtx.clearRect(0, 0, nameCanvas.width, nameCanvas.height);
                nameCtx.fillText(name, nameCanvas.width / 2, nameCanvas.height / 2);
                canvasDirtyCallback();
            },
            
            redrawStaticCanvas = function() {
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
                mainStaticCtx.drawImage(
                    nameCanvas,
                    position2d.x - radius,
                    position2d.y + necklaceRadius + 4);
            },
            
            addToDynamicView = function(mainDynamicCtx) {
                // draw rotating pointer
                mainDynamicCtx.translate(position2d.x, position2d.y);
                mainDynamicCtx.rotate(pointerRotation);
                mainDynamicCtx.drawImage(pointerCanvas, -radius, -radius);
                mainDynamicCtx.rotate(-pointerRotation);
                mainDynamicCtx.translate(-position2d.x, -position2d.y);
                
                mainDynamicCtx.fillStyle = colorHigh;
                mainDynamicCtx.strokeStyle = colorHigh;
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
            
            /**
             * Clear all this pattern's elements from the dynamic context.
             * These are the center dot, necklace dots and pointer.
             * @param  {Object} mainDynamicCtx 2D canvas context.
             */
            clearFromDynamicView = function(mainDynamicCtx) {
                // clear center dot
                if (isNoteActive) {
                    mainDynamicCtx.clearRect(centerDotX, centerDotY, centerDotSize, centerDotSize);
                }
            },
            
            intersectsWithPoint = function(x, y) {
                let distance = Math.sqrt(Math.pow(x - position2d.x, 2) + Math.pow(y - position2d.y, 2));
                return distance <= necklaceRadius + dotRadius;
            },
            
            getProcessor = function() {
                return processor;
            },
            
            setPosition2d = function(position2d) {
                processor.setParamValue('position2d', position2d);
            },
            
            getPosition2d = function() {
                return processor.getParamValue('position2d');
            },
            
            /**
             * Set the theme colours of the processor view.
             * @param {Object} theme Theme settings object.
             */
            setTheme = function(theme) {
                colorHigh = theme.colorHigh;
                colorMid = theme.colorMid;
                colorLow = theme.colorLow;
                console.log('epg setTheme: ', theme);
                staticCtx.strokeStyle = colorHigh;
                necklaceCtx.fillStyle = colorHigh;
                necklaceCtx.strokeStyle = colorHigh;
                pointerCtx.strokeStyle = colorHigh;
                nameCtx.fillStyle = colorMid;
                updateName();
                updateNecklace();
            };
        
        that = specs.that || {};
        
        initialise();
        
        that.terminate = terminate;
        that.addToStaticView = addToStaticView;
        that.addToDynamicView = addToDynamicView;
        that.clearFromDynamicView = clearFromDynamicView;
        that.intersectsWithPoint = intersectsWithPoint;
        that.getProcessor = getProcessor;
        that.setPosition2d = setPosition2d;
        that.getPosition2d = getPosition2d;
        that.setTheme = setTheme;
        return that;
    }

    ns.createCanvasEPGView = createCanvasEPGView;

})(WH);
