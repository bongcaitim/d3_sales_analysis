// Set the dimensions and margins of the graph
var margin = { top: 60, right: 230, bottom: 50, left: 50 },
    width = 660 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// Append the SVG object to the body of the page
var svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Load the data
d3.csv("data/monthly_segment_rev.csv").then(function (data) {

    // Sort data by month
    data.sort(function (a, b) {
        return a.Month - b.Month;
    });

    // List of groups - Mã PKKH
    var keys = [...new Set(data.map(d => d['Mã PKKH']))];

    // Color palette
    var color = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemeCategory10);

    // Stack the data
    var stackedData = d3.stack()
        .keys(keys)
        .value(function (d, key) { return +d['Thành tiền']; }) // Specify 'Thành tiền' as the value column
        (data);

    // X scale
    var x = d3.scaleLinear()
        .domain(d3.extent(data, function (d) { return d.Month; }))
        .range([0, width]);

    // X axis
    var xAxis = svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    // X axis label
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + 40)
        .text("Month");

    // Y scale
    var y = d3.scaleLinear()
        .domain([0, d3.max(stackedData, function (d) { return d3.max(d, function (d) { return d[1]; }); })])
        .nice()
        .range([height, 0]);

    // Y axis
    var yAxis = svg.append("g")
        .call(d3.axisLeft(y));

    // Y axis label
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", 0)
        .attr("y", -20)
        .text("Revenue")
        .attr("text-anchor", "start");

    // Area generator
    var area = d3.area()
        .x(function (d) { return x(d.data.Month); })
        .y0(function (d) { return y(d[0]); })
        .y1(function (d) { return y(d[1]); });

    // Show the areas
    svg.selectAll(".area")
        .data(stackedData)
        .enter().append("path")
        .attr("class", "area")
        .style("fill", function (d) { return color(d.key); })
        .attr("d", area);

    // Add a clipPath: everything out of this area won't be drawn.
    var clip = svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width)
        .attr("height", height)
        .attr("x", 0)
        .attr("y", 0);

    // Add brushing
    var brush = d3.brushX()
        .extent([[0, 0], [width, height]])
        .on("end", updateChart);

    // Create the scatter variable: where both the circles and the brush take place
    var areaChart = svg.append('g')
        .attr("clip-path", "url(#clip)");

    // Add the brushing
    areaChart
        .append("g")
        .attr("class", "brush")
        .call(brush);

    var idleTimeout;
    function idled() { idleTimeout = null; }

    // A function that update the chart for given boundaries
    function updateChart() {
        extent = d3.event.selection;

        // If no selection, back to initial coordinate. Otherwise, update X axis domain
        if (!extent) {
            if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
            x.domain(d3.extent(data, function (d) { return d.Month; }));
        } else {
            x.domain([x.invert(extent[0]), x.invert(extent[1])]);
            areaChart.select(".brush").call(brush.move, null); // This remove the grey brush area as soon as the selection has been done
        }

        // Update axis and area position
        xAxis.transition().duration(1000).call(d3.axisBottom(x).tickFormat(d3.format("d")));
        areaChart
            .selectAll(".area")
            .transition().duration(1000)
            .attr("d", area);
    }

    // What to do when one group is hovered
    var highlight = function (d) {
        // reduce opacity of all groups
        d3.selectAll(".area").style("opacity", .1);
        // expect the one that is hovered
        d3.select("." + d).style("opacity", 1);
    };

    // And when it is not hovered anymore
    var noHighlight = function (d) {
        d3.selectAll(".area").style("opacity", 1);
    };

    // Legend
    var legend = svg.selectAll(".legend")
        .data(keys)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color)
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function (d) { return d; })
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight);
});
