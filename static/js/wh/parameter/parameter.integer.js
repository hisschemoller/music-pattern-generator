/**
 * Parameter for integer values between an minimum and maximum.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createIntegerParameter(specs, my) {
        var that,
            changedMaxCallbacks = [],
            
            normalize = function(value) {
                return (value - my.min) / (my.max - my.min);
            },
            
            deNormalize = function(normalizedValue) {
                return Math.round(my.min + normalizedValue * (my.max - my.min));
            },
            
            /**
             * Set a new maximum value.
             * This happens to EPG pulses and rotation when steps change.
             * @param {Number} newMax The new Maximum value for this parameter.
             */
            setMax = function(newMax) {
                my.max = newMax;
                var n = changedMaxCallbacks.length;
    			for (var i = 0; i < n; i++) {
                    changedMaxCallbacks[i](my.max);
                }
            },
		
        	/**
        	 * Adds a max callback function.
        	 * @param {Function} callback The function, that will be invoked on max value changed.
        	 */
        	addChangedMaxCallback = function(callback) {
        		changedMaxCallbacks.push(callback);
        	},

    		/**
    		 * Removes a max callback function.
    		 * @param {Function} callback The function that will be removed.
    		 */
    		removeChangedMaxCallback = function(callback) {
    			var index = changedMaxCallbacks.indexOf(callback);
    			if (index > -1) {
                    changedMaxCallbacks.splice(index, 1);
                }
    		};
        
        my = my || {};
        my.min = specs.min;
        my.max = specs.max;
        my.normalize = normalize;
        my.deNormalize = deNormalize;
        
        that = ns.createBaseParameter(specs, my);
        that.setMax = setMax;
        that.addChangedMaxCallback = addChangedMaxCallback;
        that.removeChangedMaxCallback = removeChangedMaxCallback;
        return that;
    };

    ns.createIntegerParameter = createIntegerParameter;

})(WH);
