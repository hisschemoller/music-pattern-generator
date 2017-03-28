/**
 * Base parameter functionality.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createBaseParameter(specs, my) {
        var that,
            defaultValue = specs.default,
            changedCallbacks = [],
		    
            /**
             * Call all callbacks if the parameter's value changed.
             * @param {Number|String|Boolean|Array} oldValue Value before change.
             */
        	valueChanged = function(oldValue) {
        		if (oldValue == my.props.value) {
                    return;
                }
                var n = changedCallbacks.length;
    			for (var i = 0; i < n; i++) {
                    changedCallbacks[i](that, oldValue, my.props.value);
                }
        	},
		
        	/**
        	 * Adds a callback function, invoked on value changed.
        	 * @param {Function} callback The function, that will be invoked on value changed.
        	 */
        	addChangedCallback = function(callback) {
        		changedCallbacks.push(callback);
        	},

    		/**
    		 * Removes a callback function.
    		 * @param {Function} callback The function that will be removed.
    		 */
    		removeChangedCallback = function(callback) {
    			var index = changedCallbacks.indexOf(callback);
    			if (index > -1) {
                    changedCallbacks.splice(index, 1);
                }
    		},
		
        	/**
        	 * Reset value to its initial default value.
        	 */
        	reset = function() {
        		setValue(defaultValue);
        	},

        	/**
        	 * Sets the current value of the parameter.
        	 * If changed, inform all callbacks.
        	 */
            setValue = function(newValue) {
                var oldValue = my.props.value;
                my.props.value = newValue;
                valueChanged(oldValue);
            },
		
    		/**
    		 * Returns the current value of the parameter.
    		 * @return {*} Parameter value.
    		 */
            getValue = function() {
                return my.props.value;
            },
		
    		/**
    		 * Sets the current value of the parameter
    		 * by passing a normalized value between 0 and 1.
    		 * If changed, inform all callbacks.
    		 * @param normalizedValue A normalized value between 0 and 1.
    		 */
    		setValueNormalized = function(normalizedValue) {
    			var oldValue = my.props.value;
    			my.props.value = my.deNormalize(normalizedValue);
    			valueChanged(oldValue);
    		},

        	/**
        	 * Returns the current normalized value of the parameter between 0 and 1.
        	 * @return {Number} Normalized value.
        	 */
        	getValueNormalized = function() {
        		return my.normalize(my.props.value);
        	},
            
            /**
             * Get a property's value.
             * @param  {String} key Property name.
             * @return {*} Property value.
             */
            getProperty = function(key) {
                let propValue;
                if (my.hasOwnProperty(key)) {
                    propValue =  my[key];
                } else if (my.props.hasOwnProperty(key)) {
                    propValue =  my.props[key];
                }
                return propValue;
            },
            
            /**
             * Restore processor from data object.
             * @param {Object} data Preferences data object.
             */
            setData = function(data) {
                for (var key in my.props) {
                    if (my.props.hasOwnProperty(key)) {
                        my.props[key] = data.props[key];
                    }
                }
                // use setValue to trigger callbacks
                my.props.value = defaultValue;
                setValue(data.props.value);
            }, 
            
            /**
             * Write parameter properties to data object.
             * @return {Object} Data object.
             */
            getData = function() {
                var data = {
                    props: my.props
                };
                return data;
            };
            
        my = my || {};
        my.props = {
            value: specs.value || specs.default,
        };
        my.type = specs.type;
        my.label = specs.label;
        my.key = specs.key;
        my.isMidiControllable = specs.isMidiControllable;
        
        that = specs.that || {};
        if (my.isMidiControllable) {
            that = ns.createRemoteParameter(specs, my);
        }
        
        that.addChangedCallback = addChangedCallback;
        that.removeChangedCallback = removeChangedCallback;
        that.reset = reset;
        that.setValue = setValue;
        that.getValue = getValue;
        that.setValueNormalized = setValueNormalized;
        that.getValueNormalized = getValueNormalized;
        that.getProperty = getProperty;
        that.setData = setData;
        that.getData = getData;
        return that;
    };

    ns.createBaseParameter = createBaseParameter;

})(WH);
