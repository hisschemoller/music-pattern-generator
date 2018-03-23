import createCanvasProcessorBaseView from '../../view/canvasprocessorbase';

/**
 * MIDI output object drawn on canvas.
 */
export function createGraphic(specs, my) {
    let that,
        store = specs.store,
        canvasDirtyCallback = specs.canvasDirtyCallback,
        staticCanvas,
        staticCtx,
        nameCanvas,
        nameCtx,

        isSelected = false,

        lineWidth = 2,
        width = 100,
        height = 50,
        radius = 10,
        boxWidth = 80,
        selectRadius = 15,
        disconnectSize = 7,
        doublePI = Math.PI * 2,
        
        initialise = function() {
            document.addEventListener(my.store.STATE_CHANGE, handleStateChanges);
            initGraphics();
            setTheme(specs.theme, specs.state);
            updatePosition(specs.data.positionX, specs.data.positionY);
            redrawStaticCanvas();
        },
        
        /**
         * Called before this view is deleted.
         */
        terminate = function() {
            document.removeEventListener(my.store.STATE_CHANGE, handleStateChanges);
            canvasDirtyCallback = null;
        },

        handleStateChanges = function(e) {
            const processor = e.detail.state.processors.byId[my.id];
            switch (e.detail.action.type) {

                case e.detail.actions.DRAG_SELECTED_PROCESSOR:
                case e.detail.actions.DRAG_ALL_PROCESSORS:
                    updatePosition(processor.positionX, processor.positionY);
                    break;

                case e.detail.actions.UPDATE_MIDI_PORT:
                case e.detail.actions.ENABLE_PROCESSOR:
                    redrawStaticCanvas();
                    break;
                
                case e.detail.actions.CHANGE_PARAMETER:
                    if (e.detail.action.processorID === my.id) {
                        my.params = e.detail.state.processors.byId[my.id].params.byId;
                        switch (e.detail.action.paramKey) {
                            case 'port':
                                redrawStaticCanvas();
                                break;
                            case 'name':
                                updateName();
                                break;
                        }
                    }
                    break;
            }
        },

        initGraphics = function() {
            // offscreen canvas for static shapes
            staticCanvas = document.createElement('canvas');
            staticCanvas.height = height;
            staticCanvas.width = width;
            staticCtx = staticCanvas.getContext('2d');
            staticCtx.lineWidth = lineWidth;

            // offscreen canvas for the name
            nameCanvas = document.createElement('canvas');
            nameCanvas.height = 40;
            nameCanvas.width = 200;
            nameCtx = nameCanvas.getContext('2d');
            nameCtx.font = '14px sans-serif';
            nameCtx.textAlign = 'center';
        },

        setSelected = function(isSelectedView, state) {
            isSelected = isSelectedView;
            if (typeof redrawStaticCanvas == 'function' && typeof canvasDirtyCallback == 'function') {
                redrawStaticCanvas(state.processors.byId[my.id].enabled);
                canvasDirtyCallback();
            }
        },

        draw = function() {},

        /**
         * Redraw the graphic after a change.
         */
        redrawStaticCanvas = function() {
            staticCtx.strokeStyle = my.colorHigh;

            staticCtx.clearRect(0, 0, width, height);
            staticCtx.save();
            staticCtx.translate(width / 2, height / 2 - 8);
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

            // disconnected cross
            if (my.params.port.value === 'none') {
                staticCtx.moveTo(-disconnectSize, -disconnectSize);
                staticCtx.lineTo(disconnectSize, disconnectSize);
                staticCtx.moveTo(disconnectSize, -disconnectSize);
                staticCtx.lineTo(-disconnectSize, disconnectSize);
            }

            // select circle
            if (isSelected) {
                staticCtx.moveTo(selectRadius, 0);
                staticCtx.arc(0, 0, selectRadius, 0, doublePI);
            }

            staticCtx.stroke();
            staticCtx.restore();
            canvasDirtyCallback();
        },
        
        /**
         * Update the pattern's name.
         */
        updateName = function() {
            nameCtx.fillStyle = my.colorMid;
            nameCtx.clearRect(0, 0, nameCanvas.width, nameCanvas.height);
            nameCtx.fillText(my.params.name.value, nameCanvas.width / 2, nameCanvas.height / 2);
            canvasDirtyCallback();
        },
        
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
         * @return {Boolean} True if the point intersects. 
         */
        intersectsWithPoint = function(x, y) {
            let distance = Math.sqrt(Math.pow(x - my.positionX, 2) + Math.pow(y - my.positionY, 2));
            return distance <= 10;
        },
        
        /**
         * Set the theme colours of the processor view.
         * @param {Object} theme Theme settings object.
         */
        setTheme = function(theme, state) {
            my.colorHigh = theme.colorHigh;
            my.colorMid = theme.colorMid;
            my.colorLow = theme.colorLow;
            redrawStaticCanvas(state.processors.byId[my.id].enabled);
            updateName();
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
    return that;
}
