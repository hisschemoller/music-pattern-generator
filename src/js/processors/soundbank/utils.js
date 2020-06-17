

const numVoices = 32;
const buffers = {
  allIds: [],
  byId: {},
};
const voices = [];

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

export function initAudioFiles(samplesData) {
  if (buffers.allIds.length === 0) {
    createVoices();
    samplesData.forEach(data => {
      if (data.value.endsWith('.wav')) {
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

export function playSound(nowToStartInSecs, bufferId) {
  const source = audioCtx.createBufferSource();
  source.buffer = buffers.byId[bufferId].buffer;
  source.connect(audioCtx.destination);
  source.start(audioCtx.currentTime + nowToStartInSecs);
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
