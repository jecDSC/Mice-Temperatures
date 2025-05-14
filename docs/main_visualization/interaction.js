import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

export const test = () => {
  console.log("Linking works!");
};

export function createTooltip(svg) {
  const tooltip = d3.select("body").append("div").attr("class", "tooltip");

  const hoverGroup = svg
    .append("g")
    .attr("class", "hover-group")
    .style("display", "none");

  hoverGroup.append("line").attr("class", "tooltip-line");

  hoverGroup
    .append("circle")
    .attr("class", "tooltip-circle female-circle")
    .attr("r", 4);
  hoverGroup
    .append("circle")
    .attr("class", "tooltip-circle male-circle")
    .attr("r", 4);

  return { tooltip, hoverGroup };
}

export function addTooltipInteraction(
  svg,
  data,
  micedata,
  xScale,
  yScale,
  usableArea,
  tooltipElements,
  colors
) {
  const { tooltip, hoverGroup } = tooltipElements;
  const bisectDate = d3.bisector((d) => d.min).left;

  const mouseover = (event) => {
    tooltip.style("opacity", 1);
    hoverGroup.style("display", null);
  };

  const mousemove = (event) => {
    const [mouseX, mouseY] = d3.pointer(event, svg.node());

    if (
      mouseX < usableArea.left ||
      mouseX > usableArea.right ||
      mouseY < usableArea.top ||
      mouseY > usableArea.bottom
    ) {
      mouseout();
      return;
    }

    const continuousX0 = xScale.invert(mouseX);
    const snappedX0 = Math.round(continuousX0);

    let dFemale = null;
    let dMale = null;

    const femaleDataPoints = micedata[0] || [];
    const maleDataPoints = micedata[1] || [];

    if (femaleDataPoints.length > 0) {
      const i = bisectDate(femaleDataPoints, snappedX0, 1);
      const d0 = femaleDataPoints[i - 1];
      const d1 = femaleDataPoints[i];
      if (!d0) dFemale = d1;
      else if (!d1) dFemale = d0;
      else
        dFemale =
          Math.abs(snappedX0 - d0.min) > Math.abs(snappedX0 - d1.min) ? d1 : d0;
    }

    if (maleDataPoints.length > 0) {
      const i = bisectDate(maleDataPoints, snappedX0, 1);
      const d0 = maleDataPoints[i - 1];
      const d1 = maleDataPoints[i];
      if (!d0) dMale = d1;
      else if (!d1) dMale = d0;
      else
        dMale =
          Math.abs(snappedX0 - d0.min) > Math.abs(snappedX0 - d1.min) ? d1 : d0;
    }

    let tooltipHtml = `Time: ${d3.format(".0f")(snappedX0)} min<br>`;
    let tempDiffText = "N/A";

    tooltipHtml += `Female: ${
      dFemale ? d3.format(".1f")(dFemale.temp) + "°" : "N/A"
    }<br>`;
    tooltipHtml += `Male: ${
      dMale ? d3.format(".1f")(dMale.temp) + "°" : "N/A"
    }<br>`;

    if (dFemale && dMale && dFemale.temp != null && dMale.temp != null) {
      const diff = dFemale.temp - dMale.temp;
      tempDiffText = `${d3.format("+.1f")(diff)}°`;
    }
    tooltipHtml += `Difference: ${tempDiffText}`;

    tooltip
      .html(tooltipHtml)
      .style("left", event.pageX + 15 + "px")
      .style("top", event.pageY - 28 + "px");

    hoverGroup
      .select(".tooltip-line")
      .attr("x1", xScale(snappedX0))
      .attr("x2", xScale(snappedX0))
      .attr("y1", usableArea.top)
      .attr("y2", usableArea.bottom);

    const femaleCircle = hoverGroup.select(".female-circle");
    if (dFemale && femaleDataPoints.length > 0) {
      femaleCircle
        .style("display", null)
        .attr("cx", xScale(dFemale.min))
        .attr("cy", yScale(dFemale.temp))
        .style("fill", colors(femaleDataPoints[0].sex));
    } else {
      femaleCircle.style("display", "none");
    }

    const maleCircle = hoverGroup.select(".male-circle");
    if (dMale && maleDataPoints.length > 0) {
      maleCircle
        .style("display", null)
        .attr("cx", xScale(dMale.min))
        .attr("cy", yScale(dMale.temp))
        .style("fill", colors(maleDataPoints[0].sex));
    } else {
      maleCircle.style("display", "none");
    }
  };

  const mouseout = () => {
    tooltip.style("opacity", 0);
    hoverGroup.style("display", "none");
  };
  svg.select(".overlay").remove();

  svg
    .append("rect")
    .attr("class", "overlay")
    .attr("x", usableArea.left)
    .attr("y", usableArea.top)
    .attr("width", usableArea.width)
    .attr("height", usableArea.height)
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseout", mouseout);
}
