import { getProcessorByID } from '../state/selectors';

/**
 * Manages the canvas views of the processors in the network.
 * - Processor view lifecycle.
 * - Processor view user interaction, itersection with (mouse) point.
 * - Processor view dragging.
 * - Processor view theme changes.
 */
export default function createCanvasProcessorViews(specs, my) {
    var that,
        store = specs.store,
        views = [],
        dragOffsetX,
        dragOffsetY,

        setProcessorViews = function(newProcessors) {
            clearProcessorViews();
            createProcessorViews(newProcessors);
        },

        clearProcessorViews = function() {
            let type,
            n = views.length;
            while (--n >= 0) {
                type = views[n].getType();
                if (type !== 'input' && type !== 'output') {
                    deleteProcessorView(views[n].getID());
                }
            }
        },
        
        /**
         * Create canvas 2D object if it exists for the type.
         * @param  {Array} data Array of current processors' state.
         */
        createProcessorViews = function(processors) {
            processors.allIds.forEach((id, i) => {
                const processorData = processors.byId[id];
                if (!views[i] || (id !== views[i].getID())) {
                    const module = require(`../processors/${processorData.type}/graphic`);
                    const view = module.createGraphic({ 
                        data: processorData,
                        store: store,
                        canvasDirtyCallback: my.markDirty
                    });
                    views.splice(i, 0, view);
                }
            });
        },

        selectProcessorView = function(id) {
            views.forEach(view => {
                if (typeof view.setSelected === 'function') {
                    view.setSelected(view.getID() === id);
                }
            });
        },
        
        /**
         * Delete canvas 2D object when the processor is deleted.
         * @param  {Object} processor MIDI processor for which the 3D object will be a view.
         */
        deleteProcessorView = function(id) {
            let i = views.length;
            while (--i >= 0) {
                if (views[i].getID() === id) {
                    views[i].terminate();
                    views.splice(i, 1);
                    // my.updateConnectorsInfo();
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
            for (let i = views.length - 1; i >= 0; i--) {
                if (views[i].intersectsWithPoint(x, y, 'processor')) {
                    isIntersect = true;
                    store.dispatch(store.getActions().selectProcessor(views[i].getID()));
                    // start dragging the view's graphic
                    let pos2d = views[i].getPosition2d();
                    dragOffsetX = x - pos2d.x;
                    dragOffsetY = y - pos2d.y;
                    break;
                }
            }
            return isIntersect;
        },
        
        dragSelectedProcessor = function(x, y) {
            store.dispatch(store.getActions().dragSelectedProcessor(x - dragOffsetX, y - dragOffsetY));
        },
        
        dragAllProcessors = function(x, y) {
            let newX = x - dragOffsetX,
                newY = y - dragOffsetY;
            dragOffsetX = x;
            dragOffsetY = y;
            store.dispatch(store.getActions().dragAllProcessors(newX, newY));
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
    my.setProcessorViews = setProcessorViews;
    my.createProcessorViews = createProcessorViews;
    my.selectProcessorView = selectProcessorView;
    my.deleteProcessorView = deleteProcessorView;
    my.intersectsProcessor = intersectsProcessor;
    my.dragSelectedProcessor = dragSelectedProcessor;
    my.dragAllProcessors = dragAllProcessors;
    my.getProcessorViews = getProcessorViews;
    my.setThemeOnViews = setThemeOnViews;
    
    that = specs.that || {};
    
    return that;
}
