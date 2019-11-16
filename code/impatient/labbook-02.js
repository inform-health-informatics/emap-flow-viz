// actions needed
// TODO: need an inital data load for the initial state


// Node size and spacing.
const radius = 5,
	  padding = 1, // Space between nodes
      cluster_padding = 5; // Space between nodes in different stages

// Dimensions of chart.
const margin = { top: 20, right: 20, bottom: 20, left: 20 },
      width = 900 - margin.left - margin.right,
      height = 360 - margin.top - margin.bottom; 

const svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.select("#chart").style("width", (width+margin.left+margin.right)+"px");

// set up scales
const scX = d3.scaleLog().domain([1, 5000]).range([700, 100]),  
    scY = d3.scaleLog().domain([1, 5000]).range([1, 250]),
    scR = d3.scaleLog().domain([1, 100]).range([1, 100]).clamp(true);

// Group coordinates and meta info. 
const groups = {
    "ED": { x: width/5, y: height/2, color: "#FAF49A", cnt: 0, fullname: "ED" }, 
	"AMU": { x: 2.5*width/5, y: 1*height/4, color: "#BEE5AA", cnt: 0, fullname: "AMU" },
    "ICU": { x: 2.5*width/5, y: 3*height/4, color: "#93D1BA", cnt: 0, fullname: "ICU" },
    "T8": { x: 4*width/5, y: height/2, color: "#79BACE", cnt: 0, fullname: "T8" },
};

// force definitions via flowing data example
// Force to increment nodes to groups.
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
        } while (q = q.next);
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
    }
  }

  force.initialize = _ => maxRadius = d3.max(nodes = _, d => d.r) + Math.max(padding1, padding2);

  return force;
}



// connect to the websocket
const connection = new WebSocket('ws://localhost:8001/websocket');
// debugging : temporary empty connection to avoid page errors
// var connection = function () {};

// from the realtime example
connection.onmessage = function(event) {
    let newData = JSON.parse(event.data);
    let updateObject ={
        "name": newData.name,
        "start_time": newData.start_time,
        "end_time": newData.end_time,
        "activity_time": newData.activity_time,
        "resource": newData.resource,
        "replication": newData.replication
    };
    console.log('new message');
    updatePts(updateObject);
}


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

function updateViz () {
    console.log("Updating viz ...");

//     //
//     t = svg.transition().duration(1500).ease(i => i);

    
//     cs = svg.selectAll( "circle" )
//         .data(pts, function(d) {return d.name;})
//         .join(
//             enter => enter.append("circle")
//                 .attr( "fill", "green" ) 
//                 .attr( "cx", d=>groups[d.resource].x)
//                 .attr( "cy", d=>groups[d.resource].y),
//             update => update
//                 .attr( "fill", "blue" ) 
//                 .call(update => update.transition(t)
//                     .attr( "cx", d=>groups[d.resource].x)
//                     .attr( "cy", d=>groups[d.resource].y)
//                 ),
//             exit => exit
//                 .attr( "fill", "red" ) 
//                 .call(
//                     exit => exit.transition(t)
//                     )
//                 .remove()
//         )
//             .attr( "r",  d=>scR(d.activity_time) )
//             .attr( "opacity", "0.1" );

}

function main() {
    // this is wrapper function for everything else

    // const (variables that won't change (but their properties can))
    // const pts = []; // patients data
    const pts = d3.dsv(",", "../../data/ADT_head5.csv", function(d) {
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
    pts.then(function(data) {
        console.log(data);
        // do the work here

    // d3.timeout(3000)

    // const circle = svg
    //     .selectAll("circle")
    //     .data(pts)
    //     .join("circle")
    //       .attr("cx", d => d.x)
    //       .attr("cy", d => d.y)
    //       .attr("fill", d => d.color);
    
    // // Forces
    // const simulation = d3.forceSimulation(pts)
    // //     .force("x", d => d3.forceX(d.x))
    // //     .force("y", d => d3.forceY(d.y))
    // //     .force("cluster", forceCluster())
    // //     .force("collide", forceCollide())
    // //     .alpha(.09)
    // //     .alphaDecay(0);

    // // Adjust position of circles.
    // simulation.on("tick", () => {    
    //     circle
    //         .attr("cx", d => d.x)
    //         .attr("cy", d => d.y)
    //         .attr("fill", d => groups[d.group].color);
    //     });


    // console.log(pts);
    // updateViz();
    window.addEventListener("load", updatePts)
    });
}

// end of function definitions

// the code that runs the script
// begin executing javascript once the page has loaded
main();
