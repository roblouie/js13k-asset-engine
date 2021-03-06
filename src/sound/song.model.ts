import { Track } from '@/sound/track.model';

export class Song {
  tempo: number;
  tracks: Track[];

  constructor(tempo: number, tracks: Track[]) {
    this.tempo = tempo;
    this.tracks = tracks;
  }
}
