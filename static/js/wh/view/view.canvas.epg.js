/**
 * Euclidean pattern animated necklace wheel drawn on canvas.
 */

window.WH = window.WH || {};

(function (ns) {
    
    const dotMaxRadius = 10,
        centerRadius = 20;
    
    let centerDotSize;
    
    function createCanvasEPGView(specs, my) {
        let that,
            canvasDirtyCallback = specs.canvasDirtyCallback,
            staticCanvas,
            staticCtx,
            necklaceCanvas,
            necklaceCtx,
            nameCanvas,
            nameCtx,
            
            pointerCanvas,
            pointerCtx,
            pointerRotation,
            pointerRotationPrevious = 0,
            pointerMutedRadius = 30,
            pointerCanvasCenter,
            
            radius = 110,
            necklaceMinRadius = 50,
            necklaceRadius,
            centerDotFullRadius = 10,
            centerDotRadius,
            centerDotX,
            centerDotY,
            centerDotStartTween,
            centerDotEndTween,
            
            selectRadius = 15,
            dotRadius,
            zeroMarkerRadius = 3,
            lineWidth = 2,
            position2d,
            isSelected = false,
            doublePI = Math.PI * 2,
            dotAnimations = {},
            isNoteActive = false,
            necklace = [],
            
            initialise = function() {
                // offscreen canvas for static shapes
                staticCanvas = document.createElement('canvas');
                staticCanvas.height = radius * 2;
                staticCanvas.width = radius * 2;
                staticCtx = staticCanvas.getContext('2d');
                staticCtx.lineWidth = lineWidth;
                staticCtx.strokeStyle = my.colorHigh;
                
                // offscreen canvas for dots ring and polygon
                necklaceCanvas = document.createElement('canvas');
                necklaceCanvas.height = radius * 2;
                necklaceCanvas.width = radius * 2;
                necklaceCtx = necklaceCanvas.getContext('2d');
                necklaceCtx.fillStyle = my.colorHigh;
                necklaceCtx.lineWidth = lineWidth;
                necklaceCtx.strokeStyle = my.colorHigh;
                
                // offscreen canvas for the pointer
                pointerCanvas = document.createElement('canvas');
                pointerCanvas.height = radius;
                pointerCanvas.width = centerRadius * 2;
                pointerCtx = pointerCanvas.getContext('2d');
                pointerCtx.lineWidth = lineWidth;
                pointerCtx.strokeStyle = my.colorHigh;
                pointerCanvasCenter = pointerCanvas.width / 2;
                
                // offscreen canvas for the name
                nameCanvas = document.createElement('canvas');
                nameCanvas.height = 40;
                nameCanvas.width = radius * 2;
                nameCtx = nameCanvas.getContext('2d');
                nameCtx.fillStyle = my.colorMid;
                nameCtx.font = '14px sans-serif';
                nameCtx.textAlign = 'center';
                
                // width and height to clear center dot 
                centerDotSize = (centerDotFullRadius + 1) * 2;
                
                // add callback to update before render.
                my.processor.addRenderCallback(showPlaybackPosition);
                my.processor.addProcessCallback(showNote);
                my.processor.addSelectCallback(updateSelectCircle);
                
                // add listeners to parameters
                let params = my.processor.getParameters();
                params.steps.addChangedCallback(updateNecklace);
                params.pulses.addChangedCallback(updateNecklace);
                params.rotation.addChangedCallback(updateNecklace);
                params.is_mute.addChangedCallback(updatePointer);
                params.position2d.addChangedCallback(updatePosition);
                params.name.addChangedCallback(updateName);
                
                // set drawing values
                position2d = params.position2d.getValue();
                updatePosition(params.position2d, position2d, position2d)
                updateName();
                updateNecklace();
                redrawStaticCanvas();
            },
            
            /**
             * Called before this view is deleted.
             */
            terminate = function() {
                let params = my.processor.getParameters();
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
                pointerRotationPrevious = pointerRotation;
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
                let steps = my.processor.getParamValue('steps');
                
                // retain necklace dot state in object
                dotAnimations[stepIndex] = {
                    position2d: necklace[stepIndex].center,
                    boundingBox: necklace[stepIndex].rect,
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
                
                // stop center dot animation, if any
                if (centerDotStartTween) {
                    centerDotStartTween.stop();
                    centerDotStartTween = null;
                }
                if (centerDotEndTween) {
                    centerDotEndTween.stop();
                    centerDotEndTween = null;
                }
                
                // center dot start animation
                centerDotStartTween = new TWEEN.Tween({centerRadius: 0.01})
                    .to({centerRadius: centerDotFullRadius}, 10)
                    .onStart(function() {
                            isNoteActive = true;
                        })
                    .onUpdate(function() {
                            centerDotRadius = this.centerRadius;
                        })
                    .delay(noteStartDelay);
                    
                // center dot end animation
                centerDotEndTween = new TWEEN.Tween({centerRadius: centerDotFullRadius})
                    .to({centerRadius: 0.01}, 150)
                    .onUpdate(function() {
                            centerDotRadius = this.centerRadius;
                        })
                    .onComplete(function() {
                            isNoteActive = false;
                        })
                    .delay(noteStopDelay - noteStartDelay);
                
                // start center dot animation
                centerDotStartTween.chain(centerDotEndTween);
                centerDotStartTween.start();
            },
            
            /**
             * Update the pattern dots.
             * If the steps, pulses or rotation properties have changed.
             * If steps change it might invalidate the pointer.
             */
            updateNecklace = function() {
                let steps = my.processor.getParamValue('steps'),
                    pulses = my.processor.getParamValue('pulses'),
                    rotation = my.processor.getParamValue('rotation'),
                    euclid = my.processor.getEuclidPattern(),
                    rad, x, y;
                
                necklace = [];
                
                // calculate the dot positions
                necklaceRadius = necklaceMinRadius + (Math.max(0, steps - 16) * 0.8);
                for (let i = 0; i < steps; i++) {
                    rad = doublePI * (i / steps);
                    x = Math.sin(rad) * necklaceRadius;
                    y = Math.cos(rad) * necklaceRadius;
                    necklace.push({
                        center: {
                            x: x,
                            y: y
                        },
                        rect: {
                            x: x - dotMaxRadius * 2,
                            y: y + dotMaxRadius * 2,
                            xAbs: 0,
                            yAbs: 0,
                            height: dotMaxRadius * 4,
                            width: dotMaxRadius * 4
                        }
                    });
                }
                
                necklaceCtx.clearRect(0, 0, necklaceCanvas.width, necklaceCanvas.height);
                
                updateNecklaceAbsolute();
                updatePolygon(steps, pulses, euclid, necklace);
                updateDots(steps, euclid, necklace);
                updatePointer();
                updateZeroMarker(steps, rotation);
                updateRotatedMarker(steps, rotation);
                redrawStaticCanvas();
                canvasDirtyCallback();
            },
            
            /**
             * Update the coordinates of the necklace nodes relative to the main canvas.
             */
            updateNecklaceAbsolute = function() {
                let rect;
                for (let i = 0, n = necklace.length; i < n; i++) {
                    rect = necklace[i].rect;
                    rect.xAbs = position2d.x + rect.x;
                    rect.yAbs = position2d.y - rect.y;
                }
            },
            
            /**
             * Show circle if the my.processor is selected, else hide.
             * @param {Boolean} isSelectedView True if selected.
             */
            updateSelectCircle = function(isSelectedView) {
                isSelected = isSelectedView;
                redrawStaticCanvas();
                canvasDirtyCallback();
            },
            
            /**
             * Update pattern's position on the 2D canvas.
             * @param  {Object} param my.processor 2D position parameter.
             * @param  {Object} oldValue Previous 2D position as object.
             * @param  {Object} newValue New 2D position as object.
             */
            updatePosition = function(param, oldValue, newValue) {
                position2d = newValue;
                centerDotX = position2d.x - centerDotFullRadius - 1;
                centerDotY = position2d.y - centerDotFullRadius - 1;
                updateNecklaceAbsolute();
                redrawStaticCanvas();
                canvasDirtyCallback();
            },
            
            /**
             * Draw polygon.
             */
            updatePolygon = function(steps, pulses, euclid, necklace) {
                if (pulses > 1) {
                    necklaceCtx.fillStyle = my.colorLow;
                    necklaceCtx.strokeStyle = my.colorLow;
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
                dotRadius = dotMaxRadius - 3 - (Math.max(0, steps - 16) * 0.09);
                
                necklaceCtx.fillStyle = my.colorHigh;
                necklaceCtx.strokeStyle = my.colorHigh;
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
                let isMute = my.processor.getParamValue('is_mute'),
                    pointerRadius = isMute ? pointerMutedRadius : necklaceRadius,
                    pointerX = isMute ? 15 : 19,
                    pointerY = isMute ? 15 : 6;
                
                pointerCtx.clearRect(0, 0, pointerCanvas.width, pointerCanvas.height);
                pointerCtx.beginPath();
                pointerCtx.moveTo(pointerCanvasCenter - pointerX, pointerCanvas.height - pointerY);
                pointerCtx.lineTo(pointerCanvasCenter, pointerCanvas.height - pointerRadius);
                pointerCtx.lineTo(pointerCanvasCenter + pointerX, pointerCanvas.height - pointerY);
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
                let name = my.processor.getParamValue('name');
                nameCtx.clearRect(0, 0, nameCanvas.width, nameCanvas.height);
                nameCtx.fillText(name, nameCanvas.width / 2, nameCanvas.height / 2);
                canvasDirtyCallback();
            },
            
            redrawStaticCanvas = function() {
                staticCtx.clearRect(0, 0, staticCanvas.width, staticCanvas.height);
                staticCtx.beginPath();
                
                // necklace
                staticCtx.drawImage(necklaceCanvas, 0, 0);
                
                // center ring
                staticCtx.moveTo(radius + centerRadius, radius);
                staticCtx.arc(radius, radius, centerRadius, 0, doublePI, true);
                
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
                mainDynamicCtx.save();
                mainDynamicCtx.translate(position2d.x, position2d.y);
                mainDynamicCtx.rotate(pointerRotation);
                mainDynamicCtx.drawImage(pointerCanvas, -pointerCanvasCenter, -pointerCanvas.height);
                mainDynamicCtx.restore();
                
                mainDynamicCtx.fillStyle = my.colorHigh;
                mainDynamicCtx.strokeStyle = my.colorHigh;
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
                
                // center dot
                if (isNoteActive) {
                    mainDynamicCtx.moveTo(position2d.x + centerDotRadius, position2d.y);
                    mainDynamicCtx.arc(position2d.x, position2d.y, centerDotRadius, 0, doublePI, true);
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
                // center dot
                if (isNoteActive) {
                    mainDynamicCtx.clearRect(centerDotX, centerDotY, centerDotSize, centerDotSize);
                }
                
                // necklace dots
                let rect;
                for (let key in dotAnimations) {
                    if (dotAnimations.hasOwnProperty(key)) {
                        rect = dotAnimations[key].boundingBox;
                        mainDynamicCtx.clearRect(rect.xAbs, rect.yAbs, rect.height, rect.width);
                    }
                }
                
                // pointer
                mainDynamicCtx.save();
                mainDynamicCtx.translate(position2d.x, position2d.y);
                mainDynamicCtx.rotate(pointerRotationPrevious);
                mainDynamicCtx.clearRect(-pointerCanvasCenter, -pointerCanvas.height, pointerCanvas.width, pointerCanvas.height);
                mainDynamicCtx.restore();
            },
            
            intersectsWithPoint = function(x, y) {
                let distance = Math.sqrt(Math.pow(x - position2d.x, 2) + Math.pow(y - position2d.y, 2));
                return distance <= necklaceRadius + dotRadius;
            },
            
            /**
             * Set the theme colours of the processor view.
             * @param {Object} theme Theme settings object.
             */
            setTheme = function(theme) {
                my.colorHigh = theme.colorHigh;
                my.colorMid = theme.colorMid;
                my.colorLow = theme.colorLow;
                staticCtx.strokeStyle = my.colorHigh;
                necklaceCtx.fillStyle = my.colorHigh;
                necklaceCtx.strokeStyle = my.colorHigh;
                pointerCtx.strokeStyle = my.colorHigh;
                nameCtx.fillStyle = my.colorMid;
                updateName();
                updateNecklace();
            };
            
        my = my || {};
        
        that = ns.createCanvasBaseView(specs, my);
        
        initialise();
        
        that.terminate = terminate;
        that.addToStaticView = addToStaticView;
        that.addToDynamicView = addToDynamicView;
        that.clearFromDynamicView = clearFromDynamicView;
        that.intersectsWithPoint = intersectsWithPoint;
        that.setTheme = setTheme;
        return that;
    }

    ns.createCanvasEPGView = createCanvasEPGView;

})(WH);
