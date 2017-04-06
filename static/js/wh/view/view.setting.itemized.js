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
                let parentEl = my.el.parentNode;
                
                // add the main label
                let label = my.el.querySelector('.setting__label-text');
                parentEl.appendChild(label);
                
                // add the radio buttons
                let radioTemplate = document.querySelector('#template-setting-itemized-item'),
                    model = my.param.getModel(),
                    numInputs = model.length;
                for (var i = 0; i < numInputs; i++) {
                    let id = getTemporaryInputAndLabelId();
                    // add a new cloned radio element
                    let clone = radioTemplate.content.cloneNode(true)
                    // let radioEl = clone.firstElementChild;
                    // parentEl.appendChild(radioEl);
                    // set the radio input
                    // let radioInputEl = radioEl.querySelector('.setting__radio');
                    let radioInputEl = clone.children[0];
                    parentEl.appendChild(radioInputEl);
                    radioInputEl.setAttribute('name', my.param.getProperty('key'));
                    radioInputEl.setAttribute('id', id);
                    radioInputEl.value = model[i].value;
                    radioInputEl.checked = model[i].value == my.param.getValue();
                    radioInputEl.addEventListener('change', onChange);
                    radioInputs.push(radioInputEl);
                    // set the label
                    let radioLabelEl = clone.children[1];
                    parentEl.appendChild(radioInputEl);
                    // radioLabelEl = radioEl.querySelector('.setting__label-radio-text');
                    radioLabelEl.setAttribute('for', id);
                    radioLabelEl.innerHTML = model[i].label;
                }
                
                // remove the original element
                parentEl.removeChild(my.el);
                
                my.param.addChangedCallback(changedCallback);
            },
            
            /**
             * A quick ID to tie label to input elements.
             * @return {Number} Unique ID.
             */
            getTemporaryInputAndLabelId = function() {
                return 'id' + Math.random() + performance.now();
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
