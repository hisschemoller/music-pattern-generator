const themeColors = {};
const assignedParameters = {};

export function memoize(state, action = {}, actions) {
    switch (action.type) {

        case actions.ASSIGN_EXTERNAL_CONTROL:
            if (!assignedParameters[action.remoteChannel]) {
                assignedParameters[action.remoteChannel] = {};
            }

            if (!assignedParameters[action.remoteChannel][action.remoteCC]) {
                assignedParameters[action.remoteChannel][action.remoteCC] = [];
            }

            let exists = false;
            assignedParameters[action.remoteChannel][action.remoteCC].forEach(item => {
                if (item.processorID === action.processorID && item.paramKey === action.paramKey) {
                    exists = true;
                }
            });

            if (!exists) {
                assignedParameters[action.remoteChannel][action.remoteCC].push({
                    processorID: action.processorID,
                    paramKey: action.paramKey
                });
            }
            break;
        
        case actions.UNASSIGN_EXTERNAL_CONTROL:
            if (assignedParameters[action.remoteChannel][action.remoteCC]) {
                assignedParameters[action.remoteChannel][action.remoteCC].reduce((accumulator, item) => {
                    if (item.processorID !== action.processorID || item.paramKey !== action.paramKey) {
                        accumulator.push(item);
                    }
                    return accumulator;
                }, []);
            }
            break;

        case actions.CREATE_PROJECT:
        case actions.SET_THEME:
            document.querySelector('#app').dataset.theme = state.theme;
            const themeStyles = window.getComputedStyle(document.querySelector('[data-theme]'));
            themeColors.colorHigh = themeStyles.getPropertyValue('--text-color'),
            themeColors.colorMid = themeStyles.getPropertyValue('--border-color'),
            themeColors.colorLow = themeStyles.getPropertyValue('--panel-bg-color')
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

/**
 * Get list of all parameters that are remote controlled by a MIDI channel and CC combo.
 * @param {Number} remoteChannel 
 * @param {Number} remoteCC
 * @return {Array} Processor ID and parameter key of each assignment to the channel and CC.
 */
export function getAssignedParamsByMIDIData(remoteChannel, remoteCC) {
    console.log('assignedParameters', assignedParameters);
    if (assignedParameters[remoteChannel] && assignedParameters[remoteChannel][remoteCC]) {
        return assignedParameters[remoteChannel][remoteCC];
    }
}
