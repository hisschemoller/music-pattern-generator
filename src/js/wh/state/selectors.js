const themeColors = {};

export function memoize(state, action = {}, actions) {
  switch (action.type) {

    case actions.CREATE_PROJECT:
    case actions.RESCAN_TYPES:
    case actions.SET_THEME:
      document.querySelector('#app').dataset.theme = state.theme;
      const themeStyles = window.getComputedStyle(document.querySelector('[data-theme]'));
      themeColors.colorBackground = themeStyles.getPropertyValue('--bg-color').trim();
      themeColors.colorHigh = themeStyles.getPropertyValue('--webgl-high-color').trim();
      themeColors.colorMid = themeStyles.getPropertyValue('--webgl-mid-color').trim();
      themeColors.colorLow = themeStyles.getPropertyValue('--webgl-low-color').trim();
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
