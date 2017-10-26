/**
 * Base functionality for processor canvas views.
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createCanvasProcessorBaseView(specs, my) {
        var that,
        
            getProcessor = function() {
                return my.processor;
            },
            
            setPosition2d = function(position2d) {
                my.processor.setParamValue('position2d', position2d);
            },
            
            getPosition2d = function() {
                return my.processor.getParamValue('position2d');
            };
        
        my = my || {};
        my.processor = specs.processor,
        my.colorHigh = '#cccccc';
        my.colorMid = '#dddddd';
        my.colorLow = '#eeeeee';
        
        that = specs.that || {};
        
        that.getProcessor = getProcessor;
        that.setPosition2d = setPosition2d;
        that.getPosition2d = getPosition2d;
        return that;
    }
    
    ns.createCanvasProcessorBaseView = createCanvasProcessorBaseView;

})(WH);