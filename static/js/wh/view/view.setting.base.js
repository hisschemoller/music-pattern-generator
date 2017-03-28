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
                const template = document.querySelector('#template-setting-' + my.param.getProperty('type'));
                const clone = document.importNode(template.content, true);
                specs.containerEl.appendChild(clone);
                my.el = specs.containerEl.children[0];
                
                // show label
                my.el.querySelector('.setting__label-text').innerHTML = my.param.getProperty('label');
            };
            
        my = my || {};
        my.param = specs.param;
        my.el;
        
        that = that || {};
        if (my.param.getProperty('isMidiControllable')) {
            that = ns.createRemoteSettingView(specs, my);
        }
        
        init();
    
        return that;
    };

    ns.createBaseSettingView = createBaseSettingView;

})(WH);
