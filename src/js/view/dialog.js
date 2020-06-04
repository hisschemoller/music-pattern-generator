/**
 * Dialog overlay.
 */

let dialogEl,
	headerEl,
	bodyEl,
	resolveBtnEl,
	rejectBtnEl,
	resolveBtnCallback,
	rejectBtnCallback;

export function setup() {
	dialogEl = document.querySelector('.dialog');
	headerEl = dialogEl.querySelector('.dialog__header .header__label');
	bodyEl = dialogEl.querySelector('.dialog__body');
	resolveBtnEl = dialogEl.querySelector('.dialog__resolve');
	rejectBtnEl = dialogEl.querySelector('.dialog__reject');
	resolveBtnEl.addEventListener('click', e => {
		dialogEl.dataset.show = false;
		resolveBtnCallback && resolveBtnCallback();
	});
	rejectBtnEl.addEventListener('click', e => {
		dialogEl.dataset.show = false;
		rejectBtnCallback && rejectBtnCallback();
	});
}

export function showDialog(header = '', body = '', resolve = null, reject = null, resolveCb = null, rejectCb = null) {
	dialogEl.dataset.show = true;
	headerEl.innerHTML = header;
	bodyEl.innerHTML = body;
	resolveBtnEl.innerHTML = resolve;
	rejectBtnEl.innerHTML = reject;
	resolveBtnCallback = resolveCb;
	rejectBtnCallback = rejectCb;
	resolveBtnEl.style.display = resolve != null ? 'block' : 'none';
	rejectBtnEl.style.display = reject != null ? 'block' : 'none';
}
