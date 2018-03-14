/**
 * MIDI input or output port processor view.
 */
export default function createMIDIBaseView(specs, my) {
    var that,
        parentEl = specs.parentEl,
        port = specs.port,
        
        initialize = function() {
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

            // set checkboxes
            my.networkEl.querySelector('[type=checkbox]').checked = specs.networkEnabled;
            my.syncEl.querySelector('[type=checkbox]').checked = specs.syncEnabled;
            my.remoteEl.querySelector('[type=checkbox]').checked = specs.remoteEnabled;
            
            // add DOM event listeners
            my.networkEl.addEventListener('change', function(e) {
                if (!e.currentTarget.dataset.disabled) {
                    my.store.dispatch(my.store.getActions().togglePortNetwork(my.id, my.isInput));
                }
            });
            my.syncEl.addEventListener('change', function(e) {
                if (!e.currentTarget.dataset.disabled) {
                    my.store.dispatch(my.store.getActions().togglePortSync(my.id, my.isInput));
                }
            });
            my.remoteEl.addEventListener('change', function(e) {
                if (!e.currentTarget.dataset.disabled) {
                    my.store.dispatch(my.store.getActions().togglePortRemote(my.id, my.isInput));
                }
            });

            // create input or output processor for the MIDI port
            if (specs.networkEnabled) {
                my.store.dispatch(my.store.getActions().togglePortNetwork(my.id, my.isInput, true));
            }

            // listen to state updates
            document.addEventListener(my.store.STATE_CHANGE, (e) => {
                switch (e.detail.action.type) {
                    case e.detail.actions.SET_PROJECT:
                    case e.detail.actions.TOGGLE_MIDI_PREFERENCE:
                    case e.detail.actions.TOGGLE_PORT_SYNC:
                    case e.detail.actions.TOGGLE_PORT_REMOTE:
                        const port = e.detail.state.ports.byId[my.id];
                        if (port) {
                            my.networkEl.querySelector('[type=checkbox]').checked = port.networkEnabled;
                            my.syncEl.querySelector('[type=checkbox]').checked = port.syncEnabled;
                            my.remoteEl.querySelector('[type=checkbox]').checked = port.remoteEnabled;
                        } else {
                            console.log(`MIDI port with id ${my.id} not found.`);
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
