import { dispatch, getActions, STATE_CHANGE, } from '../../state/store.js';
import createBaseSettingView from './baseSetting.js';

/**
 * Processor setting view for a linear integer type parameter,
 * which has a slider and a number field.
 */
export default function createIntegerSettingView(parentEl, processorId, key, paramData) {
		let rangeEl,
			numberEl;
			
		const init = function() {
				rangeEl = el.getElementsByClassName('setting__range')[0];
				rangeEl.addEventListener('input', onChange);
				rangeEl.addEventListener('change', onChange);
				
				numberEl = el.getElementsByClassName('setting__number')[0];
				numberEl.addEventListener('change', onChange);

				initData(paramData);
				setValue(paramData.value);
			},

			initData = function(paramData) {
				rangeEl.setAttribute('min', paramData.min);
				rangeEl.setAttribute('max', paramData.max);

				numberEl.setAttribute('min', paramData.min);
				numberEl.setAttribute('max', paramData.max);
			},
			
			onChange = function(e) {
				dispatch(getActions().changeParameter(
					processorId, 
					key, 
					parseInt(e.target.value, 10)));
			},
			
			setValue = function(value) {
				rangeEl.value = value;
				numberEl.value = value;
			};
	
	const { el, terminate } = createBaseSettingView(parentEl, processorId, key, paramData, initData, setValue);
	
	init();
	
	return { terminate };
}
