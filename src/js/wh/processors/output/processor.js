import createMIDIProcessorBase from '../../midi/processorbase';
import { getMIDIPortByID } from '../../midi/midi';

/**
 * MIDI output port processor.
 */
export function createProcessor(specs, my) {
    let that,
        store = specs.store,
        midiOutput;
    
    const initialize = function() {
            document.addEventListener(store.STATE_CHANGE, handleStateChange);
            updatePortsParameter(store.getState());
        },

        terminate = function() {
            document.removeEventListener(store.STATE_CHANGE, handleStateChange);
        },

        handleStateChange = function(e) {
            switch (e.detail.action.type) {

                case e.detail.actions.CHANGE_PARAMETER:
                    if (e.detail.action.processorID === my.id) {
                        my.params = e.detail.state.processors.byId[my.id].params.byId;
                        switch (e.detail.action.paramKey) {
                            case 'port':
                                updateMIDIPort();
                                break;
                        }
                    }
                    break;
                
                case e.detail.actions.CREATE_MIDI_PORT:
                case e.detail.actions.UPDATE_MIDI_PORT:
                case e.detail.actions.TOGGLE_MIDI_PREFERENCE:
                    updatePortsParameter(e.detail.state);
                    break;
            }
        },

        /**
         * Process events to happen in a time slice.
         * @param {Number} scanStart Timespan start in ticks from timeline start.
         * @param {Number} scanEnd   Timespan end in ticks from timeline start.
         * @param {Number} nowToScanStart Timespan from current timeline position to scanStart.
         * @param {Number} ticksToMsMultiplier Duration of one tick in milliseconds.
         * @param {Number} offset Time from doc start to timeline start in ticks.
         */
        process = function(scanStart, scanEnd, nowToScanStart, ticksToMsMultiplier, offset) {

            // retrieve events waiting at the processor's input
            const inputData = my.getInputData(),
                origin = performance.now() - (offset * ticksToMsMultiplier),
                n = inputData.length;
            
            if (midiOutput && midiOutput.state === 'connected') {
                for (var i = 0; i < n; i++) {
                    let item = inputData[i],

                        // item.timestampTicks is time since transport play started
                        timestamp = origin + (item.timestampTicks * ticksToMsMultiplier),
                        duration = item.durationTicks * ticksToMsMultiplier;
                        
                    switch (item.type) {
                        case 'note':
                            midiOutput.send([0x90 + (item.channel - 1), item.pitch, item.velocity], timestamp);
                            midiOutput.send([0x80 + (item.channel - 1), item.pitch, 0], timestamp + duration);
                            break;
                    }
                }
            }
        },

        /**
         * Retrieve the MIDI port the MIDI notes are sent to.
         * After a port parameter change.
         */
        updateMIDIPort = function() {
            midiOutput = getMIDIPortByID(my.params.port.value);
            
            // update the processor's name parameter
            const item = my.params.port.model.find(element => element.value === my.params.port.value)
            store.dispatch(store.getActions().changeParameter(my.id, 'name', item.label));
        },

        /**
         * Update the ports parameter with the current available ports.
         */
        updatePortsParameter = function(state) {

            // rebuild the parameter's model and recreate the parameter
            const portsModel = [
                { label: 'No output', value: 'none' }
            ];
            state.ports.allIds.forEach(portID => {
                const port = state.ports.byId[portID];
                if (port.type === 'output' && port.networkEnabled && port.state === 'connected') {
                    portsModel.push({ label: port.name, value: port.id });
                }
            });
            store.dispatch(store.getActions().recreateParameter(my.id, 'port', { model: portsModel }));

            // set the parameter's value
            const recreatedState = store.getState(),
                portParam = recreatedState.processors.byId[my.id].params.byId.port,
                value = portParam.value,
                model = portParam.model;
            let item = model.find(element => element.value === value);
            item = item || model.find(element => element.value === 'none');
            
            store.dispatch(store.getActions().changeParameter(my.id, 'port', item.value));
            store.dispatch(store.getActions().changeParameter(my.id, 'name', item.label));
        },
        
        setEnabled = function(isEnabled) {
            my.isEnabled = isEnabled;
        },

        getMIDIPortID = function() {
            return portID;
        };


    my = my || {};
    my.isEnabled = true;

    that = createMIDIProcessorBase(specs, my);

    initialize();
    
    that.terminate = terminate;
    that.process = process;
    that.setEnabled = setEnabled;
    that.getMIDIPortID = getMIDIPortID;
    return that;
}
