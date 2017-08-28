/**
 * @description Controls view. This is the main controls bar on top of the application window.
 * @author Wouter Hisschemöller
 * @version 0.0.0
 * 
 * @namespace WH.epg
 */
 
 window.WH = window.WH || {};

(function (ns) {
    
    function createControlsView(specs) {
        var that,
            appView = specs.appView,
            midiRemote = specs.midiRemote,
            transport = specs.transport
            controlsEl = document.querySelector('.controls'),
            controls = {
                play: {
                    type: 'checkbox',
                    input: document.getElementById('play-check')
                },
                bpm: {
                    type: 'number',
                    input: document.getElementById('bpm-number')
                },
                learn: {
                    type: 'checkbox',
                    input: document.getElementById('learn-check')
                },
                prefs: {
                    type: 'checkbox',
                    input: document.getElementById('prefs-check')
                },
                edit: {
                    type: 'checkbox',
                    input: document.getElementById('edit-check')
                },
                help: {
                    type: 'checkbox',
                    input: document.getElementById('help-check')
                }
            },
            
            init = function() {
                controls.play.input.addEventListener('change', function(e) {
                    transport.toggleStartStop();
                });
                controls.bpm.input.addEventListener('change', function(e) {
                    transport.setBPM(e.target.value);
                });
                controls.learn.input.addEventListener('change', function(e) {
                    midiRemote.toggleMidiLearn(e.target.checked);
                });
                controls.prefs.input.addEventListener('change', function(e) {
                    appView.togglePreferences(e.target.checked);
                });
                controls.edit.input.addEventListener('change', function(e) {
                    appView.toggleEdit(e.target.checked);
                });
                controls.help.input.addEventListener('change', function(e) {
                    appView.toggleHelp(e.target.checked);
                });
                document.addEventListener('keyup', function(e) {
                    switch (e.keyCode) {
                        case 32:
                            transport.toggleStartStop();
                            break;
                    }
                });
            },
            
            /**
             * Toggle controls disabled state. When e clock sync is used.
             * @param {Boolean} isEnabled Disable controls when false.
             */
            setControlsEnabled = function(isEnabled) {
                controls.play.input.disabled = !isEnabled;
                controls.bpm.input.disabled = !isEnabled;
            },
            
            /**
             * Display the transport BPM value.
             * @param {String} value Beats Per Minute.
             */
            setBPMValue = function(value) {
                controls.bpm.input.value = value;
            },
            
            /**
             * Set the play button state after change in transport.
             * @param {Boolean} value True if transport runs.
             */
            setPlayButtonState = function(value) {
                controls.play.input.checked = value;
            };
        
        that = specs.that;
        
        init();
        
        that.setControlsEnabled = setControlsEnabled;
        that.setBPMValue = setBPMValue;
        that.setPlayButtonState = setPlayButtonState;
        return that;
    }

    ns.createControlsView = createControlsView;

})(WH);
