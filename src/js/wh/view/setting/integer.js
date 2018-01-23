import createBaseSettingView from './base';

/**
 * Processor setting view for a linear integer type parameter,
 * which has a slider and a number field.
 */
export default function createIntegerSettingView(specs, my) {
    var that,
        rangeEl,
        numberEl,
        
        init = function() {
            rangeEl = my.el.getElementsByClassName('setting__range')[0];
            rangeEl.setAttribute('min', my.data.min);
            rangeEl.setAttribute('max', my.data.max);
            rangeEl.value = my.data.default;
            rangeEl.addEventListener('input', onChange);
            rangeEl.addEventListener('change', onChange);
            
            numberEl = my.el.getElementsByClassName('setting__number')[0];
            numberEl.setAttribute('min', my.data.min);
            numberEl.setAttribute('max', my.data.max);
            numberEl.value = my.data.default;
            numberEl.addEventListener('change', onChange);
            
            // my.param.addChangedCallback(changedCallback);
            // my.param.addChangedMaxCallback(changedMaxCallback);
        },
        
        onChange = function(e) {
            // my.param.setValue(parseInt(e.target.value, 10));
            my.store.dispatch(my.store.getActions().changeParameter(
                my.processorID, 
                my.key, 
                parseInt(e.target.value, 10)));
        },
        
        // changedCallback = function(parameter, oldValue, newValue) {
        //     rangeEl.value = newValue;
        //     numberEl.value = newValue;
        // },
        
        /**
         * The maximum value of the parameter has changed.
         * @param {Number} max New maximum value. 
         */
        changedMaxCallback = function(max) {
            rangeEl.setAttribute('max', max);
            numberEl.setAttribute('max', max);
        },
        
        setValue = function(value) {
            rangeEl.value = value;
            numberEl.value = value;
        };
    
    my = my || {};
    my.setValue = setValue;
    
    that = createBaseSettingView(specs, my);
    
    init();
    
    return that;
}
