<template>
  <div>
    <Sequencer v-model="selectedTrackNotePositions" />
    <p>{{ keysUsed?.length }} notes used</p>
    <span>current track</span>
    <select v-model="selectedTrackNumber">
      <option v-for="(track, index) in songs[0].tracks" :key="index" :value="index">{{ index + 1 }}</option>
    </select>
    <button @click="addTrack">Add track</button>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import Sequencer from '@/sound/Sequencer.vue';
import { useSound } from '@/sound/sound.composable';

export default defineComponent({
  components: {
    Sequencer,
  },
  setup() {
    const { songs, getKeysUsed } = useSound();
    songs.value.push({
      tempo: 145,
      tracks: [[]],
    });

    const selectedTrackNumber = ref(0);
    const selectedTrackNotePositions = computed({
      get: () => songs.value[0].tracks[selectedTrackNumber.value],
      set: (value) => songs.value[0].tracks[selectedTrackNumber.value] = value,
    });

    const keysUsed = computed(() => {
      if (!selectedTrackNotePositions.value?.length) {
        return [];
      }
      return getKeysUsed(selectedTrackNotePositions.value);
    });

    function addTrack() {
      songs.value[0].tracks.push([]);
    }


    return {
      songs,
      selectedTrackNumber,
      selectedTrackNotePositions,
      addTrack,
      keysUsed,
    };
  },
});
</script>

<style scoped>

</style>
