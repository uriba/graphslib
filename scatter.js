var colors = ["blue","green","red","cyan","magenta","yellow"];
var w = 600;
var h = 400;
var margin = 40;
var oauthToken;
var url;
var id;
var loaded=0;
var xScale;
var yScale;
var xAxis;
var yAxis;
var zoom;
function csvPresent(content)
{
    var dataset = {};
    var xs = [0];
    var ys = [0];
    var xTitle = "";
    var yTitle = "";
    var labels = [];
    var circles =[];
    console.log(content);
    d3.csv.parse(content).forEach(function(d) {
        d["label"] = d.hasOwnProperty("label") ? d.label : "series-1";
        d["size"] = d.hasOwnProperty("size") ? d.size : 3;
        d["caption"] = d.hasOwnProperty("caption") ? d.caption : "";
        if(dataset.hasOwnProperty(d.label)) {
            dataset[d.label].push(d);
        } else {
            dataset[d.label]=[d];
        }
    });
    labels = Object.keys(dataset);
    xTitle=Object.keys(dataset[labels[0]][0])[0];
    yTitle=Object.keys(dataset[labels[0]][0])[1];
    for (var i=0; i< labels.length; i++) {
        xs = xs.concat(dataset[labels[i]].map(function (x) { return x[xTitle];}));
        ys = ys.concat(dataset[labels[i]].map(function (x) { return x[yTitle];}));
    }
    xScale = d3.scale.linear()
            .domain([d3.min(xs),d3.max(xs)*1.1])
            .range([margin,w-2*margin]);
    yScale = d3.scale.linear()
            .domain([d3.min(ys),d3.max(ys)*1.1])
            .range([h-margin,margin]);
    xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(5);
    yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5);

    function zooming() {
        svg.select(".x.axis").transition().ease("linear").call(xAxis);
        svg.select(".y.axis").transition().ease("linear").call(yAxis);
        svg.select("#tooltip").remove();
        d3.select("#tooltip-bg").remove();
        svg.selectAll("circle").transition().ease("linear")
            .attr("cx",function(d) {return xScale(d[xTitle]);})
            .attr("cy",function(d) {return yScale(d[yTitle]);});
    }

    zoom = d3.behavior.zoom().x(xScale).y(yScale).scaleExtent([0.1,100]).on("zoom",zooming);
    var svg = d3.select("body").append("svg").attr("width",w).attr("height",h).attr("id","mainSVG").append("g").call(zoom).append("g");
    svg.append("clipPath")
        .attr("id","chart-area")
        .append("rect")
        .attr("x",margin)
        .attr("y",margin)
        .attr("width",w-margin*3)
        .attr("height",h-margin*2);
    svg.append("rect")
        .attr("class","overlay")
        .attr("width",w)
        .attr("height",h)
        .attr("fill","none")
        .attr("pointer-events","all");
    svg.append("g")
        .attr("class", "plot")
        .attr("id","circles")
        .attr("clip-path","url(#chart-area")
        .selectAll("g").data(labels).enter()
        .append("g")
        .attr("id",function(label) {return label;})
    svg.append("text")
        .attr("id","zoom-reset")
        .attr("text-anchor","end")
        .attr("font-family","sans-serif")
        .attr("font-size","11px")
        .attr("x",w*0.95)
        .attr("y",14)
        .text("reset zoom")
        .on("click",function() {
            zoom.translate([0,0]).scale(1);
            zooming();
        });



    circles = svg.select("#circles");
    labels.map(function(label,i) {
        circles.select("#"+label).selectAll("circle").data(dataset[label]).enter()
        .append("circle")
        .attr("r",function(d) {return d.size;})
        .attr("cx",function(d) {return xScale(d[xTitle]);})
        .attr("cy",function(d) {return yScale(d[yTitle]);})
        .attr("fill",colors[i])
        .attr("stroke","black")
        .attr("stroke-width",2)
        .on("click",function(d) {
            d3.select("#tooltip").remove();
            d3.select("#tooltip-bg").remove();
            var me = d3.select(this);
            var xPos = parseFloat(me.attr("cx"));
            var yPos = parseFloat(me.attr("cy"));
            var tooltipText = svg.select(".plot").append("text")
                .attr("id","tooltip")
                .attr("x",xPos)
                .attr("y",yPos)
                .attr("text-anchor","middle")
                .attr("font-family","sans-serif")
                .attr("font-size","11px")
                .attr("font-weight","bold")
                .attr("fill","black")
                .text("(" + d[xTitle] + "," + d[yTitle] + ") - " + d.caption);
            var rect = tooltipText[0][0].getBBox();
            var tooltipBackground = svg.select(".plot").insert("rect","#tooltip")
                .attr("id","tooltip-bg")
                .attr("x",rect.x)
                .attr("y",rect.y)
                .attr("width",rect.width)
                .attr("height",rect.height)
                .attr("fill","yellow")
                .attr("stroke","gray")
                .attr("stroke-width",2);
            //svg.insertBefore(tooltipBackground,tooltipText);
        })
    });
    svg.append("text")
        .attr("class", "x-label")
        .attr("text-anchor","center")
        .attr("x",w/2)
        .attr("y",h-6)
        .text(xTitle);
    svg.append("text")
        .attr("class", "y-label")
        .attr("text-anchor","center")
        .attr("y",6)
        .attr("x",-h/2)
        .attr("transform","rotate(-90)")
        .text(yTitle);
    svg.append("g").attr("class","x axis").attr("transform", "translate(0," + (h-margin)+")").call(xAxis);
    svg.append("g").attr("class","y axis").attr("transform", "translate(" + margin+",0)").call(yAxis);
}
