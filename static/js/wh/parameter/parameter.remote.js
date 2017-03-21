/**
 * Functionality for parameters that are controllable by external MIDI CC values.
 * Also includes functionality for MIDI learn mode.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createRemoteParameter(specs, my) {
        var that,
            remoteStateChangeCallback,
            
            /**
             * Set the remote state of the parameter.
             * This calls the setting view associated with this parameter, so that
             * it goes into learn mode or shows it's selected or assigned.
             * @param {String} state Remote assignment state, for example 'selected' or 'assigned'
             * @param {Function} callback Function to call when in learn mode (ugly, improve some day)
             */
            setRemoteState = function(state, callback) {
                if (remoteStateChangeCallback) {
                    remoteStateChangeCallback(state, callback);
                }
            },
            
            /**
             * Add a callback function to update the remote overlay on the
             * parameter's setting view, so that the setting view can go
             * into learn mode, or show that it's selected or assigned.
             * @param {Function} callback Callback function.
             */
            setRemoteStateCallback = function(callback) {
                remoteStateChangeCallback = callback;
            },
            
            setRemoteProperty = function(key, value) {
                if (my.remoteProps.hasOwnProperty(key)) {
                    my.remoteProps[key] = value;
                }
            },
            
            getRemoteProperty = function(key) {
                if (my.remoteProps.hasOwnProperty(key)) {
                    return my.remoteProps[key];
                }
            },
            
            getRemoteData = function() {
                return my.remoteProps;
            };
        
        my = my || {};
        my.remoteProps = {
            portId: null,
            channel: null,
            controller: null
        };
        
        that = specs.that || {};
        
        that.setRemoteState = setRemoteState;
        that.setRemoteStateCallback = setRemoteStateCallback;
        that.setRemoteProperty = setRemoteProperty;
        that.getRemoteProperty = getRemoteProperty;
        that.getRemoteData = getRemoteData;
        return that;
    }

ns.createRemoteParameter = createRemoteParameter;

})(WH);
