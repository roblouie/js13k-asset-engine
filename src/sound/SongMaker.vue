<template>
  <div>
    <Sequencer v-model="selectedTrackNotePositions"/>
    <p>{{ frequenciesUsed?.length }} notes used</p>
    <section class="track-info">
      <span>current track</span>
      <select v-model="selectedTrackNumber">
        <option v-for="(track, index) in selectedSong.tracks" :key="index" :value="index">{{ index + 1 }}</option>
      </select>
      <select v-model="selectedTrackWave">
        <option v-for="wave in allWaves" :key="wave" :value="wave">{{ wave }}</option>
      </select>
      <button @click="addTrack">Add track</button>
      <button @click="deleteTrack">Delete track</button>
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
      <button @click="deleteSong">Delete song</button>
    </section>

  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import Sequencer from '@/sound/Sequencer.vue';
import { useSound } from '@/sound/sound.composable';
import { Song } from '@/sound/song.model';
import { isSongPlaying, startSong, stopSong } from '@/sound/spu';

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

    const selectedTrackWave = computed({
      get: () => {
        if (!songs.value.length) {
          return undefined;
        } else {
          return songs.value[selectedSongNumber.value].tracks[selectedTrackNumber.value].wave;
        }
      },
      set: (value) => songs.value[selectedSongNumber.value].tracks[selectedTrackNumber.value].wave = value,
    });

    const frequenciesUsed = computed(() => {
      if (!selectedTrackNotePositions.value?.length) {
        return [];
      }
      return getUsedNoteFrequencies(selectedTrackNotePositions.value);
    });

    function addTrack() {
      if (!songs.value.length) {
        return;
      }
      const id = selectedSongNumber.value;
      const newTrack = {
        notes: [],
      };
      songs.value[id].tracks.push(newTrack);
    }

    function deleteTrack() {
      if (!songs.value.length) {
        return;
      }
      const index = selectedSong.value.tracks.findIndex((track, index) => index === selectedTrackNumber.value);
      if (index === -1) {
        return;
      }
      selectedTrackNumber.value = 0;
      selectedSong.value.tracks.splice(index, 1);
    }

    const allWaves = [
      'sawtooth',
      'sine',
      'square',
      'triangle',
    ];


    function addSong() {
      const track = { notes: [] };
      songs.value.push(new Song(120, [track]));
    }

    function deleteSong() {
      const index = songs.value.findIndex(song => song === selectedSong.value);
      if (index === -1) {
        return;
      }
      songs.value.splice(index, 1);
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
      allWaves,
      selectedTrackWave,
      addTrack,
      deleteTrack,
      frequenciesUsed,

      isSongPlaying,
      addSong,
      deleteSong,
      onSongStart,
      stopSong,
    };
  },
});
</script>

<style scoped>

</style>
