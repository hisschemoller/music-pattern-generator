import { util } from '../core/util';
import addWindowResize from './windowresize';
import createCanvasProcessorViews from './canvasprocessors';
import createCanvasConnectionsView from './canvasconnections';
import TWEEN from '@tweenjs/tween.js';

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
 */
export default function createCanvasView(specs, my) {
    var that,
        store = specs.store,
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
            
            rootEl.addEventListener(util.eventType.click, onClick);
            rootEl.addEventListener(util.eventType.start, onTouchStart);
            rootEl.addEventListener(util.eventType.move, dragMove);
            rootEl.addEventListener(util.eventType.end, dragEnd);

            document.addEventListener(store.STATE_CHANGE, (e) => {
                switch (e.detail.action.type) {
                    case e.detail.actions.NEW_PROJECT:
                    case e.detail.actions.SET_PROJECT:
                        my.setProcessorViews(e.detail.state.processors);
                        my.selectProcessorView(e.detail.state.selectedID);
                        my.markDirty();
                        break;
                    
                    case e.detail.actions.ADD_PROCESSOR:
                        my.createProcessorViews(e.detail.state.processors);
                        break;
                    
                    case e.detail.actions.DELETE_PROCESSOR:
                        my.deleteProcessorView(e.detail.action.id);
                        break;
                    
                    case e.detail.actions.SELECT_PROCESSOR:
                        my.selectProcessorView(e.detail.state.selectedID);
                        break;
                    
                    case e.detail.actions.DRAG_SELECTED_PROCESSOR:
                    case e.detail.actions.DRAG_ALL_PROCESSORS:
                        my.markDirty();
                        break;
                }
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
            my.resizeConnections();
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
            store.dispatch(store.getActions().createProcessor({
                type: 'epg',
                positionX: e.clientX - my.canvasRect.left + window.scrollX,
                positionY: e.clientY - my.canvasRect.top + window.scrollY
            }));
        },
        
        /**
         * Select the object under the mouse.
         * Start dragging the object.
         */
        onTouchStart = function(e) {
            let canvasX = e.clientX - my.canvasRect.left + window.scrollX,
                canvasY = e.clientY - my.canvasRect.top + window.scrollY;
            
            if (my.isConnectMode && my.intersectsCableHandle(canvasX, canvasY)) {
                dragObjectType = 'cablehandle';
            } else if (my.isConnectMode && my.intersectsConnector(canvasX, canvasY, false)) {
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
                        break;
                    case 'background':
                        my.dragAllProcessors(canvasX, canvasY);
                        break;
                }
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
                        my.intersectsConnector(canvasX, canvasY, true);
                        my.dragEndConnection();
                        break;
                    case 'processor':
                        break;
                    case 'background':
                        break;
                    case 'cablehandle':
                        const connectionID = my.intersectsCableHandle(canvasX, canvasY);
                        if (connectionID) {
                            store.dispatch(store.getActions().disconnectProcessors(connectionID));
                        }
                        break;
                }
                dragObjectType = null;
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
         * @param {Number} position Transport playback position in ticks.
         * @param {Array} processorEvents Array to processor generated events to displayin the view.
         */
        draw = function(position, processorEvents) {
            TWEEN.update();
            let i,
                views = my.getProcessorViews(),
                n = views.length;
            for (i = 0; i < n; i++) {
                views[i].draw(position, processorEvents);
            }
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
    
    that = addWindowResize(specs, my);
    that = createCanvasProcessorViews(specs, my);
    that = createCanvasConnectionsView(specs, my);
    
    init();
    
    that.draw = draw;
    return that;
}
