
import raf from 'raf';
import autoBind from 'auto-bind';

import resize from '../utils/resize';

const pi = Math.PI;
const cos = Math.cos;
const sin = Math.sin;
const rand = Math.random;
const min = Math.min;
const floor = Math.floor;

const g = 10;

class Animation {
  constructor(canvas, options) {
    this.canvas = canvas;
    this.options = options || {};

    autoBind(this);

    this.initCanvas();
    this.initState();
  }

  initCanvas() {
    const { canvas, options } = this;

    this.context = canvas.getContext('2d');

    if (options.fullscreen === true) {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
    } else {
      this.width = canvas.offsetWidth;
      this.height = canvas.offsetHeight;
    }

    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = this.width * pixelRatio;
    canvas.height = this.height * pixelRatio;
    this.context.scale(pixelRatio, pixelRatio);
  }

  initState() {
    const { options } = this;

    this.l1 = min(this.width, this.height) / 4;
    this.l2 = (min(this.width, this.height) / 4) - 100;
    if (this.width < 740 || options.fullL === true) { this.l2 += 100; }

    this.m1 = 100;
    this.m2 = 100;
    this.m = this.m1 + this.m2;
    this.r = 5 * (this.l2 / 160);

    this.l2 -= this.r;

    this.th1 = rand() * 2 * pi;
    this.th2 = rand() * 2 * pi;
    this.th1d = (rand() - 0.5) * 2;
    this.th2d = (rand() - 0.5) * 2;

    this.trail = [];
  }

  th1ToX() {
    const { th1, l1, width } = this;
    return (width / 2) - (sin(th1) * l1);
  }

  th1ToY() {
    const { th1, l1, height } = this;
    return (height / 2) + (cos(th1) * l1);
  }

  th2ToX() {
    const { th1, th2, l2, th1ToX } = this;
    return th1ToX(th1) - (sin(th2) * l2);
  }

  th2ToY() {
    const { th2, l2 } = this;
    return this.th1ToY() + (cos(th2) * l2);
  }

  th1a() {
    const { th1, th2, th1d, th2d, l1, m, m2 } = this;

    const n1 = this.m2 * this.l1 * th1d * th1d * sin(th2 - th1) * cos(th2 - th1);
    const n2 = this.m2 * g * sin(th2) * cos(th2 - th1);
    const n3 = this.m2 * this.l2 * th2d * th2d * sin(th2 - th1);
    const n4 = -this.m * g * sin(th1);

    const d = (m * this.l1) - (m2 * l1 * cos(th2 - th1) * cos(th2 - th1));

    return (n1 + n2 + n3 + n4) / d;
  }

  th2a() {
    const { th1, th2, th1d, th2d, l1, l2, m, m2 } = this;

    const n1 = -this.m2 * this.l2 * th2d * th2d * sin(th2 - th1) * cos(th2 - th1);
    const n2 = this.m * ((g * sin(th1) * cos(th2 - th1)) - (l1 * th1d * th1d * sin(th2 - th1)) - (g * sin(th2)));

    const d = (m * l2) - (m2 * l2 * cos(th2 - th1) * cos(th2 - th1));

    return (n1 + n2) / d;
  }

  drawCircle(x, y, radius, color) {
    const { context } = this;

    const c = color || '#bbb';

    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI, false);
    context.fillStyle = c;
    context.fill();
  }

  drawPendulum(x1, y1, x2, y2) {
    const { context, drawCircle } = this;

    context.beginPath();
    context.moveTo(this.width / 2, this.height / 2);
    context.lineTo(x1, y1);
    context.lineWidth = 1;
    context.strokeStyle = '#bbb';
    context.stroke();

    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.lineWidth = 1;
    context.strokeStyle = '#bbb';
    context.stroke();

    drawCircle(x1, y1, this.r);
    drawCircle(x2, y2, this.r);
  }

  drawTrail(color) {
    const { r, trail, context, options } = this;

    if (trail.length > 2) {
      if (this.options.trailColor !== false) {
        this.drawCircle(trail[0][0], trail[0][1], r, color);
      } else {
        this.drawCircle(trail[0][0], trail[0][1], r);
      }

      context.beginPath();
      context.moveTo(trail[0][0], trail[0][1]);

      let i = 1;
      for (; i < trail.length - 2; i += 1) {
        const x21 = trail[i][0];
        const y21 = trail[i][1];

        const x22 = trail[i + 1][0];
        const y22 = trail[i + 1][1];

        context.quadraticCurveTo(x21, y21, (x22 + x21) / 2, (y22 + y21) / 2);
      }

      context.quadraticCurveTo(
        trail[i][0],
        trail[i][1],
        trail[i + 1][0],
        trail[i + 1][1],
      );

      if (options.trailColor !== false) {
        context.strokeStyle = color;
      }

      context.lineWidth = this.r * 2;
      context.stroke();
    }
  }

  updatePendulum() {
    const dt = 0.05;

    this.th1d += this.th1a() * dt;
    this.th2d += this.th2a() * dt;

    this.th1 += this.th1d * dt;
    this.th2 += this.th2d * dt;
  }

  updateTrail(x1, y1, x2, y2, color) {
    this.trail.push([x2, y2, color]);
    if (this.trail.length > 300) {
      this.trail.shift();
    }
  }

  animate() {
    const {
      context,
      width,
      height,
      l1,
      l2,
      updatePendulum,
      updateTrail,
      drawTrail,
      drawPendulum,
    } = this;

    context.clearRect(0, 0, width, height);

    updatePendulum();

    const x1 = this.th1ToX();
    const y1 = this.th1ToY();

    const x2 = this.th2ToX();
    const y2 = this.th2ToY();

    if (this.options.trail !== false) {
      const hue = (((x2 - (width / 2)) / (l1 + l2)) + 1) * 180;
      const color = `hsl(${floor(hue)}, 80%, 60%)`;

      updateTrail(x1, y1, x2, y2, color);
      drawTrail(color);
    }

    drawPendulum(x1, y1, x2, y2);
  }

  requestAF() {
    this.rafHandle = raf(this.tick);
  }

  cancelAF() {
    raf.cancel(this.rafHandle);
  }

  tick() {
    this.animate();
    this.requestAF();
  }

  launch() {
    this.requestAF();

    resize(() => {
      this.initCanvas();
      this.initState();

      this.cancelAF();
      this.requestAF();
    });
  }
}

export default Animation;
