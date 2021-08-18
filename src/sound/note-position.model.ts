import {Key} from "@/sound/key.model";

export interface NotePosition {
  key: Key
  startPosition: number;
  duration: number;
  style: {
    width: string;
    top: string;
    left: string;
  }
}
