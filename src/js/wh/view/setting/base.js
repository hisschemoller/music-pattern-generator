import createRemoteSettingView from './remote';

/**
 * Processor setting view for a linear integer type parameter,
 * which has a slider and a number field.
 */
export default function createBaseSettingView(specs, my) {
    var that,
        
        init = function() {
            // find template, add clone to settings panel
            let template = document.querySelector('#template-setting-' + my.param.type);
            let clone = template.content.cloneNode(true);
            my.el = clone.firstElementChild;
            specs.parentEl.appendChild(my.el);
            
            // show label
            my.el.querySelector('.setting__label-text').innerHTML = my.param.label;
        };
        
    my = my || {};
    my.store = specs.store;
    my.key = specs.key;
    my.data = specs.data;
    my.el;
    
    that = that || {};
    if (my.data.isMidiControllable) {
        that = createRemoteSettingView(specs, my);
    }
    
    init();

    return that;
}
