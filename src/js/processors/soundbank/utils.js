

const numVoices = 32;
const buffers = {
  allIds: [],
  byId: {},
};
const voices = [];
let voiceIndex = 0;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

export function initAudioFiles(samplesData) {
  if (buffers.allIds.length === 0) {
    createVoices();
    samplesData.forEach(data => {
      if (data.value) {
        buffers.allIds.push(data.value);
        buffers.byId[data.value] = {
          buffer: null,
        };

        fetch(`audio/${data.value}`).then(response => {
          if (response.status === 200) {
            response.arrayBuffer().then(arrayBuffer => {
              audioCtx.decodeAudioData(arrayBuffer).then((audioBuffer) => {
                buffers.byId[data.value].buffer = audioBuffer;
              });
            })
          }
        });
      }
    });
  }
}

export function playSound(nowToStartInSecs, bufferId, pitch, velocity) {
  const startTime = audioCtx.currentTime + nowToStartInSecs;
  const voice = voices[voiceIndex];
  voiceIndex = ++voiceIndex % numVoices;

  if (voice.isPlaying) {
    console.log('isPlaying');
    voice.source.stop();
  }

  voice.isPlaying = true;
  voice.gain.gain.setValueAtTime(velocity / 127, startTime);
  voice.source = audioCtx.createBufferSource();
  voice.source.buffer = buffers.byId[bufferId].buffer;
  voice.source.playbackRate.setValueAtTime(2 ** ((pitch - 60) / 12), startTime);
  voice.source.connect(voice.gain);
  voice.source.start(startTime);
  voice.source.onended = function() {
    voice.isPlaying = false;
  }
}

function createVoices() {
  for (let i = 0; i < numVoices; i++) {
    const gain = audioCtx.createGain();
    gain.connect(audioCtx.destination);

    voices.push({
      isPlaying: false,
      gain,
      source: null,
    });
  }
}
