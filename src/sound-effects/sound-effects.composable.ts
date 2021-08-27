import { SoundEffect } from '@/sound-effects/sound-effect.model';
import { ref } from 'vue';

const soundEffects= ref<SoundEffect[]>([]);

export function useSoundEffects() {
  return  {
    soundEffects,
    soundEffectsToBytes,
  };
}

function soundEffectsToBytes(soundEffects: SoundEffect[]): ArrayBuffer {
  const arrayBuffers = soundEffects.map(convertSoundEffectToArrayBuffer);
  const byteLength = arrayBuffers.reduce((accumulator, sfxBuffer) => {
    return accumulator + sfxBuffer.byteLength;
  }, 0);
  const combinedBytes = new Uint8Array(byteLength + 1);
  const numberOfSfxBytes = new Uint8Array([soundEffects.length]);
  combinedBytes.set(numberOfSfxBytes);
  let offset = 1;
  arrayBuffers.forEach((sfxBuffer: ArrayBuffer) => {
    const sfxBytes = new Uint8Array(sfxBuffer);
    combinedBytes.set(sfxBytes, offset);
    offset += sfxBytes.length;
  });
  return combinedBytes;
}



function convertSoundEffectToArrayBuffer(soundEffect: SoundEffect): ArrayBuffer {
  const arrayToBufferize = [];
  const gainInstructionsLength = soundEffect.gainInstructions.length << 4;
  const otherInstructionsLength = soundEffect.widthInstructions.length + soundEffect.pitchInstructions.length;
  arrayToBufferize.push(gainInstructionsLength + otherInstructionsLength); // combined instruction lengths
  soundEffect.gainInstructions.forEach(gainInstruction => {
    const offsetGainLevel = (Math.floor(gainInstruction.gain * 3)) << 6;
    const offsetIsNoise = (gainInstruction.isWhiteNoise ? 1 : 0) << 5;
    const offsetTime = Math.round((gainInstruction.timeFromLastInstruction) * 5);
    arrayToBufferize.push(offsetGainLevel + offsetIsNoise + offsetTime);
  });
  soundEffect.widthInstructions.forEach(widthInstruction => {
    const widthInstrucionFlag = 0b1000000;
    const offsetTime = Math.round((widthInstruction.timeFromLastInstruction) * 5);
    arrayToBufferize.push(widthInstrucionFlag + offsetTime);
  });
  soundEffect.pitchInstructions.forEach(pitchInstruction => {
    const linearRampFlag = pitchInstruction.isLinearRampTo ? 1 : 0;
    const offsetLinearRampFlag = linearRampFlag << 5;
    const offsetDuration = Math.round((pitchInstruction.durationInSeconds) * 5);
    const roundedPitch = Math.round((pitchInstruction.pitch - 1) / 70);
    arrayToBufferize.push(offsetLinearRampFlag + offsetDuration);
    arrayToBufferize.push(roundedPitch);
  });

  const arrayBuffer = new ArrayBuffer(arrayToBufferize.length);
  const dataView = new DataView(arrayBuffer);
  arrayToBufferize.forEach((value, index) => {
    dataView.setUint8(index, value);
  });
  return arrayBuffer;
}
