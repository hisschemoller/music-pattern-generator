export default function createCanvasProcessorBaseView(specs, my) {
    var that,

        initialiseBase = function() {
        },

        terminateBase = function() {
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
