import { createUUID } from '../core/util';

export default function createActions(specs = {}, my = {}) {
    const SET_PREFERENCES = 'SET_PREFERENCES',
        SET_PROJECT = 'SET_PROJECT',
        SET_THEME = 'SET_THEME',
        CREATE_NEW_PROCESSOR = 'CREATE_NEW_PROCESSOR',
        CREATE_PROCESSOR = 'CREATE_PROCESSOR',
        SELECT_PROCESSOR = 'SELECT_PROCESSOR';

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
                const fullData = require(`json-loader!../processors/${data.type}/config.json`);
                const id = `${data.type}_${createUUID()}`;
                fullData.type = data.type;
                fullData.id = id;
                fullData.params.position2d.value = data.position2d;
                dispatch(getActions().createProcessor(fullData));
                dispatch(getActions().selectProcessor(id));
            }
        },

        CREATE_PROCESSOR: CREATE_PROCESSOR,
        createProcessor: (data) => {
            return { type: CREATE_PROCESSOR, data: data };
        },

        SELECT_PROCESSOR: SELECT_PROCESSOR,
        selectProcessor: (id) => {
            return { type: SELECT_PROCESSOR, id: id };
        },
    };
}
