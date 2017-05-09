/**
 * @description Controls view.
 * @author Wouter Hisschemöller
 * @version 0.0.0
 * 
 * @namespace WH.epg
 */
 
 window.WH = window.WH || {};

(function (ns) {
    
    function createControlsView(specs) {
        var that,
            midiRemote = specs.midiRemote,
            preferencesView = specs.preferencesView,
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
                    preferencesView.toggle(e.target.checked);
                });
                WH.pubSub.on('transport.start', function() {
                    controls.play.input.checked = true;
                });
                WH.pubSub.on('transport.pause', function() {
                    controls.play.input.checked = false;
                });
                WH.pubSub.on('transport.bpm', function(data) {
                    controls.bpm.input.value = data;
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
            };
        
        that = specs.that;
        
        init();
        
        that.setControlsEnabled = setControlsEnabled;
        return that;
    }

    ns.createControlsView = createControlsView;

})(WH);
