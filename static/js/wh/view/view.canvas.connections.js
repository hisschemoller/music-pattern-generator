/**
 * 
 */

window.WH = window.WH || {};

(function (WH) {

    function createCanvasConnectionsView(specs, my) {
        var that,
            rootEl,
            connectCanvas,
            connectCtx,
            offlineCanvas,
            offlineCtx,
            inConnectors,
            outConnectors,
            dragData = {
                startPoint: {x: 0, y: 0},
                endPoint: {x: 0, y: 0},
                lineColor: 0,
                lineWidth: 1,
                lineWidthActive: 2
            },
        
            init = function() {
                rootEl = document.querySelector('.canvas-container');
                connectCanvas = document.querySelector('.canvas-connect');
                connectCtx = connectCanvas.getContext('2d');
                offlineCanvas = document.createElement('canvas');
                offlineCtx = offlineCanvas.getContext('2d');
                
                my.addWindowResizeCallback(onResize);
                onResize();
            },
            
            onResize = function() {
                connectCanvas.width = rootEl.clientWidth;
                connectCanvas.height = rootEl.clientHeight;
                offlineCanvas.width = rootEl.clientWidth;
                offlineCanvas.height = rootEl.clientHeight;
            },
            
            /**
             * Enter or leave application connect mode.
             * @param {Boolean} isEnabled True to enable connect mode.
             */
            toggleConnectMode = function(isEnabled) {
                my.isConnectMode = isEnabled
                
                // show the canvas
                connectCanvas.dataset.show = isEnabled;
            },
            
            dragStartConnection = function(processorView, x, y) {
                dragData.isDragging = true;
                dragData.startPoint = processorView.getOutConnectorPoint();
                dragData.endPoint = {x: x, y: y};
                drawConnections();
            },
            
            dragMoveConnection = function(x, y) {
                dragData.endPoint = {x: x, y: y};
                drawConnections();
            },
            
            dragEndConnection = function() {
                dragData.isDragging = false;
                drawConnections();
            },
            
            setThemeOnConnections = function(theme) {
                dragData.lineColor = theme.colorHigh || '#333';
                drawConnections();
            },
            
            drawConnections = function() {
                connectCtx.clearRect(0, 0, connectCanvas.width, connectCanvas.height);
                
                // show inputs and outputs
                inConnectors = {};
                outConnectors = {};
                const views = my.getProcessorViews(),
                    n = views.length; 
                for (let i = 0, view, processor, viewInfo, viewPos, graphic; i < n; i++) {
                    view = views[i];
                    processor = view.getProcessor();
                    viewInfo = processor.getInfo();
                    viewPos = view.getPosition2d();
                    if (viewInfo.inputs == 1) {
                        graphic = view.getInConnectorGraphic();
                        connectCtx.drawImage(graphic.canvas, graphic.x, graphic.y);
                        inConnectors[processor.getID()] = view.getInConnectorPoint();
                    }
                    if (viewInfo.outputs == 1) {
                        graphic = view.getOutConnectorGraphic();
                        connectCtx.drawImage(graphic.canvas, graphic.x, graphic.y);
                        outConnectors[processor.getID()] = view.getOutConnectorPoint();
                    }
                }
                
                // show cables
                let processor, sourceID, destinationID, destinations, numDestinations;
                for (let i = 0; i < n; i++) {
                    processor = views[i].getProcessor();
                    sourceID = processor.getID();
                    destinations = processor.getDestinations instanceof Function ? processor.getDestinations() : [],
                    numDestinations = destinations.length;
                    for (let j = 0; j < numDestinations; j++) {
                        destinationID = destinations[j].getID();
                        drawCable(outConnectors[sourceID], inConnectors[destinationID]);
                    }
                }
                
                // cable currently being dragged
                if (dragData.isDragging) {
                    drawCable(dragData.startPoint, dragData.endPoint);
                }
            },
            
            addConnectionsToCanvas = function(ctx) {
                
            },
            
            drawCable = function(startPoint, endPoint) {
                const distance = Math.sqrt(Math.pow(startPoint.x - endPoint.x, 2) + Math.pow(startPoint.y - endPoint.y, 2)),
                    tension = distance / 2,
                    cp1x = startPoint.x,
                    cp1y = startPoint.y + tension,
                    cp2x = endPoint.x,
                    cp2y = endPoint.y + tension;
                connectCtx.lineWidth = dragData.lineWidth;
                connectCtx.strokeStyle = dragData.lineColor;
                connectCtx.beginPath();
                connectCtx.moveTo(startPoint.x, startPoint.y);
                connectCtx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endPoint.x, endPoint.y);
                connectCtx.stroke();
            };
    
        my = my || {};
        my.isConnectMode = false,
        my.dragStartConnection = dragStartConnection;
        my.dragMoveConnection = dragMoveConnection;
        my.dragEndConnection = dragEndConnection;
        my.setThemeOnConnections = setThemeOnConnections;
        my.drawConnections = drawConnections;
        my.addConnectionsToCanvas = addConnectionsToCanvas;
        
        that = specs.that || {};
        
        init();
        
        that.toggleConnectMode = toggleConnectMode;
        return that;
    };

WH.createCanvasConnectionsView = createCanvasConnectionsView;

})(WH);