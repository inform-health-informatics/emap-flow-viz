// set up constants and non-d3 functions
const margin = {top: 20, right: 20, bottom: 20, left: 20},
    padding = {top: 60, right: 60, bottom: 60, left: 60},
    outerWidth = 960,
    outerHeight = 500,
    innerWidth = outerWidth - margin.left - margin.right,
    innerHeight = outerHeight - margin.top - margin.bottom,
    width = innerWidth - padding.left - padding.right,
    height = innerHeight - padding.top - padding.bottom;

// Group coordinates and meta info.
const groups = {
    "ED": { x: width/5, y: height/2, color: "#FAF49A", cnt: 0, fullname: "ED" },
    "AMU": { x: 2.5*width/5, y: 1*height/4, color: "#BEE5AA", cnt: 0, fullname: "AMU" },
    "ICU": { x: 2.5*width/5, y: 3*height/4, color: "#93D1BA", cnt: 0, fullname: "ICU" },
    "T8": { x: 4*width/5, y: height/2, color: "#79BACE", cnt: 0, fullname: "T8" },
};

const radius = 5,
    node_padding = 1, // Space between nodes
    cluster_padding = 5; // Space between nodes in different stages

// can only use d3 functions below; they are not seen until the page is fully loaded
// begin main
window.onload = function main () {

// set up svg to hold viz with margin transform
const svg = d3.select("#viz").append("svg")
    .attr("width", outerWidth)
    .attr("height", outerHeight)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// set up scales
const scX = d3.scaleLog().domain([1, 5000]).range([700, 100]),
    scY = d3.scaleLog().domain([1, 5000]).range([1, 250]),
    scR = d3.scaleLog().domain([1, 100]).range([1, 100]).clamp(true);

// functions for forces for collision detections
function forceCluster() {
    const strength = .15;
    let nodes;

    function force(alpha) {
        const l = alpha * strength;
        for (const d of nodes) {
        d.vx -= (d.x - groups[d.group].x) * l;
        d.vy -= (d.y - groups[d.group].y) * l;
        }
    }
    force.initialize = _ => nodes = _;

    return force;
}

// Force for collision detection.
function forceCollide() {
const alpha = 0.2; // fixed for greater rigidity!
const padding1 = padding; // separation between same-color nodes
const padding2 = cluster_padding; // separation between different-color nodes
let nodes;
let maxRadius;

function force() {
    const quadtree = d3.quadtree(nodes, d => d.x, d => d.y);
    for (const d of nodes) {
    const r = d.r + maxRadius;
    const nx1 = d.x - r, ny1 = d.y - r;
    const nx2 = d.x + r, ny2 = d.y + r;
    quadtree.visit((q, x1, y1, x2, y2) => {

        if (!q.length) do {
        if (q.data !== d) {
            const r = d.r + q.data.r + (d.group === q.data.group ? padding1 : padding2);
            let x = d.x - q.data.x, y = d.y - q.data.y, l = Math.hypot(x, y);
            if (l < r) {
            l = (l - r) / l * alpha;
            d.x -= x *= l, d.y -= y *= l;
            q.data.x += x, q.data.y += y;
            }
        }
        // TODO: is this an error? expected a conditional and saw an assignment
        } while (q = q.next);
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    });
    }
}

force.initialize = _ => maxRadius = d3.max(nodes = _, d => d.r) + Math.max(padding1, padding2);

return force;
}
// end of forces

// load initial data
let pts = d3.csv("ADT_head5.csv", function(d) {
    // note returns a promise; not the actual data
    return {
        name: d.name,
        start_time: d.start_time,
        end_time: d.end_time,
        activity_time: d.activity_time,
        resource: d.resource,
        replication: d.replication
    };
});

console.log(pts);


pts.then(function(dd) {
    d3.select("#viz_inspect")
    .append("table")

    .selectAll("tr")
        .data(dd).enter()
        .append("tr")

    .selectAll("td")
        .data(function(d) { return d3.values(d); }).enter()
        .append("td")
        .text(function(d) { return (d); });
});

svg.append("text")
  .attr("x", 100)
  .attr("y", 100)
  .text('hello world')

};
// end main

console.log("so far so good");
