/**
 * Processor setting view for a linear integer type parameter,
 * which has a slider and a number field.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createIntegerSettingView(specs, my) {
        var that,
            param = specs.param,
            rootEl,
            el,
            
            init = function() {
                
            };
        
        that = ns.createBaseSettingView(specs, my);
        
        init();
        
        return that;
    };

    ns.createIntegerSettingView = createIntegerSettingView;

})(WH);
