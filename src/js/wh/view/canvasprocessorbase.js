import { getProcessorByID } from '../state/selectors';

export default function createCanvasProcessorBaseView(specs, my) {
    var that,
        connectorGraphic,

        initialiseBase = function() {
            document.addEventListener(my.store.STATE_CHANGE, handleStateChanges);
        },

        terminateBase = function() {
            document.removeEventListener(my.store.STATE_CHANGE, handleStateChanges);
        },

        handleStateChanges = function(e) {
            switch (e.detail.action.type) {
                case e.detail.actions.DRAG_SELECTED_PROCESSOR:
                case e.detail.actions.DRAG_ALL_PROCESSORS:
                    const processor = getProcessorByID(my.data.id);
                    my.positionX = processor.positionX;
                    my.positionY = processor.positionY;
                    break;
            }
        },
        
        getPosition2d = function() {
            return { x: my.data.positionX, y: my.data.positionY };
        },
        
        getType = function() {
            return my.data.type;
        },
        
        getID = function() {
            return my.data.id;
        };
        
    my = my || {};
    my.data = specs.data;
    my.store = specs.store;
    my.positionX = 0;
    my.positionY = 0;
    my.colorHigh = '#cccccc';
    my.colorMid = '#dddddd';
    my.colorLow = '#eeeeee';
    
    that = specs.that || {};

    initialiseBase();
    
    that.terminateBase = terminateBase;
    that.getPosition2d = getPosition2d;
    that.getID = getID;
    that.getType = getType;
    return that;
}
