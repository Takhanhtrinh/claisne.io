
import highlight from 'highlight.js/lib/highlight';
import highlightPython from 'highlight.js/lib/languages/python';

import * as d3 from 'd3';

import 'highlight.js/styles/tomorrow.css';

import '../defaults';

highlight.registerLanguage('javascript', highlightPython);
highlight.initHighlightingOnLoad();

document.querySelectorAll('.inline-code').forEach(highlight.highlightBlock);

const svg = d3.select('#word-frequency-languages-svg');
const { width, height } = svg.node().getBoundingClientRect();
const center = { x: width / 2, y: height / 2 };

const g = svg.append('g')
  .attr("transform", "translate(" + center.x + "," + center.y + ")");

const nodes = d3.range(50).map(function(i) {
  return {
    radius: Math.random() * 20 + 30
  };
});

let bubbles = g.selectAll('.bubble')
  .data(nodes, d => d.id);

const forceStrength = 0.03;

function ticked() {
  bubbles
    .attr('cx', d => d.x)
    .attr('cy', d => d.y);
}

d3.forceSimulation(nodes)
  .velocityDecay(0.2)
  .force('x', d3.forceX().strength(forceStrength - 0.02))
  .force('y', d3.forceY().strength(forceStrength))
  .force('collide', d3.forceCollide().radius(d => d.radius + 0.5).iterations(2))
  .on('tick', ticked);

const bubblesE = bubbles.enter().append('circle')
  .classed('bubble', true)
  .attr('r', d => d.radius)
  // .attr('fill', (d) => fillColor(d.group))
  // .attr('stroke', (d) => d3.rgb(fillColor(d.group)).darker())
  .attr('stroke-width', 2);
  // .on('mouseover', showDetail)
  // .on('mouseout', hideDetail);

bubbles = bubbles.merge(bubblesE);
