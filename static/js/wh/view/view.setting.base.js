/**
 * Processor setting view for a linear integer type parameter,
 * which has a slider and a number field.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createBaseSettingView(specs, my) {
        var that,
            
            init = function() {
                // find template, add clone to settings panel
                var template = document.getElementById('template-setting-' + my.param.getProperty('type'));
                my.el = template.firstElementChild.cloneNode(true);
                specs.containerEl.appendChild(my.el);
                
                // show label
                my.el.getElementsByClassName('settings__label-text')[0].innerHTML = my.param.getProperty('label');
            };
            
        my = my || {};
        my.param = specs.param;
        my.el;
        
        that = that || {};
        
        init();
    
        return that;
    };

    ns.createBaseSettingView = createBaseSettingView;

})(WH);
