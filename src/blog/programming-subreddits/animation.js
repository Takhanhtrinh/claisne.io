
import shuffle from 'lodash/shuffle';
import throttle from 'lodash/throttle';

import resize from '../utils/resize';

const baseUrl = '/img/languages/';

const paths = [
  'c.svg',
  'clojure.svg',
  'cpp.svg',
  'csharp.svg',
  'erlang.svg',
  'go.svg',
  'haskell.svg',
  'java.svg',
  'javascript.svg',
  'ocaml.svg',
  'php.svg',
  'python.svg',
  'ruby.svg',
  'rust.svg',
  'scala.svg',
  'swift.svg',
].map(path => baseUrl + path);

class Animation {
  constructor(element) {
    this.element = element;

    this.init = this.init.bind(this);
    this.render = this.render.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);

    this.images = [];
  }

  init() {
    this.element.innerHTML = '';

    window.removeEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mousemove', this.onMouseMove);
  }

  onMouseMove(evt) {
    this.images.forEach((img) => {
      const rect = img.getBoundingClientRect();
      const w = document.body.clientWidth;
      const h = document.body.clientHeight;
      const dx = evt.clientX - (rect.left + (rect.width / 2));
      const dy = evt.clientY - (rect.top + (rect.height / 2));
      const radius = Math.sqrt(Math.pow(dx / w, 2) + Math.pow(dy / h, 2));
      const deg = (radius / Math.abs(radius)) * Math.sqrt(Math.abs(radius)) * 50;

      img.style.transform = `rotate3d(${-dy}, ${dx}, 0, ${deg}deg)`;
    });
  }

  render() {
    const element = this.element;

    const imgPerLine = Math.round((8 / 480) * element.clientWidth);

    const linesEl = [
      shuffle(paths).slice(0, imgPerLine),
      shuffle(paths).slice(0, imgPerLine),
      shuffle(paths).slice(0, imgPerLine),
      shuffle(paths).slice(0, imgPerLine),
    ].map((urls) => {
      const lineEl = document.createElement('div');
      lineEl.className = 'line';

      const imgEls = urls.map((url) => {
        const imgEl = document.createElement('img');
        imgEl.src = url;
        this.images.push(imgEl);

        return imgEl;
      });


      imgEls.forEach(imgEl => lineEl.appendChild(imgEl));

      return lineEl;
    });

    linesEl.forEach(lineEl => element.appendChild(lineEl));
  }

  launch() {
    this.init();
    this.render();

    resize(() => {
      this.init();
      this.render();
    });
  }
}

export default Animation;
