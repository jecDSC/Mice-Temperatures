import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
import * as i from "./interaction_sub.js";

export default function renderLineGraph_sub(data) {
  const width = 1000;
  const height = 600;

  // Create SVG
  const svg = d3
    .select("#sub_vis")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("overflow", "visible");

  // Scales
  const xScale = d3.scaleLinear().domain([0, 8640]).range([0, width]);

  const yScale = d3.scaleLinear().domain([-0.6, 1.6]).range([0, width]).nice();

  // Setting display window
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

  // Gridlines
  const gridlines = svg
    .append("g")
    .attr("class", "gridlines")
    .attr("transform", `translate(${usableArea.left}, 0)`);
  gridlines.call(
    d3.axisLeft(yScale).tickFormat("").tickSize(-usableArea.width)
  );

  // Set axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  svg
    .append("g")
    .attr("transform", `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

  svg
    .append("g")
    .attr("transform", `translate(${usableArea.left}, 0)`)
    .call(yAxis);

  const line = d3
    .line()
    .x((d) => xScale(d.min))
    .y((d) => yScale(d.diff));

  svg
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", line);

  const tooltipElements = i.createTooltip(svg);

  i.addTooltipInteraction(
    svg,
    data,
    xScale,
    yScale,
    usableArea,
    tooltipElements
  );
}
