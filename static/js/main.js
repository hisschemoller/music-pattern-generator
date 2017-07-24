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

'use strict';

/**
 * Application startup.
 */
document.addEventListener('DOMContentLoaded', function(e) {

    // Create all objects that will be the modules of the app.
    var appView = {},
        canvasView = {},
        controlsView = {},
        file = {},
        fileView = {},
        midi = {},
        midiNetwork = {},
        midiRemote = {},
        midiSync = {},
        preferences = {},
        preferencesView = {},
        remoteView = {},
        transport = {};

    // Add functionality to the modules and inject dependencies.
    WH.createAppView({
        that: appView,
        midiNetwork: midiNetwork
    });
    WH.createCanvasView({
        that: canvasView,
        midiNetwork: midiNetwork
    });
    WH.createControlsView({
        that: controlsView,
        midiRemote: midiRemote,
        preferencesView: preferencesView,
        transport: transport
    });
    WH.createPreferences({
        that: preferences
    });
    WH.createPreferencesView({
        that: preferencesView,
        canvasView: canvasView,
        preferences: preferences
    });
    WH.createRemoteView({
        that: remoteView,
        midiRemote: midiRemote
    });
    WH.createFile({
        that: file,
        midi: midi,
        midiNetwork: midiNetwork,
        midiRemote: midiRemote,
        preferences: preferences,
        transport: transport
    });
    WH.createFileView({
        that: fileView,
        file: file
    });
    WH.createMIDI({
        that: midi,
        preferencesView: preferencesView,
        midiNetwork: midiNetwork,
        midiRemote: midiRemote,
        midiSync: midiSync
    });
    WH.createMIDIRemote({
        that: midiRemote,
        remoteView: remoteView
    });
    WH.createMIDISync({
        that: midiSync,
        transport: transport
    });
    WH.createMIDINetwork({
        that: midiNetwork,
        appView: appView,
        canvasView: canvasView,
        midiRemote: midiRemote,
        preferencesView: preferencesView
    });
    WH.createTransport({
        that: transport,
        canvasView: canvasView,
        controlsView: controlsView,
        midiNetwork: midiNetwork
    });

    // initialise
    midi.setup();
    file.setup();
    transport.run();
});
