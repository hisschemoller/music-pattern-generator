/**
 * MIDI input or output port processor view.
 */
export default function createMIDIBaseView(specs, my) {
    var that,
        parentEl = specs.parentEl,
        port = specs.port,
        
        initialize = function() {
            // set callback for the port to update the view
            // port.setViewCallback(updateView);
            
            // find template, add clone to midi ports list
            let template = document.querySelector('#template-midi-port');
            let clone = template.content.cloneNode(true);
            my.el = clone.firstElementChild;
            parentEl.appendChild(my.el);
            
            // set data-connected="true" to make the element visible
            my.el.dataset.connected = true;
            
            // show label
            my.el.querySelector('.midi-port__label').innerHTML = specs.name;
            
            // find checkboxes
            my.networkEl = my.el.querySelector('.midi-port__network');
            my.syncEl = my.el.querySelector('.midi-port__sync');
            my.remoteEl = my.el.querySelector('.midi-port__remote');
            
            // add DOM event listeners
            my.networkEl.addEventListener('change', function(e) {
                if (!e.currentTarget.dataset.disabled) {
                    my.store.dispatch(my.store.getActions().togglePortNetwork(my.id, my.isInput));
                }
            });
            my.syncEl.addEventListener('change', function(e) {
                if (!e.currentTarget.dataset.disabled) {
                    port.toggleSync();
                }
            });
            my.remoteEl.addEventListener('change', function(e) {
                if (!e.currentTarget.dataset.disabled) {
                    port.toggleRemote();
                }
            });

            // listen to state updates
            document.addEventListener(my.store.STATE_CHANGE, (e) => {
                switch (e.detail.action.type) {
                    case e.detail.actions.TOGGLE_PORT_NETWORK:
                        if (e.detail.action.id === my.id) {
                            const ports = e.detail.action.isInput ? e.detail.state.inputs : e.detail.state.outputs;
                            ports.forEach(port => {
                                if (port.id === my.id) {
                                    my.networkEl.querySelector('[type=checkbox]').checked = port.networkEnabled;
                                }
                            });
                        }
                        break;
                }
            });
        },
        
        /**
         * Called before this view is deleted.
         */
        terminate = function() {
            if (my.el && parentEl) {
                parentEl.removeChild(my.el);
            }
        },
        
        /**
         * Callback for port to update view.
         */
        updateView = function(key, value) {
            switch (key) {
                case 'network':
                    my.networkEl.querySelector('[type=checkbox]').checked = value;
                    break;
                case 'sync':
                    my.syncEl.querySelector('[type=checkbox]').checked = value;
                    break;
                case 'remote':
                    my.remoteEl.querySelector('[type=checkbox]').checked = value;
                    break;
                case 'connected':
                    my.el.dataset.connected = value;
                    break;
            }
        },
        
        getID = function() {
            return my.id;
        };
        
    my = my || {};
    my.store = specs.store;
    my.isInput = specs.isInput;
    my.id = specs.id;
    my.el;
    my.networkEl;
    my.syncEl;
    my.remoteEl;
    
    that = that || {};
    
    initialize();
    
    that.terminate = terminate;
    that.getID = getID;
    return that;
}
