/**
 * Base functionality for processor canvas views.
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createCanvasBaseView(specs, my) {
        var that;
        
        my = my || {};
        
        that = specs.that || {};
        
        return that;
    }
    
    ns.createCanvasBaseView = createCanvasBaseView;

})(WH);