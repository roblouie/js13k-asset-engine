<template>
  <div>
    <span>Current Sfx</span>
    <select v-model="selectedSoundEffectIndex">
      <option v-for="(effect, index) in soundEffects" :key="index" :value="index">{{index}}</option>
    </select>
    <button @click="addSoundEffect">Add sfx</button>
    <button @click="deleteSoundEffect">Delete sfx</button>
    <input type="file" @change="loadJson"/>
    <button @click="saveJson">Save JSON</button>

    <div v-if="selectedSoundEffect">
      <p>Sound Controls</p>
      <button @click="addPitchInstruction">Add Pitch Instruction</button>
      <button @click="addWidthInstruction">Add Width Instruction</button>
      <button @click="addGainInstruction">Add Gain Instruction</button>

      <section v-if="selectedSoundEffect.pitchInstructions.length">
        <div v-for="(pitch, pitchIndex) in selectedSoundEffect.pitchInstructions" :key="pitchIndex">
          <span>Pitch:</span>
          <select v-model="pitch.pitch">
            <option v-for="option in getPitchOptions()" :key="option" :value="option">{{option}}</option>
          </select>
          <span>Duration:</span>
          <select v-model="pitch.durationInSeconds">
            <option v-for="option in getLengthOptions()" :key="option" :value="option">{{option.toFixed(2)}}</option>
          </select>
          <label :for="`linear-ramp${pitchIndex}`">Is linear ramp:</label>
          <input :id="`linear-ramp${pitchIndex}`" type="checkbox" v-model="pitch.isLinearRampTo" />
          <div class="delete-button" @click="deletePitchInstruction(pitch)">X</div>
          <div v-if="pitchIndex < selectedSoundEffect.pitchInstructions.length - 1" class="divider"/>
        </div>
      </section>

      <section v-if="selectedSoundEffect.widthInstructions.length">
        <div v-for="(width, widthIndex) in selectedSoundEffect.widthInstructions" :key="widthIndex">
          <span>Width Toggle, delay:</span>
          <select v-model="width.timeFromLastInstruction">
            <option v-for="option in getLengthOptions()" :key="option" :value="option">{{option.toFixed(2)}}</option>
          </select>
          <div class="delete-button" @click="deleteWidthInstruction(width)">X</div>
          <div v-if="widthIndex < selectedSoundEffect.widthInstructions.length - 1" class="divider"/>
        </div>
      </section>

      <section v-if="selectedSoundEffect.gainInstructions.length">
        <div v-for="(gain, gainIndex) in selectedSoundEffect.gainInstructions" :key="gainIndex">
          <span>Chanel affected</span>
          <select v-model="gain.isWhiteNoise">
            <option :value="true">White Noise</option>
            <option :value="false">Oscillator</option>
          </select>
          <span>Gain Level</span>
          <select v-model="gain.gain">
            <option v-for="option in getGainOptions()" :key="option" :value="option">{{option.toFixed(2)}}</option>
          </select>
          <span>Gain adjust, delay:</span>
          <select v-model="gain.timeFromLastInstruction">
            <option v-for="option in getLengthOptions()" :key="option" :value="option">{{option.toFixed(2)}}</option>
          </select>
          <div class="delete-button" @click="deleteGainInstruction(gain)">X</div>
          <div v-if="gainIndex < selectedSoundEffect.gainInstructions.length - 1" class="divider"/>
        </div>
      </section>

    </div>

    <button @click="playEffect">Play Sound</button>

  </div>
</template>

<script lang="ts">
import { audioContext, whiteNoiseLoading } from '@/audio-initializer';
import { defineComponent, ref, watch } from 'vue';
import { SoundEffect } from '@/sound-effects/sound-effect.model';
import { SfxWidthInstruction } from '@/sound-effects/sfx-width-instruction.model';
import { SfxPitchInstruction } from '@/sound-effects/sfx-pitch-instruction.model';
import { SfxGainInstruction } from '@/sound-effects/sfx-gain-instruction.model';
import { useSoundEffects } from '@/sound-effects/sound-effects.composable';

export default defineComponent({
  name: 'SoundEffectMaker',
  setup() {
    
    let whiteNoiseGainNode: AudioWorkletNode;
    let whiteNoiseFrequency: AudioParam;
    let whiteNoiseCounterWidth: AudioParam; // Must be set to either 7 or 15

    const { soundEffects } = useSoundEffects();

    const selectedSoundEffectIndex = ref(-1);
    const selectedSoundEffect = ref<SoundEffect>();

    watch(selectedSoundEffectIndex, assignCurrentSoundEffect);

    function assignCurrentSoundEffect() {
      selectedSoundEffect.value = soundEffects.value.find((sfx, index) => index === selectedSoundEffectIndex.value);
    }

    function getLengthOptions() {
      const options = new Array(32).fill(0);
      return options.map((option, index) => index * .05);
    }

    function getPitchOptions() {
      const options = new Array(256).fill(0);
      return options.map((option, index) => ((index) * 70) + 1).reverse();
    }

    function getGainOptions() {
      const options = new Array(4).fill(0);
      return options.map((option, index) => index / 3);
    }

    function addSoundEffect() {
      soundEffects.value.push({ pitchInstructions: [], gainInstructions: [], widthInstructions: [] });
    }

    function deleteSoundEffect() {
      if (!soundEffects.value.length || !selectedSoundEffectIndex.value) {
        return;
      }
      soundEffects.value.splice(selectedSoundEffectIndex.value, 1);
    }

    function addPitchInstruction() {
      if (!selectedSoundEffect.value) {
        return;
      }
      selectedSoundEffect.value.pitchInstructions.push({  isLinearRampTo: true, durationInSeconds: 1, pitch: 440 });
    }

    function addWidthInstruction() {
      if (!soundEffects.value.length) {
        return;
      }
      soundEffects.value[selectedSoundEffectIndex.value].widthInstructions.push({ timeFromLastInstruction: 0, isWidth: true });
    }

    function addGainInstruction() {
      if (!soundEffects.value.length) {
        return;
      }
      soundEffects.value[selectedSoundEffectIndex.value].gainInstructions.push({ timeFromLastInstruction: 0, isWhiteNoise: false, gain: 1 });
    }



    function deletePitchInstruction(instruction: SfxPitchInstruction ) {
      if (!selectedSoundEffect.value) {
        return;
      }
      const instructionIndex = selectedSoundEffect.value?.pitchInstructions.findIndex(inst => inst === instruction);
      if (instructionIndex === -1) {
        return;
      }
      selectedSoundEffect.value?.pitchInstructions.splice(instructionIndex, 1);
    }

    function deleteWidthInstruction(instruction: SfxWidthInstruction ) {
      if (!selectedSoundEffect.value) {
        return;
      }
      const instructionIndex = selectedSoundEffect.value?.widthInstructions.findIndex(inst => inst === instruction);
      if (instructionIndex === -1) {
        return;
      }
      selectedSoundEffect.value?.widthInstructions.splice(instructionIndex, 1);
    }

    function deleteGainInstruction(instruction: SfxGainInstruction ) {
      if (!selectedSoundEffect.value) {
        return;
      }
      const instructionIndex = selectedSoundEffect.value?.gainInstructions.findIndex(inst => inst === instruction);
      if (instructionIndex === -1) {
        return;
      }
      selectedSoundEffect.value?.gainInstructions.splice(instructionIndex, 1);
    }

    async function playEffect() {
      if (!selectedSoundEffect.value) {
        return;
      }
      audioContext.resume();
      const gainNode = new GainNode(audioContext);
      gainNode.gain.value = 1;
      await whiteNoiseLoading;
      whiteNoiseGainNode = new AudioWorkletNode(audioContext, 'white-noise-processor');
      whiteNoiseFrequency = whiteNoiseGainNode.parameters.get('changesPerSecond')!;
      whiteNoiseCounterWidth = whiteNoiseGainNode.parameters.get('counterWidth')!;
      whiteNoiseGainNode
        .connect(gainNode)
        .connect(audioContext.destination);

      const oscillator = new OscillatorNode(audioContext, { type: 'square' });
      const oscillatorGain = new GainNode(audioContext);
      oscillator.connect(oscillatorGain);
      oscillatorGain.connect(audioContext.destination);
      oscillatorGain.gain.value = 1;

      let pitchDurationInSeconds = 0;

      
      const frequencies = [oscillator.frequency, whiteNoiseFrequency];
      const gainNodes = [oscillatorGain, gainNode];

      frequencies.forEach((freq, frequencyIndex) => {
        const pitchDivider = frequencyIndex === 0 ? 16 : 0.7;
        pitchDurationInSeconds = 0;
        selectedSoundEffect.value?.pitchInstructions.forEach((instruction: SfxPitchInstruction, index: number) => {
          pitchDurationInSeconds += instruction.durationInSeconds;
          if (index === 0){
            freq.setValueAtTime(instruction.pitch / pitchDivider, audioContext.currentTime);
            freq.setValueAtTime(instruction.pitch / pitchDivider, audioContext.currentTime + pitchDurationInSeconds);
            return;
          }
          if (instruction.isLinearRampTo) {
            freq.linearRampToValueAtTime(instruction.pitch / pitchDivider, audioContext.currentTime + pitchDurationInSeconds);
          } else {
            freq.exponentialRampToValueAtTime(instruction.pitch / pitchDivider, audioContext.currentTime + pitchDurationInSeconds);
          }
        });
      });

      oscillator.start();

      let totalGainTimePerChanel = [0, 0];
      let isSeven = false;

      selectedSoundEffect.value?.gainInstructions.forEach((instruction: SfxGainInstruction) => {
        const index = instruction.isWhiteNoise ? 1 : 0;
        gainNodes[index].gain.linearRampToValueAtTime(instruction.gain, audioContext.currentTime + totalGainTimePerChanel[index] + instruction.timeFromLastInstruction);
        totalGainTimePerChanel[index] += instruction.timeFromLastInstruction;
      });

      let secondsSinceWidthChange = 0;

      selectedSoundEffect.value?.widthInstructions.forEach((instruction: SfxWidthInstruction) => {
        secondsSinceWidthChange += instruction.timeFromLastInstruction;
        whiteNoiseCounterWidth.setValueAtTime(isSeven ? 15 : 7,audioContext.currentTime + secondsSinceWidthChange);
        isSeven = !isSeven;
        return;
      });

      gainNodes.forEach(gain=> gain.gain.setValueAtTime(0, audioContext.currentTime + pitchDurationInSeconds));
    }

    function saveJson() {
      const json = JSON.stringify(soundEffects.value,null, 2);

      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([json], {
        type: 'text/plain',
      }));
      a.setAttribute('download', 'sfx.json');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    function loadJson(event: any) {
      const fileElement = event.target as HTMLInputElement;

      if (fileElement.files && fileElement.files[0]) {
        const file = fileElement.files[0];
        const fileReader = new FileReader();
        fileReader.onload = event => {
          const text = event.target!.result;
          soundEffects.value = JSON.parse(text as string);
        };
        fileReader.readAsText(file);
      }
    }



    return {
      playEffect,
      addSoundEffect,
      deleteSoundEffect,
      selectedSoundEffectIndex,
      selectedSoundEffect,
      soundEffects,
      getPitchOptions,
      getLengthOptions,
      getGainOptions,
      addPitchInstruction,
      addWidthInstruction,
      addGainInstruction,
      deletePitchInstruction,
      deleteWidthInstruction,
      deleteGainInstruction,
      saveJson,
      loadJson,
    };
  },
});
</script>

<style scoped>
section {
  border: 3px solid black;
  margin: 30px auto;
  max-width: 600px;
  padding: 3px;
}

.divider {
  width: 500px;
  height: 1px;
  background-color: black;
  margin: 10px auto;
}

.delete-button {
  display: inline-block;
  padding: 3px 8px;
  border: 1px solid black;
  box-sizing: border-box;
  cursor: pointer;
}
</style>