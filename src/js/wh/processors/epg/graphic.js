import createCanvasProcessorBaseView from '../../view/canvasprocessorbase';
import { getProcessorByID } from '../../state/selectors';
import getEuclidPattern from './euclid';

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
        position2d,
        isSelected = false,
        doublePI = Math.PI * 2,
        dotAnimations = {},
        isNoteActive = false,
        necklace = [],
        
        initialise = function() {
            document.addEventListener(my.store.STATE_CHANGE, (e) => {
                switch (e.detail.action.type) {
                    case e.detail.actions.CHANGE_PARAMETER:
                        if (e.detail.action.processorID === my.data.id) {
                            switch (e.detail.action.paramKey) {
                                case 'steps':
                                case 'pulses':
                                case 'rotation':
                                    updateNecklace();
                                    break;
                                case 'is_mute':
                                    updatePointer();
                                    break;
                                case 'name':
                                    updateName();
                                    break;
                            }
                        }
                        break;
                }
            });


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
            // my.processor.addRenderCallback(showPlaybackPosition);
            // my.processor.addProcessCallback(showNote);
            // my.processor.addSelectCallback(updateSelectCircle);
            
            // add listeners to parameters
            // let params = my.processor.getParameters();
            // params.steps.addChangedCallback(updateNecklace);
            // params.pulses.addChangedCallback(updateNecklace);
            // params.rotation.addChangedCallback(updateNecklace);
            // params.is_mute.addChangedCallback(updatePointer);
            // params.position2d.addChangedCallback(updatePosition);
            // params.name.addChangedCallback(updateName);
            console.log(my.data);
            // set drawing values
            position2d = my.data.params.position2d.value;
            updatePosition(position2d, position2d)
            updateName();
            updateNecklace();
            redrawStaticCanvas();
        },
        
        /**
         * Called before this view is deleted.
         */
        terminate = function() {
            // let params = my.processor.getParameters();
            // params.steps.removeChangedCallback(updateNecklace);
            // params.pulses.removeChangedCallback(updateNecklace);
            // params.rotation.removeChangedCallback(updateNecklace);
            // params.is_mute.removeChangedCallback(updatePointer);
            // params.position2d.removeChangedCallback(updatePosition);
            // params.name.removeChangedCallback(updateName);
            canvasDirtyCallback = null;
        },

        setSelected = function(isSelected) {
            updateSelectCircle(isSelected);
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
            let params = getProcessorByID(my.data.id).params,
                steps = params.steps.value,
                pulses = params.pulses.value,
                rotation = params.rotation.value,
                euclid = getEuclidPattern(steps, pulses),
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
            if (typeof redrawStaticCanvas == 'function' && typeof canvasDirtyCallback == 'function') {
                redrawStaticCanvas();
                canvasDirtyCallback();
            }
        },
        
        /**
         * Update pattern's position on the 2D canvas.
         * @param  {Object} value New 2D position as object.
         */
        updatePosition = function(value) {
            position2d = value;
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
            let params = getProcessorByID(my.data.id).params,
                isMute = params.is_mute.value,
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
            // let name = my.processor.getParamValue('name');
            let params = getProcessorByID(my.data.id).params,
                name = params.name.value;
            nameCtx.clearRect(0, 0, nameCanvas.width, nameCanvas.height);
            nameCtx.fillText(my.data.params.name.value, nameCanvas.width / 2, nameCanvas.height / 2);
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
                position2d.x - radius,
                position2d.y - radius);
            mainStaticCtx.drawImage(
                nameCanvas,
                position2d.x - radius,
                position2d.y + necklaceRadius + 4);
        },
        
        /**
         * Draw the pattern's dynamic shapes on the main dymamic canvas
         * @param  {Object} mainStaticCtx 2D canvas context.
         */
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
         * @param  {Number} y Vertical coordinate.
         * @param  {String} type Hit area type, 'processor|inconnector|outconnector'
         * @return {Boolean} True if the point intersects. 
         */
        intersectsWithPoint = function(x, y, type) {
            let distance;
            switch (type) {
                case 'processor':
                    distance = Math.sqrt(Math.pow(x - position2d.x, 2) + Math.pow(y - position2d.y, 2));
                    return distance <= necklaceRadius + dotRadius;
                case 'inconnector':
                    return false;
                case 'outconnector':
                    distance = Math.sqrt(Math.pow(x - position2d.x, 2) + Math.pow(y - position2d.y - outConnectorY, 2));
                    return distance <= my.getConnectorGraphic().canvas.width / 2;
            }
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
            my.getConnectorGraphic().setTheme(theme);
        },
        
        getOutConnectorPoint = function() {
            return {
                x: position2d.x,
                y: position2d.y + outConnectorY
            }
        },
        
        /**
         * Provide output connector image for editing connections.
         * @return {Object} Contains canvas and coordinates.
         */
        getOutConnectorGraphic = function() {
            const canvas = my.getConnectorGraphic().canvas,
                point = getOutConnectorPoint();
            return {
                canvas: canvas,
                x: point.x - (canvas.width / 2),
                y: point.y - (canvas.height / 2)
            };
        };
        
    my = my || {};
    
    that = createCanvasProcessorBaseView(specs, my);
    
    initialise();
    
    that.terminate = terminate;
    that.setSelected = setSelected;
    that.updatePosition = updatePosition;
    that.addToStaticView = addToStaticView;
    that.addToDynamicView = addToDynamicView;
    that.clearFromDynamicView = clearFromDynamicView;
    that.intersectsWithPoint = intersectsWithPoint;
    that.setTheme = setTheme;
    that.getOutConnectorPoint = getOutConnectorPoint;
    that.getOutConnectorGraphic = getOutConnectorGraphic;
    return that;
}