<template>
  <div>
<!--    <div-->
<!--        v-for="(sound, soundIndex) in sounds"-->
<!--        :key="soundIndex"-->
<!--        @click="selectSound"-->
<!--        :class="{ 'selected': selectedSound === soundIndex }"-->
<!--    >-->
<!--      {{ soundIndex }}-->
<!--    </div>-->

<!--    <button @click="addSound">Add Sound</button>-->

<!--    <div v-if="selectedSound">-->

<!--      <h3>Gains</h3>      <button @click="addGainTimeValue">Add Gain Time Value</button>-->

<!--      <div v-for="(gainTimeValue, index) in selectedSound.gainSettings" :key="index">-->
<!--        {{ index }}-->
<!--      </div>-->

<!--      <h3>Pitches</h3>      <button @click="addPitchTimeValue">Add Pitch Time Value</button>-->

<!--      <div v-for="(frequencyTimeValue, index) in selectedSound.frequencySettings" :key="index">-->
<!--        {{ index }}-->
<!--      </div>-->

      <button @click="startAudio">Play Sound</button>

<!--    </div>-->
  </div>
</template>

<script lang="ts">
import { audioContext, whiteNoiseLoading } from '@/audio-initializer';
import { computed, defineComponent, ref } from 'vue';
import { Sound } from '@/sound-effects/sound';

export default defineComponent({
  name: 'SoundEffectMaker',
  setup() {
    const sounds = ref<Sound[]>([]);
    const selectedSoundIndex = ref(0);
    
    let whiteNoiseGainNode: AudioWorkletNode;
    let whiteNoiseFrequency: AudioParam;
    let whiteNoiseCounterWidth: AudioParam; // Must be set to either 7 or 15

    const selectedSound = ref<Sound | null>(null);

    async function startAudio() {
      audioContext.resume();
      const gainNode = new GainNode(audioContext);
      gainNode.gain.value = 1;
      await whiteNoiseLoading;
      whiteNoiseGainNode = new AudioWorkletNode(audioContext, 'white-noise-gain-processor');
      whiteNoiseFrequency = whiteNoiseGainNode.parameters.get('changesPerSecond')!;
      whiteNoiseCounterWidth = whiteNoiseGainNode.parameters.get('counterWidth')!;
      whiteNoiseGainNode
        .connect(gainNode)
        .connect(audioContext.destination);

      // Ramp to high frequency
      whiteNoiseFrequency.linearRampToValueAtTime(12000, audioContext.currentTime + 6);
      // Switch to "less random", gives a more rhythmic tone to the white noise.
      // Changing back to 15 makes it more random and chaotic again
      whiteNoiseCounterWidth.setValueAtTime(7, audioContext.currentTime + 6);

      // Ramp back to low frequency but with the less random variation
      whiteNoiseFrequency.linearRampToValueAtTime(200, audioContext.currentTime + 12);
    }

    function selectSound(soundIndex: number) {
      selectedSoundIndex.value = soundIndex;
      selectedSound.value = sounds.value[soundIndex];
    }

    function addSound() {
      sounds.value.push(new Sound(200, [], []));
    }

    return {
      sounds,
      startAudio,
      selectedSound: selectedSoundIndex,
      addSound,
      selectSound,
    };
  },
});
</script>

<style scoped>
.selected {
  background-color: green;
}
</style>