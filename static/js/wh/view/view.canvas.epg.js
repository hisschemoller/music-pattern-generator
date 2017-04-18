
window.WH = window.WH || {};

(function (ns) {
    
    function createCanvasEPGView(specs) {
        let that,
            processor = specs.processor,
            dynamicCtx = specs.dynamicCtx,
            canvasDirtyCallback = specs.canvasDirtyCallback,
            staticCtx,
            canvasHeight = 300,
            canvasWidth = 300,
            position2d,
            
            initialise = function() {
                // offscreen canvas for static shapes
                let staticCanvas = document.createElement('canvas');
                staticCanvas.height = canvasHeight;
                staticCanvas.width = canvasWidth;
                staticCtx = staticCanvas.getContext('2d');
                
                // add listeners to parameters
                let params = processor.getParameters();
                params.position2d.addChangedCallback(updatePosition);
                
                // set drawing values
                position2d = params.position2d.getValue();
                redrawStaticCanvas();
            },
            
            /**
             * Update pattern's position on the 2D canvas.
             * @param  {Object} param Processor 2D position parameter.
             * @param  {Object} oldValue Previous 2D position as object.
             * @param  {Object} newValue New 2D position as object.
             */
            updatePosition = function(param, oldValue, newValue) {
                position2d = newValue;
                redrawStaticCanvas();
                canvasDirtyCallback();
            },
            
            redrawStaticCanvas = function() {
                staticCtx.beginPath();
                staticCtx.arc(canvasWidth / 2, canvasHeight / 2, 50, 0, Math.PI * 2, true);
                staticCtx.stroke();
            },
            
            getStaticImageData = function() {
                return staticCtx.getImageData(0, 0, canvasWidth, canvasHeight);
            }
            
            /**
             * Called before this view is deleted.
             */
            terminate = function() {};
        
        that = specs.that || {};
        
        initialise();
        
        that.getStaticImageData = getStaticImageData;
        return that;
    }

    ns.createCanvasEPGView = createCanvasEPGView;

})(WH);
