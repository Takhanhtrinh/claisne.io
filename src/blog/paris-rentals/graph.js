
import {
  select,
  scaleLinear,
  line,
  extent,
  max,
  axisTop,
  axisRight,
} from 'd3';

import dataRaw from './data/price-surface-distribution.csv';

const data = dataRaw.map(d => ({
  count: parseInt(d.count, 10),
  price_surface: parseInt(d.price_surface, 10),
}));

const container = select('#price-distribution-container');
const svg = select('#price-distribution-visualization');

const width = container.node().offsetWidth;
const height = container.node().offsetHeight;

svg.attr('width', width)
  .attr('height', height);

const x = scaleLinear().range([0, width]);
const y = scaleLinear().range([height, 0]);

const valueLine = line()
    .x(d => x(d.price_surface))
    .y(d => y(d.count));

x.domain([0, max(data, d => d.price_surface)]);
y.domain([0, max(data, d => d.count)]);

svg.append('path')
  .data([data])
  .attr('class', 'line')
  .attr('d', valueLine);

svg.append('g')
  .attr('class', 'axis grid')
  .attr('transform', `translate(0, ${height - 2})`)
  .call(axisTop(x).tickSize(height));

svg.append('g')
  .attr('class', 'axis x')
  .attr('transform', `translate(0, ${height - 2})`)
  .call(axisTop(x).tickSize(0));

svg.append('g')
  .attr('class', 'axis y')
  .attr('transform', 'translate(-1, 0)')
  .call(axisRight(y).tickSize(0).tickSizeOuter(0));

svg.append('g')
  .attr('class', 'axis grid')
  .attr('transform', 'translate(-1, -1)')
  .call(axisRight(y).tickSize(width));
