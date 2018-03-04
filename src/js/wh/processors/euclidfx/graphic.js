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
        necklaceCtx,
        nameCtx,

        isSelected = false,

        lineWidth = 2,
        radius = 110,
        centerRadius = 20,
        selectRadius = 15,
        doublePI = Math.PI * 2,

        initialise = function() {
            document.addEventListener(my.store.STATE_CHANGE, handleStateChanges);
            canvasDirtyCallback = specs.canvasDirtyCallback;
            initGraphics();
            redrawStaticCanvas();
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
                case e.detail.actions.DRAG_SELECTED_PROCESSOR:
                case e.detail.actions.DRAG_ALL_PROCESSORS:
                    const processor = e.detail.state.processors.byId[my.id];
                    updatePosition(processor.positionX, processor.positionY);
                    break;
            }
        },

        initGraphics = function() {
            // offscreen canvas for static shapes
            const staticCanvas = document.createElement('canvas');
            staticCanvas.height = radius * 2;
            staticCanvas.width = radius * 2;
            staticCtx = staticCanvas.getContext('2d');
            staticCtx.lineWidth = lineWidth;
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
         * Redraw the pattern's static shapes canvas.
         */
        redrawStaticCanvas = function() {
            staticCtx.clearRect(0, 0, staticCtx.canvas.width, staticCtx.canvas.height);
            staticCtx.beginPath();

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

        draw = function(position, processorEvents) {},
        
        /**
         * Add the pattern's static canvas to the main static canvas.
         * @param  {Object} mainStaticCtx 2D canvas context.
         */
        addToStaticView = function(mainStaticCtx) {
            mainStaticCtx.drawImage(
                staticCtx.canvas,
                my.positionX - radius,
                my.positionY - radius);
        },
        
        /**
         * Draw the pattern's dynamic shapes on the main dymamic canvas
         * @param  {Object} mainStaticCtx 2D canvas context.
         */
        addToDynamicView = function(mainDynamicCtx) {},
        
        /**
         * Clear all this pattern's elements from the dynamic context.
         * These are the center dot, necklace dots and pointer.
         * @param  {Object} mainDynamicCtx 2D canvas context.
         */
        clearFromDynamicView = function(mainDynamicCtx) {},
        
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
