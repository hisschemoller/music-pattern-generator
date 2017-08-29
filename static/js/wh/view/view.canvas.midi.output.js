/**
 * MIDI output object drawn on canvas.
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createCanvasMIDIOutView(specs) {
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
            
            
            