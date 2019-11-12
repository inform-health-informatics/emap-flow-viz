// begin executing javascript once the page has loaded
window.addEventListener("load", main)

// Tune-able constants etc.
const people = {};
let time_so_far = Date.now();

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

// Group coordinates and meta info. 
const groups = {
    "ED": { x: width/5, y: height/2, color: "#FAF49A", cnt: 0, fullname: "ED" }, 
	"AMU": { x: 2.5*width/5, y: 1*height/4, color: "#BEE5AA", cnt: 0, fullname: "AMU" },
    "ICU": { x: 2.5*width/5, y: 3*height/4, color: "#93D1BA", cnt: 0, fullname: "ICU" },
    "T8": { x: 4*width/5, y: height/2, color: "#79BACE", cnt: 0, fullname: "T8" },
};

// load your data
// via csv
var stages = d3.csv("../../data/adt4d3.csv");

// connect to the websocket
// debugging : temporary empty connection to avoid page errors
var connection = new WebSocket('ws://localhost:8001/websocket');
// var connection = function () {};

// from FlowingData's moving bubble example
stages.then(
    function(data) { // promise: function to handle success
    
    // Consolidate stages by pid.
    // The data file is one row per stage change.
    // this function sorts the rows into batches grouped by PID
    data.forEach(d => {
        if (d3.keys(people).includes(d.pid+"")) {
            people[d.pid+""].push(d);
        } else {
            people[d.pid+""] = [d];
        }
        // console.log(d)
    });

    // console.log(people);
},
    function(e) {a // promise: function to handle failure
        console.log('oops' + e)

    }
);

// from the realtime example
connection.onmessage = function(event) {
    var newData = JSON.parse(event.data);
    var updateObject =[{
        "name": newData.name,
        "start_time": newData.start_time,
        "end_time": newData.end_time,
        "activity_time": newData.activity_time,
        "resource": newData.resource,
        "replication": newData.replication
    }]
    //resetData(ndx, [yearDim, spendDim, nameDim]);
    // xfilter.add(updateObject);
    // dc.redrawAll();
    makeUpdate(updateObject);
}




// // create a variable to hold the svg object that you will work with
// console.log("hello")
// var svg = d3.select("#fig01");

// function makeKeys() {
//     var ds1 = [["Mary", 1], ["Jane", 4], ["Anne", 2]];            
//     var ds2 = [["Anne", 5], ["Jane", 3]];                         

//     var scX = d3.scaleLinear().domain([0, 6]).range([50, 300]),
//         scY = d3.scaleLinear().domain([0, 3]).range([50, 150]);

//     var j = -1, k = -1;                                           

//     var svg = d3.select( "#fig01" );                                

//     svg.selectAll( "text" )                                       
//         .data(ds1).enter().append( "text" )
//         .attr( "x", 20 ).attr( "y", d=>scY(++j) ).text( d=>d[0] + ">>" );

//     svg.selectAll("circle").data(ds1).enter().append( "circle" )  
//         .attr( "r", 5 ).attr( "fill", "red" )
//         .attr( "cx", d=>scX(d[1]) ).attr( "cy", d=>scY(++k)-5 );

//     svg.on( "click", function() {
//         var cs = svg.selectAll( "circle" ).data( ds2, d=>d[0] );  

//         cs.transition().duration(1000).attr("cx", d=>scX(d[1]) ); 
//         cs.exit().attr( "fill", "blue" );                         
//     } );
    

// }

// just checking you can draw a circle OK
function test_circle1() {
    console.log('test circle 1')
    svg1 = d3.select("#chart").append('svg')
        .attr("width", 400 )
        .attr("height", 200 );
    svg1.append("circle")
        .attr("cx", 201)
        .attr("cy", 101)
        .attr("r", 31)
        .attr("style", "fill: skyblue");

}

// append a 2nd circle

function test_circle2() {
    console.log('test circle 2')
    svg1 = d3.select("#chart").select("svg");
    svg1.append("circle")
        .attr("cx", 152)
        .attr("cy", 152)
        .attr("r", 32)
        .attr("style", "fill: red");

}

function makeUpdate(newData) {
    
    // prove that you can see the new data
    console.log("data to update")
    console.log(newData);

    var scX = d3.scaleLog().domain([1, 5000]).range([700, 100]),  
        scY = d3.scaleLog().domain([1, 5000]).range([1, 250]),
        scR = d3.scaleLog().domain([1, 100]).range([1, 100]);

    var svg2 = d3.select( "#update" );                             
    var cs = svg2.selectAll( "circle" ).remove();  
    
    // var cs = svg2.selectAll( "circle" ).data( newData );  
    var cs = svg2.data( newData );  
    console.log("selection to update")
    console.log(cs)


//     svg.on( "click", function() {                                 
//         [ ds1, ds2 ] = [ ds2, ds1 ];                              

//         var cs = svg.selectAll( "circle" ).data( ds1, d=>d[2] );  

        // cs.exit().remove();                                       

        // cs.enter().append( "circle" )                        
        cs.append( "circle" )                        
            .attr( "r",  d=>scR(d.activity_time) )
            .attr( "cx", d=>scX(d.start_time) )
            .attr( "cy", d=>scY(d.end_time) )
            .attr( "opacity", "0.1" )
            .attr( "fill", "red" );
            // .merge(cs);
        console.log("selection to update")
        console.log(cs)

//         cs.attr( "cx", d=>scX(d[0]) ).attr( "cy", d=>scY(d[1]) ); 
//     } );

//     svg.dispatch( "click" );                                      
}

function main() {
    // this is wrapper function for everything else
    // makeKeys();
    // makeUpdate();
    // var svg = d3.select("#fig01");
    // svg.selectAll("circle").attr("fill", "black");
    test_circle1();
    test_circle2();
}
