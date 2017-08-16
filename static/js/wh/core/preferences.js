/**
 * Application preferences.
 * @namespace WH
 */
window.WH = window.WH || {};

(function (ns) {

    function createPreferences(specs) {
        var that,
            themeCallbacks = [],
            isDarkTheme = false,

            /**
             * Set callback function to update after theme change.
             * @param {Function} callback Callback function.
             */
            addThemeCallback = function(callback) {
                themeCallbacks.push(callback);
            },

            /**
             * Enable dark UI theme for low light environment.
             * @param {Boolean} isEnabled True to enable the dark theme.
             */
            enableDarkTheme = function(isEnabled) {
                return;
                isDarkTheme = isEnabled;
                for (let i = 0, n = themeCallbacks.length; i < n; i++) {
                    themeCallbacks[i]('dark-theme', isDarkTheme);
                }
            },

            /**
             * Restore preferences from data object.
             * @param {Object} data Data object.
             */
            setData = function(data) {
                enableDarkTheme(data.isDarkTheme || false);
            },

            /**
             * Write preferences to data object.
             * @return {Object} Data object.
             */
            getData = function() {
                return {
                    isDarkTheme: isDarkTheme
                };
            };

        that = specs.that;

        that.addThemeCallback = addThemeCallback;
        that.enableDarkTheme = enableDarkTheme;
        that.setData = setData;
        that.getData = getData;
        return that;
    }

    ns.createPreferences = createPreferences;

})(WH);
