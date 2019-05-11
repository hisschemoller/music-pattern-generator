# Music Pattern Generator

An application to create musical rhythms in MIDI.

## Overview

Music Pattern Generator is an app to create musical rhythms. It sends MIDI data, so it won’t make any sounds by itself. For that you need to connect it to MIDI soft- or hardware that can handle MIDI data to produce sound.

## Processors

Music Pattern Generator has a modular setup. Modules are called processors and are connected to form a network. Modules can produce MIDI notes, transform incoming data or send notes to MIDI output ports.

![Processor types](assets/img/processor-types.jpg 'Processor types')

Three types of processors are available at the moment:

- ‘Euclidean’ generates euclidean rhythms
- 'Euclid FX’ transforms incoming MIDI notes
- ‘Output’ sends notes to MIDI output ports

Processors are created by dragging them out of the Library into the main area of the app.

## Connections

![Connecting processors](assets/img/processor-connecting.jpg 'Connecting processors')

Processors have their input at the top and output at the bottom. Connections are made by dragging a cable from the output of one processor to the input of another. The app must be in 'Connection mode', which is enabled by clicking the Connections button in the top Control Bar.

A single output can connect to multiple other processors' inputs. Just drag as many cables as you want out of the output. Similarly, an input can receive data from multiple outputs.

Connection cables can be deleted by clicking the Delete button that shows halfway each cable when in 'Connection mode'.

## The Euclidean processor

![The Euclidean processor](assets/img/processor-euclidean.jpg 'The Euclidean processor')

The Euclidean processor generates rhythm patterns using the [Euclidean algorithm](https://en.wikipedia.org/wiki/Euclidean_rhythm).

Each processor has it's own editor panel to change it's settings. Click the 'Editor' button in the Control Bar if the panel isn't visible. The editor always shows the settings of the selected processor. Select a processor by clicking it's center circle. The processor will show a double ring to indicate it's selected.

![The Euclidean settings editor](assets/img/processor-euclidean-editor.jpg 'The Euclidean settings editor')

This editor panel shows the settings for the rightmost processor in the image above. 

The top three settings - steps, pulses and rotation - produce the actual pattern. Play with them and you will get a feeling for the results and what they do.

Rate sets the musical timing of the pattern. At '1/16' each step will take a quarter beat as set in the 'Beats Per Minute' input in the Control Bar. The number must be understood a part of a whole measure where one measure lasts four beats. Just try and you'll understand.

Note Length uses the same timing as rate. It's generally best to not set it higher than the rate or notes will overlap and produce usually unwanted results.

The other settings are self explanatory.

## The Euclid FX processor

![The Euclid FX processor](assets/img/processor-euclidfx.jpg 'The Euclid FX processor')

The Euclid FX processor transforms incoming MIDI notes and sends them out of the output. 

It changes a MIDI note in one of two possible ways. A Euclidean pattern decides which of the two ways.

![The Euclid FX settings editor](assets/img/processor-euclidfx-editor.jpg 'The Euclid FX settings editor')

This editor panel shows the settings for the rightmost processor in the image above. 

Most settings are exactly the same as in the Euclidean processor editor. The only real difference here is the Effect section.

- The Target sets which property of the MIDI notes will be changed.
- Low value sets the value when the pattern is between pulses.
- High value sets the value when the pattern on a pulse.
- Mode sets the way the new values are applied:
  - Absolute mode overwrites the incoming data,
  - Relative mode adds to the incoming data.

### An Example

This is the case in the image above. The target is Velocity and mode is Absolute. Now the velocity of the incoming MIDI notes will be changed to 50 or 100, depending on the state of the pattern at the moment the note arrives. It's previous velocity value is lost.

### Another example

![The Euclid FX example 2](assets/img/processor-euclidfx-example2.jpg 'The Euclid FX example 2')

The target is Pitch and mode is Relative. Depending on the state of the pattern at the moment the note arrives, a value of two is distracted from the pitch or five is added. Lets say the incoming MIDI notes have a pitch of 60, then they will be changed to 60 - 2 = 58 or 60 + 5 = 65. Or in musical terms, notes arrive in C, and are turned into either Bb or F.

## The Output processor

![The Output processor](assets/img/processor-output.jpg 'The Output processor')

The output processor sends incoming MIDI out of the app to a MIDI port.

Only MIDI ports that are enabled in the Preferences panel can be used as an output. Click the 'Preferences' button in the Control Bar to open the Preferences panel. Then enable all MIDI outputs you want to use in the Network column. As shown in the image above.

![The Output settings editor](assets/img/processor-output-editor.jpg 'The Output settings editor')

Select an output in the MIDI ports list of the editor. 

Multiple Output processors can be added in a single project to send MIDI to multiple ports.

## The Preferences panel

![The Preferences panel](assets/img/preferences.jpg 'The Preferences panel')

The preference settings are saved separately from a project, so they will persist when switching between projects or creating new ones.

### MIDI Inputs

Only the Remote column is active for the MIDI inputs. When MIDI controllers are used for automation, the app only listens to MIDI Continuous Control data on inputs that have Remote enabled. The section about MIDI learn and MIDI automation follows below.

### MIDI Outputs

Only the Network column is active for the MIDI inputs. The outputs that have Network enabled can be used by the Output processors to send MIDI data to. See the section about the Output Processor above.

### Interface

The dark theme might be easier on the eye in low light environments.











