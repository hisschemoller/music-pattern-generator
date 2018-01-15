import { util } from '../core/util';

export default function createActions(specs = {}, my = {}) {
    const SET_PREFERENCES = 'SET_PREFERENCES';
    const SET_PROJECT = 'SET_PROJECT';
    const SET_THEME = 'SET_THEME';
    const CREATE_PROCESSOR = 'CREATE_PROCESSOR';

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

        CREATE_PROCESSOR: CREATE_PROCESSOR,
        createProcessor: (data) => {
            data.id = `${data.type}_${util.createUUID()}`;
            return { type: CREATE_PROCESSOR, data: data };
        }
    };
}
