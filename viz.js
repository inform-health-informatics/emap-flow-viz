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
// these will be represented as 'nodes'
const groups = {
    "ED": { x: width/5, y: height/2, color: "#FAF49A", cnt: 0, fullname: "ED" },
    "AMU": { x: 2.5*width/5, y: 1*height/4, color: "#BEE5AA", cnt: 0, fullname: "AMU" },
    "ICU": { x: 2.5*width/5, y: 3*height/4, color: "#93D1BA", cnt: 0, fullname: "ICU" },
    "T8": { x: 4*width/5, y: height/2, color: "#79BACE", cnt: 0, fullname: "T8" },
};

// node parameters (for groups above)
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

// table inspect
d3.select("#viz_inspect")
    .append("table");

// test function to print the original patient load
function updateTable () {

    let dd = pts.sort(function(a,b) {
        let aa = a.rownum;
        let bb = b.rownum;
        return aa < bb ? +1 : aa > bb ? -1 : 0;
    }).slice(0,10);
    console.log(dd);
    
    d3.select("#viz_inspect").select("table")

        .selectAll("tr")
            // .data(dd).enter()
            // .append("tr")
            .data(dd, function(i) {return i.rownum;})
            .join(
                enter => enter.append("tr"),
                update => update,
                exit => exit.remove()
            )

        .selectAll("td")
            .data(function(d) { return d3.values(d); }).enter()
            .append("td")
            .text(function(d) { return (d); }) // ;
    // });
}


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
                    .attr( "cx", d=>groups[d.resource].x + Math.random())
                    .attr( "cy", d=>groups[d.resource].y + Math.random())
                ),
            update => update
                .attr( "fill", "blue" ) 
                .call(update => update.transition(t)
                    .attr( "cx", d=>groups[d.resource].x + Math.random())
                    .attr( "cy", d=>groups[d.resource].y + Math.random())
                ),
            exit => exit
                .attr( "fill", "red" ) 
                .call(
                    exit => exit.transition(t)
                    )
                .remove()
        )
            .attr( "r",  d=>radius )
            .attr( "opacity", "0.1" );

}

function map_data2pts (d) {
    return {
        rownum: +d.rownum,
        name: d.name,
        start_time: +d.start_time,
        end_time: +d.end_time,
        activity_time: +d.activity_time,
        resource: d.resource,
        x: groups[d.resource].x,
        y: groups[d.resource].y,
        replication: +d.replication
    };
}

// load initial data and create the patients (pts_start) array
const pts_start = d3.csv("data/ADT.csv", function(d, i) {
    // slicing: see https://stackoverflow.com/a/58052738
    return  i < 0 | i > 5
    ? null
    :  map_data2pts(d);
    // note returns a promise; not the actual data
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

// now set up connection and listener AFTER you have done the initial patient load
// connect to the websocket
const connection = new WebSocket('ws://localhost:8001/websocket');
// debugging : temporary empty connection to avoid page errors
// var connection = function () {};

// from the realtime example
connection.onmessage = function(event) {
    let newData = JSON.parse(event.data);
    let updateObject = map_data2pts(newData);
    console.log('new message');
    updatePts(updateObject, pts);
    updateTable();
    updateViz();
}


};
// end main
console.log("end main: so far so good");
