<template>
  <div>
    <sound-create />
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import SoundCreate from '@/sound/SongMaker';

export default defineComponent({
  name: 'music',
  components: { SoundCreate },
});
</script>

<style scoped>

</style>
