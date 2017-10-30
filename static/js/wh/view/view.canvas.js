/**
 * Graphic 2D view of the processor network.
 *
 * CanvasView draws the graphics for all processors.
 * DynamicCanvas shows all elements that update each requestAnimationFrame.
 * StaticCanvas shows all elements that update only infrequently.
 * 
 * Each processor has its own view.
 * When a change happens to a processor that 
 * requires the static canvas to be redrawn:
 * - The processor's view receives a callback from a changed parameter.
 * - The view redraws its static graphics on an off-screen canvas.
 * - The view sets a dirty flag on the canvasView (this).
 * - The canvasView receives the next draw request.
 * - It clears the staticCanvas.
 * - It draws each view's off-screen canvas on the staticCanvas.
 * - It clears the dirty flag.
 * 
 * @namespace WH
 */
window.WH = window.WH || {};

(function (WH) {
    
    function createCanvasView(specs, my) {
        var that,
            midiNetwork = specs.midiNetwork,
            rootEl,
            staticCanvas,
            dynamicCanvas,
            staticCtx,
            dynamicCtx,
            isDirty = false,
            doubleClickCounter = 0,
            doubleClickDelay = 300,
            doubleClickTimer,
            isConnectMode = false,
            dragObjectType, // 'background|processor|connection'
            
            init = function() {
                rootEl = document.querySelector('.canvas-container');
                staticCanvas = document.querySelector('.canvas-static');
                dynamicCanvas = document.querySelector('.canvas-dynamic');
                my.connectCanvas = document.querySelector('.canvas-connect');
                staticCtx = staticCanvas.getContext('2d');
                dynamicCtx = dynamicCanvas.getContext('2d');
                my.connectCtx = my.connectCanvas.getContext('2d');
                
                rootEl.addEventListener(WH.util.eventType.click, onClick);
                rootEl.addEventListener(WH.util.eventType.start, onTouchStart);
                rootEl.addEventListener(WH.util.eventType.move, dragMove);
                rootEl.addEventListener(WH.util.eventType.end, dragEnd);
                
                my.addWindowResizeCallback(onWindowResize);
                onWindowResize();
            },
            
            /**
             * Window resize event handler.
             */
            onWindowResize = function() {
                staticCanvas.width = rootEl.clientWidth;
                staticCanvas.height = rootEl.clientHeight;
                dynamicCanvas.width = rootEl.clientWidth;
                dynamicCanvas.height = rootEl.clientHeight;
                my.connectCanvas.width = rootEl.clientWidth;
                my.connectCanvas.height = rootEl.clientHeight;
                my.canvasRect = dynamicCanvas.getBoundingClientRect();
                markDirty();
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
                midiNetwork.createProcessor({
                    type: 'epg',
                    position2d: {
                        x: e.clientX - my.canvasRect.left + window.scrollX,
                        y: e.clientY - my.canvasRect.top + window.scrollY
                    }
                });
            },
            
            /**
             * Select the object under the mouse.
             * Start dragging the object.
             */
            onTouchStart = function(e) {
                let canvasX = e.clientX - my.canvasRect.left + window.scrollX,
                    canvasY = e.clientY - my.canvasRect.top + window.scrollY;
                
                if (isConnectMode && my.intersectsOutConnector(canvasX, canvasY)) {
                    dragObjectType = 'connection';
                } else if (my.intersectsProcessor(canvasX, canvasY)) {
                    dragObjectType = 'processor';
                } else {
                    dragObjectType = 'background';
                }
            },
            
            /**
             * Drag a view.
             * @param  {Object} e Event.
             */
            dragMove = function(e) {
                e.preventDefault();
                
                if (dragObjectType) {
                    let canvasX = e.clientX - my.canvasRect.left + window.scrollX,
                        canvasY = e.clientY - my.canvasRect.top + window.scrollY;
                    
                    switch (dragObjectType) {
                        case 'processor':
                            my.dragSelectedProcessor(canvasX, canvasY);
                            break;
                        case 'connection':
                            my.dragMoveConnection(canvasX, canvasY);
                            break;
                        case 'background':
                            my.dragAllProcessors(canvasX, canvasY);
                            break;
                    }
                    
                    my.drawConnections();
                    my.markDirty();
                }
            },
            
            /**
             * Dragging 3D object ended.
             * @param  {Object} e Event.
             */
            dragEnd = function(e) {
                e.preventDefault();
                
                if (dragObjectType) {
                    dragMove(e);
                    let canvasX = e.clientX - my.canvasRect.left + window.scrollX,
                        canvasY = e.clientY - my.canvasRect.top + window.scrollY;
                    switch (dragObjectType) {
                        case 'processor':
                            break;
                        case 'connection':
                            my.dragEndConnection(canvasX, canvasY);
                            break;
                        case 'background':
                            break;
                    }
                    dragObjectType = null;
                    my.markDirty();
                }
            },
            
            /**
             * Set the theme colours of the processor canvas views.
             * @param {Object} theme Theme settings object.
             */
            setTheme = function(theme) {
                my.theme = theme;
                my.setThemeOnViews();
                my.setThemeOnConnections();
                my.markDirty();
            },
            
            /**
             * Enter or leave application connect mode.
             * @param {Boolean} isEnabled True to enable connect mode.
             */
            toggleConnectMode = function(isEnabled) {
                isConnectMode = isEnabled
                
                // show the canvas
                my.connectCanvas.dataset.show = isEnabled;
                
                if (isConnectMode) {
                    my.enterConnectMode();
                } else {
                    my.exitConnectMode();
                }
            },
            
            /**
             * Set a flag to indicate the static canvas should be redrawn.
             */
            markDirty = function() {
                isDirty = true;
            },
            
            /**
             * Update any tween animations that are going on and
             * redraw the canvases if needed.
             */
            draw = function() {
                TWEEN.update();
                let i,
                    views = my.getProcessorViews(),
                    n = views.length;
                if (isDirty) {
                    isDirty = false;
                    staticCtx.clearRect(0, 0, staticCanvas.width, staticCanvas.height);
                    dynamicCtx.clearRect(0, 0, staticCanvas.width, staticCanvas.height);
                    for (i = 0; i < n; i++) {
                        views[i].addToStaticView(staticCtx);
                    }
                }
                
                for (i = 0; i < n; i++) {
                    views[i].clearFromDynamicView(dynamicCtx);
                }
                for (i = 0; i < n; i++) {
                    views[i].addToDynamicView(dynamicCtx);
                }
            };
            
        my = my || {};
        my.theme;
        my.canvasRect;
        my.markDirty = markDirty;
        my.connectCanvas;
        my.connectCtx;
        
        that = WH.createCanvasProcessorsView(specs, my);
        that = WH.createCanvasConnectionsView(specs, my);
        that = WH.addWindowResize(specs, my);
        
        init();
        
        that.setTheme = setTheme;
        that.toggleConnectMode = toggleConnectMode;
        that.draw = draw;
        return that;
    }

    WH.createCanvasView = createCanvasView;

})(WH);
