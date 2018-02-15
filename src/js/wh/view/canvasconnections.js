/**
 * Canvas processor connector input and output points,
 * cables between the processor connectors,
 * Delete circles halfway the cables.
 * 
 * OFFLINE CANVAS
 * All connection lines are drawn on the offline canvas,
 * This happens when processors are created, deleted or moved,
 * or when Connect Mode is entered or exited.
 * 
 * The offline context is drawn on the static canvas.
 * It's the first thing that's drawn on the static canvas,
 * so that the connection lines appear behind the processors.
 * 
 * CONNECT CANVAS
 * All input and output connector circles are drawn on the connect canvas.
 * The currently dragged cable is also drawn on the canvas.
 * 
 * The connect canvas appears in front of the processors.
 */
export default function createCanvasConnectionsView(specs, my) {
    var that,
        store = specs.store,
        rootEl,
        connectorsCanvas,
        connectorsCtx,
        cablesCanvas,
        cablesCtx,
        activeCableCanvas,
        activeCableCtx,
        connectorCanvas,
        connectorCtx,
        cableData = {
            byId: {},
            allIds: []
        },
        cableHandleRadius = 10,
        connectorRadius = 12,
        sourceProcessorID,
        sourceConnectorID,
        dragData = {
            isDragging: false,
            startPoint: {x: 0, y: 0},
            endPoint: {x: 0, y: 0},
            lineColor: '#ccc',
            lineWidth: 1,
            lineWidthActive: 2
        },
    
        init = function() {
            rootEl = document.querySelector('.canvas-container');
            connectorsCanvas = document.querySelector('.canvas-connect');
            connectorsCtx = connectorsCanvas.getContext('2d');
            cablesCanvas = document.createElement('canvas');
            cablesCtx = cablesCanvas.getContext('2d');
            activeCableCanvas = document.createElement('canvas');
            activeCableCtx = activeCableCanvas.getContext('2d');

            document.addEventListener(store.STATE_CHANGE, (e) => {
                switch (e.detail.action.type) {
                    case e.detail.actions.TOGGLE_CONNECT_MODE:
                        toggleConnectMode(e.detail.state.connectModeActive);
                        drawConnectCanvas(e.detail.state);
                        drawCablesCanvas(e.detail.state);
                        break;
                    
                    case e.detail.actions.ADD_PROCESSOR:
                    case e.detail.actions.DELETE_PROCESSOR:
                    case e.detail.actions.DRAG_SELECTED_PROCESSOR:
                    case e.detail.actions.DRAG_ALL_PROCESSORS:
                    case e.detail.actions.CONNECT_PROCESSORS:
                    case e.detail.actions.DISCONNECT_PROCESSORS:
                        drawConnectCanvas(e.detail.state);
                        drawCablesCanvas(e.detail.state);
                        break;
                }
            });

            createConnectorGraphic();
            
            my.addWindowResizeCallback(onResize);
            onResize();
        },
        
        onResize = function() {
            connectorsCanvas.width = rootEl.clientWidth;
            connectorsCanvas.height = rootEl.clientHeight;
            cablesCanvas.width = rootEl.clientWidth;
            cablesCanvas.height = rootEl.clientHeight;
            activeCableCanvas.width = rootEl.clientWidth;
            activeCableCanvas.height = rootEl.clientHeight;
        },
        
        /**
         * Create the connector canvas once and use it for all 
         * processor input and output connectors.
         */
        createConnectorGraphic = function(theme) {
            const lineWidth = 2,
                size = (connectorRadius + lineWidth) * 2;

            connectorCanvas = document.createElement('canvas');
            connectorCanvas.width = size;
            connectorCanvas.height = size;

            connectorCtx = connectorCanvas.getContext('2d');
            connectorCtx.lineWidth = lineWidth;
            connectorCtx.strokeStyle = theme ? theme.colorHigh : '#333333';
            connectorCtx.setLineDash([4, 4]);

            connectorCtx.save();
            connectorCtx.translate(size / 2, size / 2);
            connectorCtx.arc(0, 0, size / 2, 0, Math.PI * 2, true);
            connectorCtx.stroke();
            connectorCtx.restore();
        },
        
        /**
         * Enter or leave application connect mode.
         * @param {Boolean} isEnabled True to enable connect mode.
         */
        toggleConnectMode = function(isEnabled) {
            my.isConnectMode = isEnabled
            
            // show the canvas
            connectorsCanvas.dataset.show = isEnabled;
            my.markDirty();
        },
        
        dragStartConnection = function(startX, startY, x, y) {
            dragData.isDragging = true;
            dragData.startPoint = {x: startX, y: startY};
            dragData.endPoint = {x: x, y: y};
            drawActiveCableCanvas();
        },
        
        dragMoveConnection = function(x, y) {
            dragData.endPoint = {x: x, y: y};
            drawActiveCableCanvas();
        },
        
        dragEndConnection = function() {
            dragData.isDragging = false;
            drawActiveCableCanvas();
        },
        
        setThemeOnConnections = function() {
            dragData.lineColor = my.theme.colorHigh || '#333';
            drawCablesCanvas();
            drawConnectCanvas();
        },
        
        intersectsConnector = function(x, y, isInput) {
            let isIntersect = false,
                isFound = false;
            store.getState().processors.allIds.forEach(id => {
                const processor = store.getState().processors.byId[id];
                const connectorData = processor[isInput ? 'inputs' : 'outputs'];
                connectorData.allIds.forEach(id => {
                    if (!isFound) {
                        const connectorX = processor.positionX + connectorData.byId[id].x,
                            connectorY = processor.positionY + connectorData.byId[id].y,
                            distance = Math.sqrt(Math.pow(x - connectorX, 2) + Math.pow(y - connectorY, 2));
                        isIntersect = distance <= connectorRadius;
                        if (isIntersect) {
                            isFound = true;
                            if (isInput) {
                                store.dispatch(store.getActions().connectProcessors({
                                    sourceProcessorID: sourceProcessorID, 
                                    sourceConnectorID: sourceConnectorID,
                                    destinationProcessorID: processor.id,
                                    destinationConnectorID: id
                                }));
                                sourceProcessorID = null;
                            } else {
                                sourceProcessorID = processor.id;
                                sourceConnectorID = id;
                                dragStartConnection(connectorX, connectorY, x, y);
                            }
                        }
                    }
                });
            });
            return isIntersect;
        },

        intersectsCableHandle = function(x, y) {
            for (let id of cableData.allIds) {
                const data = cableData.byId[id],
                    distance = Math.sqrt(Math.pow(x - data.handleX, 2) + Math.pow(y - data.handleY, 2));
                if (distance <= cableHandleRadius) {
                    return id;
                }
            };
            return null;
        },
        
        /**
         * All connection lines are drawn on the offline canvas,
         * This happens when processors are created, deleted or moved,
         * or when Connect Mode is entered or exited.
         */
        drawCablesCanvas = function(state) {
            cableData.byId = {};
            cableData.allIds = [];
            cablesCtx.clearRect(0, 0, cablesCanvas.width, cablesCanvas.height);
            cablesCtx.strokeStyle = '#cccccc';
            cablesCtx.beginPath();

            state.connections.allIds.forEach(connectionID => {
                const connection = state.connections.byId[connectionID];
                const sourceProcessor = state.processors.byId[connection.sourceProcessorID],
                    destinationProcessor = state.processors.byId[connection.destinationProcessorID],
                    sourceConnector = sourceProcessor.outputs.byId[connection.sourceConnectorID],
                    destinationConnector = destinationProcessor.inputs.byId[connection.destinationConnectorID];
                let handlePosition = drawCable(cablesCtx, {
                    x: sourceProcessor.positionX + sourceConnector.x,
                    y: sourceProcessor.positionY + sourceConnector.y
                }, {
                    x: destinationProcessor.positionX + destinationConnector.x,
                    y: destinationProcessor.positionY + destinationConnector.y
                });

                cableData.byId[connectionID] = {
                    handleX: handlePosition.x,
                    handleY: handlePosition.y
                };
                cableData.allIds.push(connectionID);
            });

            cablesCtx.stroke();
        },
        
        /**
         * Draw connector circles and currently dragged line on connectorsCanvas.
         */
        drawConnectCanvas = function(state) {
            connectorsCtx.clearRect(0, 0, connectorsCanvas.width, connectorsCanvas.height);

            if (state.connectModeActive) {
                state.processors.allIds.forEach(id => {
                    const processor = state.processors.byId[id];
                    processor.inputs.allIds.forEach(id => {
                        connectorsCtx.drawImage(connectorCanvas, 
                            processor.positionX + processor.inputs.byId[id].x - (connectorCanvas.width / 2), 
                            processor.positionY + processor.inputs.byId[id].y - (connectorCanvas.height / 2));
                    });
                    processor.outputs.allIds.forEach(id => {
                        connectorsCtx.drawImage(connectorCanvas, 
                            processor.positionX + processor.outputs.byId[id].x - (connectorCanvas.width / 2), 
                            processor.positionY + processor.outputs.byId[id].y - (connectorCanvas.height / 2));
                    });
                });
                my.markDirty();
            }
        },

        drawActiveCableCanvas = function() {
            activeCableCtx.clearRect(0, 0, activeCableCanvas.width, activeCableCanvas.height);
            if (dragData.isDragging) {
                activeCableCtx.lineWidth = 2;
                activeCableCtx.strokeStyle = dragData.lineColor;
                activeCableCtx.beginPath();
                drawCable(activeCableCtx, dragData.startPoint, dragData.endPoint);
                activeCableCtx.stroke();
            }
            my.markDirty();
        },
        
        /**
         * Draw a processor connection cable.
         * @param  {Object} startPoint {x, y} start coordinate.
         * @param  {Object} endPoint   {x, y} end coordinate.
         */
        drawCable = function(context, startPoint, endPoint) {
            // line
            const distance = Math.sqrt(Math.pow(startPoint.x - endPoint.x, 2) + Math.pow(startPoint.y - endPoint.y, 2)),
                tension = distance / 2,
                cp1x = startPoint.x,
                cp1y = startPoint.y + tension,
                cp2x = endPoint.x,
                cp2y = endPoint.y + tension;
            context.moveTo(startPoint.x, startPoint.y);
            context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endPoint.x, endPoint.y);
            
            // endpoint
            const radius = 5;
            context.moveTo(endPoint.x + radius, endPoint.y);
            context.arc(endPoint.x, endPoint.y, radius, 0, Math.PI * 2, true);
            
            return drawCableHandle(context, startPoint.x, startPoint.y, cp1x, cp1y, cp2x, cp2y, endPoint.x, endPoint.y);
        },
        
        /**
         * Draw select button halfway the bezier curved cable.
         * @see https://stackoverflow.com/questions/15397596/find-all-the-points-of-a-cubic-bezier-curve-in-javascript
         * @param  {Object} context The canvas context to draw on.
         * @param  {[type]} ax [description]
         * @param  {[type]} ay [description]
         * @param  {[type]} bx [description]
         * @param  {[type]} by [description]
         * @param  {[type]} cx [description]
         * @param  {[type]} cy [description]
         * @param  {[type]} dx [description]
         * @param  {[type]} dy [description]
         * @return {Object}    Canvas x, y coordinate.
         */
        drawCableHandle = function(context, ax, ay, bx, by, cx, cy, dx, dy) {
            const t = 0.5, // halfway the cable
                b0t = Math.pow(1 - t, 3),
                b1t = 3 * t * Math.pow(1 - t, 2),
                b2t = 3 * Math.pow(t, 2) * (1 - t),
                b3t = Math.pow(t, 3),
                pxt = (b0t * ax) + (b1t * bx) + (b2t * cx) + (b3t * dx),
                pyt = (b0t * ay) + (b1t * by) + (b2t * cy) + (b3t * dy);
            
            if (my.isConnectMode) {
                context.moveTo(pxt + cableHandleRadius, pyt);
                context.arc(pxt, pyt, cableHandleRadius, 0, Math.PI * 2, true);
            }
            
            return { x: pxt, y: pyt };
        },
        
        addConnectionsToCanvas = function(ctx) {
            ctx.drawImage(cablesCanvas, 0, 0);
            if (my.isConnectMode) {
                ctx.drawImage(connectorsCanvas, 0, 0);
                ctx.drawImage(activeCableCanvas, 0, 0);
            }
        };

    my = my || {};
    my.isConnectMode = false,
    my.dragMoveConnection = dragMoveConnection;
    my.dragEndConnection = dragEndConnection;
    my.intersectsConnector = intersectsConnector;
    my.intersectsCableHandle = intersectsCableHandle;
    my.setThemeOnConnections = setThemeOnConnections;
    my.addConnectionsToCanvas = addConnectionsToCanvas;
    
    that = specs.that || {};
    
    init();
    
    return that;
}
