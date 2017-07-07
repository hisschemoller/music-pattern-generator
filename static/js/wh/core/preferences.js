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
            };

        that = specs.that;

        that.setViewCallback = setViewCallback;
        that.enableDarkTheme = enableDarkTheme;
        return that;
    }

    ns.createPreferences = createPreferences;

})(WH);
