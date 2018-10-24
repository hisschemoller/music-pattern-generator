import createCanvasProcessorBaseView from '../../view/canvasprocessorbase.js';
import { getEuclidPattern, rotateEuclidPattern } from './euclid.js';
import { PPQN } from '../../core/config.js';

/**
 * Euclidean pattern animated necklace wheel drawn on canvas.
 */
export function createGraphic(specs, my) {
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
        centerDotSize,
        centerDotX,
        centerDotY,
        centerDotStartTween,
        centerDotEndTween,
        
        centerRadius = 20,
        outConnectorY = 35,
        selectRadius = 15,
        dotRadius,
        dotMaxRadius = 10,
        dotActiveRadius,
        zeroMarkerRadius = 3,
        lineWidth = 2,
        isSelected = false,
        doublePI = Math.PI * 2,
        dotAnimations = {},
        isNoteActive = false,
        necklace = [],
        duration = 0,
        
        initialise = function() {
            document.addEventListener(my.store.STATE_CHANGE, handleStateChanges);
            canvasDirtyCallback = specs.canvasDirtyCallback;

            initGraphics();
            setTheme(specs.theme);
            updatePosition(specs.data.positionX, specs.data.positionY);
            redrawStaticCanvas();
            updateDuration();
        },
        
        /**
         * Called before this view is deleted.
         */
        terminate = function() {
            document.removeEventListener(my.store.STATE_CHANGE, handleStateChanges);
            canvasDirtyCallback = null;
        },

        handleStateChanges = function(e) {
            switch (e.detail.action.type) {
                case e.detail.actions.CHANGE_PARAMETER:
                    if (e.detail.action.processorID === my.id) {
                        my.params = e.detail.state.processors.byId[my.id].params.byId;
                        switch (e.detail.action.paramKey) {
                            case 'steps':
                            case 'pulses':
                                updateDuration();
                                // fall through
                            case 'rotation':
                                updateNecklace();
                                break;
                            case 'is_mute':
                                updatePointer();
                                break;
                            case 'name':
                                updateName();
                                break;
                            case 'is_triplets':
                            case 'rate':
                            case 'note_length':
                                updateDuration();
                                break;
                        }
                    }
                    break;

                case e.detail.actions.DRAG_SELECTED_PROCESSOR:
                case e.detail.actions.DRAG_ALL_PROCESSORS:
                    const processor = e.detail.state.processors.byId[my.id];
                    updatePosition(processor.positionX, processor.positionY);
                    break;
            }
        },

        initGraphics = function() {
            // offscreen canvas for static shapes
            staticCanvas = document.createElement('canvas');
            staticCanvas.height = radius * 2;
            staticCanvas.width = radius * 2;
            staticCtx = staticCanvas.getContext('2d');
            staticCtx.lineWidth = lineWidth;
            
            // offscreen canvas for dots ring and polygon
            necklaceCanvas = document.createElement('canvas');
            necklaceCanvas.height = radius * 2;
            necklaceCanvas.width = radius * 2;
            necklaceCtx = necklaceCanvas.getContext('2d');
            necklaceCtx.lineWidth = lineWidth;
            
            // offscreen canvas for the pointer
            pointerCanvas = document.createElement('canvas');
            pointerCanvas.height = radius;
            pointerCanvas.width = centerRadius * 2;
            pointerCtx = pointerCanvas.getContext('2d');
            pointerCtx.lineWidth = lineWidth;
            pointerCanvasCenter = pointerCanvas.width / 2;
            
            // offscreen canvas for the name
            nameCanvas = document.createElement('canvas');
            nameCanvas.height = 40;
            nameCanvas.width = radius * 2;
            nameCtx = nameCanvas.getContext('2d');
            nameCtx.font = '14px sans-serif';
            nameCtx.textAlign = 'center';
            
            // width and height to clear center dot 
            centerDotSize = (centerDotFullRadius + 1) * 2;
        },
        
        /**
         * Show circle if the my.processor is selected, else hide.
         * @param {Boolean} isSelectedView True if selected.
         */
        setSelected = function(isSelectedView) {
            isSelected = isSelectedView;
            if (typeof redrawStaticCanvas == 'function' && typeof canvasDirtyCallback == 'function') {
                redrawStaticCanvas();
                canvasDirtyCallback();
            }
        },

        draw = function(position, processorEvents) {
            showPlaybackPosition(position);
            
            if (processorEvents[my.id] && processorEvents[my.id].length) {
                for (let i = 0, n = processorEvents[my.id].length; i < n; i++) {
                    const event = processorEvents[my.id][i];
                    showNote(event.stepIndex, event.delayFromNowToNoteStart, event.delayFromNowToNoteEnd);
                }
            }
        },
        
        /**
         * Show the playback position within the pattern.
         * Indicated by the pointer's rotation.
         * @param  {Number} position Position within pattern in ticks.
         */
        showPlaybackPosition = function(position) {
            pointerRotationPrevious = pointerRotation;
            pointerRotation = doublePI * (position % duration / duration);
        },
        
        /**
         * Show animation of the pattern dot that is about to play. 
         * @param {Number} stepIndex Index of the step to play.
         * @param {Number} noteStartDelay Delay from now until note start in ms.
         * @param {Number} noteStopDelay Delay from now until note end in ms.
         */
        showNote = function(stepIndex, noteStartDelay, noteStopDelay) {
            // get the coordinates of the dot for this step
            let steps = my.params.steps.value;
            
            // retain necklace dot state in object
            dotAnimations[stepIndex] = {
                positionX: necklace[stepIndex].center.x,
                positionY: necklace[stepIndex].center.y,
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
         * Calculate the pattern's duration in milliseconds.
         */
        updateDuration = function() {
            const rate = my.params.is_triplets.value ? my.params.rate.value * (2 / 3) : my.params.rate.value,
                stepDuration = rate * PPQN;
            duration = my.params.steps.value * stepDuration;
        },
        
        /**
         * Update the pattern dots.
         * If the steps, pulses or rotation properties have changed.
         * If steps change it might invalidate the pointer.
         */
        updateNecklace = function() {
            let steps = my.params.steps.value,
                pulses = my.params.pulses.value,
                rotation = my.params.rotation.value,
                euclid, rad, x, y;
            
            euclid = getEuclidPattern(steps, pulses);
            euclid = rotateEuclidPattern(euclid, rotation);
            
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
                rect.xAbs = my.positionX + rect.x;
                rect.yAbs = my.positionY - rect.y;
            }
        },
        
        /**
         * Update pattern's position on the 2D canvas.
         * @param  {Object} value New 2D position as object.
         */
        updatePosition = function(x, y) {
            my.positionX = x;
            my.positionY = y;
            centerDotX = my.positionX - centerDotFullRadius - 1;
            centerDotY = my.positionY - centerDotFullRadius - 1;
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
        
        /**
         * Draw the necklace dots in their inactive state.
         */
        updateDots = function(steps, euclid, necklace) {
            dotRadius = dotMaxRadius - 3 - (Math.max(0, steps - 16) * 0.09);
            dotActiveRadius = dotRadius * 2;
            
            necklaceCtx.fillStyle = my.colorHigh;
            necklaceCtx.strokeStyle = my.colorHigh;
            let point;
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
            let isMute = my.params.is_mute.value,
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
            nameCtx.fillStyle = my.colorMid;
            nameCtx.clearRect(0, 0, nameCanvas.width, nameCanvas.height);
            nameCtx.fillText(my.params.name.value, nameCanvas.width / 2, nameCanvas.height / 2);
            canvasDirtyCallback();
        },
        
        /**
         * Redraw the pattern's static shapes canvas.
         */
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
        
        /**
         * Add the pattern's static canvas to the main static canvas.
         * @param  {Object} mainStaticCtx 2D canvas context.
         */
        addToStaticView = function(mainStaticCtx) {
            mainStaticCtx.drawImage(
                staticCanvas,
                my.positionX - radius,
                my.positionY - radius);
            mainStaticCtx.drawImage(
                nameCanvas,
                my.positionX - radius,
                my.positionY + necklaceRadius + 4);
        },
        
        /**
         * Draw the pattern's dynamic shapes on the main dymamic canvas
         * @param  {Object} mainStaticCtx 2D canvas context.
         */
        addToDynamicView = function(mainDynamicCtx) {
            // draw rotating pointer
            mainDynamicCtx.save();
            mainDynamicCtx.translate(my.positionX, my.positionY);
            mainDynamicCtx.rotate(pointerRotation);
            mainDynamicCtx.drawImage(pointerCanvas, -pointerCanvasCenter, -pointerCanvas.height);
            mainDynamicCtx.restore();
            
            mainDynamicCtx.fillStyle = my.colorHigh;
            mainDynamicCtx.strokeStyle = my.colorHigh;
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
                    x = my.positionX + dotState.positionX;
                    y = my.positionY - dotState.positionY;
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
                mainDynamicCtx.moveTo(my.positionX + centerDotRadius, my.positionY);
                mainDynamicCtx.arc(my.positionX, my.positionY, centerDotRadius, 0, doublePI, true);
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
            mainDynamicCtx.translate(my.positionX, my.positionY);
            mainDynamicCtx.rotate(pointerRotationPrevious);
            mainDynamicCtx.clearRect(-pointerCanvasCenter, -pointerCanvas.height, pointerCanvas.width, pointerCanvas.height);
            mainDynamicCtx.restore();
        },
        
        /**
         * Test if a coordinate intersects with the graphic's hit area.
         * @param  {Number} x Horizontal coordinate.
         * @param  {Number} y Vertical coordinate.
         * @return {Boolean} True if the point intersects. 
         */
        intersectsWithPoint = function(x, y) {
            let distance = Math.sqrt(Math.pow(x - my.positionX, 2) + Math.pow(y - my.positionY, 2));
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
            updateName();
            updateNecklace();
        };
        
    my = my || {};
    
    that = createCanvasProcessorBaseView(specs, my);
    
    initialise();
    
    that.terminate = terminate;
    that.setSelected = setSelected;
    that.draw = draw;
    that.addToStaticView = addToStaticView;
    that.addToDynamicView = addToDynamicView;
    that.clearFromDynamicView = clearFromDynamicView;
    that.intersectsWithPoint = intersectsWithPoint;
    that.setTheme = setTheme;
    return that;
}