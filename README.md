# Music Pattern Generator
An application to generate musical rhythmic patterns in MIDI.

## Introduction
This is an application to create rhythm patterns that can be used in music. It doesn't produce any sounds by itself, but sends MIDI messages to other applications that can generate sound. These applications typically are music programs like Ableton Live, Cubase or FL Studio. MIDI messages can also be sent to external hardware instruments like drum machines, samplers or synthesizers.

The app can be used online or as a desktop application. Downloads are available for Linux, Mac and Windows. The online version currently only works in Chrome, because that's the only browser that supports MIDI.

## Quick start

#### 1. Create a pattern.
  * Drag a Euclidean processor from the Library on the left and drop it in the empty area in the middle of the screen.
  * A Euclidean pattern wheel appears at the position you dropped it.
  * You can press play now, and the wheel will spin.
#### 2. Create a MIDI Output.
  * Drag an Output processor from the Library and drop it in the empty canvas area.
  * The Output processor represents a MIDI port to send MIDI out of the application.
  * The Output processor you just created is not yet assigned to a MIDI port.
#### 3. Connect the Euclidean pattern to the Output.
  * Enter connect mode with the Connections button in the ControlBar.
  * Connector circles will now appear below the Euclidean processor and above the Output processor.
  * Output connectors appear below the processor and inputs above it.
  * Click and drag from the Euclidean processor's output to the Output processor's input.
  * When you drag a line will appear from the Euclidean processor's output.
  * If you finish the drag above an input, the connection is created and the connecting line remains visible.
#### 5. Select a MIDI Port.
  * Click the Output processor to show its Settings panel, if it wasn't visible already.
  * Open the Preferences panel with the Preferences button in the ControlBar.
  * The Preferences panel shows a list of all detected MIDI output devices.
  * Toggle on of the outputs port's Network column from Off to On.
  * The network of processors can now use the MIDI port.
  * The Settings panel now shows the MIDI port as a selectable port.
  * Click the port in the Settings panel to select it.
  * The Output processor will now send MIDI events to the selected port.
#### 6. Play
  * Make sure you have a software or hardware sound generator connected to the MIDI port.
  * Make sure it listens to MIDI channel 1. That's the Euclidean processor's default channel.
  * Make sure it plays a sound on MIDI pitch 60. That's the Euclidean processor's default pitch.
  * Press play and you will hear the pattern produced by the Euclidean processor.

## Download and online use

The app can be used online or as a desktop application. Downloads are available for Linux, Mac and Windows. The online version currently only works in Chrome, because that's the only browser that supports MIDI.

Please find the the online version here:

https://www.hisschemoller.com/mpg/

## Application concepts

### Processors

Processors are the basic building blocks in the application. Each processor generates or changes MIDI notes depending on the type of the processor. It also has a series of settings to change the way it works.

A processor has two views:

* __Canvas graphic__ - A graphic representation of the processor in the canvas area. The graphic animates when the app plays. The animation gives visual feedback of what the processor is doing. It can also change shape according to setting changes.
* __Settings panel__ - A panel of user changeable settings. 

Processors are created by dragging new instances from the library onto the canvas area.

### Network

Processors are connected to form a network. A single processor usually performs just one basic function. Connected in a network they combine to create interesting music and rhythms.

Processors have inputs and outputs to connect them to the network. One output can have multiple connections to multiple destinations, and likewise multiple connections from multiple sources can lead to a single input.

Ultimately one or more outputs must be connected to one or more Output processors that send the MIDI messages out of the application to soft- or hardware that can handle MIDI events.

The network of connected processors is comparable to modular software like Pure Data, Max/MSP or Reaktor. Differences are that it only handles MIDI and that it uses animating graphics for user feedback. 

## Application overview

The application consists of a controlbar at the top, a main canvas area below, and a set of panels that can be opened and closed to reveal specific functionality.

### Canvas

Canvas is the main area where processors are created and connected. It spans the whole background of the application. 

* __Select processor__ - Processors are selected by clicking their center circle.
* __Move processor__ - Processors can be moved around the canvas by dragging within their center circle. 
* __Move all__ - Dragging the canvas background moves all processors. So processors can be dragged out of view and still perform.

### Controlbar

The controlbar is the permanently visible top bar. It shows a row of buttons and other controls.

* __New Project__ - Create an empty new project. All previous existing processors are lost.
* __Open Project__ - Opens a file browser to select and load a project file that was saved earlier.
* __Save Project__ - Opens a file browser to save the current project to a file.
* __Play / Stop__ - Starts and stops playback of the patterns.
* __BPM Tempo__ - A number input to set the tempo in Beats Per Minute.
* __Library__ - Toggles the Library panel.
* __Preferences__ - Toggles the Preferences panel.
* __MIDI Learn__ - Toggles 'MIDI Learn' mode and the associated remote MIDI Assignments panel.
* __Settings__ - Toggles the settings panel showing the currently selected pattern's settings.
* __Connect mode__ - Toggles processor connect mode. This has no associated panel.
* __Help__ - Toggles the Help text panel.
* __Version__ - The right side of the bar shows the app's version number.

### Library

The library shows the available processors. Drag a processor from the library to the canvas to create a new instance at the posistion where you dropped it. The settings panel shows the settings for the new processor. Available processors:

* __Euclidean__ - Generates MIDI notes using the Euclidean pattern algorithm.
* __Euclid FX__ - Changes a property of incoming notes based on the Euclidean pattern algorithm.
* __Output__ - Sends incoming notes to a MIDI output port on the host computer.

### Processor settings

The settings panel shows the currently selected processor's settings. These differ per processor type. Common controls are:

* __Naming field__ - Each processor is created with a default name that can be changed here.
* __Delete button__ - Removes the processor from the network and deletes its connections.

### Preferences

The preferences panel shows the MIDI port settings. The list of MIDI ports automatically updates when MIDI devices are added or removed. MIDI ports have multiple settings:

* __MIDI Input Sync__ - The app responds to MIDI Start, Stop and Continue messages on the port.
* __MIDI Input Remote__ - The app listens to MIDI Continuous Control messages if remote control assignments are set up.
* __MIDI Output Network__ - The output port can be selected as target of network Output processors.

The __Theme__ switch switches the app to a dark colour theme, which is easier to look at in dark environments.

### Remote assignments

The remote panel shows a list of all processor settings that are assigned to respond to a MIDI Continuous Control. Assignments can be set up with the MIDI Learn system. The assigned settings are grouped by processor. Each setting in the list shows:

* __Setting name__ - Name of the setting in the Settings panel.
* __Channel__ - Assigned MIDI channel number.
* __CC__ - Assigned MIDI Continuous Control number.
* __Delete button__ - Button to remove the assignment.

### Help

* Documentation on how to use the app.

## Processor types

### Euclidean

The Euclidean processor generates Euclidean rhythms. For an explanation please see the section below. 

It's panel has the following settings:

* __Steps, Pulses, Rotation__ - The Euclidean settings that determine the pattern.
* __Rate__ - The duration of one step in the pattern. Default is 1/16, where one step is a 16th note. If you change that rate to 1/8 the pattern play half speed.
* __Note length__ - The length of a played note. Default is 1/16, which is a 16th note.
* __Triplets__ - 
* __Mute__ - 
* __MIDI Out Channel, Pitch, Velocity__ - Properties of the MIDI notes that the pattern will output.
* __Name__ - All patterns get a default name which can be changed here.
* __Delete__ - Button to delete the current pattern.

### Euclid FX

### Output

## MIDI learn and remote control


### External MIDI sync
















The application creates a specific type of patterns, known as Euclidean rhythms. These are generated by a mathematical algorithm and often resemble African and South-American traditional drum and percussion patterns. The application makes it easy to create polyrhythms, where patterns of different length play together to create interesting slowly evolving rhythms.

A desktop application can be downloaded for Windows, Mac and Linux, and it can be used as an online app that runs in the browser as well (Chrome and Chromium only at the moment). It is written in Javascript and uses the Electron framework to create the desktop versions.

## Euclidean rhythms
Euclidean rhythms are generated with a simple mathematical formula. It distributes an amount of pulses as evenly as possible over a period of time, where time is divided in equal parts. So, say you have four notes to divide over a sequence of sixteen steps, the result is:

``x . . . x . . . x . . . x . . .``

Each note is separated from the next by three rests, a typical house and techno kick drum pattern. 4 steps can be very evenly distributed over 16 steps: 16 / 4 = 4. More uneven divisions create more complex rhythms. 5 notes over 16 steps for example results in this pattern:

``x . . . x . . x . . x . . x . .``

Interesting polyrhythms can be created by combining patterns of different length. The patterns in the application go up to 64 steps in length.

Patterns can also be rotated to create more variation, because without rotation they always start with a note on the first step. This is the 4 on 16 pattern from before followed by rotations of 1 and 2:

``x . . . x . . . x . . . x . . .``

``. x . . . x . . . x . . . x . .``

``. . x . . . x . . . x . . . x .``

The generation of Euclidean rhythms in music was discovered by Godfried Toussaint in 2004. His paper on this theory is online as a PDF file: [The Euclidean Algorithm Generates Traditional Musical Rhythms][link_toussaint]

## Download and installation

Desktop applications will be available for Linux, Mac and Windows.

## Quick start

The application opens with just the controlbar visible at the top and the empty pattern area below.

* Create a pattern by double clicking the pattern area. A pattern wheel appears and its Settings panel opens at the right.
* You can start and stop the pattern with the play button in the controlbar.
* Open the Preferences panel with the 'cogwheel' button in the controlbar.
* Choose the MIDI output you want by toggling its button in the Network column. 'Network' is the term for the network of patterns that outputs MIDI notes on this port.
* The pattern you created will now send notes to your MIDI port on Channel 1 with Pitch 60 and Velocity 100, the default values of a new pattern (as you can see in the Settings panel).

## Application overview

The application window shows a controlbar at the top. The rest of the window is the pattern area. Panels can be opened and closed as necessary.

### Controlbar

The controlbar is permanently visible and shows a row of buttons and other controls.

* __New Project__ - Create an empty new project. All previous existing patterns are lost.
* __Open Project__ - Opens a file browser to select and load a project file that was saved earlier.
* __Save Project__ - Opens a file browser to save the current project to a file.
* __Play / Stop__ - Starts and stops playback of the patterns.
* __BPM Tempo__ - A number input to set the tempo in Beats Per Minute.
* __Preferences__ - Toggles the Preferences panel.
* __MIDI Learn__ - Toggles 'MIDI Learn' mode and the associated Remote MIDI Assignments panel.
* __Settings__ - Toggles the panel with settings of the currently selected pattern.
* __Help__ - Toggles the Help text panel.

### Pattern area

* Doubleclick the background to create a pattern.
* Click a pattern to select or drag it.
* Drag the background to move all patterns at once.

### Settings panel

The Settings panel shows the settings for the currently selected pattern.

* __Steps, Pulses, Rotation__ - The Euclidean settings that determine the pattern.
* __Rate__ - The duration of one step in the pattern. Default is 1/16, where one step is a 16th note. If you change that rate to 1/8 the pattern play half speed.
* __Note length__ - The length of a played note. Default is 1/16, which is a 16th note.
* __MIDI Out Channel, Pitch, Velocity__ - Properties of the MIDI notes that the pattern will output.
* __Name__ - All patterns get a default name which can be changed here.
* __Delete__ - Button to delete the current pattern.

### Preferences panel

Preferences are loaded when the program starts. They are not stored in project files.

* __MIDI Inputs__ - All MIDI input ports are listed here.
  - __Sync__ - MIDI start and stop messages received on the port will start and stop playback.
  - __Remote__ - MIDI CC messages received on the port can be assigned to remotely control pattern parameters.
* __MIDI Outputs__ - All MIDI output ports are listed here.
  - __Network__ - MIDI notes are sent to the selected output port. 'Network' is the term for the network of patterns that generates MIDI notes.

MIDI devices that are connected or disconnected will automatically appear or disappear in this list. If a device is accidentally diconnected and reconnected, it's settings are attempted to be restored.

* __Dark theme__ - An inverse colour theme with light content on a dark background. To comfortably use the application in dark environments.

### MIDI Assignments panel

A list of all the pattern parameters that have a MIDI CC assigned to them so they can be remotely controlled. The assignments are grouped by pattern. Creating remote assignments is explained elsewhere in this text.

Each assignment in the list shows these fields:

* Name of the parameter.
* MIDI Channel of he assigned CC.
* MIDI CC (Continuous Control) number.
* A 'X' button to remove the assignment.

## MIDI learn mode

Several pattern parameters can be remotely controlled by MIDI CC messages. A CC is associated with a parameter by its MIDI Channel and its Controller number. To set this up 'MIDI learn mode' is used. The following example presumes you use a hardware MIDI controller with knobs or sliders that send MIDI CC messages.

* Connect your MIDI Controller hardware to a MIDI input.
* In the Preferences panel make sure that the MIDI input port has its Remote option enabled.
* Click the 'MIDI Learn' button (MIDI connector icon) in the controlbar to enter MIDI learn mode.
  - The Remote Assignments panel appears, showing all existing assignments.
  - The selected pattern's Settings panel shows a dashed border around each parameter that is not yet assigned.
  - Parameters that have already been assigned show a solid unbroken line as their border.
* Select a pattern and click an assignable parameter in the Settings panel. The parameter will turn slightly darker to indicate it's selected.
* Turn a knob on the hardware controller that sends MIDI CC messages.
* The MIDI Channel and CC Number is now assigned to the parameter.
  - The paremeter's border turns from dashed to a solid line.
  - The assignent appears in the Assignments panel list.
* Click the 'MIDI Learn' button in the controlbar to exit MIDI learn mode.
* Now, if you turn the knob on the hardware, the pattern's parameter will change accordingly.

The assignments are saved in the project file. So save the project to keep the assignments for later use in the project.



[link_toussaint]: http://cgm.cs.mcgill.ca/~godfried/publications/banff.pdf

## Note
This app is a project in progress, so all of the above might not yet.

For the moment the app uses older Electron version 1.4.16 because newer vesrions have a bug that stops requestAnimationFrame when the app window is in the background.
See https://github.com/electron/electron/issues/9567
