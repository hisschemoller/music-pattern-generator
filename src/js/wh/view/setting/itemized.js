import createBaseSettingView from './base';

/**
 * Processor setting view for a itemized type parameter,
 * which has a radio buttons for item selection.
 */
export default function createItemizedSettingView(specs, my) {
    var that,
        valueEl,
        radioInputs = [],
        numInputs,
        
        init = function() {
            valueEl = my.el.querySelector('.setting__value');

            initData();
            setValue(my.data.value);
        },

        initData = function() {
            // remove previous radio buttons, if any
            while (valueEl.firstChild) {
                valueEl.firstChild.removeEventListener('change', onChange);
                valueEl.removeChild(valueEl.firstChild);
            }
            
            // add the radio buttons
            let radioTemplate = document.querySelector('#template-setting-itemized-item'),
                model = my.data.model;
            numInputs = model.length;
            for (var i = 0; i < numInputs; i++) {
                let id = getTemporaryInputAndLabelId();
                
                // add a new cloned radio element
                let radioInputEl = radioTemplate.content.children[0].cloneNode(true);
                valueEl.appendChild(radioInputEl);
                radioInputEl.setAttribute('name', specs.key);
                radioInputEl.setAttribute('id', id);
                radioInputEl.value = model[i].value;
                radioInputEl.addEventListener('change', onChange);
                radioInputs.push(radioInputEl);
                
                // add a new cloned label element
                let radioLabelEl = radioTemplate.content.children[1].cloneNode(true);
                valueEl.appendChild(radioLabelEl);
                radioLabelEl.setAttribute('for', id);
                radioLabelEl.innerHTML = model[i].label;
            }
        },
        
        /**
         * A quick ID to tie label to input elements.
         * @return {Number} Unique ID.
         */
        getTemporaryInputAndLabelId = function() {
            return 'id' + Math.random() + performance.now();
        },
        
        onChange = function(e) {
            my.store.dispatch(my.store.getActions().changeParameter(
                my.processorID, 
                my.key, 
                e.target.value));
        },

        setValue = function(value) {
            radioInputs.forEach(radioInput => {
                radioInput.checked = (radioInput.value == value);
            });
        };
        
    my = my || {};
    my.initData = initData;
    my.setValue = setValue;
    
    that = createBaseSettingView(specs, my);
    
    init();
    
    return that;
}
