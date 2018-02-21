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
                    const processor = e.detail.state.processors.byId[my.id];
                    my.positionX = processor.positionX;
                    my.positionY = processor.positionY;
                    break;
            }
        },
        
        getPosition2d = function() {
            return { x: my.positionX, y: my.positionY };
        },
        
        getType = function() {
            return my.type;
        },
        
        getID = function() {
            return my.id;
        };
    
    my = my || {};
    my.params = specs.data.params.byId;
    my.store = specs.store;
    my.type = specs.data.type;
    my.id = specs.data.id;
    my.positionX = specs.data.positionX;
    my.positionY = specs.data.positionY;
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
