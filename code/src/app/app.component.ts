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

enum type {
  SolidAndStroke,
  Solid,
  Stroke,
}
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
  pointSize = 3;
  gap = 3;
  pitch = this.pointSize + this.gap;
  typeOfDesign: type = type.SolidAndStroke;

  get type() {
    return type;
  }

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
  paths: any[] = [];

  backgroundStyle: any;

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
    /* setInterval(() => {
      this.refresh();
    }, 1000); */
  }
  private refresh() {
    this.bgColor = this.generateRandomColor();
    this.two.clear();
    this.curveRefresh(this.points, window.innerHeight);
  }

  ngOnInit(): void {}

  drawCurve() {
    var { circleEndPoints, height } = this.refreshPoints();
    this.curveRefresh(circleEndPoints, height);
  }

  private refreshPoints() {
    const height = window.innerHeight;
    const width = window.innerWidth;
    const gen = sequenceGeneratorFunction();
    let i = gen.next().value;
    let circleEndPoints = [];
    while (width / (this.pointSize + this.gap) > i) {
      circleEndPoints.push(i);
      i = gen.next().value;
    }
    circleEndPoints.push(i);
    i = gen.next().value;

    this.points = circleEndPoints;
    return { circleEndPoints, height };
  }

  private curveRefresh(circleEndPoints: number[], height: number) {
    (this.paths ?? []).forEach((e) => (e = null));
    this.paths = [];
    const paths: any[] = this.paths;
    circleEndPoints.forEach((e, i, a) => {
      if (i != 0) {
        const circlePoints: any = [];
        const r = (this.pitch * (e - a[i - 1])) / 2;
        circlePoints.push(
          ...this.circlePoints(height, r, a[i - 1] * this.pitch, i % 2 == 1)
        );
        const circle = this.two.makePath(circlePoints, true);
        /* circle.start = 0;
          circle.ending = 0; */
        const color = this.generateRandomColor();
        switch (this.typeOfDesign) {
          case type.Solid:
            {
              circle.fill = color;
            }
            break;
          case type.Stroke:
            {
              circle.noFill().linewidth =
                this.pointSize + Math.round(Math.random() * this.pointSize * 2);
              circle.stroke = color;
            }
            break;
          case type.SolidAndStroke:
          default: {
            const test = Math.round(Math.random() * 1000);
            if (test >= 100 && test < 200) {
              circle.fill = color;
            } else {
              circle.noFill().linewidth =
                this.pointSize + Math.round(Math.random() * this.pointSize * 2);
              circle.stroke = color;
            }
          }
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

  calculatePitch() {
    this.pitch = (this.gap ?? 0) + (this.pointSize ?? 0);
    this.refreshPoints();
  }

  private changeBackgroundStyle() {
    const angle = Math.round(Math.random() * 360);
    const noOfColors = Math.round(Math.random() * 4) + 1;
    const colors = Array(noOfColors)
      .fill('')
      .map((e) => e + this.generateRandomColor(true));
  }

  private generateRandomColor(rgba: boolean = false): string {
    return (
      '#' +
      Array(rgba ? 4 : 3)
        .fill(1)
        .map((e) =>
          Math.round(Math.random() * 245)
            .toString(16)
            .padStart(2, '0')
        )
        .join('')
    );
  }
}
