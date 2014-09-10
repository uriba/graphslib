var colors = ["blue","green","red"];
var w = 600;
var h = 400;
var margin = 30;
var oauthToken;
var url;
var id;
var loaded=0;
function csvPresent(content)
{
    var svg = d3.select("body").append("svg");
    var dataset = {};
    var xs = [];
    var ys = [];
    var xTitle = "";
    var yTitle = "";
    var labels = [];
    var circles =[];
    svg.attr("width",w).attr("height",h);
    svg.append("clipPath")
        .attr("id","chart-area")
        .append("rect")
        .attr("x",margin)
        .attr("y",margin)
        .attr("width",w-margin*3)
        .attr("height",h-margin*2);
    console.log(content);
    d3.csv.parse(content).forEach(function(d) {
        var label = "series-1";
        var size = 3;
        var caption = "";
        if(d.hasOwnProperty("label")) {
            label = d.label;
        }
        if(! d.hasOwnProperty("size")) {
            d["size"] = size;
        }
        if(! d.hasOwnProperty("caption")) {
            d["caption"] = caption;
        }
        if(dataset.hasOwnProperty(label)) {
            dataset[label].push(d);
        } else {
            dataset[label]=[d];
        }
    });
    labels = Object.keys(dataset);
    xTitle=Object.keys(dataset[labels[0]][0])[0];
    yTitle=Object.keys(dataset[labels[0]][0])[1];
    for (var i=0; i< labels.length; i++) {
        xs = xs.concat(dataset[labels[i]].map(function (x) { return x[xTitle];}));
        ys = ys.concat(dataset[labels[i]].map(function (x) { return x[yTitle];}));
    }
    var xScale = d3.scale.linear()
            .domain([d3.min(xs),d3.max(xs)])
            .range([margin,w-2*margin]);
    var yScale = d3.scale.linear()
            .domain([d3.min(ys),d3.max(ys)])
            .range([h-margin,margin]);
    svg.append("g")
        .attr("id","circles")
        .attr("clip-path","url(#chart-area")
        .selectAll("g").data(labels).enter()
        .append("g")
        .attr("id",function(label) {return label;})
    circles = svg.select("#circles");
    labels.map(function(label,i) {
        circles.select("#"+label).selectAll("circle").data(dataset[label]).enter()
        .append("circle")
        .attr("cx",function(d) {return xScale(d[xTitle]);})
        .attr("cy",function(d) {return yScale(d[yTitle]);})
        .attr("r",function(d) {return d.size;})
        .attr("fill",colors[i])
        .on("mouseover",function(d) {
            var me = d3.select(this);
            var xPos = parseFloat(me.attr("cx"));
            var yPos = parseFloat(me.attr("cy"));
            svg.append("text")
                .attr("id","tooltip")
                .attr("x",xPos)
                .attr("y",yPos)
                .attr("text-anchor","middle")
                .attr("font-family","sans-serif")
                .attr("font-size","11px")
                .attr("font-weight","bold")
                .attr("fill","black")
                .text("(" + d[xTitle] + "," + d[yTitle] + ") - " + d.caption);
        })
        .on("mouseout",function() {
            d3.select("#tooltip").remove();
        });
    });
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(5);
    var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5);
    svg.append("g").attr("class","x axis").attr("transform", "translate(0," + (h-margin)+")").call(xAxis);
    svg.append("g").attr("class","y axis").attr("transform", "translate(" + margin+",0)").call(yAxis);
}
