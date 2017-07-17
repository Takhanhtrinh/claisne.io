
import shuffle from 'lodash/shuffle';

import resize from '../utils/resize';

const baseUrl = 'https://static-cdn.jtvnw.net/emoticons/v1';

const paths = [
  '/354/1.0',
  '/41/1.0',
  '/88/1.0',
  '/25/1.0',
].map(path => baseUrl + path);

class Animation {
  constructor(element) {
    this.element = element;

    this.init = this.init.bind(this);
    this.render = this.render.bind(this);
  }

  init() {
    this.element.innerHTML = '';
  }

  render() {
    const element = this.element;

    const imgPerLine = Math.round((8 / 480) * element.clientWidth);

    const imgUrls = [];
    for (let i = 0; i < imgPerLine; i += 1) {
      imgUrls.push(paths[i % paths.length]);
    }

    const linesEl = [
      shuffle(imgUrls.slice(0)),
      shuffle(imgUrls.slice(0)),
      shuffle(imgUrls.slice(0)),
      shuffle(imgUrls.slice(0)),
    ].map((urls) => {
      const lineEl = document.createElement('div');
      lineEl.className = 'line';

      const imgEls = urls.map((url) => {
        const imgEl = document.createElement('img');
        imgEl.className = 'rotating';
        imgEl.src = url;

        return imgEl;
      });

      imgEls.forEach(imgEl => lineEl.appendChild(imgEl));

      return lineEl;
    });

    linesEl.forEach(lineEl => element.appendChild(lineEl));
  }

  launch() {
    this.render();

    resize(() => {
      this.init();
      this.render();
    });
  }
}

export default Animation;
