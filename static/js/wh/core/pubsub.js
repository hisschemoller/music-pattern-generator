/**
 * Simple PubSub pattern.
 * @namespace WH
 */
window.WH = window.WH || {};

(function (ns) {

    function createPubSub() {
        
        var that,
            listeners = [],
            
            /**
             *  Adds a new event listener. This method accepts a name and a callback
             *  function. When the event with this name is fired, the callback function
             *  will be called.
             *  @method on
             *  @public
             *  @param {String} name - The name of the event
             *  @param {Function} callback - The callback function
             */
            on = function (name, callback) {
                var data = {};
                data.name = name;
                data.callback = callback;
                listeners.push(data);
                return data;
            },

            /**
             *  Removes an existing event listener. This method accepts a name and a
             *  callback function. When there is a listener found for the given name,
             *  and the callback function matches the listener, the listener will be
             *  removed.
             *  @method off
             *  @public
             *  @param {String} name - The name of the event
             *  @param {Function} callback - The callback function
             */
            off = function (name, callback) {
                var i = 0,
                    listenerLength = listeners.length,
                    listener;

                for (; i < listenerLength; ++i) {
                    listener = listeners[i];
                    if (listener && listener.name === name &&
                        listener.callback === callback) {
                        listeners.splice(i, 1);
                    }
                }
            },

            /**
             *  Fires an event
             *  @method fire
             *  @public
             *  @param {String} name - The name of the event
             *  @optional {Mixed} data - The data you want to send along with the object
             */
            fire = function (name) {
                var args = arguments,
                    data = {},
                    i = 0,
                    listenerLength = listeners.length,
                    listener;

                data.name = name;

                for (; i < listenerLength; ++i) {
                    listener = listeners[i];
                    if (listener && listener.name === name) {
                        listener.callback.apply(data, Array.prototype.slice.call(
                            args,
                            1,
                            args.length
                        ));
                    }
                }
            },

            /**
             *  Unsubscribes all listeners
             *  @method offAll
             *  @public
             */
            offAll = function () {
                listeners = [];
            };
        
        that = {};
        that.on = on;
        that.off = off;
        that.fire = fire;
        that.offAll = offAll;
        return that;
    }
    
    ns.createPubSub = createPubSub;
    
})(WH);
