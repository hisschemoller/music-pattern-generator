import { dispatch, getActions, STATE_CHANGE, } from '../../state/store.js';
import createBaseSettingView from './baseSetting.js';

/**
 * Processor setting view for a Boolean type parameter,
 * which has a checkbox input.
 */
export default function createBooleanSettingView(parentEl, processorId, key, paramData) {
	let checkEl;
		
	const init = function() {
			const id = getTemporaryInputAndLabelId();
			
			checkEl = el.querySelector('.setting__check');
			checkEl.value = paramData.defaultValue;
			checkEl.setAttribute('id', id);
			checkEl.addEventListener('change', onChange);
			
			const labelEl = el.querySelector('.toggle__label');
			labelEl.setAttribute('for', id);
			
			initData(paramData);
			setValue(paramData.value);
		},

		initData = function(paramData) {},
		
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
				e.target.checked));
		},
		
		setValue = function(value) {
			checkEl.checked = value;
		};
	
	const { el, terminate } = createBaseSettingView(parentEl, processorId, key, paramData, initData, setValue);
	
	init();
	
	return { terminate };
}
