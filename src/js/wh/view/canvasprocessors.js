/**
 * Manages the canvas views of the processors in the network.
 * - Processor view lifecycle.
 * - Processor view user interaction, itersection with (mouse) point.
 * - Processor view dragging.
 * - Processor view theme changes.
 */
export default function createCanvasProcessorViews(specs, my) {
    var that,
        midiNetwork = specs.midiNetwork,
        views = [],
        numViews = 0,
        selectedView,
        connectionSourceProcessor,
        dragOffsetX,
        dragOffsetY,
        
        /**
         * Create canvas 2D object if it exists for the type.
         * @param  {Array} data Array of current processors' state.
         */
        createProcessorViews = function(state) {
            state.forEach((data, i) => {
                if (!views[i] || (data.id !== views[i].getID())) {
                    const module = require(`../processors/${data.type}/graphic`);
                    const view = module.createGraphic({ 
                        data: data,
                        canvasDirtyCallback: my.markDirty
                    });
                    views.splice(i, 0, view);
                }
            });


            return;





            let view,
                specs = {
                    processor: processor,
                    canvasDirtyCallback: my.markDirty
                };
            
            switch (processor.getType()) {
                case 'epg':
                    view = WH.midiProcessors[processor.getType()].createCanvasView(specs);
                    break;
                case 'output':
                    specs.initialPosition = {x: my.canvasRect.width / 2, y: my.canvasRect.height - 70};
                    view = WH.midiProcessors[processor.getType()].createCanvasView(specs);
                    break;
            }
            
            views.push(view);
            numViews = views.length;
            
            // set theme on the new view
            if (my.theme && typeof view.setTheme == 'function') {
                view.setTheme(my.theme);
            }
            
            my.updateConnectorsInfo();
        },
        
        /**
         * Delete canvas 2D object when the processor is deleted.
         * @param  {Object} processor MIDI processor for which the 3D object will be a view.
         */
        deleteProcessorView = function(processor) {
            let i = numViews;
            while (--i >= 0) {
                if (views[i].getProcessor() === processor) {
                    views[i].terminate();
                    views.splice(i, 1);
                    numViews = views.length;
                    my.updateConnectorsInfo();
                    my.markDirty();
                    return;
                }
            }
        },
        
        /**
         * Check and handle intersection of point with view.
         * @param  {Number} x Canvas X coordinate.
         * @param  {Number} y Canvas Y coordinate.
         * @return {Boolean} True if intersects.
         */
        intersectsProcessor = function(x, y) {
            let isIntersect = false;
            dragOffsetX = x;
            dragOffsetY = y;
            for (let i = numViews - 1; i >= 0; i--) {
                if (views[i].intersectsWithPoint(x, y, 'processor')) {
                    isIntersect = true;
                    selectedView = views[i];
                    // select the found view's processor
                    midiNetwork.selectProcessor(selectedView.getProcessor());
                    // start dragging the view's graphic
                    let position2d = selectedView.getPosition2d();
                    dragOffsetX = x - position2d.x;
                    dragOffsetY = y - position2d.y;
                    break;
                }
            }
            return isIntersect;
        },
        
        intersectsInConnector = function(x, y) {
            for (let i = 0; i < numViews; i++) {
                if (views[i].intersectsWithPoint(x, y, 'inconnector')) {
                    const destinationProcessor = views[i].getProcessor();
                    midiNetwork.connectProcessors(connectionSourceProcessor, destinationProcessor);
                    break;
                }
            }
            my.dragEndConnection();
        },
        
        intersectsOutConnector = function(x, y) {
            for (let i = 0; i < numViews; i++) {
                if (views[i].intersectsWithPoint(x, y, 'outconnector')) {
                    connectionSourceProcessor = views[i].getProcessor();
                    my.dragStartConnection(views[i], x, y);
                    return true;
                }
            }
            return false;
        },
        
        dragSelectedProcessor = function(x, y) {
            selectedView.setPosition2d({
                x: x - dragOffsetX,
                y: y - dragOffsetY
            });
        },
        
        dragAllProcessors = function(x, y) {
            // drag background, so all views
            let newX = x - dragOffsetX,
                newY = y - dragOffsetY;
            dragOffsetX = x;
            dragOffsetY = y;
            for (let i = 0, view, position2d; i < numViews; i++) {
                view = views[i];
                position2d = view.getPosition2d();
                view.setPosition2d({
                    x: position2d.x + newX,
                    y: position2d.y + newY
                });
            }
        },
        
        getProcessorViews = function() {
            return views;
        },
        
        /**
         * Update all processor views with changed theme.
         */
        setThemeOnViews = function() {
            for (let i = 0, n = views.length; i < n; i++) {
                if (views[i].setTheme instanceof Function) {
                    views[i].setTheme(my.theme);
                }
            }
        };

    my = my || {};
    my.createProcessorViews = createProcessorViews;
    my.intersectsProcessor = intersectsProcessor;
    my.intersectsInConnector = intersectsInConnector;
    my.intersectsOutConnector = intersectsOutConnector;
    my.dragSelectedProcessor = dragSelectedProcessor;
    my.dragAllProcessors = dragAllProcessors;
    my.getProcessorViews = getProcessorViews;
    my.setThemeOnViews = setThemeOnViews;
    
    that = specs.that || {};
    
    // that.createProcessorView = createProcessorView;
    // that.deleteProcessorView = deleteProcessorView;
    return that;
}
            