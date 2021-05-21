import { dispatch, getActions, STATE_CHANGE, } from '../../state/store.js';
import createBaseSettingView from './baseSetting.js';

/**
 * Processor setting view for a itemized type parameter,
 * which has a radio buttons for item selection.
 */
export default function createItemizedSettingView(parentEl, processorId, key, paramData) {
	let valueEl,
		radioInputs = [],
		numInputs;
		
	const init = function() {
			valueEl = el.querySelector('.setting__value');

			initData(paramData);
			setValue(paramData.value);
		},

		initData = function(paramData) {

			// remove previous radio buttons, if any
			while (valueEl.firstChild) {
				valueEl.firstChild.removeEventListener('change', onChange);
				valueEl.removeChild(valueEl.firstChild);
			}
			
			// add the radio buttons
			let radioTemplate = document.querySelector('#template-setting-itemized-item'),
				model = paramData.model;
			numInputs = model.length;
			for (let i = 0; i < numInputs; i++) {
				let id = getTemporaryInputAndLabelId();
				
				// add a new cloned radio element
				let radioInputEl = radioTemplate.content.children[0].cloneNode(true);
				valueEl.appendChild(radioInputEl);
				radioInputEl.setAttribute('name', key);
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
			dispatch(getActions().changeParameter(
				processorId, 
				key, 
				e.target.value));
		},

		setValue = function(value) {
			radioInputs.forEach(radioInput => {
				radioInput.checked = (radioInput.value == value);
			});
		};
	
	const { el, terminate } = createBaseSettingView(parentEl, processorId, key, paramData, initData, setValue);
	
	init();
	
	return { terminate };
}
