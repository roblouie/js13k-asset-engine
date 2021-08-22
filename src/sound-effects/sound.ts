interface TimeValue {
  value: number;
  timestamp: number;
}

export class Sound {
  duration: number;
  gainSettings: TimeValue[];
  frequencySettings: TimeValue[];

  constructor(duration: number, gainSettings: TimeValue[], frequencySettings: TimeValue[]) {
    this.duration = duration;
    this.gainSettings = gainSettings;
    this.frequencySettings = frequencySettings;
  }
}
