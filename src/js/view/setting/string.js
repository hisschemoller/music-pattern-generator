import { dispatch, getActions, STATE_CHANGE, } from '../../state/store.js';
import createBaseSettingView from './baseSetting.js';

/**
 * Processor setting view for a Boolean type parameter,
 * which has a checkbox input.
 */
export default function createStringSettingView(parentEl, processorId, key, paramData) {
	let textEl;
		
	const init = function() {
			textEl = el.getElementsByClassName('setting__text')[0];
			textEl.addEventListener('input', onChange);
			
			initData(paramData);
			setValue(paramData.value);
		},

		initData = function(paramData) {},
		
		onChange = function(e) {
			e.preventDefault();
			dispatch(getActions().changeParameter(
				processorId, 
				key, 
				e.target.value));
		},
		
		setValue = function(value) {
			// only update if the text input doesn't have focus,
			// else value gets refreshed and cursor jumps to end
			if (textEl != document.activeElement) {
				textEl.value = value;
			}
		};
	
	const { el, terminate } = createBaseSettingView(parentEl, processorId, key, paramData, initData, setValue);
	
	init();
	
	return { terminate };
}
