var yearRingChart   = dc.pieChart("#chart-ring-year"),
    spenderRowChart = dc.rowChart("#chart-row-spenders");
var connection = new WebSocket('ws://localhost:8001/websocket');
var data1 = [
    {Name: 'Ben', Spent: 330, Year: 2014, 'total':1},
    {Name: 'Aziz', Spent: 1350, Year: 2012, 'total':2},
    {Name: 'Vijay', Spent: 440, Year: 2014, 'total':2},
    {Name: 'Jarrod', Spent: 555, Year: 2015, 'total':1},
];
// set crossfilter with first dataset
var xfilter = crossfilter(data1),
    yearDim  = xfilter.dimension(function(d) {return +d.Year;}),
    spendDim = xfilter.dimension(function(d) {return Math.floor(d.Spent/10);}),
    nameDim  = xfilter.dimension(function(d) {return d.Name;}),
    
    spendPerYear = yearDim.group().reduceSum(function(d) {return +d.Spent;}),
    spendPerName = nameDim.group().reduceSum(function(d) {return +d.Spent;});

// render plots
function render_plots(){
    yearRingChart
        .width(200).height(200)
        .dimension(yearDim)
        .group(spendPerYear)
        .innerRadius(50);
    spenderRowChart
        .width(250).height(200)
        .dimension(nameDim)
        .group(spendPerName)
        .elasticX(true);
    dc.renderAll();
}
render_plots();

// data reset function (adapted)
function resetData(ndx, dimensions) {
    var yearChartFilters = yearRingChart.filters();
    var spenderChartFilters = spenderRowChart.filters();
    yearRingChart.filter(null);
    spenderRowChart.filter(null);
    xfilter.remove();
    yearRingChart.filter([yearChartFilters]);
    spenderRowChart.filter([spenderChartFilters]);
}
connection.onmessage = function(event) {
    var newData = JSON.parse(event.data);
    var updateObject =[{
        "Name": newData.Name,
        "Year": newData.Year,
        "Spent": newData.Spent,
        "payType": newData.payType
    }]
    //resetData(ndx, [yearDim, spendDim, nameDim]);
    xfilter.add(updateObject);
    dc.redrawAll();
}