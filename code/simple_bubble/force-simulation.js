// Steve Harris
// Simple bubble demo
// 2019-11-10

// Draw a single circle based on fixed data (position and radius)
// Now update the circle using data from your websocket
var simul_svg = d3.select('#simul')
    .append("svg")
    .attr("width", 600)
    .attr("height", 600)


function makeSimul() {
    // create the background
    var simul_svg = d3.select('#simul')
        .append("svg")
        .attr("width", 600)
        .attr("height", 300)
        .attr("fill", "black");
    
    // draw a circle
    var cs1 = simul_svg
        .append("circle")
        .attr("r", 40)
        .attr("cx", 100)
        .attr("cy", 100);
    
    return simul_svg;

}
makeSimul();


function makeSimul_bak() {
    var ps = [ { x: 150, y: 200, vx: 0, vy: 3 },
               { x: 250, y: 200, vx: 0, vy: -3 } ];
    var ln = [ { index: 0, source: ps[0], target: ps[1] } ];

    var simul_svg = d3.select('#simul')
        .append("svg")
        .attr("width", 600)
        .attr("height", 600)

    var cs1 = simul_svg
        .append("circle")
        .attr("r", 40)
        .attr("cx", 100)
        .attr("cy", 100)

    var cs2 = simul_svg
        .append("circle")
        .attr("r", 40)
        .attr("cx", 200)
        .attr("cy", 150)
        .attr("fill", "white")


    var sim = d3.forceSimulation( ps )
        .alphaDecay( 0 ).alphaMin( -1 ).velocityDecay( 0 )
        .force("ln", d3.forceLink(ln).distance(100).strength(0.01))
        .on( "tick", function() {
            cs1.attr( "cx", ps[0].x ).attr( "cy", ps[0].y );
            cs2.attr( "cx", ps[1].x ).attr( "cy", ps[1].y );
        } );
}
