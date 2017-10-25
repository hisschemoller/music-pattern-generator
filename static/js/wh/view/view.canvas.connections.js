/**
 * 
 */

window.WH = window.WH || {};

(function (WH) {

    function createCanvasConnectionsView(specs, my) {
        var that,
            canvas,
            ctx,
        
            init = function() {
                canvas = document.querySelector('.canvas-connections');
                ctx = canvas.getContext('2d');
            },
            
            enterConnectMode = function() {
                // listen for mouse or touch
                canvas.addEventListener(WH.util.eventType.start, onTouchStart);
                
                // show inputs and outputs
                for (let i = 0, view, viewInfo, viewPos; i < my.numViews; i++) {
                    view = my.views[i];
                    viewInfo = view.getProcessor().getInfo();
                    viewPos = view.getPosition2d();
                    if (viewInfo.inputs == 1) {
                        ctx.drawImage(view.getInputCanvas(), viewPos.x, viewPos.y);
                    }
                }
            },
            
            exitConnectMode = function() {
                canvas.removeEventListener(WH.util.eventType.start, onTouchStart);
            },
            
            /**
             * Enter or leave application connect mode.
             * @param {Boolean} isEnabled True to enable connect mode.
             */
            toggleConnectMode = function(isEnabled) {
                console.log(isEnabled, canvas);
                // show the canvas
                canvas.dataset.show = isEnabled;
                
                if (isEnabled) {
                    enterConnectMode();
                } else {
                    exitConnectMode();
                }
            },
            
            /**
             * Start to drag a connection if an output is the startpoint.
             * @param  {Object} e Event.
             */
            onTouchStart = function(e) {
                
            };
    
        my = my || {};
        
        that = specs.that || {};
        
        init();
        
        that.toggleConnectMode = toggleConnectMode;
        return that;
    };

WH.createCanvasConnectionsView = createCanvasConnectionsView;

})(WH);