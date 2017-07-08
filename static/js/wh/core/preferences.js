/**
 * Application preferences.
 * @namespace WH
 */
window.WH = window.WH || {};

(function (ns) {

    function createPreferences(specs) {
        var that,
            viewCallback,
            isDarkTheme = false,

            /**
             * Set callback function to update the view.
             * @param {Function} callback Callback function.
             */
            setViewCallback = function(callback) {
                viewCallback = callback;
            },

            /**
             * Enable dark UI theme for low light environment.
             * @param {Boolean} isEnabled True to enable the dark theme.
             */
            enableDarkTheme = function(isEnabled) {
                isDarkTheme = isEnabled;
                if (viewCallback) {
                    viewCallback('dark-theme', isDarkTheme);
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

        that.setViewCallback = setViewCallback;
        that.enableDarkTheme = enableDarkTheme;
        that.setData = setData;
        that.getData = getData;
        return that;
    }

    ns.createPreferences = createPreferences;

})(WH);
