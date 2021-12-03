import { animate, style, transition, trigger } from '@angular/animations';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Observable } from 'rxjs';
import Two from 'two.js';
import { sequenceGeneratorFunction } from './service/generator';
import { SequenceGeneratorService } from './service/sequence-generator.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: '0', 'background-color': '#ffffff' }),
        animate(
          '1s ease-out',
          style({ opacity: '1', 'background-color': '#00ffff' })
        ),
      ]),
    ]),
  ],
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'abhiramTS';
  sequence$: Observable<number>;
  // colors$: Observable<string>;
  colors: string = '#ffffff';
  sequence: number[] = [];

  @ViewChild('box') box: ElementRef = {} as any;
  @ViewChild('bigBox') bigBox: ElementRef = {} as any;

  rotating = false;

  two: any;
  path: any;
  cursor: any;
  bgColor: string = '#fff';
  points: number[] = [];

  constructor(private sequenceGenerator: SequenceGeneratorService) {
    this.sequence$ = this.sequenceGenerator.getSequence$();
    this.sequence$.subscribe((e) => this.sequence.push(e));
  }
  ngAfterViewInit(): void {
    this.two = new Two({
      type: Two.Types.svg,
      fullscreen: true,
      autostart: true,
    }).appendTo(this.box.nativeElement);
    this.drawCurve();
    setInterval(() => {
      this.refresh();
    }, 1000);
  }
  private refresh() {
    this.bgColor =
      '#' +
      Array(3)
        .fill(1)
        .map((e) =>
          Math.round(Math.random() * 245)
            .toString(16)
            .padStart(2, '0')
        )
        .join('');
    this.two.clear();
    this.curveRefresh(this.points, window.innerHeight);
  }

  ngOnInit(): void {}

  drawCurve() {
    const height = window.innerHeight;
    const width = window.innerWidth;
    const pointSize = 5;
    const gap = 10;
    const gen = sequenceGeneratorFunction();
    let i = gen.next().value;
    let circleEndPoints = [];
    while (width / (pointSize + gap) > i) {
      circleEndPoints.push(i);
      i = gen.next().value;
    }
    circleEndPoints.push(i);
    i = gen.next().value;

    this.points = circleEndPoints;
    this.curveRefresh(circleEndPoints, height);
  }

  private curveRefresh(circleEndPoints: number[], height: number) {
    const paths: any[] = [];
    circleEndPoints /* .slice(0,5) */
      .forEach((e, i, a) => {
        if (i != 0) {
          const circlePoints: any = [];
          const r = (15 * (e - a[i - 1])) / 2;
          circlePoints.push(
            ...this.circlePoints(height, r, a[i - 1] * 15, i % 2 == 1)
          );
          const circle = this.two.makePath(circlePoints, true);
          /* circle.start = 0;
          circle.ending = 0; */
          const color =
            '#' +
            Array(3)
              .fill(1)
              .map((e) =>
                Math.round(Math.random() * 245)
                  .toString(16)
                  .padStart(2, '0')
              )
              .join('');
          const test = Math.round(Math.random() * 1000);
          if (test >= 100 && test < 200) {
            circle.fill = color;
          } else {
            circle.noFill().linewidth = 5 + Math.round(Math.random() * 8);
            circle.stroke = color;
          }
          paths.push(circle);
        }
      });
    // this.draw(paths);
  }

  draw(path: any[] = [], count = 0) {
    return new Promise<Array<any>>((r, rj) => {
      const circle = path.shift();
      let p = 0;
      const animate = () => {
        if (p >= 1 && path.length != 0) {
          r(this.draw(path, count++));
        } else if (p >= 1 && path.length == 0) {
          r(path);
        } else {
          p += 1;
          circle.ending = p;
        }
      };
      this.two.bind('update', animate);
    });
  }

  private circlePoints(
    height: number,
    r: number,
    xOffset: number = 0,
    firstHalf: boolean = false
  ) {
    if (r < 0) {
      firstHalf = !firstHalf;
    }
    return Array(181)
      .fill(1)
      .map((e, i) => {
        return this.addCurvePoints(r, i, xOffset, height / 2, firstHalf);
      });
  }

  private addPoint(points: [any, any], pointSize: number) {
    const point = this.two.makePoints(points);
    point.stroke = '#f55555';
    point.fill = '#f55555';
    point.size = pointSize;
  }

  addCurvePoints(
    R: number,
    i: number,
    xOffset: number = 0,
    yOffset: number = 0,
    firstHalf = true
  ) {
    const theta = (((firstHalf ? 180 : 0) + i) * Math.PI) / 180;
    const r = R;
    const x = r * Math.cos(theta) + R + xOffset;
    const y = r * Math.sin(theta) + yOffset;
    return new Two.Anchor(x, y);
  }
}
