// import * as d3 from 'd3';


var body = d3.select("body");
var div = body.append("div");
div.html("Hello, world! (from viz.js");

d3.select("p#target")
    .text("Hello from a d3 selector");

console.log("so far so good");
