import { SfxPitchInstruction } from '@/sound-effects/sfx-pitch-instruction.model';
import { SfxWidthInstruction } from '@/sound-effects/sfx-width-instruction.model';
import { SfxGainInstruction } from '@/sound-effects/sfx-gain-instruction.model';

export interface SoundEffect {
  pitchInstructions: SfxPitchInstruction[];
  widthInstructions: SfxWidthInstruction[];
  gainInstructions: SfxGainInstruction[];
}