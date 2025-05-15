import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

export function createTooltip(svg) {
  const tooltip = d3.select("body").append("div").attr("class", "tooltip");

  const hoverGroup = svg
    .append("g")
    .attr("class", "hover-group")
    .style("display", "none");

  hoverGroup.append("line").attr("class", "tooltip-line");

  hoverGroup
    .append("circle")
    .attr("class", "tooltip-point-circle")
    .attr("r", 4);

  return { tooltip, hoverGroup };
}

export function addTooltipInteraction(
  svg,
  data,
  xScale,
  yScale,
  usableArea,
  tooltipElements
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

    let dPoint = null;

    if (data && data.length > 0) {
      const i = bisectDate(data, snappedX0, 1);
      const d0 = data[i - 1];
      const d1 = data[i];

      if (!d0) {
        dPoint = d1;
      } else if (!d1) {
        dPoint = d0;
      } else {
        dPoint =
          Math.abs(snappedX0 - d0.min) > Math.abs(snappedX0 - d1.min) ? d1 : d0;
      }
    }

    let tooltipHtml = "";
    const verticalLine = hoverGroup.select(".tooltip-line");
    const pointCircle = hoverGroup.select(".tooltip-point-circle");

    if (dPoint && dPoint.diff !== undefined) {
      tooltipHtml =
        `Time (min): ${d3.format(".0f")(dPoint.min)}<br>` +
        `Avg. Difference: ${d3.format(".3f")(dPoint.diff)}`;

      verticalLine
        .style("display", null)
        .attr("x1", xScale(dPoint.min))
        .attr("x2", xScale(dPoint.min))
        .attr("y1", usableArea.top)
        .attr("y2", usableArea.bottom);

      pointCircle
        .style("display", null)
        .attr("cx", xScale(dPoint.min))
        .attr("cy", yScale(dPoint.diff))
        .style("fill", "steelblue");
    } else {
      tooltipHtml =
        `Time (min): ${d3.format(".0f")(snappedX0)}<br>` +
        `Avg. Difference: N/A`;

      verticalLine
        .style("display", null)
        .attr("x1", xScale(snappedX0))
        .attr("x2", xScale(snappedX0))
        .attr("y1", usableArea.top)
        .attr("y2", usableArea.bottom);

      pointCircle.style("display", "none");
    }

    tooltip
      .html(tooltipHtml)
      .style("left", event.pageX + 15 + "px")
      .style("top", event.pageY - 28 + "px");
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
