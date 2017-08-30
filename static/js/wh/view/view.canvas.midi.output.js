/**
 * MIDI output object drawn on canvas.
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createCanvasMIDIOutView(specs, my) {
        let that,
            processor = specs.processor,
            staticCanvas,
            staticCtx,
            position2d,
            lineWidth = 2,
            
            initialise = function() {
                // offscreen canvas for static shapes
                staticCanvas = document.createElement('canvas');
                staticCanvas.height = 100;
                staticCanvas.width = 100;
                staticCtx = staticCanvas.getContext('2d');
                staticCtx.lineWidth = lineWidth;
                staticCtx.strokeStyle = my.colorHigh;
                
                // add listeners to parameters
                let params = my.processor.getParameters();
                params.position2d.addChangedCallback(updatePosition);
                
                position2d = params.position2d.getValue();
                updatePosition(params.position2d, position2d, position2d);
            },
            
            /**
             * Called before this view is deleted.
             */
            terminate = function() {
                let params = my.processor.getParameters();
                params.position2d.removeChangedCallback(updatePosition);
            },
            
            /**
             * Update pattern's position on the 2D canvas.
             * @param  {Object} param my.processor 2D position parameter.
             * @param  {Object} oldValue Previous 2D position as object.
             * @param  {Object} newValue New 2D position as object.
             */
            updatePosition = function(param, oldValue, newValue) {
                position2d = newValue;
                // redrawStaticCanvas();
                // canvasDirtyCallback();
            },
            
            addToStaticView = function(mainStaticCtx) {
            },
            
            addToDynamicView = function(mainDynamicCtx) {
            },
            
            /**
             * Clear all this pattern's elements from the dynamic context.
             * These are the center dot, necklace dots and pointer.
             * @param  {Object} mainDynamicCtx 2D canvas context.
             */
            clearFromDynamicView = function(mainDynamicCtx) {
            },
            
            intersectsWithPoint = function(x, y) {
            },
            
            /**
             * Set the theme colours of the processor view.
             * @param {Object} theme Theme settings object.
             */
            setTheme = function(theme) {
                my.colorHigh = theme.colorHigh;
                my.colorMid = theme.colorMid;
                my.colorLow = theme.colorLow;
            };
            
        my = my || {};
        
        that = ns.createCanvasBaseView(specs, my);
        
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

    ns.createCanvasMIDIOutView = createCanvasMIDIOutView;

})(WH);
            
            
            