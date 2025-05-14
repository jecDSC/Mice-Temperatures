import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
import * as i from "./interaction.js";

// Put the code for the graph here, the interactivity is in another graph,
// Use placeholder functions/comments to map where things should be

// console.log("Hello World!");
// i.test();

async function loadData() {
  const data = await d3.csv("dataset/avgsMin.csv");
  return data;
}

function renderLineGraph(data) {
    const width = 1000;
    const height = 600;

    const svg = d3
  .select('#vis')
  .append('svg')
  .attr('viewBox', `0 0 ${width} ${height}`)
  .style('overflow', 'visible');

  const xScale = d3
  .scaleLinear()
  .domain(d3.extent(data, (d) => d.min))
  .range([0, width])
  .nice();

  const yScale = d3
  .scaleLinear()
  .domain(d3.extent(data, (d) => d.temp))
  .range([0, width])
  .nice();

  const margin = { top: 10, right: 10, bottom: 30, left: 20 };
  const usableArea = {
  top: margin.top,
  right: width - margin.right,
  bottom: height - margin.bottom,
  left: margin.left,
  width: width - margin.left - margin.right,
  height: height - margin.top - margin.bottom,
  };

  xScale.range([usableArea.left, usableArea.right]);
  yScale.range([usableArea.bottom, usableArea.top]);
  
  const gridlines = svg
  .append('g')
  .attr('class', 'gridlines')
  .attr('transform', `translate(${usableArea.left}, 0)`);
  gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);
  
  svg
  .append('g')
  .attr('transform', `translate(0, ${usableArea.bottom})`)
  .call(xAxis);
  
  svg
  .append('g')
  .attr('transform', `translate(${usableArea.left}, 0)`)
  .call(yAxis);

  const data2 = [
    data.filter(({ sex }) => sex === 'female'),
    data.filter(({ sex }) => sex === 'male')
  ]
  
  const line = d3.line()
  .x(d => xScale(d.min))
  .y(d => yScale(d.temp));
  const colors = d3.scaleOrdinal(d3.schemeCategory10)

  const path = svg
    .append("g")
    .selectAll('path')
    .data(data2)
    .join('path')
    .attr('class', 'stock-lines')
    .attr('d', line)
    .style('stroke', (d, i) => colors(d[i].sex))
    .style('stroke-width', 2)
    .style('fill', 'transparent');
}

const mice = await loadData("dataset/avgsMin.json");
renderLineGraph(mice);