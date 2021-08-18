import {NotePosition} from "@/sound/note-position.model";

export interface Song {
  tempo: number;
  tracks: [
    NotePosition[]
  ];
}
