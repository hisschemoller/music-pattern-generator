
window.WH = window.WH || {};

(function (ns) {
    
    function createCanvasEPGView(specs) {
        let that,
            processor = specs.processor,
            dynamicCtx = specs.dynamicCtx,
            canvasDirtyCallback = specs.canvasDirtyCallback,
            staticCanvas,
            staticCtx,
            radius = 50,
            selectRadius = 10,
            position2d,
            isSelected = false,
            doublePI = Math.PI * 2,
            
            initialise = function() {
                // offscreen canvas for static shapes
                staticCanvas = document.createElement('canvas');
                staticCanvas.height = radius * 2;
                staticCanvas.width = radius * 2;
                staticCtx = staticCanvas.getContext('2d');
                
                // add callback to update before render.
                processor.addSelectCallback(updateSelectCircle);
                
                // add listeners to parameters
                let params = processor.getParameters();
                params.position2d.addChangedCallback(updatePosition);
                
                // set drawing values
                position2d = params.position2d.getValue();
                redrawStaticCanvas();
            },
            
            /**
             * Called before this view is deleted.
             */
            terminate = function() {},
            
            /**
             * Show circle if the processor is selected, else hide.
             * @param {Boolean} isSelectedView True if selected.
             */
            updateSelectCircle = function(isSelectedView) {
                isSelected = isSelectedView;
                redrawStaticCanvas();
                canvasDirtyCallback();
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
                staticCtx.clearRect(0, 0, staticCanvas.width, staticCanvas.height);
                staticCtx.beginPath();
                staticCtx.arc(radius, radius, 50, 0, doublePI, true);
                // select circle
                if (isSelected) {
                    staticCtx.moveTo(radius + selectRadius, radius);
                    staticCtx.arc(radius, radius, selectRadius, 0, doublePI, true);
                }
                staticCtx.stroke();
            },
            
            addToStaticView = function(mainStaticCtx) {
                mainStaticCtx.drawImage(
                    staticCanvas,
                    position2d.x - radius,
                    position2d.y - radius);
            },
            
            intersectsWithPoint = function(x, y) {
                let distance = Math.sqrt(Math.pow(x - position2d.x, 2) + Math.pow(y - position2d.y, 2));
                return distance <= radius;
            },
            
            getProcessor = function() {
                return processor;
            };
        
        that = specs.that || {};
        
        initialise();
        
        that.addToStaticView = addToStaticView;
        that.intersectsWithPoint = intersectsWithPoint;
        that.getProcessor = getProcessor;
        return that;
    }

    ns.createCanvasEPGView = createCanvasEPGView;

})(WH);
