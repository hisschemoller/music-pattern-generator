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
                isDragging: false,
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
                
                drawOfflineCanvas();
                
                if (my.isConnectMode) {
                    drawConnectCanvas();
                }
            },
            
            dragStartConnection = function(processorView, x, y) {
                dragData.isDragging = true;
                dragData.startPoint = processorView.getOutConnectorPoint();
                dragData.endPoint = {x: x, y: y};
                drawOfflineCanvas();
            },
            
            dragMoveConnection = function(x, y) {
                dragData.endPoint = {x: x, y: y};
                drawOfflineCanvas();
            },
            
            dragEndConnection = function() {
                dragData.isDragging = false;
                drawOfflineCanvas();
            },
            
            setThemeOnConnections = function(theme) {
                dragData.lineColor = theme.colorHigh || '#333';
                drawOfflineCanvas();
                drawConnectCanvas();
            },
            
            updateConnectorsInfo = function() {
                // clear the old info
                inConnectors = {};
                outConnectors = {};
                
                // loop over all processor views to collect current info
                const views = my.getProcessorViews(),
                    n = views.length; 
                for (let i = 0, view, processor, viewInfo, viewPos, graphic; i < n; i++) {
                    view = views[i];
                    processor = view.getProcessor();
                    viewInfo = processor.getInfo();
                    viewPos = view.getPosition2d();
                    if (viewInfo.inputs == 1) {
                        inConnectors[processor.getID()] = {
                            point: view.getInConnectorPoint(),
                            graphic: view.getInConnectorGraphic()
                        }
                    }
                    if (viewInfo.outputs == 1) {
                        outConnectors[processor.getID()] = {
                            point: view.getOutConnectorPoint(),
                            graphic: view.getOutConnectorGraphic()
                        }
                    }
                }
                
                if (my.isConnectMode) {
                    drawConnectCanvas();
                }
            },
            
            /**
             * All connection lines are drawn on the offline canvas,
             * This happens when processors are created, deleted or moved,
             * or when Connect Mode is entered or exited.
             */
            drawOfflineCanvas = function() {
                offlineCtx.clearRect(0, 0, offlineCanvas.width, offlineCanvas.height);
                
                const lineWidth = my.isConnectMode ? dragData.lineWidthActive : dragData.lineWidth;
                
                // show cables
                const views = my.getProcessorViews(),
                    n = views.length; 
                let processor, sourceID, destinationID, destinations, numDestinations;
                offlineCtx.lineWidth = lineWidth;
                offlineCtx.strokeStyle = dragData.lineColor;
                offlineCtx.beginPath();
                for (let i = 0; i < n; i++) {
                    processor = views[i].getProcessor();
                    sourceID = processor.getID();
                    destinations = processor.getDestinations instanceof Function ? processor.getDestinations() : [],
                    numDestinations = destinations.length;
                    for (let j = 0; j < numDestinations; j++) {
                        destinationID = destinations[j].getID();
                        drawCable(outConnectors[sourceID].point, inConnectors[destinationID].point);
                    }
                }
                
                // cable currently being dragged
                if (dragData.isDragging) {
                    drawCable(dragData.startPoint, dragData.endPoint);
                }
                
                offlineCtx.stroke();
            },
            
            /**
             * Draw a processor connection cable.
             * @param  {Object} startPoint {x, y} start coordinate.
             * @param  {Object} endPoint   {x, y} end coordinate.
             */
            drawCable = function(startPoint, endPoint) {
                // line
                const distance = Math.sqrt(Math.pow(startPoint.x - endPoint.x, 2) + Math.pow(startPoint.y - endPoint.y, 2)),
                    tension = distance / 2,
                    cp1x = startPoint.x,
                    cp1y = startPoint.y + tension,
                    cp2x = endPoint.x,
                    cp2y = endPoint.y + tension;
                offlineCtx.moveTo(startPoint.x, startPoint.y);
                offlineCtx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endPoint.x, endPoint.y);
                
                // endpoint
                const radius = 3;
                offlineCtx.arc(endPoint.x, endPoint.y, radius * 2, 0, Math.PI * 2, true);
            },
            
            addConnectionsToCanvas = function(ctx) {
                ctx.drawImage(offlineCanvas, 0, 0);
                ctx.drawImage(connectCanvas, 0, 0);
            },
            
            /**
             * Draw connector circles and currently dragged line on connectCanvas.
             */
            drawConnectCanvas = function() {
                connectCtx.clearRect(0, 0, connectCanvas.width, connectCanvas.height);
                
                // show inputs and outputs
                let graphic;
                for (id in inConnectors) {
                    if (inConnectors.hasOwnProperty(id)) {
                        graphic = inConnectors[id].graphic;
                        connectCtx.drawImage(graphic.canvas, graphic.x, graphic.y);
                    }
                }
                for (id in outConnectors) {
                    if (outConnectors.hasOwnProperty(id)) {
                        graphic = outConnectors[id].graphic;
                        connectCtx.drawImage(graphic.canvas, graphic.x, graphic.y);
                    }
                }
            };
            
            // drawConnections = function() {
            //     connectCtx.clearRect(0, 0, connectCanvas.width, connectCanvas.height);
            //     
            //     // show inputs and outputs
            //     inConnectors = {};
            //     outConnectors = {};
            //     const views = my.getProcessorViews(),
            //         n = views.length; 
            //     for (let i = 0, view, processor, viewInfo, viewPos, graphic; i < n; i++) {
            //         view = views[i];
            //         processor = view.getProcessor();
            //         viewInfo = processor.getInfo();
            //         viewPos = view.getPosition2d();
            //         if (viewInfo.inputs == 1) {
            //             graphic = view.getInConnectorGraphic();
            //             connectCtx.drawImage(graphic.canvas, graphic.x, graphic.y);
            //             inConnectors[processor.getID()] = view.getInConnectorPoint();
            //         }
            //         if (viewInfo.outputs == 1) {
            //             graphic = view.getOutConnectorGraphic();
            //             connectCtx.drawImage(graphic.canvas, graphic.x, graphic.y);
            //             outConnectors[processor.getID()] = view.getOutConnectorPoint();
            //         }
            //     }
            //     
            //     // show cables
            //     let processor, sourceID, destinationID, destinations, numDestinations;
            //     for (let i = 0; i < n; i++) {
            //         processor = views[i].getProcessor();
            //         sourceID = processor.getID();
            //         destinations = processor.getDestinations instanceof Function ? processor.getDestinations() : [],
            //         numDestinations = destinations.length;
            //         for (let j = 0; j < numDestinations; j++) {
            //             destinationID = destinations[j].getID();
            //             drawCable(outConnectors[sourceID], inConnectors[destinationID]);
            //         }
            //     }
            //     
            //     // cable currently being dragged
            //     if (dragData.isDragging) {
            //         drawCable(dragData.startPoint, dragData.endPoint);
            //     }
            // };
    
        my = my || {};
        my.isConnectMode = false,
        my.dragStartConnection = dragStartConnection;
        my.dragMoveConnection = dragMoveConnection;
        my.dragEndConnection = dragEndConnection;
        my.setThemeOnConnections = setThemeOnConnections;
        my.updateConnectorsInfo = updateConnectorsInfo;
        my.drawOfflineCanvas = drawOfflineCanvas;
        my.addConnectionsToCanvas = addConnectionsToCanvas;
        
        that = specs.that || {};
        
        init();
        
        that.toggleConnectMode = toggleConnectMode;
        return that;
    };

WH.createCanvasConnectionsView = createCanvasConnectionsView;

})(WH);