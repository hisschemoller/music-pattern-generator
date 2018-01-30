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
        position2d,
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
            console.log(specs);
            nameCtx.fillText(getMIDIPortByID(specs.data.portID).name, nameCanvas.width / 2, nameCanvas.height / 2);
            
            // add listeners to parameters
            // let params = my.processor.getParameters();
            // params.position2d.addChangedCallback(updatePosition);
            
            // set position on the canvas
            // position2d = my.data.params.position2d.value;
            // if (!position2d || (position2d.x == 0 && position2d.y == 0)) {
            //     // use initial position centered on the canvas
            //     position2d = specs.data.initialPosition;
            // }
            // updatePosition(params.position2d, position2d, position2d);
            updatePosition(specs.data.position2d);
        },
        
        /**
         * Called before this view is deleted.
         */
        terminate = function() {
            // let params = my.processor.getParameters();
            // params.position2d.removeChangedCallback(updatePosition);
            canvasDirtyCallback = null;
        },
        
        /**
         * Update pattern's position on the 2D canvas.
         * @param  {Object} param my.processor 2D position parameter.
         * @param  {Object} oldValue Previous 2D position as object.
         * @param  {Object} newValue New 2D position as object.
         */
        updatePosition = function(param, oldValue, newValue) {
            position2d = newValue;
            canvasDirtyCallback();
        },
        
        addToStaticView = function(mainStaticCtx) {
            mainStaticCtx.drawImage(
                staticCanvas,
                position2d.x - 50,
                position2d.y - 15);
                
            mainStaticCtx.drawImage(
                nameCanvas,
                position2d.x - (nameCanvas.width / 2),
                position2d.y + 30);
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
                    distance = Math.sqrt(Math.pow(x - position2d.x, 2) + Math.pow(y - position2d.y, 2));
                    return distance <= 10;
                case 'inconnector':
                    distance = Math.sqrt(Math.pow(x - position2d.x, 2) + Math.pow(y - position2d.y, 2));
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
                x: position2d.x,
                y: position2d.y
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
    that.addToStaticView = addToStaticView;
    that.addToDynamicView = addToDynamicView;
    that.clearFromDynamicView = clearFromDynamicView;
    that.intersectsWithPoint = intersectsWithPoint;
    that.setTheme = setTheme;
    that.getInConnectorPoint = getInConnectorPoint;
    that.getInConnectorGraphic = getInConnectorGraphic;
    return that;
}
