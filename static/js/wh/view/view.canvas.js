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
            store = specs.store,
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
            dragObjectType, // 'background|processor|connection'
            
            init = function() {
                rootEl = document.querySelector('.canvas-container');
                staticCanvas = document.querySelector('.canvas-static');
                dynamicCanvas = document.querySelector('.canvas-dynamic');
                staticCtx = staticCanvas.getContext('2d');
                dynamicCtx = dynamicCanvas.getContext('2d');
                
                rootEl.addEventListener(WH.util.eventType.click, onClick);
                rootEl.addEventListener(WH.util.eventType.start, onTouchStart);
                rootEl.addEventListener(WH.util.eventType.move, dragMove);
                rootEl.addEventListener(WH.util.eventType.end, dragEnd);

                document.addEventListener(store.STATE_CHANGE, (e) => {
                    const themeName = e.detail.state.preferences.isDarkTheme ? 'dark' : '';
                    setTheme(themeName);
                });
                
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
                        onClick();
                    }, doubleClickDelay);
                } else {
                    clearTimeout(doubleClickTimer);
                    doubleClickCounter = 0;
                    // implement double click behaviour here
                    onDoubleClick(e);
                }
            },
            
            /**
             * [description]
             * @param  {[type]} e [description]
             */
            onClick = function(e) {
                
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
                
                if (my.isConnectMode && my.intersectsOutConnector(canvasX, canvasY)) {
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
                        case 'connection':
                            my.dragMoveConnection(canvasX, canvasY);
                            break;
                        case 'processor':
                            my.dragSelectedProcessor(canvasX, canvasY);
                            my.updateConnectorsInfo();
                            my.drawOfflineCanvas();
                            break;
                        case 'background':
                            my.dragAllProcessors(canvasX, canvasY);
                            my.updateConnectorsInfo();
                            my.drawOfflineCanvas();
                            break;
                    }
                    
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
                        case 'connection':
                            my.intersectsInConnector(canvasX, canvasY);
                            break;
                        case 'processor':
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
             * @param {String} theme Theme name, 'dark' or ''.
             */
            setTheme = function(theme) {
                // possibly have to set theme data attribute first
                var themeStyles = window.getComputedStyle(document.querySelector('[data-theme]'));

                my.theme = {
                    colorHigh: themeStyles.getPropertyValue('--text-color'),
                    colorMid: themeStyles.getPropertyValue('--border-color'),
                    colorLow: themeStyles.getPropertyValue('--panel-bg-color')
                };
                my.setThemeOnViews();
                my.setThemeOnConnections();
                my.markDirty();
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
                    my.addConnectionsToCanvas(staticCtx);
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
        my.canvasRect,
        my.markDirty = markDirty;
        
        that = WH.addWindowResize(specs, my);
        that = WH.createCanvasProcessorsView(specs, my);
        that = WH.createCanvasConnectionsView(specs, my);
        
        init();
        
        that.setTheme = setTheme;
        that.draw = draw;
        return that;
    }

    WH.createCanvasView = createCanvasView;

})(WH);
