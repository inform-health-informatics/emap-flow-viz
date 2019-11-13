// use the var declaration to avoid polluting the global name space
// then create a single object to hold all your variables to avoid collisions
var vz = {};
vz.pts = []; // patients data

// Dimensions of chart.
const margin = { top: 20, right: 20, bottom: 20, left: 20 },
      width = 900 - margin.left - margin.right,
      height = 360 - margin.top - margin.bottom; 


// Group coordinates and meta info. 
const groups = {
    "ED": { x: width/5, y: height/2, color: "#FAF49A", cnt: 0, fullname: "ED" }, 
	"AMU": { x: 2.5*width/5, y: 1*height/4, color: "#BEE5AA", cnt: 0, fullname: "AMU" },
    "ICU": { x: 2.5*width/5, y: 3*height/4, color: "#93D1BA", cnt: 0, fullname: "ICU" },
    "T8": { x: 4*width/5, y: height/2, color: "#79BACE", cnt: 0, fullname: "T8" },
};


// begin executing javascript once the page has loaded
window.addEventListener("load", main)

// connect to the websocket
var connection = new WebSocket('ws://localhost:8001/websocket');
// debugging : temporary empty connection to avoid page errors
// var connection = function () {};

// from the realtime example
connection.onmessage = function(event) {
    var newData = JSON.parse(event.data);
    var updateObject ={
        "name": newData.name,
        "start_time": newData.start_time,
        "end_time": newData.end_time,
        "activity_time": newData.activity_time,
        "resource": newData.resource,
        "replication": newData.replication
    };
    vz.pts = makeUpdate(updateObject, vz.pts);
}

// actions needed
// - let's use the resource string to create coordinates
// - append the updated data to the existing data
// the array of data should be keyed on patient and ideally just contain the _current_ attributes
// then the update the attributes and add new nodes if needed
// - then select based on the key
// - then using 'join' or similar redraw
// - then add in transitions to make it look pretty


function makeUpdate(msg, pts) {
    
    // prove that you can see the new data
    // console.log("data to update");

    // return index of patient if already in array else -1
    var pts_index = pts.findIndex( i => {return i.name === msg.name;});
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
    updateViz(svg, pts);
    return pts;
}

function updateViz (svg, pts) {
    console.log("Updating viz ...");

    //
    var t = svg.transition().duration(1500).ease(i => i);

    // set up scales
    var scX = d3.scaleLog().domain([1, 5000]).range([700, 100]),  
        scY = d3.scaleLog().domain([1, 5000]).range([1, 250]),
        scR = d3.scaleLog().domain([1, 100]).range([1, 100]).clamp(true);
    
    var cs = svg.selectAll( "circle" )
        .data(pts, function(d) {return d.name;})
        .join(
            enter => enter.append("circle")
                .attr( "fill", "green" ) 
                .attr( "cx", d=>groups[d.resource].x)
                .attr( "cy", d=>groups[d.resource].y),
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

function main() {
    // this is wrapper function for everything else

    d3.select("#chart").style("width", (width+margin.left+margin.right)+"px");

    svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    console.log(vz.pts);
    updateViz(svg, vz.pts);
}
