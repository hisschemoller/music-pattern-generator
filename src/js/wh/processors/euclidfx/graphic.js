import createCanvasProcessorBaseView from '../../view/canvasprocessorbase';
import { getEuclidPattern, rotateEuclidPattern } from './euclid';
import { PPQN } from '../../core/config';

/**
 * Euclidean pattern animated necklace wheel drawn on canvas.
 */
export function createGraphic(specs, my) {
    let that,
        canvasDirtyCallback,
        staticCtx,
        rotateCtx,
        pointerCtx,
        nameCtx,

        duration = 0,
        euclid,
        status = true,
        isSelected = false,
        isNoteActive = false,
        pointerRotation,
        pointerRotationPrevious = 0,
        pointerCanvasCenter,
        centerDotCounter = 0,
        centerDotNextStartTime = 0,

        centerDotFullRadius = 10,
        lineWidth = 2,
        radius = 70,
        centerRadius = 20,
        selectRadius = 15,
        innerRadius = 30,
        outerRadius = 46,
        dotRadius = 10,
        locatorLength = 38,
        zeroMarkerRadius = 3,
        locatorToZeroMarker = 7,
        doublePI = Math.PI * 2,

        initialise = function() {
            document.addEventListener(my.store.STATE_CHANGE, handleStateChanges);
            canvasDirtyCallback = specs.canvasDirtyCallback;
            initGraphics();
            updateEuclid(specs.data.params.byId);
            setTheme(specs.theme, specs.data.params.byId);
            updatePosition(specs.data.positionX, specs.data.positionY);
            updateDuration(specs.data.params.byId);
            redrawStaticCanvas();
            redrawPointerCanvas();
            redrawRotatingCanvas();
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
                                updateDuration(e.detail.state.processors.byId[my.id].params.byId);
                                // fall through
                            case 'pulses':
                                updateEuclid(e.detail.state.processors.byId[my.id].params.byId);
                                redrawRotatingCanvas();
                                break;
                            case 'rotation':
                                canvasDirtyCallback();
                                break;
                            case 'is_triplets':
                            case 'rate':
                                updateDuration(e.detail.state.processors.byId[my.id].params.byId);
                                break;
                            case 'name':
                                updateName(e.detail.state.processors.byId[my.id].params.byId);
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
            let canvas = document.createElement('canvas');
            canvas.height = radius * 2;
            canvas.width = radius * 2;
            staticCtx = canvas.getContext('2d');
            staticCtx.lineWidth = lineWidth;

            // offscreen canvas for dots ring and polygon
            canvas = document.createElement('canvas');
            canvas.height = radius * 2;
            canvas.width = radius * 2;
            rotateCtx = canvas.getContext('2d');
            rotateCtx.lineWidth = lineWidth;

            // offscreen canvas for the pointer
            canvas = document.createElement('canvas');
            canvas.height = radius;
            canvas.width = centerRadius * 2;
            pointerCtx = canvas.getContext('2d');
            pointerCtx.lineWidth = lineWidth;
            pointerCtx.lineJoin = 'bevel';
            pointerCanvasCenter = canvas.width / 2;
            
            // offscreen canvas for the name
            canvas = document.createElement('canvas');
            canvas.height = 40;
            canvas.width = radius * 2;
            nameCtx = canvas.getContext('2d');
            nameCtx.font = '14px sans-serif';
            nameCtx.textAlign = 'center';
        },
        
        /**
         * Update pattern's position on the 2D canvas.
         * @param  {Object} value New 2D position as object.
         */
        updatePosition = function(x, y) {
            my.positionX = x;
            my.positionY = y;
            canvasDirtyCallback();
        },

        /**
         * Calculate the pattern's duration in milliseconds.
         */
        updateDuration = function(params) {
            const rate = params.is_triplets.value ? params.rate.value * (2 / 3) : params.rate.value,
                stepDuration = rate * PPQN;
            duration = params.steps.value * stepDuration;
        },

        updateEuclid = function(params) {
            euclid = getEuclidPattern(params.steps.value, params.pulses.value);
        },
        
        /**
         * Update the pattern's name.
         */
        updateName = function(params) {
            nameCtx.fillStyle = my.colorMid;
            nameCtx.clearRect(0, 0, nameCtx.canvas.width, nameCtx.canvas.height);
            nameCtx.fillText(params.name.value, nameCtx.canvas.width / 2, nameCtx.canvas.height / 2);
            canvasDirtyCallback();
        },
        
        /**
         * Show the playback position within the pattern.
         * Indicated by the pointer's rotation.
         * @param  {Number} position Position within pattern in ticks.
         */
        updatePlaybackPosition = function(position) {
            pointerRotationPrevious = pointerRotation;
            pointerRotation = -doublePI * ((position % duration) / duration);
        },
        
        /**
         * Redraw the pattern's static shapes canvas.
         */
        redrawStaticCanvas = function() {
            staticCtx.clearRect(0, 0, staticCtx.canvas.width, staticCtx.canvas.height);
            staticCtx.beginPath();

            // center ring
            staticCtx.moveTo(radius + centerRadius, radius);
            staticCtx.arc(radius, radius, centerRadius, 0, doublePI);
            
            // select circle
            if (isSelected) {
                staticCtx.moveTo(radius + selectRadius, radius);
                staticCtx.arc(radius, radius, selectRadius, 0, doublePI);
            }

            staticCtx.stroke();
        },

        /**
         * Redraw the location pointer and the status dot.
         */
        redrawPointerCanvas = function() {
            const locatorTop = radius - pointerCanvasCenter - locatorLength,
                necklacePos = radius - (status ? outerRadius : innerRadius),
                halfWayPos = necklacePos + ((locatorTop - necklacePos) / 2),
                statusWidth = status ? 15 : 6,
                sides = status ? locatorTop : halfWayPos;

            pointerCtx.clearRect(0, 0, pointerCtx.canvas.width, pointerCtx.canvas.height);
            pointerCtx.beginPath();

            // position locator
            pointerCtx.moveTo(pointerCanvasCenter, radius - pointerCanvasCenter);
            pointerCtx.lineTo(pointerCanvasCenter, locatorTop);

            // status indicator
            pointerCtx.lineTo(pointerCanvasCenter - statusWidth, sides);
            pointerCtx.lineTo(pointerCanvasCenter, necklacePos);
            pointerCtx.lineTo(pointerCanvasCenter + statusWidth, sides);
            pointerCtx.lineTo(pointerCanvasCenter, locatorTop);

            // zero marker
            pointerCtx.moveTo(pointerCanvasCenter, locatorTop - locatorToZeroMarker + zeroMarkerRadius);
            pointerCtx.arc(pointerCanvasCenter, locatorTop - locatorToZeroMarker, zeroMarkerRadius, 0, doublePI, true);

            pointerCtx.stroke();
        },

        /**
         * The rotating canvas shows the necklace shape.
         */
        redrawRotatingCanvas = function() {
            let arc, x, y;

            rotateCtx.clearRect(0, 0, rotateCtx.canvas.width, rotateCtx.canvas.height);
            rotateCtx.fillStyle = my.colorHigh;
            rotateCtx.strokeStyle = my.colorHigh;
            rotateCtx.beginPath();

            for (let i = 0, n = euclid.length; i < n; i++) {
                const stepRadius = euclid[i] ? outerRadius : innerRadius;
                rotateCtx.arc(radius, radius, stepRadius, ((i / n) * doublePI) - (Math.PI / 2), (((i + 1) / n) * doublePI) - (Math.PI / 2), false);
            }
            // for (let i = 0, n = euclid.length; i < n; i++) {
            //     const stepRadius = euclid[i] ? outerRadius : innerRadius;
            //     rotateCtx.arc(radius, radius, stepRadius, ((n - i) / n) * doublePI, ((n - i - 1) / n) * doublePI, true);
            // }

            rotateCtx.closePath();
            rotateCtx.stroke();
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
            updatePlaybackPosition(position);

            // calculate status and redraw locator if needed
            let currentStep = Math.floor(((position % duration) / duration) * my.params.steps.value);
            currentStep = (currentStep + my.params.rotation.value) % my.params.steps.value;
            const currentStatus = euclid[currentStep];
            if (currentStatus !== status) {
                status = currentStatus;
                redrawPointerCanvas();
                canvasDirtyCallback();
            }

            // Show notes to happen as center dot animation.
            if (processorEvents[my.id] && processorEvents[my.id].length) {
                for (let i = 0, n = processorEvents[my.id].length; i < n; i++) {
                    const event = processorEvents[my.id][i];
                    centerDotNextStartTime = performance.now() + event.delayFromNowToNoteStart;
                    centerDotCounter = 1;
                }
            }
        },
        
        /**
         * Add the pattern's static canvas to the main static canvas.
         * @param  {Object} mainStaticCtx 2D canvas context.
         */
        addToStaticView = function(mainStaticCtx) {
            // draw static canvas
            mainStaticCtx.drawImage(
                staticCtx.canvas,
                my.positionX - radius,
                my.positionY - radius);
            
            // draw name canvas
            mainStaticCtx.drawImage(
                nameCtx.canvas,
                my.positionX - radius,
                my.positionY + outerRadius + 4);
            
            // draw pointer canvas
            let patternRotation = (my.params.rotation.value / my.params.steps.value) * doublePI;
            mainStaticCtx.save();
            mainStaticCtx.translate(my.positionX, my.positionY);
            mainStaticCtx.rotate(patternRotation);
            mainStaticCtx.drawImage(pointerCtx.canvas, -pointerCanvasCenter, -pointerCtx.canvas.height);
            mainStaticCtx.restore();
        },
        
        /**
         * Draw the pattern's dynamic shapes on the main dymamic canvas
         * @param  {Object} mainStaticCtx 2D canvas context.
         */
        addToDynamicView = function(mainDynamicCtx) {
            // draw rotating canvas
            mainDynamicCtx.save();
            mainDynamicCtx.translate(my.positionX, my.positionY);
            mainDynamicCtx.rotate(pointerRotation);
            mainDynamicCtx.drawImage(rotateCtx.canvas, -radius, -radius);
            mainDynamicCtx.restore();
            
            // center dot
            if (centerDotCounter >= 0 && centerDotNextStartTime < performance.now()) {
                const centerDotRadius = centerDotFullRadius * centerDotCounter;
                mainDynamicCtx.moveTo(my.positionX + centerDotRadius, my.positionY);
                mainDynamicCtx.arc(my.positionX, my.positionY, centerDotRadius, 0, doublePI, true);
                mainDynamicCtx.fill();
                centerDotCounter -= .1;
            }
        },
        
        /**
         * Clear all this pattern's elements from the dynamic context.
         * These are the center dot, necklace dots and pointer.
         * @param  {Object} mainDynamicCtx 2D canvas context.
         */
        clearFromDynamicView = function(mainDynamicCtx) {
            mainDynamicCtx.save();
            mainDynamicCtx.translate(my.positionX, my.positionY);
            mainDynamicCtx.rotate(pointerRotationPrevious);
            mainDynamicCtx.clearRect(-radius, -radius, rotateCtx.canvas.width, rotateCtx.canvas.height);
            mainDynamicCtx.restore();
        },
        
        /**
         * Test if a coordinate intersects with the graphic's hit area.
         * @param  {Number} x Horizontal coordinate.
         * @param  {Number} y Vertical coordinate.
         * @return {Boolean} True if the point intersects. 
         */
        intersectsWithPoint = function(x, y, canvasRect) {
            let distance = Math.sqrt(Math.pow(x - my.positionX, 2) + Math.pow(y - my.positionY, 2));
            return distance <= centerRadius;
        },
        
        /**
         * Set the theme colours of the processor view.
         * @param {Object} theme Theme settings object.
         */
        setTheme = function(theme, params) {
            my.colorHigh = theme.colorHigh;
            my.colorMid = theme.colorMid;
            my.colorLow = theme.colorLow;
            staticCtx.strokeStyle = my.colorHigh;
            staticCtx.fillStyle = my.colorHigh;
            rotateCtx.strokeStyle = my.colorHigh;
            pointerCtx.strokeStyle = my.colorHigh;
            pointerCtx.fillStyle = my.colorHigh;
            
            updateName(params);
            redrawRotatingCanvas(params);
            redrawPointerCanvas(params);
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
