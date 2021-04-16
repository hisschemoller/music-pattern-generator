# Soundbank processor

- User selects a sample from a list, the 'sample' parameter. 
- Incoming notes will play that sample with MIDI pitch and velocity used for playback speed and volume.
- MIDI pitch 60 is unchanged sample playback speed.
- MIDI channel is ignored.

## Sample preloading

- All audiofiles are stored in the 'audio' directory.
- The first time a Soundbank processor is created it loads all sample audiofiles.
- Each sound i

## Sample sources

- 808 Kick
  - 367059__electronicmotion__kick-long-tr-8.aiff
  - https://freesound.org/people/electronicmotion/sounds/367059/
- 808 Snare
  - 252734__crispydinner__crdn-upgrsn-004.wav
  - https://freesound.org/people/crispydinner/sounds/252734/
- 606 Closed Hat
  - 802__bdu__closehatac.aiff
  - https://freesound.org/people/bdu/sounds/802/


Convert to 16bit wav file with FFMPEG:

```bash
ffmpeg -i input.aiff -acodec pcm_s16le -ar 44100 output.wav
```