/**
 * 
 */

window.WH = window.WH || {};

(function (WH) {

    function createCanvasConnectionsView(specs, my) {
        var that,
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
                inConnectors = [];
                outConnectors = [];
                const views = my.getProcessorViews(),
                    n = views.length; 
                for (let i = 0, view, viewInfo, viewPos, graphic; i < n; i++) {
                    view = views[i];
                    viewInfo = view.getProcessor().getInfo();
                    viewPos = view.getPosition2d();
                    if (viewInfo.inputs == 1) {
                        graphic = view.getInConnectorGraphic();
                        my.connectCtx.drawImage(graphic.canvas, graphic.x, graphic.y);
                    }
                    if (viewInfo.outputs == 1) {
                        graphic = view.getOutConnectorGraphic();
                        my.connectCtx.drawImage(graphic.canvas, graphic.x, graphic.y);
                    }
                }
                
                if (dragData.isDragging) {
                    my.connectCtx.lineWidth = dragData.lineWidth;
                    my.connectCtx.strokeStyle = dragData.lineColor;
                    my.connectCtx.beginPath();
                    my.connectCtx.moveTo(dragData.startPoint.x, dragData.startPoint.y);
                    my.connectCtx.lineTo(dragData.endPoint.x, dragData.endPoint.y);
                    my.connectCtx.stroke();
                }
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