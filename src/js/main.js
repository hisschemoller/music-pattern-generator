/**
    Euclidean Pattern Generator
    Copyright (C) 2017  Wouter Hisschemoller

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import createApp from './wh/core/app';
import createFile from './wh/core/file';
import createTransport from './wh/core/transport';
import createMIDI from './wh/midi/midi';
import createMIDINetwork from './wh/midi/network';
import createMIDIRemote from './wh/midi/remote';
import createMIDISync from './wh/midi/sync';
import createActions from './wh/state/actions';
import createReducers from './wh/state/reducers';
import createStore from './wh/state/store';
import createAppView from './wh/view/app';
import createCanvasView from './wh/view/canvas';
import createPreferencesView from './wh/view/preferences';
import createRemoteView from './wh/view/remote';
import createFileView from './wh/view/file';

/**
 * Application startup.
 */
document.addEventListener('DOMContentLoaded', function(e) {

    // Create all objects that will be the modules of the app.
    var app = {},
        appView = {},
        canvasView = {},
        file = {},
        fileView = {},
        midi = {},
        midiNetwork = {},
        midiRemote = {},
        midiSync = {},
        preferencesView = {},
        remoteView = {},
        transport = {};
    
    const store = createStore({
        actions: createActions(),
        reducers: createReducers()
    });

    // Add functionality to the modules and inject dependencies.
    createApp({
        that: app,
        appView: appView,
        midiNetwork: midiNetwork,
        midiRemote: midiRemote,
        transport: transport
    });
    createAppView({
        that: appView,
        store: store,
        app: app,
        midiNetwork: midiNetwork
    });
    createCanvasView({
        that: canvasView,
        store: store
    });
    createPreferencesView({
        that: preferencesView,
        store: store,
        canvasView: canvasView
    });
    createRemoteView({
        that: remoteView,
        appView: appView,
        midiRemote: midiRemote
    });
    createFile({
        that: file,
        store: store,
        midi: midi,
        midiNetwork: midiNetwork,
        midiRemote: midiRemote,
        transport: transport
    });
    createFileView({
        that: fileView,
        file: file
    });
    createMIDI({
        that: midi,
        preferencesView: preferencesView,
        midiNetwork: midiNetwork,
        midiRemote: midiRemote,
        midiSync: midiSync
    });
    createMIDIRemote({
        that: midiRemote,
        app: app,
        remoteView: remoteView
    });
    createMIDISync({
        that: midiSync,
        transport: transport
    });
    createMIDINetwork({
        that: midiNetwork,
        store: store,
        app: app,
        appView: appView,
        canvasView: canvasView,
        midiRemote: midiRemote,
        preferencesView: preferencesView
    });
    createTransport({
        that: transport,
        app: app,
        canvasView: canvasView,
        midiNetwork: midiNetwork
    });

    // initialise
    midi.connect()
        .then(file.loadLocalStorage)
        .then(transport.run);
});
