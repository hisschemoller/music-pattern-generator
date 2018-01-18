import { util } from '../core/util';

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
                const config = require(`json-loader!../processors/${data.type}/config.json`),
                    id = `${data.type}_${util.createUUID()}`,
                    fullData = Object.assign(data, config, { id: id });
                dispatch(getActions().createProcessor(fullData));
                dispatch(getActions().selectProcessor(id));
            }
        },

        CREATE_PROCESSOR: CREATE_PROCESSOR,
        createProcessor: (data) => {
            console.log('createProcessor', data);
            return { type: CREATE_PROCESSOR, data: data };
        },

        SELECT_PROCESSOR: SELECT_PROCESSOR,
        selectProcessor: (id) => {
            console.log('selectProcessor', id);
            return { type: SELECT_PROCESSOR, id: id };
        },
    };
}
