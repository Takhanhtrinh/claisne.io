
import values from 'lodash/values';
import highlight from 'highlight.js/lib/highlight';
import highlightPython from 'highlight.js/lib/languages/python';
import 'highlight.js/styles/tomorrow.css';

import * as d3 from 'd3';

import '../defaults';

import relWordFrequency from './data/rel_word_freq.json';
import usersInCommon from './data/users_in_common.json';
import commentsLength from './data/comments_length.json';

highlight.registerLanguage('javascript', highlightPython);
highlight.initHighlightingOnLoad();

document.querySelectorAll('.inline-code').forEach(highlight.highlightBlock);

const container = d3.select('#word-frequency-languages-svg-container');
const svg = d3.select('#word-frequency-languages-svg');
const { width, height } = svg.node().getBoundingClientRect();
// const center = { x: width / 2, y: height / 2 };

let simulation;
const draw = (subreddit) => {
  const nodes = relWordFrequency[subreddit]
    .filter(d => d.freq <= 0.009)
    .filter(d => d.word !== subreddit.toLowerCase() && (subreddit !== 'javascript' || d.word !== 'js') && (subreddit !== 'golang' || d.word !== 'x00'));

  const surface = nodes.map(d => d.freq - d.mean_freq).reduce((a, b) => a + b, 0);

  const radius = d => Math.sqrt((d.freq - d.mean_freq) * (((width * height) / 5.5) / surface));

  let bubbles = svg.selectAll('.bubble')
    .data(nodes, d => d.word);

  let labels = container.selectAll('.label')
    .data(nodes, d => d.word);

  const ticked = () => {
    bubbles
      .attr('cx', d => d.x = Math.max(radius(d) + 15, Math.min(width - 15 - radius(d), d.x)))
      .attr('cy', d => d.y = Math.max(radius(d) + 15, Math.min(height - 15 - radius(d), d.y)));

    labels
      .style('top', function top(d) {
        if (d.bcr == null) { d.bcr = this.getBoundingClientRect(); }
        return `${d.y - (d.bcr.height / 2)}px`;
      })
      .style('left', function left(d) {
        if (d.bcr == null) { d.bcr = this.getBoundingClientRect(); }
        return `${d.x - (d.bcr.width / 2)}px`;
      });
  };

  if (simulation != null) {
    simulation.stop();
  }

  simulation = d3.forceSimulation(nodes)
    .velocityDecay(0.2)
    .force('x', d3.forceX().x(width).strength(0.001))
    .force('y', d3.forceY().y(height).strength(0.001))
    .force('charge', d3.forceManyBody().strength(-10))
    .force('collide', d3.forceCollide().radius(d => radius(d) + 5))
    .on('tick', ticked);

  const fillColor = d3.scaleLinear().domain(d3.extent(nodes.map(d => d.freq - d.mean_freq)))
    .interpolate(d3.interpolateHcl)
    .range([d3.rgb('#e4f5b5'), d3.rgb('#1e3489')]);

  const bubblesE = bubbles.enter().append('circle')
    .classed('bubble', true)
    .attr('r', 0)
    .attr('fill', d => fillColor(d.freq - d.mean_freq))
    .attr('stroke', d => fillColor(d.freq - d.mean_freq))
    .attr('stroke', 'rgba(0, 0, 0, 0.1)')
    .attr('stroke-opacity', 0.7)
    .attr('stroke-width', 3);
    // .on('mouseover', showDetail)
    // .on('mouseout', hideDetail);

  bubbles
    .attr('r', 0)
    .attr('fill', d => fillColor(d.freq - d.mean_freq))
    .attr('stroke', d => fillColor(d.freq - d.mean_freq))
    .attr('stroke', 'rgba(0, 0, 0, 0.1)')
    .attr('stroke-opacity', 0.7)
    .attr('stroke-width', 3);

  bubbles.exit().remove();

  bubbles = bubbles.merge(bubblesE);

  const labelsE = labels.enter().append('div')
    .attr('class', 'label')
    .text(d => d.word);

  labels.exit().remove();

  labels = labels.merge(labelsE);
  bubbles.transition()
    .delay(50)
    .duration(500)
    .attr('r', radius);
};

draw('Python');

const languageElmts = document.getElementById('word-frequency-languages').children;

let currentLanguageElmt = languageElmts[0];
currentLanguageElmt.classList.toggle('selected');
draw(currentLanguageElmt.dataset.subreddit);

for (let i = 0; i < languageElmts.length; i += 1) {
  const languageElmt = languageElmts[i];
  languageElmt.addEventListener('click', () => {
    languageElmt.classList.toggle('selected');
    const language = languageElmt.dataset.subreddit;
    draw(language);
    currentLanguageElmt.classList.toggle('selected');
    currentLanguageElmt = languageElmt;
  });
}

const commonUsersElmt = document.getElementById('common-users-matrix');

const firstLine = document.createElement('div');
firstLine.className = 'line';

const emptyMatrixElmt = document.createElement('div');
emptyMatrixElmt.className = 'matrix-elmt';

firstLine.append(emptyMatrixElmt);

const matrixElmts = [];
const rowLanguages = [];
const columnLanguages = [];

for (let i = 0; i < languageElmts.length; i += 1) {
  const languageElmt = languageElmts[i].cloneNode(true);
  languageElmt.className = 'language';
  firstLine.appendChild(languageElmt);
  rowLanguages[i] = languageElmt;
}

commonUsersElmt.appendChild(firstLine);

for (let i = 0; i < languageElmts.length; i += 1) {
  const line = document.createElement('div');
  line.className = 'line';

  const languageElmt = languageElmts[i].cloneNode(true);
  languageElmt.className = 'language';
  line.appendChild(languageElmt);
  columnLanguages[i] = languageElmt;

  matrixElmts[i] = [];
  for (let j = 0; j < languageElmts.length; j += 1) {
    const matrixElmt = document.createElement('div');
    matrixElmt.className = 'matrix-elmt';
    matrixElmts[i][j] = matrixElmt;

    const rowLanguage = languageElmts[i].dataset.subreddit;
    const colLanguage = languageElmts[j].dataset.subreddit;

    if (i !== j) {
      const matrixElmtTooltip = document.createElement('span');
      matrixElmtTooltip.className = 'tooltip';
      matrixElmtTooltip.innerHTML = `${Math.round(usersInCommon[rowLanguage][colLanguage] * 100)} %`;
      matrixElmtTooltip.innerHTML += ` of ${rowLanguage} commenters also comment in ${colLanguage}`;

      matrixElmt.appendChild(matrixElmtTooltip);
    }

    line.append(matrixElmt);
  }

  commonUsersElmt.appendChild(line);
}


let min = 1;
let max = 0;
for (let i = 0; i < languageElmts.length; i += 1) {
  for (let j = 0; j < languageElmts.length; j += 1) {
    const rowLanguage = languageElmts[i].dataset.subreddit;
    const colLanguage = languageElmts[j].dataset.subreddit;

    if (i !== j) {
      max = Math.max(max, usersInCommon[rowLanguage][colLanguage]);
      min = Math.min(min, usersInCommon[rowLanguage][colLanguage]);
    }
  }
}

const fillColor = d3.scaleLinear().domain([min, max])
  .interpolate(d3.interpolateHcl)
  .range([d3.rgb('#e4f5b5'), d3.rgb('#1e3489')]);

for (let i = 0; i < languageElmts.length; i += 1) {
  for (let j = 0; j < languageElmts.length; j += 1) {
    const rowLanguage = languageElmts[i].dataset.subreddit;
    const colLanguage = languageElmts[j].dataset.subreddit;

    matrixElmts[i][j].style.height = `${matrixElmts[i][j].offsetWidth}px`;

    if (i !== j) {
      matrixElmts[i][j].style.background = fillColor(usersInCommon[rowLanguage][colLanguage]);
    }
  }
}

rowLanguages.forEach((l) => {
  l.style.height = `${l.offsetWidth}px`;
});

columnLanguages.forEach((l) => {
  l.style.height = `${l.offsetWidth}px`;
});

const commentsLengthElmt = document.getElementById('comments-length');

for (let i = 0; i < commentsLengthElmt.children.length; i += 1) {
  const language = commentsLengthElmt.children[i];
  language.style.height = `${language.offsetWidth}px`;
}

const barHeightScale = d3.scaleLinear().domain([0, d3.max(values(commentsLength))])
  .range([0, 200]);

const barFillColor = d3.scaleLinear().domain(d3.extent(values(commentsLength)))
  .interpolate(d3.interpolateHcl)
  .range([d3.rgb('#e4f5b5'), d3.rgb('#1e3489')]);

const bars = document.getElementById('comments-length-bars');
for (let i = 0; i < languageElmts.length; i += 1) {
  const language = languageElmts[i].dataset.subreddit;

  const bar = document.createElement('div');
  bar.className = 'bar';
  bar.style.height = `${barHeightScale(commentsLength[language])}px`;
  const background = (d3.color(barFillColor(commentsLength[language])));
  background.opacity = 0.7;
  bar.style.background = background + '';

  bars.appendChild(bar);
}
