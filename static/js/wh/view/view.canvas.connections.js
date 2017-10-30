/**
 * 
 */

window.WH = window.WH || {};

(function (WH) {

    function createCanvasConnectionsView(specs, my) {
        var that,
        
            init = function() {
            },
            
            enterConnectMode = function() {
                drawConnections();
            },
            
            exitConnectMode = function() {
            },
            
            
            intersectsOutConnector = function(x, y) {
            },
            
            setThemeOnConnections = function(theme) {
                drawConnections();
            },
            
            drawConnections = function() {
                my.connectCtx.clearRect(0, 0, my.connectCanvas.width, my.connectCanvas.height);
                
                // show inputs and outputs
                for (let i = 0, view, viewInfo, viewPos, graphic; i < my.numViews; i++) {
                    view = my.views[i];
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
            };
    
        my = my || {};
        my.enterConnectMode = enterConnectMode;
        my.exitConnectMode = exitConnectMode;
        my.intersectsOutConnector = intersectsOutConnector;
        my.setThemeOnConnections = setThemeOnConnections;
        my.drawConnections = drawConnections;
        
        that = specs.that || {};
        
        init();
        
        return that;
    };

WH.createCanvasConnectionsView = createCanvasConnectionsView;

})(WH);