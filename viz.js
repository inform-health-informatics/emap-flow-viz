// set up constants and non-d3 functions
// array to hold the current position of the patients
const pts = [];

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

// push or update patient's current position
function updatePts(msg, pts) {

    // prove that you can see the new data
    // console.log("data to update");

    // return index of patient if already in array else -1
    let pts_index = pts.findIndex( i => {return i.name === msg.name;});
    // push new patient or splice (delete and insert) as necessary
    if (pts_index === -1) {
        console.log('new patient ' + pts.length);
        pts.push(msg);
    } else {
        console.log('existing patient');
        // console.log(pts[pts_index]);
        pts.splice(pts_index, 1, msg);
        // console.log('new patient');
        // console.log(pts[pts_index]);

    };
    // commenting out because ...
    // don't do the update when the message arrives; use the tick instead
    // updateViz();
}

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

// functions for forces
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

function updateViz (update_speed=1500) {
    console.log("Updating viz ...");

    //
    t = svg.transition().duration(update_speed).ease(i => i);

    
    cs = svg.selectAll( "circle" )
        .data(pts, function(d) {return d.name;})
        .join(
            enter => enter.append("circle")
                .attr( "fill", "green" ) 
                .call(update => update.transition(t)
                    .attr( "cx", d=>groups[d.resource].x)
                    .attr( "cy", d=>groups[d.resource].y)
                ),
            update => update
                .attr( "fill", "blue" ) 
                .call(update => update.transition(t)
                    .attr( "cx", d=>groups[d.resource].x)
                    .attr( "cy", d=>groups[d.resource].y)
                ),
            exit => exit
                .attr( "fill", "red" ) 
                .call(
                    exit => exit.transition(t)
                    )
                .remove()
        )
            .attr( "r",  d=>scR(d.activity_time) )
            .attr( "opacity", "0.1" );

}

// load initial data and create the patients (pts_start) array
const pts_start = d3.csv("ADT_head5.csv", function(d) {
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

// parse each initial patient as if it were a message
pts_start.then(function(msgs) {
    msgs.forEach(msg => {
    console.log(msg);
    updatePts(msg, pts);
    });
    // RECONSIDER: running updates outside of the message loop
    updateTable();
    updateViz(update_speed=500);
});

console.log(pts);

d3.select("#viz_inspect")
    .append("table");

// test function to print the original patient load
function updateTable () {

    pts_start.then(function(dd) {
    d3.select("#viz_inspect").select("table")

        .selectAll("tr")
            .data(dd).enter()
            .append("tr")

        .selectAll("td")
            .data(function(d) { return d3.values(d); }).enter()
            .append("td")
            .text(function(d) { return (d); });
    });
}

// updateTable();

// now iterate through the initial CSV load as if they were messages


svg.append("text")
  .attr("x", 100)
  .attr("y", 100)
  .text('hello world')

};
// end main

console.log("so far so good");
