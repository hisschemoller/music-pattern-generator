/**
 * 2D view.
 * 
 * @namespace WH
 */
window.WH = window.WH || {};

(function (ns) {
    
    function createCanvasView(specs) {
        var that,
            staticCanvas,
            dynamicCanvas,
            staticCtx,
            dynamicCtx,
            views = [],
            numViews,
            isDirty = false,
            isTouchDevice = 'ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch,
            doubleClickCounter = 0,
            doubleClickDelay = 300,
            doubleClickTimer,
        
            /**
             * Type of events to use, touch or mouse
             * @type {String}
             */
            eventType = {
                start: isTouchDevice ? 'touchstart' : 'mousedown',
                end: isTouchDevice ? 'touchend' : 'mouseup',
                click: isTouchDevice ? 'touchend' : 'click',
                move: isTouchDevice ? 'touchmove' : 'mousemove',
            },
            
            init = function() {
                numViews = 0;
                staticCanvas = document.querySelector('.canvas-static');
                dynamicCanvas = document.querySelector('.canvas-dynamic');
                staticCtx = staticCanvas.getContext('2d');
                dynamicCtx = dynamicCanvas.getContext('2d');
                
                dynamicCanvas.addEventListener(eventType.click, onClick);
                window.addEventListener('resize', onWindowResize, false);
                
                onWindowResize();
            },
            
            /**
             * Window resize event handler.
             */
            onWindowResize = function() {
                staticCanvas.width = window.innerWidth;
                staticCanvas.height = window.innerHeight;
                dynamicCanvas.width = window.innerWidth;
                dynamicCanvas.height = window.innerHeight;
            },
            
            /**
             * Separate click and doubleclick.
             * @see http://stackoverflow.com/questions/6330431/jquery-bind-double-click-and-single-click-separately
             */
            onClick = function(e) {
                // separate click from doubleclick
                doubleClickCounter ++;
                if (doubleClickCounter == 1) {
                    doubleClickTimer = setTimeout(function() {
                        doubleClickCounter = 0;
                        // implement single click behaviour here
                    }, doubleClickDelay);
                } else {
                    clearTimeout(doubleClickTimer);
                    doubleClickCounter = 0;
                    // implement double click behaviour here
                    onDoubleClick(e);
                }
            },
            
            /**
             * Handler for the custom doubleclick event detection.
             * Create a new pattern at the location of the doubleclick.
             */
            onDoubleClick = function(e) {
                // create a new processor
                ns.pubSub.fire('create.processor', {
                    type: 'epg',
                    position2d: {
                        x: (e.pageX - e.target.offsetLeft) - (dynamicCanvas.width / 2),
                        y: (e.pageY - e.target.offsetTop) - (dynamicCanvas.height / 2)
                    }
                });
            },
            
            /**
             * Create world object if it exists for the type.
             * @param  {Object} processor MIDI processor for which the 3D object will be a view.
             */
            createView = function(processor) {
                let specs = {
                    processor: processor,
                    staticCtx: staticCtx,
                    dynamicCtx: dynamicCtx
                }
                switch (processor.getType()) {
                    case 'epg':
                        var view = ns.createCanvasEPGView(specs);
                        break;
                }
                views.push(view);
                numViews = views.length;
            },
            
            /**
             * Delete world object when processor is deleted.
             * @param  {Object} processor MIDI processor for which the 3D object will be a view.
             */
            deleteView = function(processor) {
                numViews = views.length;
            },
            
            markDirty = function() {
                isDirty = true;
            },
            
            draw = function() {
                if (isDirty) {
                    staticCtx.clearRect(0, 0, staticCanvas.width, staticCanvas.height);
                }
                dynamicCtx.clearRect(0, 0, staticCanvas.width, staticCanvas.height);
                for (let i = 0; i < numViews; i++) {
                    views[i].draw(isDirty);
                }
                isDirty = false;
            };
        
        that = specs.that || {};
        
        init();
        
        that.createView = createView;
        that.deleteView = deleteView;
        that.markDirty = markDirty;
        that.draw = draw;
        return that;
    }

    ns.createCanvasView = createCanvasView;

})(WH);
