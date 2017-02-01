/**
 * Processor setting view for a itemized type parameter,
 * which has a radio buttons for item selection.
 * @namespace WH
 */
 
window.WH = window.WH || {};

(function (ns) {
     
    function createItemizedSettingView(specs, my) {
        var that,
            radioInputs = [],
            numInputs,
            
            init = function() {
                var parentEl = my.el.parentNode;
                
                // add the main label
                var label = my.el.getElementsByClassName('settings__label-text')[0];
                parentEl.appendChild(label);
                
                // add the radio buttons
                var radioTemplateEl = my.el.getElementsByClassName('settings__label-radio')[0],
                    model = my.param.getModel(),
                    numInputs = model.length;
                for (var i = 0; i < numInputs; i++) {
                    // add a new cloned radio element
                    var radioEl = radioTemplateEl.cloneNode(true);
                    parentEl.appendChild(radioEl);
                    // set the radio input
                    var radioInputEl = radioEl.getElementsByClassName('settings__radio')[0];
                    radioInputEl.setAttribute('name', my.param.getProperty('key'));
                    radioInputEl.value = model[i].value;
                    radioInputEl.checked = model[i].value == my.param.getValue();
                    radioInputEl.addEventListener('change', onChange);
                    radioInputs.push(radioInputEl);
                    // set the label
                    radioLabelEl = radioEl.getElementsByClassName('settings__label-radio-text')[0];
                    radioLabelEl.innerHTML = model[i].label;
                }
                
                // remove the original element
                parentEl.removeChild(my.el);
                
                my.param.addChangedCallback(changedCallback);
            },
            
            onChange = function(e) {
                my.param.setValue(e.target.value);
            },
            
            changedCallback = function(parameter, oldValue, newValue) {
                for (i = 0; i < numInputs; i++) {
                    radioInputs[i].checked = (radioInputs[i].value === newValue);
                }
            };
         
        my = my || {};
        
        that = ns.createBaseSettingView(specs, my);
        
        init();
        
        return that;
    };
    
    ns.createItemizedSettingView = createItemizedSettingView;
    
})(WH);
