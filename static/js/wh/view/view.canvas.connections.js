/**
 * 
 */

window.WH = window.WH || {};

(function (WH) {

    function createCanvasConnectionsView(specs, my) {
        var that,
            inConnectors,
            outConnectors,
            dragData = {
                startPoint: {x: 0, y: 0},
                endPoint: {x: 0, y: 0},
                lineColor: 0,
                lineWidth: 2
            },
        
            init = function() {
            },
            
            enterConnectMode = function() {
                drawConnections();
            },
            
            exitConnectMode = function() {
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
                my.connectCtx.clearRect(0, 0, my.connectCanvas.width, my.connectCanvas.height);
                
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
                        my.connectCtx.drawImage(graphic.canvas, graphic.x, graphic.y);
                        inConnectors[processor.getID()] = view.getInConnectorPoint();
                    }
                    if (viewInfo.outputs == 1) {
                        graphic = view.getOutConnectorGraphic();
                        my.connectCtx.drawImage(graphic.canvas, graphic.x, graphic.y);
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
            
            drawCable = function(startPoint, endPoint) {
                const distance = Math.sqrt(Math.pow(startPoint.x - endPoint.x, 2) + Math.pow(startPoint.y - endPoint.y, 2)),
                    tension = distance / 2,
                    cp1x = startPoint.x,
                    cp1y = startPoint.y + tension,
                    cp2x = endPoint.x,
                    cp2y = endPoint.y + tension;
                my.connectCtx.lineWidth = dragData.lineWidth;
                my.connectCtx.strokeStyle = dragData.lineColor;
                my.connectCtx.beginPath();
                my.connectCtx.moveTo(startPoint.x, startPoint.y);
                my.connectCtx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endPoint.x, endPoint.y);
                my.connectCtx.stroke();
            };
    
        my = my || {};
        my.enterConnectMode = enterConnectMode;
        my.exitConnectMode = exitConnectMode;
        my.dragStartConnection = dragStartConnection;
        my.dragMoveConnection = dragMoveConnection;
        my.dragEndConnection = dragEndConnection;
        my.setThemeOnConnections = setThemeOnConnections;
        my.drawConnections = drawConnections;
        
        that = specs.that || {};
        
        init();
        
        return that;
    };

WH.createCanvasConnectionsView = createCanvasConnectionsView;

})(WH);