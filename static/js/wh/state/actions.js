window.WH = window.WH || {};

(function (WH) {
    function createActions(specs = {}, my = {}) {
        const SET_PREFERENCES = 'SET_PREFERENCES';

        return {
            SET_PREFERENCES: SET_PREFERENCES,
            setPreferences: (data) => {
                return { type: SET_PREFERENCES, data: data};
            }
        };
    }

    WH.createActions = createActions;

})(WH);
