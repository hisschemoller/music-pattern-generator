/**
 * Processor setting view for a linear integer type parameter,
 * which has a slider and a number field.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createIntegerSettingView(specs, my) {
        var that,
            
            init = function() {
                var rangeEl = my.el.getElementsByClassName('settings__range')[0];
                rangeEl.setAttribute('min', my.param.getProperty('min'));
                rangeEl.setAttribute('max', my.param.getProperty('max'));
            };
        
        my = my || {};
        
        that = ns.createBaseSettingView(specs, my);
        
        init();
        
        return that;
    };

    ns.createIntegerSettingView = createIntegerSettingView;

})(WH);
