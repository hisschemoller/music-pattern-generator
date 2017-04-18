
window.WH = window.WH || {};

(function (ns) {
    
    function createCanvasEPGView(specs) {
        let that,
            processor = specs.processor,
            staticCtx = specs.staticCtx,
            dynamicCtx = specs.dynamicCtx,
            
            initialise = function() {
                // add listeners to parameters
                var params = processor.getParameters();
                params.position2d.addChangedCallback(updatePosition);
            },
            
            draw = function(isDirty) {
                if (isDirty) {
                    
                }
            },
            
            /**
             * Update pattern's position on the 2D canvas.
             * @param  {Object} param Processor 2D position parameter.
             * @param  {Object} oldValue Previous 2D position as object.
             * @param  {Object} newValue New 2D position as object.
             */
            updatePosition = function(param, oldValue, newValue) {
                staticCtx.beginPath();
                staticCtx.arc(newValue.x, newValue.y, 50, 0, Math.PI * 2, true);
                staticCtx.stroke();
            },
            
            /**
             * Called before this view is deleted.
             */
            terminate = function() {};
        
        that = specs.that || {};
        
        initialise();
        
        that.draw = draw;
        return that;
    }

    ns.createCanvasEPGView = createCanvasEPGView;

})(WH);
