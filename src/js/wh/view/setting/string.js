import createBaseSettingView from './base';

/**
 * Processor setting view for a Boolean type parameter,
 * which has a checkbox input.
 */
 
export default function createStringSettingView(specs, my) {
    var that,
        textEl,
        
        init = function() {
            textEl = my.el.getElementsByClassName('setting__text')[0];
            textEl.value = my.param.default;
            textEl.addEventListener('input', onChange);
            
            // my.param.addChangedCallback(changedCallback);
        },
        
        onChange = function(e) {
            e.preventDefault();
            my.param.setValue(e.target.value);
        },
        
        changedCallback = function(parameter, oldValue, newValue) {
            // only update if the text input doesn't have focus,
            // else value gets refreshed and cursor jumps to end
            if (textEl != document.activeElement) {
                textEl.value = newValue;
            }
        };
    
    my = my || {};
    
    that = createBaseSettingView(specs, my);
    
    init();
    
    return that;
}
