import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
import renderLineGraph from "./main_visualization/main_visualization.js";

// Load Data
async function loadData(path) {
  const data = await d3.csv(path);
  return data;
}

//Main visualization
const mice = await loadData("./dataset/average_temp.csv");
renderLineGraph(mice);

//Sub visualization
