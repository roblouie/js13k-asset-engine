import { NotePosition } from '@/sound/note-position.model';

export interface Track {
  trackId: number;
  notes: NotePosition[];
}
