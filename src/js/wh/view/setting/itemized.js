import createBaseSettingView from './base';

/**
 * Processor setting view for a itemized type parameter,
 * which has a radio buttons for item selection.
 */
export default function createItemizedSettingView(specs, my) {
    var that,
        radioInputs = [],
        numInputs,
        
        init = function() {
            let parentEl = my.el.parentNode,
                valueEl = my.el.querySelector('.setting__value');
            
            // add the radio buttons
            let radioTemplate = document.querySelector('#template-setting-itemized-item'),
                model = my.store.getState().processors.byId[my.processorID].models.byId[my.data.modelId];
            numInputs = model.length;
            for (var i = 0; i < numInputs; i++) {
                let id = getTemporaryInputAndLabelId();
                
                // add a new cloned radio element
                let radioInputEl = radioTemplate.content.children[0].cloneNode(true);
                valueEl.appendChild(radioInputEl);
                radioInputEl.setAttribute('name', specs.key);
                radioInputEl.setAttribute('id', id);
                radioInputEl.value = model[i].value;
                radioInputEl.checked = model[i].value == my.data.default;
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
            for (let i = 0; i < numInputs; i++) {
                radioInputs[i].checked = (radioInputs[i].value == value);
            }
        };
        
    my = my || {};
    my.setValue = setValue;
    
    that = createBaseSettingView(specs, my);
    
    init();
    
    return that;
}
