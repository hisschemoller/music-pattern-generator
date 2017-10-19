
window.WH = window.WH || {};

(function (ns) {
    
    const dotMaxRadius = 10,
        centerRadius = 20;
    
    let centerDotSize;
    
    function createCanvasEPGView(specs) {
        let that,
            processor = specs.processor,
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
            dotActiveRadius,
            zeroMarkerRadius = 3,
            colorHigh = '#cccccc',
            colorMid = '#dddddd',
            colorLow = '#eeeeee',
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
                pointerCanvas.height = radius;
                pointerCanvas.width = centerRadius * 2;
                pointerCtx = pointerCanvas.getContext('2d');
                pointerCtx.lineWidth = lineWidth;
                pointerCtx.strokeStyle = colorHigh;
                pointerCanvasCenter = pointerCanvas.width / 2;
                
                // offscreen canvas for the name
                nameCanvas = document.createElement('canvas');
                nameCanvas.height = 40;
                nameCanvas.width = radius * 2;
                nameCtx = nameCanvas.getContext('2d');
                nameCtx.fillStyle = colorMid;
                nameCtx.font = '14px sans-serif';
                nameCtx.textAlign = 'center';
                
                // width and height to clear center dot 
                centerDotSize = (centerDotFullRadius + 1) * 2;
                
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
                // lookAhead is 200ms
                let elapsed = performance.now() - that.lastNow;
                that.lastNow = performance.now();
                
                // get the coordinates of the dot for this step
                let steps = processor.getParamValue('steps');
                
                // retain necklace dot state in object
                dotAnimations[stepIndex] = {
                    position2d: necklace[stepIndex].center,
                    boundingBox: necklace[stepIndex].rect,
                    dotRadius: 0
                }
                
                let tweeningDot = dotAnimations[stepIndex];
                
                // animate the necklace dot
                new TWEEN.Tween({currentRadius: dotActiveRadius})
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
            
            /**
             * Draw the necklace dots in their inactive state.
             */
            updateDots = function(steps, euclid, necklace) {
                dotRadius = dotMaxRadius - 3 - (Math.max(0, steps - 16) * 0.09);
                dotActiveRadius = dotRadius * 2;
                
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
            
            /**
             * Update the pattern's name.
             */
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
                
                mainDynamicCtx.fillStyle = colorHigh;
                mainDynamicCtx.strokeStyle = colorHigh;
                mainDynamicCtx.beginPath();
                
                // necklace dots
                isNoteActive = false;
                let n = dotAnimations.length,
                    largestDot = dotRadius,
                    hasDotAnimations = false,
                    dotState, x, y;
                for (let key in dotAnimations) {
                    if (dotAnimations.hasOwnProperty(key)) {
                        dotState = dotAnimations[key];
                        x = position2d.x + dotState.position2d.x;
                        y = position2d.y - dotState.position2d.y;
                        mainDynamicCtx.moveTo(x + dotState.dotRadius, y);
                        mainDynamicCtx.arc(x, y, dotState.dotRadius, 0, doublePI, true);
                        largestDot = Math.max(largestDot, dotState.dotRadius);
                        isNoteActive = true;
                    }
                }
                
                // center dot
                if (isNoteActive) {
                    let largestDotNormalised = (largestDot - dotRadius) / (dotActiveRadius - dotRadius);
                    centerDotRadius = largestDotNormalised * centerDotFullRadius;
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
            
            /**
             * Test if a coordinate intersects with the graphic's hit area.
             * @param  {Number} x Horizontal coordinate.
             * @param  {[type]} y Vertical coordinate.
             * @return {Boolean} True if the point intersects. 
             */
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
