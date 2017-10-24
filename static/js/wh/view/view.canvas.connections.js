/**
 * 
 */

window.WH = window.WH || {};

(function (WH) {

    function createCanvasConnectionsView(specs, my) {
        var that,
            
            /**
             * Enter or leave application connect mode.
             * @param  {Boolean} isEnabled True to enable connect mode.
             */
            toggleConnectMode = function(isEnabled) {
                console.log(isEnabled);
            };
    
    my = my || {};
    
    that = specs.that || {};
    
    that.toggleConnectMode = toggleConnectMode;
    return that;
};

WH.createCanvasConnectionsView = createCanvasConnectionsView;

})(WH);