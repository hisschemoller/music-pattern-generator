# Music Pattern Generator

An application to create musical rhythms in MIDI.

## Overview

Music Pattern Generator is an app to create musical rhythms. It sends MIDI data, so it won’t make any sounds by itself. For that you need to connect it to MIDI soft- or hardware that can handle MIDI data to produce sound.

### Processors

Music Pattern Generator has a modular setup. Modules are called processors and are connected to form a network. Modules can produce MIDI notes, transform incoming data or send notes to MIDI output ports.

Three types of processors are available at the moment:

- ‘Euclidean’ generates euclidean rhythms
- 'Euclid FX’ transforms incoming MIDI notes
- ‘Output’ sends notes to MIDI output ports

Processors are created by dragging them out of the Library into the main area of the app.

![Processor types](assets/img/processor-types.jpg 'Processor types')

### Connections

Processors have their input at the top and output at the bottom. Connections are made by dragging a cable from the output of one processor to the input of another. The app must be in 'Connection mode', which is enabled by clicking the Connections button in the top Control Bar.

A single output can connect to multiple other processors' inputs. Just drag as many cables as you want out of the output. Similarly, an input can receive data from multiple outputs.

Connection cables can be deleted by clicking the Delete button that shows halfway each cable when in 'Connection mode'.

![Connecting processors](assets/img/processor-connecting.jpg 'Connecting processors')

### The Euclidean processor

The Euclidean processor generates rhythm patterns using the [Euclidean algorithm](https://en.wikipedia.org/wiki/Euclidean_rhythm).

![The Euclidean processor](assets/img/processor-euclidean.jpg 'The Euclidean processor')

Each processor has it's own editor panel to change it's settings. Click the 'Editor' button in the Control Bar if the panel isn't visible. The editor always shows the settings of the selected processor. Select a processor by clicking it's center circle. The processor will show a double ring to indicate it's selected.

![The Euclidean settings editor](assets/img/processor-euclidean-editor.jpg 'The Euclidean settings editor')

This editor panel shows the settings for the rightmost processor in the image above. 

The top three settings - steps, pulses and rotation - produce the actual pattern. Play with them and you will get a feeling for the results and what they do.

Rate sets the musical timing of the pattern. At '1/16' each step will take a quarter beat as set in the 'Beats Per Minute' input in the Control Bar. The number must be understood a part of a whole measure where one measure lasts four beats. Just try and you'll understand.

Note Length uses the same timing as rate. It's generally best to not set it higher than the rate or notes will overlap and produce usually unwanted results.

The other settings are self explanatory.
