window.WH = window.WH || {};

(function (WH) {
    function createActions(specs = {}, my = {}) {
        const SET_PREFERENCES = 'SET_PREFERENCES';
        const SET_THEME = 'SET_THEME';

        return {
            SET_PREFERENCES: SET_PREFERENCES,
            setPreferences: (data) => {
                return { type: SET_PREFERENCES, data: data};
            },

            SET_THEME: SET_THEME,
            setTheme: (value) => {
                return { type: SET_THEME, data: value};
            }
        };
    }

    WH.createActions = createActions;

})(WH);
