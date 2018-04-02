const themeColors = {};

export function memoize(state, action = {}, actions) {
    switch (action.type) {

        case actions.CREATE_PROJECT:
        case actions.SET_THEME:
            document.querySelector('#app').dataset.theme = state.theme;
            const themeStyles = window.getComputedStyle(document.querySelector('[data-theme]'));
            themeColors.colorHigh = themeStyles.getPropertyValue('--text-color');
            themeColors.colorMid = themeStyles.getPropertyValue('--border-color');
            themeColors.colorLow = themeStyles.getPropertyValue('--panel-bg-color');
            break;
    }
}

/**
 * Memoised selector to access processors by id as object key.
 * Recreates the memoised data each time a processor is created or deleted.
 */
export function getThemeColors() {
    return themeColors;
}
