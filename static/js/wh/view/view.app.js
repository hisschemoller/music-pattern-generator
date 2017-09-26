/**
 * Main application view.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createAppView(specs, my) {
        var that,
            app = specs.app,
            midiNetwork = specs.midiNetwork,
            rootEl = document.querySelector('#app'),
            panelsEl = document.querySelector('.panels'),
            helpEl = document.querySelector('.help'),
            prefsEl = document.querySelector('.prefs'),
            editEl = document.querySelector('.edit'),
            editContentEl = document.querySelector('.edit .panel__content'),
            remoteEl = document.querySelector('.remote'),
            settingsViews = [],
            panelHeaderHeight,
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
                    app.updateApp('play');
                });
                controls.bpm.input.addEventListener('change', function(e) {
                    app.updateApp('bpm', e.target.value);
                });
                controls.learn.input.addEventListener('change', function(e) {
                    app.updateApp('learn', e.target.checked);
                });
                controls.prefs.input.addEventListener('change', function(e) {
                    app.togglePanel('preferences', e.target.checked);
                });
                controls.edit.input.addEventListener('change', function(e) {
                    app.togglePanel('settings', e.target.checked);
                });
                controls.help.input.addEventListener('change', function(e) {
                    app.togglePanel('help', e.target.checked);
                });
                
                // get panel header height from CSS.
                var style = getComputedStyle(document.body);
                panelHeaderHeight = parseInt(style.getPropertyValue('--header-height'), 10);
                
                my.addWindowResizeCallback(renderLayout);
                renderLayout();
            },
            
            /**
             * Create settings controls view for a processor.
             * @param  {Object} processor MIDI processor to control with the settings.
             */
            createSettingsView = function(processor) {
                var settingsView = ns.createSettingsView({
                    midiNetwork: midiNetwork,
                    processor: processor,
                    parentEl: editContentEl
                });
                settingsViews.push(settingsView);
            },
            
            /**
             * Delete settings controls view for a processor.
             * @param  {Object} processor MIDI processor to control with the settings.
             */
            deleteSettingsView = function(processor) {
                var n = settingsViews.length;
                while (--n >= 0) {
                    if (settingsViews[n].hasProcessor(processor)) {
                        settingsViews[n].terminate();
                        settingsViews.splice(n, 1);
                        return false;
                    }
                }
            },
            
            renderLayout = function(leftColumn = true, rightColumn = true) {
                if (leftColumn) {
                    renderLayoutLeftColumn();
                }
                if (rightColumn) {
                    renderLayoutRightColumn();
                }
            },
            
            renderLayoutLeftColumn = function() {
                const totalHeight = panelsEl.clientHeight,
                    isPrefsVisible = prefsEl.dataset.show == 'true',
                    isRemoteVisible = remoteEl.dataset.show == 'true',
                    prefsViewportEl = prefsEl.querySelector('.panel__viewport'),
                    remoteViewportEl = remoteEl.querySelector('.panel__viewport'),
                    prefsHeight = prefsEl.clientHeight,
                    remoteHeight = remoteEl.clientHeight,
                    prefsContentHeight = prefsEl.querySelector('.panel__content').clientHeight,
                    remoteContentHeight = remoteEl.querySelector('.panel__content').clientHeight;
                
                if (isPrefsVisible && isRemoteVisible) {
                    let combinedHeight = prefsContentHeight + remoteContentHeight + (panelHeaderHeight * 2);
                    if (combinedHeight > totalHeight) {
                        if (prefsContentHeight + panelHeaderHeight < totalHeight / 2) {
                            prefsViewportEl.style.height = prefsEl.prefsContentHeight + 'px';
                            remoteViewportEl.style.height = (totalHeight - prefsContentHeight - (panelHeaderHeight * 2)) + 'px';
                        } else if (remoteContentHeight + panelHeaderHeight < totalHeight / 2) {
                            prefsViewportEl.style.height = (totalHeight - remoteContentHeight - (panelHeaderHeight * 2)) + 'px';
                            remoteViewportEl.style.height = remoteEl.prefsContentHeight + 'px';
                        } else {
                            prefsViewportEl.style.height = ((totalHeight / 2) - panelHeaderHeight) + 'px';
                            remoteViewportEl.style.height = ((totalHeight / 2) - panelHeaderHeight) + 'px';
                        }
                    } else {
                        prefsViewportEl.style.height = 'auto';
                        remoteViewportEl.style.height = 'auto';
                    }
                } else if (isPrefsVisible) {
                    if (prefsContentHeight + panelHeaderHeight > totalHeight) {
                        prefsViewportEl.style.height = totalHeight - panelHeaderHeight + 'px';
                    } else {
                        prefsViewportEl.style.height = 'auto';
                    }
                } else if (isRemoteVisible) {
                    if (remoteContentHeight + panelHeaderHeight > totalHeight) {
                        remoteViewportEl.style.height = totalHeight - panelHeaderHeight + 'px';
                    } else {
                        remoteViewportEl.style.height = 'auto';
                    }
                }
            },
            
            renderLayoutRightColumn = function() {
                const totalHeight = panelsEl.clientHeight,
                    columnWidth = document.querySelector('.panels__right').clientWidth,
                    editWidth = editEl.clientWidth,
                    helpWidth = helpEl.clientWidth,
                    isEditVisible = editEl.dataset.show == 'true',
                    isHelpVisible = helpEl.dataset.show == 'true',
                    editViewportEl = editEl.querySelector('.panel__viewport'),
                    helpViewportEl = helpEl.querySelector('.panel__viewport'),
                    editContentHeight = editEl.querySelector('.panel__content').clientHeight,
                    helpContentHeight = helpEl.querySelector('.help__nav').clientHeight + helpEl.querySelector('.help__copy').clientHeight;
                
                if (editWidth + helpWidth < columnWidth) {
                    if (editContentHeight + panelHeaderHeight > totalHeight) {
                        editViewportEl.style.height = totalHeight - panelHeaderHeight + 'px';
                    } else {
                        editViewportEl.style.height = 'auto';
                    }
                    if (helpContentHeight + panelHeaderHeight > totalHeight) {
                        helpViewportEl.style.height = totalHeight - panelHeaderHeight + 'px';
                    } else {
                        helpViewportEl.style.height = 'auto';
                    }
                } else {
                    if (isEditVisible && isHelpVisible) {
                        editViewportEl.style.height = ((totalHeight / 2) - panelHeaderHeight) + 'px';
                        helpViewportEl.style.height = ((totalHeight / 2) - panelHeaderHeight) + 'px';
                    } else if (isEditVisible) {
                        if (editContentHeight + panelHeaderHeight >= totalHeight) {
                            editViewportEl.style.height = totalHeight - panelHeaderHeight + 'px';
                        } else {
                            editViewportEl.style.height = 'auto';
                        }
                    } else if (isHelpVisible) {
                        if (helpContentHeight + panelHeaderHeight >= totalHeight) {
                            helpViewportEl.style.height = totalHeight - panelHeaderHeight + 'px';
                        } else {
                            helpViewportEl.style.height = 'auto';
                        }
                    }
                }
            },
            
            updateControl = function(property, value) {
                switch(property) {
                    case 'bpm':
                        controls.bpm.input.value = value;
                        break;
                    case 'play':
                        controls.play.input.checked = value;
                        break;
                    case 'learn':
                        controls.learn.input.checked = value;
                        break;
                }
            },
            
            toggleEdit = function(isVisible) {
                editEl.dataset.show = isVisible;
                renderLayout();
            },
            
            toggleHelp = function(isVisible) {
                helpEl.dataset.show = isVisible;
                renderLayout();
            },
            
            togglePreferences = function(isVisible) {
                prefsEl.dataset.show = isVisible;
                renderLayout();
            },
            
            toggleRemote = function(isVisible) {
                remoteEl.dataset.show = isVisible;
                renderLayout();
            };
        
        my = my || {};
        
        that = ns.addWindowResize(specs, my);
        
        init();
        
        that.renderLayout = renderLayout;
        that.createSettingsView = createSettingsView;
        that.deleteSettingsView = deleteSettingsView;
        that.updateControl = updateControl;
        that.toggleEdit = toggleEdit;
        that.toggleHelp = toggleHelp;
        that.togglePreferences = togglePreferences;
        that.toggleRemote = toggleRemote;
        return that;
    };

    ns.createAppView = createAppView;

})(WH);
