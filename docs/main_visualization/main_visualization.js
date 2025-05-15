import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
import * as i from "./interaction.js";

// Put the code for the graph here, the interactivity is in another graph,
// Use placeholder functions/comments to map where things should be

// console.log("Hello World!");
// i.test();

// For creating graph
export default function renderLineGraph(data) {
  const width = 1000;
  const height = 600;

  // Create SVG
  const svg = d3
    .select("#vis")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("overflow", "visible");

  // Scales
  const xScale = d3.scaleLinear().domain([0, 8640]).range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.temp))
    .range([0, width])
    .nice();

  // Setting display window
  const margin = { top: 10, right: 10, bottom: 30, left: 30 };
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

  // Background coloring
  const daysToShade = [
    { day: 2, start: 1440, end: 2880 },
    { day: 6, start: 7200, end: 8640 },
  ];

  daysToShade.forEach((day) => {
    svg
      .append("rect")
      .attr("x", xScale(day.start))
      .attr("width", xScale(day.end) - xScale(day.start))
      .attr("y", 10)
      .attr("height", height - 39)
      .style("fill", "#b0aeae")
      .style("opacity", 0.5);
  });

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

  // Creating the lines
  const micedata = [
    data.filter(({ sex }) => sex === "female"),
    data.filter(({ sex }) => sex === "male"),
  ];

  const line = d3
    .line()
    .x((d) => xScale(d.min))
    .y((d) => yScale(d.temp));
  const colors = d3.scaleOrdinal(["#ff8ab7", "#4269d0"]);

  const path = svg
    .append("g")
    .selectAll("path")
    .data(micedata)
    .join("path")
    .attr("class", "stock-lines")
    .attr("d", line)
    .style("stroke", (d, i) => colors(d[i].sex))
    .style("stroke-width", 2)
    .style("fill", "transparent");

  //Interactivity
  const tooltipElements = i.createTooltip(svg);

  i.addTooltipInteraction(
    svg,
    data,
    micedata,
    xScale,
    yScale,
    usableArea,
    tooltipElements,
    colors
  );

  // Graph title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 0 - margin.top / 2)
    .attr("text-anchor", "middle")
    .attr("font", "inherit")
    .style("text-decoration", "underline")
    .text(
      "Average Core Temperature of Male Mice and Female Mice Over Six Days"
    );

  // Axes titles
  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + margin.top)
    .attr("font", "inherit")
    .attr("font-weight", 450)
    .text("Time (minutes)");

  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 20)
    .attr("x", -margin.top)
    .attr("font", "inherit")
    .attr("font-weight", 450)
    .text("Temperature (Celsius)");

  // Add legend
  svg.append("g").attr("id", "legend").attr("transform", "translate(820,-100)");

  svg
    .select("#legend")
    .append("circle")
    .attr("cx", 190)
    .attr("cy", 130)
    .attr("r", 6)
    .style("fill", "#ff8ab7");
  svg
    .select("#legend")
    .append("circle")
    .attr("cx", 190)
    .attr("cy", 160)
    .attr("r", 6)
    .style("fill", "#4269d0");
  svg
    .select("#legend")
    .append("text")
    .attr("x", 210)
    .attr("y", 130)
    .text("Female")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle")
    .attr("transform", "translate(0, 4)");
  svg
    .select("#legend")
    .append("text")
    .attr("x", 210)
    .attr("y", 160)
    .text("Male")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle")
    .attr("transform", "translate(0, 4)");
  svg
    .select("#legend")
    .append("rect")
    .attr("x", 185)
    .attr("y", 185)
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", "#b0aeae");
  svg
    .select("#legend")
    .append("text")
    .attr("x", 210)
    .attr("y", 190)
    .text("Estrus (female)")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle")
    .attr("transform", "translate(0, 4)");
}
