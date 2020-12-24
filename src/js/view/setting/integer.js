import { dispatch, getActions, STATE_CHANGE, } from '../../state/store.js';
import createBaseSettingView from './base.js';

/**
 * Processor setting view for a linear integer type parameter,
 * which has a slider and a number field.
 */
export default function createIntegerSettingView(specs, my) {
    let that,
			rangeEl,
			numberEl,
			
			init = function() {
				rangeEl = my.el.getElementsByClassName('setting__range')[0];
				rangeEl.addEventListener('input', onChange);
				rangeEl.addEventListener('change', onChange);
				
				numberEl = my.el.getElementsByClassName('setting__number')[0];
				numberEl.addEventListener('change', onChange);

				initData();
				setValue(my.data.value);
			},

			initData = function() {
				rangeEl.setAttribute('min', my.data.min);
				rangeEl.setAttribute('max', my.data.max);

				numberEl.setAttribute('min', my.data.min);
				numberEl.setAttribute('max', my.data.max);
			},
			
			onChange = function(e) {
				dispatch(getActions().changeParameter(
					my.processorId, 
					my.key, 
					parseInt(e.target.value, 10)));
			},
			
			setValue = function(value) {
				rangeEl.value = value;
				numberEl.value = value;
			};
	
	my = my || {};
	my.initData = initData;
	my.setValue = setValue;
	
	that = createBaseSettingView(specs, my);
	
	init();
	
	return that;
}
