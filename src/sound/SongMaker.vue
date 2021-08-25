<template>
  <div>
    <Sequencer v-model="selectedTrackNotePositions"/>
    <p>{{ frequenciesUsed?.length }} notes used</p>
    <section class="track-info">
      <span>current track</span>
      <select v-model="selectedTrackNumber">
        <option v-for="(track, index) in selectedSong.tracks" :key="index" :value="index">{{ index + 1 }}</option>
      </select>
      <button @click="addTrack">Add track</button>
      <br>
      <button v-if="!isSongPlaying" @click="onSongStart">Start</button>
      <button v-if="isSongPlaying" @click="stopSong">Stop</button>
    </section>

    <section class="song-info">
      <span>song tempo</span>
      <input v-model="selectedSong.tempo"/>
      <span>current song</span>
      <select v-model="selectedSongNumber">
        <option v-for="(song, index) in songs" :key="index" :value="index">{{ index + 1 }}</option>
      </select>
      <button @click="addSong">Add song</button>
    </section>

  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import Sequencer from '@/sound/Sequencer.vue';
import { useSound } from '@/sound/sound.composable';
import { Song } from '@/sound/song.model';
import { isSongPlaying, startSong, stopSong } from '@/sound/music-engine';

export default defineComponent({
  components: {
    Sequencer,
  },
  setup() {
    const { songs, getUsedNoteFrequencies } = useSound();

    const selectedSongNumber = ref(0);
    const selectedSong = computed(() => {
      return songs.value[selectedSongNumber.value] || [];
    });

    const selectedTrackNumber = ref(0);
    const selectedTrackNotePositions = computed({
      get: () => {
        if (selectedSong.value?.tracks?.length) {
          return selectedSong.value?.tracks[selectedTrackNumber.value].notes;
        } else {
          return [];
        }
      },
      set: (value) => songs.value[selectedSongNumber.value].tracks[selectedTrackNumber.value].notes = value,
    });

    const frequenciesUsed = computed(() => {
      if (!selectedTrackNotePositions.value?.length) {
        return [];
      }
      return getUsedNoteFrequencies(selectedTrackNotePositions.value);
    });

    function addTrack() {
      const id = selectedSongNumber.value;
      const newTrack = {
        trackId: songs.value[id].tracks.length + 1,
        notes: [],
      };
      songs.value[id].tracks.push(newTrack);
    }

    function addSong() {
      const track = { trackId: 0, notes: [] };
      songs.value.push(new Song(120, [track]));
    }

    function onSongStart() {
      startSong(selectedSong.value);
    }


    return {
      selectedSongNumber,
      selectedSong,
      songs,
      selectedTrackNumber,
      selectedTrackNotePositions,
      addTrack,
      frequenciesUsed,

      isSongPlaying,
      addSong,
      onSongStart,
      stopSong,
    };
  },
});
</script>

<style scoped>

</style>
