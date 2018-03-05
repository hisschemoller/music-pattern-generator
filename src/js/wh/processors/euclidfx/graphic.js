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
        nameCtx,

        duration = 0,
        euclid,
        status = true,

        isSelected = false,
        pointerRotation,
        pointerRotationPrevious = 0,

        lineWidth = 2,
        radius = 70,
        centerRadius = 20,
        selectRadius = 15,
        innerRadius = 30,
        outerRadius = 50,
        dotRadius = 10,
        locatorLength = 50,
        doublePI = Math.PI * 2,

        initialise = function() {
            document.addEventListener(my.store.STATE_CHANGE, handleStateChanges);
            canvasDirtyCallback = specs.canvasDirtyCallback;
            initGraphics();
            updateEuclid();
            setTheme(specs.theme);
            updatePosition(specs.data.positionX, specs.data.positionY);
            redrawStaticCanvas();
            updateDuration();
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
                                updateDuration();
                                // fall through
                            case 'pulses':
                            case 'rotation':
                                updateEuclid();
                                redrawRotatingCanvas();
                                break;
                            case 'name':
                                updateName();
                                break;
                            case 'is_triplets':
                            case 'rate':
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
        updateDuration = function() {
            const rate = my.params.is_triplets.value ? my.params.rate.value * (2 / 3) : my.params.rate.value,
                stepDuration = rate * PPQN;
            duration = my.params.steps.value * stepDuration;
        },

        updateEuclid = function() {
            euclid = getEuclidPattern(my.params.steps.value, my.params.pulses.value);
            euclid = rotateEuclidPattern(euclid, my.params.rotation.value);
        },
        
        /**
         * Update the pattern's name.
         */
        updateName = function() {
            nameCtx.fillStyle = my.colorMid;
            nameCtx.clearRect(0, 0, nameCtx.canvas.width, nameCtx.canvas.height);
            nameCtx.fillText(my.params.name.value, nameCtx.canvas.width / 2, nameCtx.canvas.height / 2);
            canvasDirtyCallback();
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

            // position locator
            staticCtx.moveTo(radius, radius);
            staticCtx.lineTo(radius, radius - locatorLength);

            staticCtx.stroke();

            // status dot
            const yPos = radius - (status ? outerRadius : innerRadius);
            staticCtx.beginPath();
            staticCtx.moveTo(radius, yPos);
            staticCtx.arc(radius, yPos, dotRadius, 0, doublePI);
            staticCtx.fill();
        },

        /**
         * The rotating canvas shows the necklace shape.
         */
        redrawRotatingCanvas = function() {
            let steps = my.params.steps.value,
                pulses = my.params.pulses.value,
                rotation = my.params.rotation.value,
                arc, x, y;

            rotateCtx.clearRect(0, 0, rotateCtx.canvas.width, rotateCtx.canvas.height);
            rotateCtx.fillStyle = my.colorHigh;
            rotateCtx.strokeStyle = my.colorHigh;
            rotateCtx.beginPath();

            for (let i = 0, n = euclid.length; i < n; i++) {
                const stepRadius = euclid[i] ? outerRadius : innerRadius;
                rotateCtx.arc(radius, radius, stepRadius, ((n - i) / n) * doublePI, ((n - i - 1) / n) * doublePI, true);
            }

            rotateCtx.closePath();
            rotateCtx.stroke();
            // rotateCtx.globalAlpha = 0.6;
            // rotateCtx.fill();
            // rotateCtx.globalAlpha = 1.0;
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

        setSelected = function(isSelected) {
            updateSelectCircle(isSelected);
        },

        draw = function(position, processorEvents) {
            showPlaybackPosition(position);

            const currentStep = Math.floor(((position % duration) / duration) * my.params.steps.value);
            const currentStatus = euclid[currentStep];
            if (currentStatus !== status) {
                status = currentStatus;
                redrawStaticCanvas();
                canvasDirtyCallback();
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
         * Add the pattern's static canvas to the main static canvas.
         * @param  {Object} mainStaticCtx 2D canvas context.
         */
        addToStaticView = function(mainStaticCtx) {
            mainStaticCtx.drawImage(
                staticCtx.canvas,
                my.positionX - radius,
                my.positionY - radius);
            mainStaticCtx.drawImage(
                nameCtx.canvas,
                my.positionX - radius,
                my.positionY + outerRadius + 4);
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
        setTheme = function(theme) {
            my.colorHigh = theme.colorHigh;
            my.colorMid = theme.colorMid;
            my.colorLow = theme.colorLow;
            staticCtx.strokeStyle = my.colorHigh;
            staticCtx.fillStyle = my.colorHigh;
            updateName();
            redrawRotatingCanvas();
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
