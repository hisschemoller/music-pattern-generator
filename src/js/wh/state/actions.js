import { createUUID } from '../core/util';

export default function createActions(specs = {}, my = {}) {
    const SET_PREFERENCES = 'SET_PREFERENCES',
        SET_PROJECT = 'SET_PROJECT',
        SET_THEME = 'SET_THEME',
        CREATE_NEW_PROCESSOR = 'CREATE_NEW_PROCESSOR',
        CREATE_PROCESSOR = 'CREATE_PROCESSOR',
        DELETE_PROCESSOR = 'DELETE_PROCESSOR',
        SELECT_PROCESSOR = 'SELECT_PROCESSOR',
        DRAG_SELECTED_PROCESSOR = 'DRAG_SELECTED_PROCESSOR',
        DRAG_ALL_PROCESSORS = 'DRAG_ALL_PROCESSORS',
        CHANGE_PARAMETER = 'CHANGE_PARAMETER',
        RECREATE_PARAMETER = 'RECREATE_PARAMETER',
        TOGGLE_PLAY = 'TOGGLE_PLAY';

    return {
        SET_PREFERENCES: SET_PREFERENCES,
        setPreferences: (data) => {
            return { type: SET_PREFERENCES, data: data };
        },

        SET_PROJECT: SET_PROJECT,
        setProject: (data) => {
            return { type: SET_PROJECT, data: data };
        },

        SET_THEME: SET_THEME,
        setTheme: (value) => {
            return { type: SET_THEME, data: value };
        },

        CREATE_NEW_PROCESSOR: CREATE_NEW_PROCESSOR,
        createNewProcessor: (data) => {
            return (dispatch, getState, getActions) => {
                const dataTemplate = require(`json-loader!../processors/${data.type}/config.json`);
                const fullData = JSON.parse(JSON.stringify(dataTemplate));
                const id = `${data.type}_${createUUID()}`;
                fullData.type = data.type;
                fullData.id = id;
                fullData.params.position2d.value = data.position2d;
                fullData.params.name.value = getProcessorDefaultName(getState().processors);
                dispatch(getActions().createProcessor(fullData));
                dispatch(getActions().selectProcessor(id));
            }
        },

        CREATE_PROCESSOR: CREATE_PROCESSOR,
        createProcessor: (data) => {
            return { type: CREATE_PROCESSOR, data: data };
        },

        DELETE_PROCESSOR: DELETE_PROCESSOR,
        deleteProcessor: id => {
            return { type: DELETE_PROCESSOR, id: id };
        },

        SELECT_PROCESSOR: SELECT_PROCESSOR,
        selectProcessor: id => {
            return { type: SELECT_PROCESSOR, id: id };
        },

        DRAG_SELECTED_PROCESSOR: DRAG_SELECTED_PROCESSOR,
        dragSelectedProcessor: (x, y) => {
            return { type: DRAG_SELECTED_PROCESSOR, x: x, y: y };
        },

        DRAG_ALL_PROCESSORS: DRAG_ALL_PROCESSORS,
        dragAllProcessors: (x, y) => {
            return { type: DRAG_ALL_PROCESSORS, x: x, y: y };
        },

        CHANGE_PARAMETER: CHANGE_PARAMETER,
        changeParameter: (processorID, paramKey, paramValue) => {
            return { type: CHANGE_PARAMETER, processorID: processorID, paramKey: paramKey, paramValue: paramValue };
        },

        RECREATE_PARAMETER: RECREATE_PARAMETER,
        recreateParameter: (processorID, paramKey, paramObj) => {
            return { type: RECREATE_PARAMETER, processorID: processorID, paramKey : paramKey, paramObj: paramObj };
        },

        TOGGLE_PLAY: TOGGLE_PLAY,
        togglePlay: value => { return { type:TOGGLE_PLAY, value: value } }
    };
}
        
/**
 * Set default processor name.
 * @param {Object} processor Processor to name.
 */
function getProcessorDefaultName(processors) {
    let name, number, spaceIndex, 
        highestNumber = 0,
        staticName = 'Processor';
    for (let i = 0, n = processors.length; i < n; i++) {
        name = processors[i].params.name.value;
        if (name && name.indexOf(staticName) == 0) {
            spaceIndex = name.lastIndexOf(' ');
            if (spaceIndex != -1) {
                number = parseInt(name.substr(spaceIndex), 10);
                if (!isNaN(number)) {
                    highestNumber = Math.max(highestNumber, number);
                }
            }
        }
    }
    return `${staticName} ${highestNumber + 1}`;
}