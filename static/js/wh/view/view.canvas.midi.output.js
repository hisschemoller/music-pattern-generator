/**
 * MIDI output object drawn on canvas.
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createCanvasMIDIOutView(specs, my) {
        let that,
            processor = specs.processor,
            
            initialise = function() {
            },
            
            /**
             * Called before this view is deleted.
             */
            terminate = function() {
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
            
            
            