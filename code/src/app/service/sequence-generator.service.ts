import { Injectable } from '@angular/core';
import { interval, map, Observable } from 'rxjs';
import { sequenceGeneratorFunction } from './generator';

@Injectable({
  providedIn: 'root',
})
export class SequenceGeneratorService {
  generator = sequenceGeneratorFunction();

  private tick: Observable<number>;
  constructor() {
    this.tick = interval(300);
  }

  getSequence$() {
    return this.tick.pipe(map((e) => this.generator.next().value));
  }
  getSequenceColor$() {
    return this.tick.pipe(map((e) => this.numberToColor(e)));
  }

  numberToColor(n:number) {
    const num = Math.round((n ?? 0) % 256)
    return `#${num}${num}${num}`
  }
}
