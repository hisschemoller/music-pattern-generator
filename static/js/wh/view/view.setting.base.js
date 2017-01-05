/**
 * Processor setting view for a linear integer type parameter,
 * which has a slider and a number field.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createBaseSettingView(specs, my) {
        var that,
            el,
            
            init = function() {
                // find template, add clone to settings panel
                var template = document.getElementById('template-setting-' + my.param.getType());
                el = template.firstElementChild.cloneNode(true);
                specs.containerEl.appendChild(el);
            };
            
        my = my || {};
        my.param = specs.param;
        my.el = el;
        
        that = that || {};
        
        init();
    
        return that;
    };

    ns.createBaseSettingView = createBaseSettingView;

})(WH);
