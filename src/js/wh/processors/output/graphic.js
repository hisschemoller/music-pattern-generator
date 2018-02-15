import createCanvasProcessorBaseView from '../../view/canvasprocessorbase';
import { getMIDIPortByID } from '../../state/selectors';

/**
 * MIDI output object drawn on canvas.
 */
export function createGraphic(specs, my) {
    let that,
        canvasDirtyCallback = specs.canvasDirtyCallback,
        connectorCanvas = specs.connectorCanvas,
        staticCanvas,
        staticCtx,
        nameCanvas,
        nameCtx,
        lineWidth = 2,
        
        initialise = function() {
            // offscreen canvas for static shapes
            const width = 100,
                height = 50,
                radius = 10,
                boxWidth = 80;
            staticCanvas = document.createElement('canvas');
            staticCanvas.height = height;
            staticCanvas.width = width;
            staticCtx = staticCanvas.getContext('2d');
            staticCtx.lineWidth = lineWidth;
            staticCtx.strokeStyle = my.colorHigh;
            staticCtx.clearRect(0, 0, width, height);
            staticCtx.save();
            staticCtx.translate(width / 2, height / 2 - 10);
            staticCtx.beginPath();
            // box
            staticCtx.rect(-boxWidth / 2, -radius, boxWidth, radius * 2);
            // arrow
            staticCtx.moveTo(-boxWidth / 2, radius);
            staticCtx.lineTo(0, radius + 20)
            staticCtx.lineTo(boxWidth / 2, radius);
            // circle
            staticCtx.moveTo(radius, 0);
            staticCtx.arc(0, 0, radius, 0, Math.PI * 2, true);
            staticCtx.stroke();
            staticCtx.restore90;
            
            // offscreen canvas for the name
            nameCanvas = document.createElement('canvas');
            nameCanvas.height = 40;
            nameCanvas.width = 200;
            nameCtx = nameCanvas.getContext('2d');
            nameCtx.fillStyle = my.colorMid;
            nameCtx.font = '14px sans-serif';
            nameCtx.textAlign = 'center';
            nameCtx.fillText(getMIDIPortByID(specs.data.portID).name, nameCanvas.width / 2, nameCanvas.height / 2);
            
            updatePosition(specs.data.positionX, specs.data.positionY);
        },
        
        /**
         * Called before this view is deleted.
         */
        terminate = function() {
            canvasDirtyCallback = null;
        },

        setSelected = function(isSelected) {
            console.log('TODO: setSelected');
        },

        draw = function() {},
        
        /**
         * Update pattern's position on the 2D canvas.
         * @param  {Object} value New 2D position as object.
         */
        updatePosition = function(x, y) {
            my.positionX = x;
            my.positionY = y;
            canvasDirtyCallback();
        },
        
        addToStaticView = function(mainStaticCtx) {
            mainStaticCtx.drawImage(
                staticCanvas,
                my.positionX - 50,
                my.positionY - 15);
                
            mainStaticCtx.drawImage(
                nameCanvas,
                my.positionX - (nameCanvas.width / 2),
                my.positionY + 30);
        },
        
        addToDynamicView = function(mainDynamicCtx) {
        },
        
        /**
         * Clear all this pattern's elements from the dynamic context.
         * These are the center dot, necklace dots and pointer.
         * @param  {Object} mainDynamicCtx 2D canvas context.
         */
        clearFromDynamicView = function(mainDynamicCtx) {
        },
        
        /**
         * Test if a coordinate intersects with the graphic's hit area.
         * @param  {Number} x Horizontal coordinate.
         * @param  {Number} y Vertical coordinate.
         * @param  {String} type Hit area type, 'processor|inconnector|outconnector'
         * @return {Boolean} True if the point intersects. 
         */
        intersectsWithPoint = function(x, y, type) {
            let distance;
            switch (type) {
                case 'processor':
                    distance = Math.sqrt(Math.pow(x - my.positionX, 2) + Math.pow(y - my.positionY, 2));
                    return distance <= 10;
                case 'inconnector':
                    distance = Math.sqrt(Math.pow(x - my.positionX, 2) + Math.pow(y - my.positionY, 2));
                    return distance <= my.getConnectorGraphic().canvas.width / 2;
                case 'outconnector':
                    return false;
                }
        },
        
        /**
         * Set the theme colours of the processor view.
         * @param {Object} theme Theme settings object.
         */
        setTheme = function(theme) {
            my.colorHigh = theme.colorHigh;
            my.colorMid = theme.colorMid;
            my.colorLow = theme.colorLow;
            my.getConnectorGraphic().setTheme(theme);
        },
        
        getInConnectorPoint = function() {
            return {
                x: my.positionX,
                y: my.positionY
            }
        },
        
        /**
         * Provide output connector image for editing connections.
         * @return {Object} Contains canvas and coordinates.
         */
        getInConnectorGraphic = function() {
            const canvas = my.getConnectorGraphic().canvas,
                point = getInConnectorPoint();
            return {
                canvas: canvas,
                x: point.x - (canvas.width / 2),
                y: point.y - (canvas.height / 2)
            };
        };
        
    my = my || {};
    
    that = createCanvasProcessorBaseView(specs, my);
    
    initialise();
    
    that.terminate = terminate;
    that.setSelected = setSelected;
    that.draw = draw;
    that.addToStaticView = addToStaticView;
    that.addToDynamicView = addToDynamicView;
    that.clearFromDynamicView = clearFromDynamicView;
    that.intersectsWithPoint = intersectsWithPoint;
    that.setTheme = setTheme;
    that.getInConnectorPoint = getInConnectorPoint;
    that.getInConnectorGraphic = getInConnectorGraphic;
    return that;
}
