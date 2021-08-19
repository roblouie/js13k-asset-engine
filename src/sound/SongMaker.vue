<template>
  <div>
    <Sequencer v-model="selectedTrackNotePositions" />
    <p>{{ frequenciesUsed?.length }} notes used</p>
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
import { Song } from '@/sound/song.model';

export default defineComponent({
  components: {
    Sequencer,
  },
  setup() {
    const { songs, getUsedNoteFrequencies } = useSound();
    if (!songs.value.length) {
      const track = { trackId: 0, notes: [] };
      songs.value.push(new Song(145, [track]));
    }

    const selectedTrackNumber = ref(0);
    const selectedTrackNotePositions = computed({
      get: () => songs.value[0].tracks[selectedTrackNumber.value].notes,
      set: (value) => songs.value[0].tracks[selectedTrackNumber.value].notes = value,
    });

    const frequenciesUsed = computed(() => {
      if (!selectedTrackNotePositions.value?.length) {
        return [];
      }
      return getUsedNoteFrequencies(selectedTrackNotePositions.value);
    });

    const selectedSongsNumber = ref(0);
    function addTrack() {
      const newTrack = {
        trackId: songs.value[selectedSongsNumber.value].tracks.length + 1,
        notes: [],
      };
      songs.value[selectedSongsNumber.value].tracks.push(newTrack);
    }


    return {
      songs,
      selectedTrackNumber,
      selectedTrackNotePositions,
      addTrack,
      frequenciesUsed,
    };
  },
});
</script>

<style scoped>

</style>
