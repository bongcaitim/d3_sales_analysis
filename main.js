function createParallelPlot(column1, column2, column3) {
  var margin = { top: 90, right: 100, bottom: 60, left: 100 },
    width = 900,
    height = 700;

  var innerWidth = width - margin.left - margin.right;
  var innerHeight = height - margin.top - margin.bottom;

  var svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.csv("data/scatter_data.csv").then((data) => {
    var dimensions = [column1, column2, column3];

    var yScales = {};
    dimensions.forEach((dim) => {
      yScales[dim] = d3
        .scaleLinear()
        .domain(d3.extent(data, (d) => +d[dim]))
        .range([0, innerHeight]);
    });

    var xScale = d3.scalePoint().domain(dimensions).range([0, innerWidth]);

    function path(d) {
      return d3.line()(dimensions.map((p) => [xScale(p), yScales[p](+d[p])]));
    }
    defaultOpacity = 0.15;
    var lines = svg
      .selectAll("path")
      .data(data)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("stroke-width", 4)
      .style("fill", "none")
      .style("stroke", "#006989")
      .style("opacity", defaultOpacity);

    dimensions.forEach((dim) => {
      svg
        .append("g")
        .attr("transform", `translate(${xScale(dim)},0)`)
        .each(function () {
          d3.select(this).call(d3.axisLeft(yScales[dim]));
        })
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", innerHeight + 20)
        .text(dim);
    });

    var tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "#ffffe3")
      .style("padding", "8px")
      .style("border-radius", "4px");

    lines
      .on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible").html(`${d["Tên mặt hàng"]}
                      <br>${column1}: ${d[column1]}
                      <br>${column2}: ${d[column2]}
                      <br>${column3}: ${d[column3]}`);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 40 + "px");
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      })
      .on("click", function (event, d) {
        var clicked = d3.select(this);
        var isSelected = clicked.classed("selected");

        svg.selectAll(".item-label").remove();

        if (isSelected) {
          lines
              .style("opacity", defaultOpacity)
              .attr("stroke-width", 4)
              .classed("selected", false);
        } else {
          lines
              .style("opacity", defaultOpacity - 0.1)
              .attr("stroke-width", 4);
          clicked
              .style("opacity", 1)
              .attr("stroke-width", 4)
              .classed("selected", true);

          svg
            .append("text")
            .attr("class", "item-label")
            .attr("x", innerWidth + 5)
            .attr("y", yScales[column3](d[column3]))
            .text(d["Tên mặt hàng"])
            .call(wrap, margin.right - 10); 

  function wrap(text, width) {
    text.each(function () {
      var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        x = text.attr("x"),
        dy = 0,
        lineHeight = 12; //parseFloat(text.attr("dy")),
        tspan = text
          .text(null)
          .append("tspan")
          .attr("x", x)
          .attr("dy", dy + "px");
      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text
            .append("tspan")
            .attr("x", x)
            .attr("dy", ++lineHeight + "pt")
            .text(word);
        }
      }
    });
  }

        }
      });

    svg
      .append("text")
      .attr("class", "chart-title")
      .attr("x", -margin.left + 50)
      .attr("y", -20)
      .attr("text-anchor", "start")
      .text("Parallel Coordinates");
  });
}

createParallelPlot("Rank TL lời", "Rank tổng lợi nhuận", "Rank mức doanh thu");
d3.select("body").append("br");
/////////////////////////////////////////////
function createHeatMap() {
  const margin = { top: 90, right: 80, bottom: 40, left: 250 },
      width = 800,
      height = 1200;
  
  var  innerWidth = 800 - margin.left - margin.right,
    innerHeight = 1200 - margin.top - margin.bottom;

const svg = d3.select("body")
.append("svg")
.attr("width", width)
.attr("height", height)
.append("g")
.attr("transform", `translate(${margin.left},${margin.top})`);

d3.csv("data/heatmap.csv").then(data => {
  const yLabels = Array.from(new Set(data.map(d => d["Tên mặt hàng"])));
  const xLabels = Array.from(new Set(data.map(d => d["Mã PKKH"])));

  const xScale = d3.scaleBand()
      .range([0, innerWidth])
      .domain(xLabels)
      .padding(0.01);

  const yScale = d3.scaleBand()
      .range([0, innerHeight])
      .domain(yLabels)
      .padding(0.01);

  const colorScale = d3.scaleSequential()
      .interpolator(d3.interpolateBlues)
      .domain([0, 1]);

  var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "#ffffe3")
      .style("padding", "8px")
      .style("border-radius", "4px");

  svg.append("g")
      .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")")
      .call(d3.axisBottom(xScale))
      .selectAll("text");

  svg.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .attr("class", "y-tick-labels")
      .call(wrap, margin.left - 20);  

      
  svg.selectAll()
      .data(data, d => d["Mã PKKH"] + ':' + d["Mã mặt hàng"])
      .enter()
      .append("rect")
      .attr("x", d => xScale(d["Mã PKKH"]))
      .attr("y", d => yScale(d["Tên mặt hàng"]))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .style("fill", d => colorScale(d.percentage))
      .on("mouseover", (event, d) => {
          tooltip.style("visibility", "visible")
                 .html(`${d["Mã PKKH"]} - <strong>${d["Mô tả Phân Khúc Khách hàng"]}</strong>
                      <br>${d["Mã mặt hàng"]} - <strong>${d["Tên mặt hàng"]}</strong>
                      <br>Xác suất: ${(d.percentage*100).toFixed(0)}%`);
      })
      .on("mousemove", event => {
          tooltip.style("top", (event.pageY - 10) + "px")
                 .style("left", (event.pageX + 40) + "px");
      })
      .on("mouseout", () => {
          tooltip.style("visibility", "hidden");
      });
  svg.append("text")
  .attr("class", "chart-title")
  .attr("x", -margin.left + 50)
  .attr("y", -20)
  .attr("text-anchor", "start")
  .text("Heatmap - Xác suất mua mặt hàng của từng PKHH");

  function wrap(text, width) {
      text.each(function() {
          const text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                lineHeight = 1.1, // ems
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy"));
          let word,
              line = [],
              lineNumber = 0,
              tspan = text.text(null).append("tspan").attr("x", -10).attr("y", y).attr("dy", dy + "em");

          while (word = words.pop()) {
              line.push(word);
              tspan.text(line.join(" "));
              if (tspan.node().getComputedTextLength() > width) {
                  line.pop();
                  tspan.text(line.join(" "));
                  line = [word];
                  tspan = text.append("tspan").attr("x", -10).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
              }
          }
      });
  }
});

}

createHeatMap()
d3.select("body").append("br");

////////////////////////////////////////////////////

const new_descriptions = {
  A1: "Huấn luyện viên thể hình, giáo viên yoga, nghề liên quan đến vóc dáng",
  A2: "Người đi làm tại gia, nội trợ",
  A3: "Mẹ bỉm sữa",
  B1: "Nhân viên văn phòng, công việc tự do (Chưa kết hôn)",
  B2: "Học sinh, sinh viên",
  B3: "Cán bộ, nhân viên, quản lý, công việc tự do (Đã kết hôn)",
  C1: "CBCNV nhà nước, quản lý quan tâm sức khỏe tuổi trung niên",
  C2: "CBCNV nhà nước, quản lý quan tâm sản phẩm cho bệnh lý",
  C3: "Trưởng phòng, quản lý, cấp cao mua làm quà tặng, biếu gửi",
};

const width = 900;
const height = 700;
const margin = { top: 90, right: 80, bottom: 40, left: 250 }; // Increased top margin for title

var chartSvg = d3
    .select("body")
    .append("svg")
    .attr("class", "rev-by-segment")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("data/data.json").then(function (data) {
  const nestedData = d3.rollup(
    data,
    (v) => d3.sum(v, (d) => d["Thành tiền"]),
    (d) => d["Mã PKKH"]
  );

  let processedData = Array.from(nestedData, ([key, value]) => ({
    key,
    value,
    description: new_descriptions[key] || "No description available",
  }));

  processedData.sort((a, b) => d3.ascending(a.key, b.key));

  var x = d3
    .scaleLinear()
    .domain([0, d3.max(processedData, (d) => d.value)])
    .range([0, width - margin.left - margin.right]);

  var y = d3
    .scaleBand()
    .domain(processedData.map((d) => `${d.key} - ${d.description}`))
    .range([0, height - margin.top - margin.bottom])
    .padding(0.1);

  chartSvg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")");
  chartSvg.append("g").attr("class", "y-axis");

  chartSvg
    .call(d3.axisLeft(y))
    .selectAll("text")
    .attr("class", "y-tick-labels")
    .call(wrap, 200); 

  function wrap(text, width) {
    text.each(function () {
      var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        x = text.attr("x"),
        dy = -18,
        lineHeight = 12; //parseFloat(text.attr("dy")),
        tspan = text
          .text(null)
          .append("tspan")
          .attr("x", x)
          .attr("dy", dy + "px");
      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text
            .append("tspan")
            .attr("x", x)
            .attr("dy", ++lineHeight + "pt")
            .text(word);
        }
      }
    });
  }

  chartSvg
    .selectAll(".bar")
    .data(processedData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", 0)
    .attr("y", (d) => y(`${d.key} - ${d.description}`))
    .attr("width", (d) => x(d.value))
    .attr("height", y.bandwidth())
    .attr("fill", "#102C57");

  chartSvg
    .selectAll(".label")
    .data(processedData)
    .join("text")
    .attr("class", "label")
    .attr("x", (d) => x(d.value) + 10)
    .attr("y", (d) => y(`${d.key} - ${d.description}`) + y.bandwidth() / 2)
    .attr("text-anchor", "start")
    .style("font-size", "10px")
    .text((d) => `${(d.value / 1e6).toFixed(2)}M`);

  chartSvg.selectAll(".domain").remove();
  chartSvg.selectAll(".tick line").remove();

  chartSvg
    .append("text")
    .attr("class", "chart-title")
    .attr("x", - margin.left + 50)
    .attr("y", -20)
    .attr("text-anchor", "start")
    .text("Doanh thu theo phân khúc khách hàng");
});

///////////////////////////////////////
function update(dataType) {
    console.log("Update called with data type: " + dataType);
  }
  d3.select('body').append('br');
  
  d3.select("body")
    .append("button")
    .text("Nhóm hàng")
    .attr("onclick", "update('data1')");
  
  d3.select("body")
    .append("button")
    .text("Mặt hàng")
    .attr("onclick", "update('data2')");

  d3.select('body').append('br');
  
  // Load data from JSON file
  function loadData(callback) {
    d3.json("data/data.json").then(function (data) {
      callback(data);
    });
  }
  d3.select('body').append('br');
  var secondMargin = { top: 90, right: 80, bottom: 40, left: 250 },
    secondWidth = 900,
    secondHeight = 700;
  
  var secondSvg = d3
    .select("body")
    .append("svg")
    .attr("class", "rev-by-item")
    .attr("width", secondWidth)
    .attr("height", secondHeight)
    .append("g")
    .attr("transform", "translate(" + secondMargin.left + "," + secondMargin.top + ")");
  
  var x = d3.scaleLinear().range([0, secondWidth - secondMargin.left - secondMargin.right]);
  
  // Y axis
  var y = d3
    .scaleBand()
    .range([0, secondHeight - secondMargin.top - secondMargin.bottom])
    .padding(0.1);
  
  // X axis group
  secondSvg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + (secondHeight - secondMargin.top - secondMargin.bottom) + ")");
  
  // Y axis group
  secondSvg.append("g").attr("class", "y-axis");
  
  function update(variable) {
    loadData(function (data) {
      var sumData = d3.rollup(
        data,
        (v) => d3.sum(v, (d) => d["Thành tiền"]),
        (d) => d[variable === "data1" ? "Tên nhóm hàng" : "Tên mặt hàng"]
      );
  
      sumData = Array.from(sumData, ([key, value]) => ({ key, value }));
  
      // Sort sumData by value in descending order
      sumData.sort((a, b) => d3.descending(a.value, b.value));
  
      x.domain([0, d3.max(sumData, (d) => d.value)]);
      y.domain(sumData.map((d) => d.key));
  
      // Update x axis
      secondSvg
        .select(".x-axis")
        .call(d3.axisBottom(x))
        .selectAll("text") // Select all text elements of x-axis ticks
        .remove(); // Remove them
  
      // Update y axis
      secondSvg
        .select(".y-axis")
        .transition()
        .duration(1000)
        .call(d3.axisLeft(y));
  
      // Append data labels to bars
      secondSvg.selectAll(".data-label").remove();
      var uLabels = secondSvg.selectAll(".data-label").data(sumData);
  
      uLabels
        .enter()
        .append("text")
        .attr("class", "data-label")
        .merge(uLabels)
        .transition()
        .duration(1000)
        .attr("x", function (d) {
          return x(d.value) + 10;
        })
        .attr("y", function (d) {
          return y(d.key) + y.bandwidth() / 2;
        })
        .text(function (d) {
          return (d.value / 1000000).toFixed(1) + "M";
        });   
      secondSvg.selectAll(".domain").remove();
      secondSvg.selectAll(".tick line").remove();
  
      secondSvg.selectAll("rect").remove();
  
      var u = secondSvg.selectAll("rect").data(sumData);
  
      u.enter()
        .append("rect")
        .merge(u)
        .transition()
        .duration(1000)
        .attr("y", function (d) {
          return y(d.key);
        })
        .attr("height", y.bandwidth())
        .attr("x", 0)
        .attr("width", function (d) {
          return x(d.value);
        })
        .attr("fill", "#344955");

        secondSvg.selectAll(".chart-title").remove();
        secondSvg
          .append("text")
          .attr("class", "chart-title")
          .attr("x", -secondMargin.left + 50)
          .attr("y", -20)
          .attr("text-anchor", "start")
          .text("Doanh thu theo Nhóm hàng - Mặt hàng");
    });
  }
  
  update("data1");
  
//////////////
function createRevByMonthChart(container, dataFilePath) {
  var thirdMargin = { top: 90, right: 80, bottom: 40, left: 100 },
      thirdWidth = 900,
      thirdHeight = 400;

  var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "#ffffe3")
      .style("padding", "8px")
      .style("border-radius", "4px");

  d3.select('body').append('br');

  var thirdSvg = d3.select(container)
      .append("svg")
      .attr("class", "rev-by-month")
      .attr("width", thirdWidth)
      .attr("height", thirdHeight)
      .append("g")
      .attr("transform", "translate(" + thirdMargin.left + "," + thirdMargin.top + ")");

  var innerWidth = thirdWidth - thirdMargin.left - thirdMargin.right;
  var innerHeight = thirdHeight - thirdMargin.top - thirdMargin.bottom;

  // Y axis
  var y = d3.scaleLinear()
      .range([innerHeight, 0]);

  // X axis
  var x = d3.scaleBand()
      .range([0, innerWidth])
      .padding(0.1);

  var xAxis = d3.axisBottom(x);
  var yAxis = d3.axisLeft(y);

  thirdSvg.append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0," + innerHeight + ")")
      .call(xAxis);

  thirdSvg.append("g")
      .attr("class", "y-axis")
      .call(yAxis);

  d3.json(dataFilePath).then(function(data) {
      var sumData = Array.from(
          d3.rollup(
              data,
              (v) => d3.sum(v, (d) => d['Thành tiền']),
              (d) => d['Month']
          ),
          ([key, value]) => ({ Month: key, sum: value })
      );

      x.domain(sumData.map(d => d.Month));
      y.domain([0, d3.max(sumData, d => d.sum)]);


      
      const yAxis = d3.axisLeft(y).ticks(2);
          

      var line = d3.line()
          .x(d => x(d.Month) + x.bandwidth() / 2)
          .y(d => y(d.sum));

      thirdSvg.append("path")
          .datum(sumData)
          .attr("class", "line")
          .attr("d", line)
          .attr("stroke", "#102C57")
          .attr("stroke-width", 5)
          .style('fill', 'none');

      // Append circles at data points for tooltip interaction
      thirdSvg
          .selectAll(".dot")
          .data(sumData)
          .enter()
          .append("circle")
          .attr("class", "dot")
          .attr("cx", d => x(d.Month) + x.bandwidth() / 2)
          .attr("cy", d => y(d.sum))
          .attr("r", 6)
          .attr("fill", "steelblue")
          .style("opacity", 0.5)
          .on("mouseover", function(event, d) {
              tooltip.style("visibility", "visible")
                     .text(`Tháng: ${d.Month}, Doanh thu: ${(d.sum/1e6).toFixed(1)} triệu`);
          })
          .on("mousemove", function(event) {
              tooltip.style("top", (event.pageY - 10) + "px")
                     .style("left", (event.pageX + 30) + "px");
          })
          .on("mouseout", function() {
              tooltip.style("visibility", "hidden");
          });

      thirdSvg.append('text')
          .attr('class', 'chart-title')
          .attr("x", -thirdMargin.left + 50)
          .attr("y", -20)
          .attr("text-anchor", "start")
          .text("Doanh thu theo Tháng");
  });
}

createRevByMonthChart("body", "data/data.json");

///////////////
function createSmallMultiplesChart(dataFilePath, id, chartTitle, valueColumn) {
  d3.select("body").append("br");
  d3.select("body").append("p").attr("class", "chart-title").text(chartTitle);
  d3.select("body").append("br");
  d3.select("body").append("div").attr("class", "multiples").attr("id", id);

  var margin = { top: 80, right: 80, bottom: 40, left: 100 },
      width = 550,
      height = 230,
      innerWidth = width - margin.left - margin.right,
      innerHeight = height - margin.top - margin.bottom;

  var svgContainer = d3.select(`#${id}`)
      .style("display", "grid")
      .style("grid-template-columns", `repeat(3, minmax(${width}px, 1fr))`) 
      .style("grid-template-rows", `repeat(3, minmax(${height}px, 1fr))`)    
      .style("gap", "10px");

  var tooltip = d3.select(`#${id}`).append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "#ffffe3")
      .style("padding", "8px")
      .style("border-radius", "4px");

  d3.csv(dataFilePath).then(function(data) {
      var nestedData = d3.group(data, d => d['Mã PKKH']);

      var color = d3.scaleOrdinal(d3.schemeCategory10);

      nestedData.forEach((values, key, map) => {
          var segmentDescription = values[0]['Mô tả Phân Khúc Khách hàng'];
          
          var x = d3.scaleBand()
              .domain(values.map(d => d['Month']))
              .range([0, innerWidth])
              .padding(0.1);

          var y = d3.scaleLinear()
              .domain([0, d3.max(values, d => +d[valueColumn])])
              .range([innerHeight, 0]);

          var xAxis = d3.axisBottom(x);
          var yAxis = d3.axisLeft(y).ticks(2);

          var line = d3.line()
              .x(d => x(d['Month']) + x.bandwidth() / 2)
              .y(d => y(+d[valueColumn]));

          var svg = svgContainer.append("svg")
              .attr("width", width)
              .attr("height", height)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          svg.append("g")
              .attr("class", "x-axis")
              .attr("transform", "translate(0," + innerHeight + ")")
              .call(xAxis);

          svg.append("g")
              .attr("class", "y-axis")
              .call(yAxis);

          svg.append("path")
              .datum(values)
              .attr("class", "line")
              .attr("d", line)
              .attr("stroke", color(key))
              .attr("stroke-width", 3)
              .style('fill', 'none');

          svg.selectAll(".dot")
              .data(values)
              .enter()
              .append("circle")
              .attr("class", "dot")
              .attr("cx", d => x(d['Month']) + x.bandwidth() / 2)
              .attr("cy", d => y(+d[valueColumn]))
              .attr("r", 4)
              .attr("fill", color(key))
              .style("opacity", 0.3)
              .on("mouseover", function(event, d) {
                  if (valueColumn === 'Thành tiền') {
                      tooltip.style("visibility", "visible")
                            .html(`Tháng ${d['Month']} <br> ${d['Mã PKKH']} - ${d['Mô tả Phân Khúc Khách hàng']}<br>Doanh thu: <strong>${(+d[valueColumn]/1e6).toFixed(1)} triệu</strong>`);
                  } else {
                      tooltip.style("visibility", "visible")
                            .html(`Tháng ${d['Month']} <br> ${d['Mã PKKH']} - ${d['Mô tả Phân Khúc Khách hàng']}<br>Tỉ lệ rời bỏ: <strong>${d[valueColumn]}%</strong>`);
                  }
              })
              .on("mousemove", function(event) {
                  tooltip.style("top", (event.pageY - 10) + "px")
                        .style("left", (event.pageX + 50) + "px");
              })
              .on("mouseout", function() {
                  tooltip.style("visibility", "hidden");
              });


          svg.append('text')
              .attr('class', 'subplot-title')
              .attr("x", -margin.left + 30)
              .attr("y", -30)
              .attr("text-anchor", "start")
              .text(segmentDescription)
              .call(wrap, width - 100); 

              function wrap(text, width) {
                text.each(function () {
                  var text = d3.select(this),
                    words = text.text().split(/\s+/).reverse(),
                    word,
                    line = [],
                    x = text.attr("x"),
                    dy = -18,
                    lineHeight = 12; //parseFloat(text.attr("dy")),
                    tspan = text
                      .text(null)
                      .append("tspan")
                      .attr("x", x)
                      .attr("dy", dy + "px");
                  while ((word = words.pop())) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    if (tspan.node().getComputedTextLength() > width) {
                      line.pop();
                      tspan.text(line.join(" "));
                      line = [word];
                      tspan = text
                        .append("tspan")
                        .attr("x", x)
                        .attr("dy", ++lineHeight + "pt")
                        .text(word);
                    }
                  }
                });
              }
      });
  });
}

createSmallMultiplesChart(data = "data/monthly_segment_rev.csv", 
                      id = "monthly-seg-rev", 
                      chartTitle = 'Doanh thu theo tháng của từng Phân khúc khách hàng', 
                      valueColumn = 'Thành tiền');

createSmallMultiplesChart(data = "data/monthly_churning_rate.csv", 
                      id = "monthly-churn", 
                      chartTitle = 'Tỉ lệ rời bỏ hàng tháng', 
                      valueColumn = 'churning rate');

////////////////////////////
function createChartGrid() {
  d3.select("body").append("p").attr("class", "chart-title").text("Số đơn trung bình theo thời gian");
  d3.select("body").append("br");
  const dataFiles = [
      { file: "data/DayofMonth_Summary.csv", id: "day-of-month", title: "Day of Month Summary", valueColumn: "AvgOrders", keyColumn: "DayofMonth" },
      { file: "data/DayofWeek_Summary.csv", id: "day-of-week", title: "Day of Week Summary", valueColumn: "AvgOrders", keyColumn: "DayofWeek" },
      { file: "data/HourofDay_Summary.csv", id: "hour-of-day", title: "Hour of Day Summary", valueColumn: "AvgOrders", keyColumn: "HourofDay" }
  ];

  const gridContainer = d3.select("body").append("div").attr("class", "grid-container").attr("id", "orders-by-time");

  dataFiles.forEach((dataFile, index) => {
      createBarChart(dataFile.file, dataFile.id, dataFile.title, dataFile.valueColumn, dataFile.keyColumn, index);
  });

  d3.select(".grid-container")
      .style("display", "grid")
      .style("grid-template-columns", "repeat(2, 1fr)")
      .style("grid-template-rows", "repeat(2, auto)")
      .style("gap", "10px");
}

  function createBarChart(dataFilePath, id, chartTitle, valueColumn, keyColumn, index) {
      const margin = { top: 40, right: 20, bottom: 40, left: 50 },
          width = 800 - margin.left - margin.right,
          height = 300 - margin.top - margin.bottom;

      const chartContainer = d3.select(".grid-container").append("div")
          .attr("class", "chart-container")
          .attr("id", id);

      var tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("visibility", "hidden")
          .style("background", "#ffffe3")
          .style("padding", "8px")
          .style("border-radius", "4px");

      d3.csv(dataFilePath).then(data => {
          const svg = d3.select(`#${id}`).append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", `translate(${margin.left},${margin.top})`);

          const x = d3.scaleBand()
              .domain(data.map(d => d[keyColumn]))
              .range([width, 0])
              .padding(0.2);

          const y = d3.scaleLinear()
              .domain([0, d3.max(data, d => +d[valueColumn])])
              .nice()
              .range([height, 0]);

          svg.append("g")
              .attr("class", "x-axis")
              .attr("transform", `translate(0,${height})`)
              .call(d3.axisBottom(x));

          svg.append("g")
              .attr("class", "y-axis")
              .call(d3.axisLeft(y));

          svg.selectAll(".bar")
              .data(data)
              .enter().append("rect")
              .attr("class", "bar")
              .attr("x", d => x(d[keyColumn]))
              .attr("y", d => y(+d[valueColumn]))
              .attr("width", x.bandwidth())
              .attr("height", d => height - y(+d[valueColumn]))
              .style("fill", "#BED7DC")
              .on("mouseover", function(event, d) {
                  tooltip.style("visibility", "visible")
                      .html(`Trung bình <strong>${(+d[valueColumn]).toFixed(1)}</strong> đơn`);
              })
              
              .on("mousemove", function(event) {
                  tooltip.style("top", (event.pageY - 10) + "px")
                      .style("left", (event.pageX + 30) + "px");
              })
              .on("mouseout", function() {
                  tooltip.style("visibility", "hidden");
              });

          svg.append("text")
              .attr("class", "subplot-title")
              .attr("x", width / 2)
              .attr("y", -10)
              .attr("text-anchor", "middle")
              .text(chartTitle);
      });
}

createChartGrid();
//////////

function drillDownChart() {
  Promise.all([
      d3.csv("data/rev_by_group.csv"),
      d3.csv("data/rev_by_item.csv")
  ]).then(function(data) {
      const groupData = data[0];
      const itemData = data[1];

      const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
          .domain(groupData.map(d => d["Tên nhóm hàng"]));

      groupData.sort((a, b) => +a["Thành tiền"] - +b["Thành tiền"]);
      const groupNames = groupData.map(d => d["Tên nhóm hàng"]);

      const width = 900;
      const height = 700;
      const margin = { top: 90, right: 80, bottom: 40, left: 150 };

      const chartSvg = d3
          .select("body")
          .append("svg")
          .attr("class", "rev-by-item-drilldown")
          .attr("width", width)
          .attr("height", height)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      chartSvg.append('text')
          .attr('class', 'chart-title')
          .attr("x", -margin.left + 50)
          .attr("y", -20)
          .attr("text-anchor", "start")
          .text("Doanh thu theo Nhóm/Mặt hàng drill down");

      const x = d3.scaleLinear()
          .range([0, width - margin.left - margin.right]);

      const y = d3.scaleBand()
          .range([height - margin.top - margin.bottom, 0])
          .padding(0.1);

      createChart(groupData, groupNames, itemData, width, height, margin);

      function createChart(groupData, groupNames, itemData, width, height, margin) {
          chartSvg.selectAll(".x-axis").remove();
          chartSvg.selectAll(".y-axis").remove();
          chartSvg.selectAll(".bar").remove();

          
          x.domain([0, d3.max(groupData, d => +d["Thành tiền"])]);
          y.domain(groupNames);

          chartSvg.append("g")
              .attr("class", "x-axis")
              .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")")
              .call(d3.axisBottom(x).tickFormat(d => d / 1e6 + "M"));

          chartSvg.append("g")
              .attr("class", "y-axis")
              .call(d3.axisLeft(y))
              .selectAll("text")
              .attr("class", "y-tick-labels");

          const bars = chartSvg.selectAll(".bar").data(groupData);

          bars.enter()
              .append("rect")
              .attr("class", "bar")
              .attr("y", (d) => y(d["Tên nhóm hàng"]))
              .attr("height", y.bandwidth())
              .attr("width", (d) => x(+d["Thành tiền"]))
              .attr("fill", d => colorScale(d["Tên nhóm hàng"]))
              .on("click", function(event, d) {
                  console.log("d ten nhom hàg:", d["Tên nhóm hàng"]);
                  const filteredItems = itemData.filter(item => item["Tên nhóm hàng"] === d["Tên nhóm hàng"]);
                  console.log("filteredItems:", filteredItems);
                  updateChart(filteredItems, "Tên mặt hàng");
              });
      }

      function updateChart(data, keyColumn) {
          data.sort((a, b) => +a["Thành tiền"] - +b["Thành tiền"]);

          x.domain([0, d3.max(data, d => +d["Thành tiền"])]);
          y.domain(data.map(d => d[keyColumn]));

          chartSvg.select(".x-axis")
              .transition()
              .duration(500)
              .call(d3.axisBottom(x).tickFormat(d => d / 1e6 + "M"));

          chartSvg.select(".y-axis")
              .transition()
              .duration(500);
          chartSvg.select(".y-axis")
              .call(d3.axisLeft(y))
              .selectAll("text")
              .attr("class", "y-tick-labels")
              .call(wrap, 100);

          const bars = chartSvg.selectAll(".bar")
              .data(data, d => d[keyColumn]);

          bars.exit()
              .transition()
              .duration(300)
              .attr("width", 0)
              .remove();

          bars.enter()
              .append("rect")
              .attr("class", "bar")
              .attr("y", d => y(d[keyColumn]))
              .attr("height", y.bandwidth())
              .attr("fill", d => colorScale(d["Tên nhóm hàng"]))
              .transition()
              .duration(500)
              .attr("width", d => x(+d["Thành tiền"]))
              .attr("y", d => y(d[keyColumn]))
              .each(function(d) {
                  // chartSvg.selectAll(".bar").transition().duration(300).attr("width", 0);
                  this.addEventListener("click", function() {
                      
                      createChart(groupData, groupNames, itemData, width, height, margin);
                  });
              });
      }

      function wrap(text, width) {
          text.each(function() {
              var text = d3.select(this),
                  words = text.text().split(/\s+/).reverse(),
                  word,
                  line = [],
                  x = text.attr("x"),
                  dy = -18,
                  lineHeight = 12,
                  tspan = text
                      .text(null)
                      .append("tspan")
                      .attr("x", x)
                      .attr("dy", dy + "px");
              while ((word = words.pop())) {
                  line.push(word);
                  tspan.text(line.join(" "));
                  if (tspan.node().getComputedTextLength() > width) {
                      line.pop();
                      tspan.text(line.join(" "));
                      line = [word];
                      tspan = text
                          .append("tspan")
                          .attr("x", x)
                          .attr("dy", ++lineHeight + "pt")
                          .text(word);
                  }
              }
          });
      }

      createChart(groupData, groupNames, itemData, width, height, margin);
      d3.select("body").append("br").attr("class", "rev-by-item-drilldown");
  });
  
}
drillDownChart();
//////////////////////////////////////////////////////////////////////////////////////////
function plotHistogramWithKDE(dataFilePath, valueColumn) {
  var margin = { top: 90, right: 80, bottom: 40, left: 100 },
      width = 900,
      height = 400;

  d3.select('body').append('br');

  var chartSvg = d3.select("body")
      .append("svg")
      .attr("class", "histogram-kde")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var innerWidth = width - margin.left - margin.right;
  var innerHeight = height - margin.top - margin.bottom;

  d3.csv(dataFilePath).then(function(data) {
      var values = data.map(d => +d[valueColumn]);

      var xDomain = d3.extent(values);
      var x = d3.scaleLinear()
          .domain(xDomain)
          .range([0, innerWidth]);

      // Create histogram data
      var histogram = d3.histogram()
          .domain(x.domain())
          .thresholds(x.ticks(30));
      var bins = histogram(values);

      // Calculate y-domain for histogram
      var yMax = d3.max(bins, d => d.length);
      var y = d3.scaleLinear()
          .domain([0, yMax])
          .range([innerHeight, 0]);

      // Append x-axis
      chartSvg.append("g")
          .attr("class", "x-axis")
          .attr("transform", "translate(0," + innerHeight + ")")
          .call(d3.axisBottom(x).tickFormat(d => d / 1e6 + "M"));

      // Append y-axis
      chartSvg.append("g")
          .attr("class", "y-axis")
          .call(d3.axisLeft(y).ticks(2));

      // Draw histogram bars
      chartSvg.selectAll("rect")
          .data(bins)
          .enter()
          .append("rect")
          .attr("x", 1)
          .attr("transform", d => "translate(" + x(d.x0) + "," + y(d.length) + ")")
          .attr("width", d => x(d.x1) - x(d.x0) - 1)
          .attr("height", d => innerHeight - y(d.length))
          .style("fill", "salmon")
          .style("opacity", 0.5);

      // KDE calculation
      var kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(40));
      var density = kde(values);

      // Scale density to fit the histogram height
      var scaleFactor = yMax / d3.max(density, d => d[1]);
      var scaledDensity = density.map(d => [d[0], d[1] * scaleFactor]);

      // Draw KDE curve
      chartSvg.append("path")
          .datum(scaledDensity)
          .attr("class", "line")
          .attr("fill", "none")
          .attr("stroke", "#ff7029")
          .attr("stroke-width", 1.5)
          .attr("stroke-linejoin", "round")
          .attr("d", d3.line()
              .curve(d3.curveBasis)
              .x(d => x(d[0]))
              .y(d => y(d[1]))
          );

      chartSvg
          .append("text")
          .attr("class", "chart-title")
          .attr("x", - margin.left + 50)
          .attr("y", -20)
          .attr("text-anchor", "start")
          .text('Phân phối số tiền khách hàng đã chi trả');

  });

  // Function to compute density
  function kernelDensityEstimator(kernel, X) {
      return function(V) {
          return X.map(function(x) {
              return [x, d3.mean(V, function(v) { return kernel(x - v); })];
          });
      };
  }

  function kernelEpanechnikov(k) {
      return function(v) {
          return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
      };
  }
  d3.select("body").append("br").attr("class", "histogram-kde");
}

plotHistogramWithKDE("data/total_spent.csv", 'Thành tiền');
///////////////////////////////////////////////////////
function boxPlotWithPoints(points, id) {
    const new_descriptions = {
        A1: "Huấn luyện viên thể hình, giáo viên yoga, nghề liên quan đến vóc dáng",
        A2: "Người đi làm tại gia, nội trợ",
        A3: "Mẹ bỉm sữa",
        B1: "Nhân viên văn phòng, công việc tự do (Chưa kết hôn)",
        B2: "Học sinh, sinh viên",
        B3: "Cán bộ, nhân viên, quản lý, công việc tự do (Đã kết hôn)",
        C1: "CBCNV nhà nước, quản lý quan tâm sức khỏe tuổi trung niên",
        C2: "CBCNV nhà nước, quản lý quan tâm sản phẩm cho bệnh lý",
        C3: "Trưởng phòng, quản lý, cấp cao mua làm quà tặng, biếu gửi",
      };
    d3.csv("data/total_spent.csv").then(function(data) {  
        data.map(d => +d["Thành tiền"]);
    
        var data = Array.from(d3.group(data, d => d["Mã PKKH"]));
          
        var margin = { top: 90, right: 80, bottom: 40, left: 100 },
            width = 800,
            height = 700;
        var innerHeight = height - margin.top - margin.bottom;
        var innerWidth = width - margin.right - margin.left;
        
        // d3.select("body").append("br").attr("class", `${id}`);

        var tooltip = d3.select("body").append("div")
        .attr("class", `tooltip-${id}`)
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "#ffffe3")
        .style("padding", "8px")
        .style("border-radius", "4px");

        var svg = d3.select("body")
            .append("svg")
            .attr("id", id)
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            ;
        
        svg.append("text")
            .attr("x", -margin.left + 50)
            .attr("y", -20)
            .attr("text-anchor", "start")
            .text("Phân bổ mức chi tiêu")
            .attr("class", "chart-title");
    
        xDomain = data.map(d => d[0]);
    
        var x = d3.scaleBand()
            .range([0, innerWidth])
            .domain(xDomain)
            .padding(0.1)
      
        svg.append("g")
            .attr("transform", "translate(0," + innerHeight + ")")
            .call(d3.axisBottom(x));
      
        var allValues = data.flatMap(d => d[1].map(v => +v["Thành tiền"]));
        console.log("allvalues", d3.max(allValues));
        var y = d3.scaleLinear()
            .domain(d3.extent(allValues))
            .range([innerHeight, 0]);
      
        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y).tickFormat(d => d/1e6 + "M"));
      
        var boxWidth = 50;
      
        data.forEach(function(d) {
          var key = d[0];
          var values = d[1].map(v => v["Thành tiền"]);
      
          var q1 = d3.quantile(values, .25);
          var median = d3.quantile(values, .5);
          var q3 = d3.quantile(values, .75);
          var interQuantileRange = q3 - q1;
          var min = q1 - 1.5 * interQuantileRange;
          var max = q3 + 1.5 * interQuantileRange;
        
        //Thêm trục dọc chính
          svg.append("line")
              .attr("x1", x(key) + x.bandwidth() / 2)
              .attr("x2", x(key) + x.bandwidth() / 2)
              .attr("y1", y(min))
              .attr("y2", y(max))
              .attr("stroke", "black")
              .style("width", 40);
      
          svg.append("rect")
              .attr("x", x(key) - boxWidth / 2 + x.bandwidth() / 2)
              .attr("y", y(q3))
              .attr("height", y(q1) - y(q3))
              .attr("width", boxWidth)
              .attr("stroke", "black")
              .style("fill", "#CAE6B2")
              .on("mouseover", function(event, d) {
                tooltip.style("visibility", "visible")
                        .html(`${key} - <strong>${new_descriptions[key]}</strong>
                        <br>75% KH có mức chi tiêu dưới ${(q3/1e6).toFixed(1)} triệu
                        <br>Trung vị mức chi tiêu: ${(median/1e6).toFixed(1)} triệu
                        <br>25% KH có mức chi tiêu dưới ${(q1/1e6).toFixed(1)} triệu` )
              })
              .on("mousemove", function(event) {
                tooltip.style("top", (event.pageY - 10) + "px")
                       .style("left", (event.pageX + 30) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("visibility", "hidden");
            });
            
        //Thêm đường median
          svg.append("line")
              .attr("x1", x(key) - boxWidth / 2 + x.bandwidth() / 2)
              .attr("x2", x(key) + boxWidth / 2 + x.bandwidth() / 2)
              .attr("y1", y(median))
              .attr("y2", y(median))
              .attr("stroke", "#373A40")
              .style("width", 80);
          
          if (points===true) {
            svg.selectAll("indPoints")
              .data(values)
              .enter().append("circle")
              .attr("cx", function(d) { return x(key) + x.bandwidth()/2 + - boxWidth/2 + Math.random()*boxWidth; }) // Adding jitter
              .attr("cy", function(d) { return y(d); })
              .attr("r", 3)
              .style("fill", "#FEB941")
              .style("opacity", 0.2).on("mouseover", function(event, d) {
                tooltip.style("visibility", "visible")
                        .html(`${key} - <strong>${new_descriptions[key]}</strong>
                        <br>75% KH có mức chi tiêu dưới ${(q3/1e6).toFixed(1)} triệu
                        <br>Trung vị mức chi tiêu: ${(median/1e6).toFixed(1)} triệu
                        <br>25% KH có mức chi tiêu dưới ${(q1/1e6).toFixed(1)} triệu` )
              })
              .on("mousemove", function(event) {
                tooltip.style("top", (event.pageY - 10) + "px")
                       .style("left", (event.pageX + 30) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("visibility", "hidden");
            });
            console.log("x band with/2",  x.bandwidth()/2 );
          }
          
        });
      });
}
boxPlotWithPoints(points=false, id = "group-boxplot-points");
boxPlotWithPoints(points=true, id = "group-boxplot");
/////////////////////////
function violinChart(id) {
    d3.csv("data/total_spent.csv").then(function(data) {
        data.forEach(d => d["Thành tiền"] = +d["Thành tiền"]);

        var margin = { top: 90, right: 80, bottom: 40, left: 100 },
            width = 1655,
            height = 400;
        var innerHeight = height - margin.top - margin.bottom;
        var innerWidth = width - margin.right - margin.left;
            
        var svg = d3.select("body")
            .append("svg")
            .attr("id", id)
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        yDomain = d3.extent(data, d => d["Thành tiền"]);
        var y = d3.scaleLinear()
            .domain(yDomain)
            .range([innerHeight, 0]);

        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y).tickFormat(d => d/1e6 + "M"));

        console.log("array from new", Array.from(new Set(data.map(d => d["Mã PKKH"]))));

        var xDomain = Array.from(new Set(data.map(d => d["Mã PKKH"])));
        var x = d3.scaleBand()
            .range([0, innerWidth])
            .domain(xDomain)
            .padding(0.005);

        svg.append("g")
            .attr("transform", "translate(0," + innerHeight + ")")
            .call(d3.axisBottom(x));

        function kernelDensityEstimator(kernel, X) {
            return function(V) {
                return X.map(function(x) {
                    return [x, d3.mean(V, function(v) { return kernel(x - v); })];
                });
            };
        }

        function kernelEpanechnikov(k) {
            return function(v) {
                return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
            };
        }

        var kde = kernelDensityEstimator(kernelEpanechnikov(.2), y.ticks(50));

        var groupedData = d3.group(data, d => d["Mã PKKH"]);
        var maxDensity = 0;
        var densityData = Array.from(groupedData, ([key, values]) => {
            var density = kde(values.map(v => v["Thành tiền"]));
            var maxD = d3.max(density, d => d[1]);
            if (maxD > maxDensity) maxDensity = maxD;
            return {key: key, density: density};
        });

        var xNum = d3.scaleLinear()
            .range([0, x.bandwidth()])
            .domain([-maxDensity, maxDensity]);

        svg.selectAll("myViolin")
            .data(densityData)
            .enter()
            .append("g")
            .attr("transform", d => "translate(" + x(d.key) + " ,0)")
            .append("path")
            .datum(d => d.density)
            .style("stroke", "none")
            .style("fill", "#69b3a2")
            .attr("d", d3.area()
                .x0(d => xNum(-d[1]))
                .x1(d => xNum(d[1]))
                .y(d => y(d[0]))
                .curve(d3.curveCatmullRom) 
            );
    svg.append("text")
            .attr("x", -margin.left + 50)
            .attr("y", -20)
            .attr("text-anchor", "start")
            .text("Biểu đồ violin Phân bổ mức chi tiêu")
            .attr("class", "chart-title");
    });
}

violinChart("violinPlot1");
//////////////////////
function stackedArea () {
    var margin = { top: 90, right: 80, bottom: 40, left: 100 },
width = 900,
height = 700;

var innerWidth = width - margin.left - margin.right;
var innerHeight = height - margin.top - margin.bottom;

var svg = d3.select("body")
    .append("svg")
    .attr("width", width) 
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data/monthly_segment_rev.csv").then(function(data) {
    
    data.sort((a, b) => d3.ascending(a["Mã PKKH"], b["Mã PKKH"]));
    const stackedData = d3.stack()
    .keys(d3.union(data.map(d => d["Mã PKKH"]))) // apples, bananas, cherries, …
    .value(([, group], key) => group.get(key)["Thành tiền"])
  (d3.index(data, d => d["Month"], d => d["Mã PKKH"]));

    var xDomain = Array.from(new Set(data.map(d => d["Month"])))
    console.log("xDomain", xDomain);
    var x = d3.scaleBand()
        .domain(xDomain)
        .range([0, innerWidth])
        .padding(0.1);
    svg.append("g")
        .attr("transform", "translate(" + (0 - x.bandwidth()/2) + "," + innerHeight + ")")
        .call(d3.axisBottom(x));
    

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, d3.max(stackedData, d => d3.max(d, d => d[1])) * 1.2])
        .range([innerHeight, 0]);

    svg.append("g")
        .call(d3.axisLeft(y)
        .tickFormat(d => d / 1e9 + "B")
        .tickValues(y.ticks(6).filter(tick => tick !== 0)));
    

    // Color palette
    var color = d3.scaleOrdinal()
        .domain(stackedData.map(d => d.key))
        .range(d3.schemeTableau10);

    // Show the areas
    svg.selectAll("mylayers")
        .data(stackedData)
        .enter()
        .append("path")
        .style("fill", d => color(d.key))
        .attr("d", d3.area()
            .x((_, j) => x(xDomain[j])) // Use xDomain to map index to the respective month
            .y0(d => y(d[0]))
            .y1(d => y(d[1]))
        );

var sortedKeys = stackedData.map(d => d.key).sort();

var legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + innerWidth + "," + 0 + ")");

var legendItems = legend.selectAll(".legend-item")
    .data(sortedKeys) // Use sorted keys
    .enter().append("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => "translate(0," + i * 20 + ")");


    legendItems.append("rect")
        .attr("x", 0)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", d => color(d));

    // Append text labels to the legend items
    legendItems.append("text")
        .attr("x", 20)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(d => d);
    svg
    .append("text")
    .attr("class", "chart-title")
    .attr("x", - margin.left + 50)
    .attr("y", -20)
    .attr("text-anchor", "start")
    .text("Doanh thu hàng tháng theo phân khúc khách hàng");
    
});

}

stackedArea ()
////////////////////////////////////////////////////////////
function createLollipopPlot() {
    const new_descriptions = {
      A1: "Huấn luyện viên thể hình, giáo viên yoga, nghề liên quan đến vóc dáng",
      A2: "Người đi làm tại gia, nội trợ",
      A3: "Mẹ bỉm sữa",
      B1: "Nhân viên văn phòng, công việc tự do (Chưa kết hôn)",
      B2: "Học sinh, sinh viên",
      B3: "Cán bộ, nhân viên, quản lý, công việc tự do (Đã kết hôn)",
      C1: "CBCNV nhà nước, quản lý quan tâm sức khỏe tuổi trung niên",
      C2: "CBCNV nhà nước, quản lý quan tâm sản phẩm cho bệnh lý",
      C3: "Trưởng phòng, quản lý, cấp cao mua làm quà tặng, biếu gửi",
    };
  
    const width = 900;
    const height = 700;
    const margin = { top: 90, right: 80, bottom: 40, left: 250 };
  
    var chartSvg = d3
      .select("body")
      .append("svg")
      .attr("id", "lollipop-chart")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "#ffffe3")
      .style("padding", "8px")
      .style("border-radius", "4px");
  
    d3.json("data/data.json").then(function (data) {
      const nestedData = d3.rollup(
        data,
        (v) => d3.sum(v, (d) => d["Thành tiền"]),
        (d) => d["Mã PKKH"]
      );
  
      let processedData = Array.from(nestedData, ([key, value]) => ({
        key,
        value,
        description: new_descriptions[key] || "No description available",
      }));
  
      processedData.sort((a, b) => d3.ascending(a.key, b.key));
  
      var x = d3
        .scaleLinear()
        .domain([0, d3.max(processedData, (d) => d.value)])
        .range([0, width - margin.left - margin.right]);
  
      var y = d3
        .scaleBand()
        .domain(processedData.map((d) => `${d.key} - ${d.description}`))
        .range([0, height - margin.top - margin.bottom])
        .padding(0.1);
  
      chartSvg
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")");
      chartSvg.append("g").attr("class", "y-axis");
  
      chartSvg
        .call(d3.axisLeft(y))
        .selectAll("text")
        .attr("class", "y-tick-labels")
        .call(wrap, 200);
  
      function wrap(text, width) {
        text.each(function () {
          var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            x = text.attr("x"),
            dy = -18,
            lineHeight = 12;
          var tspan = text
            .text(null)
            .append("tspan")
            .attr("x", x)
            .attr("dy", dy + "px");
          while ((word = words.pop())) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
              line.pop();
              tspan.text(line.join(" "));
              line = [word];
              tspan = text
                .append("tspan")
                .attr("x", x)
                .attr("dy", ++lineHeight + "pt")
                .text(word);
            }
          }
        });
      }
  
      chartSvg.selectAll(".line")
        .data(processedData)
        .enter()
        .append("line")
        .attr("class", "line")
        .attr("x1", x(0))
        .attr("x2", d => x(d.value))
        .attr("y1", d => y(`${d.key} - ${d.description}`) + y.bandwidth() / 2)
        .attr("y2", d => y(`${d.key} - ${d.description}`) + y.bandwidth() / 2)
        .attr("stroke", "gray");
  
      chartSvg.selectAll(".dot")
        .data(processedData)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.value))
        .attr("cy", d => y(`${d.key} - ${d.description}`) + y.bandwidth() / 2)
        .attr("r", 5)
        .attr("fill", "#102C57")
        .on("mouseover", function (event, d) {
          tooltip
            .style("visibility", "visible")
            .html(`<strong>${d.key}</strong><br>${d.description}<br>Doanh thu: <strong>${(d.value/1e6).toFixed(1)} M</strong>`);
        })
        .on("mousemove", function (event) {
          tooltip
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function () {
          tooltip.style("visibility", "hidden");
        });
  
      chartSvg.append("text")
        .attr("class", "chart-title")
        .attr("x", -margin.left + 50)
        .attr("y", -20)
        .attr("text-anchor", "start")
        .text("Lollipop chart - Doanh thu theo phân khúc khách hàng");
    });
  }
  
  createLollipopPlot();
////////////////////////////////////////////////////////////////
function createChart(isDonut = false, chartId) {
  const new_descriptions = {
    A1: "Huấn luyện viên thể hình, giáo viên yoga, nghề liên quan đến vóc dáng",
    A2: "Người đi làm tại gia, nội trợ",
    A3: "Mẹ bỉm sữa",
    B1: "Nhân viên văn phòng, công việc tự do (Chưa kết hôn)",
    B2: "Học sinh, sinh viên",
    B3: "Cán bộ, nhân viên, quản lý, công việc tự do (Đã kết hôn)",
    C1: "CBCNV nhà nước, quản lý quan tâm sức khỏe tuổi trung niên",
    C2: "CBCNV nhà nước, quản lý quan tâm sản phẩm cho bệnh lý",
    C3: "Trưởng phòng, quản lý, cấp cao mua làm quà tặng, biếu gửi",
  };

  var margin = { top: 90, right: 80, bottom: 40, left: 100 },
      width = 900,
      height = 700;

  var innerWidth = width - margin.left - margin.right;
  var innerHeight = height - margin.top - margin.bottom;

  var radius = 170;
  const color = d3.scaleOrdinal(d3.schemeTableau10);

  // Remove existing SVG to prevent overlap
  d3.select(`#${chartId}`).select("svg").remove();

  var chartSvg = d3
    .select(`#${chartId}`)
    .append("svg")
    .attr("id", "chart")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + (width / 2 - margin.right - 150) + "," + height / 2 + ")");

  var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "#ffffe3")
    .style("padding", "8px")
    .style("border-radius", "4px");

  d3.json("data/data.json").then(function (data) {
    const nestedData = d3.rollup(
      data,
      (v) => d3.sum(v, (d) => d["Thành tiền"]),
      (d) => d["Mã PKKH"]
    );

    let processedData = Array.from(nestedData, ([key, value]) => ({
      key,
      value,
      description: new_descriptions[key]
    }));

    processedData.sort((a, b) => d3.descending(a.value, b.value));

    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);

    const data_ready = pie(processedData);

    chartSvg.selectAll('path')
      .data(data_ready)
      .enter()
      .append('path')
      .attr('d', d3.arc()
        .innerRadius(isDonut ? radius / 2 : 0) // Set innerRadius based on isDonut parameter
        .outerRadius(radius))
      .attr('fill', d => color(d.data.key))
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .on("mouseover", function (event, d) {
        tooltip
          .style("visibility", "visible")
          .html(`<strong>${d.data.key}</strong><br>${d.data.description}<br>Doanh thu: <strong>${(d.data.value / 1e6).toFixed(1)} M</strong>`);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 20) + "px");
      })
      .on("mouseout", function () {
        tooltip.style("visibility", "hidden");
      });

    var legend = d3.select(`#${chartId} svg`).append("g")
      .attr("class", "legend")
      .attr("transform", "translate(" + (width - margin.right - margin.left) + "," + margin.top + ")");

    var legendItems = legend.selectAll(".legend-item")
      .data(processedData)
      .enter().append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => "translate(" + (-margin.right - 200) + "," + (height/4 + i * 20) + ")");

    legendItems.append("rect")
      .attr("x", 0)
      .attr("width", 10)
      .attr("height", 10)
      .style("fill", d => color(d.key));

    legendItems.append("text")
      .attr("x", 20)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .text(d => `${d.key} - ${d.description}`);

    chartSvg.append("text")
      .attr("class", "chart-title")
      .attr("x", margin.right)
      .attr("y", -height / 2 + 20 + margin.top / 2)
      .attr("text-anchor", "middle")
      .text("Doanh thu theo phân khúc khách hàng");
  });
}

// Create two containers for the charts
d3.select("body").append("div").attr("id", "chartContainer1");
d3.select("body").append("div").attr("id", "chartContainer2");

// Create the two charts in separate containers
createChart(true, "chartContainer1");
createChart(false, "chartContainer2");


///////////////////////////////////////////////////////////////
function createScatterPlot(xColumn, yColumn) {
  var margin = { top: 90, right: 80, bottom: 60, left: 100 },
  width = 900,
  height = 350;

var innerWidth = width - margin.left - margin.right;
var innerHeight = height - margin.top - margin.bottom;

var svg = d3.select("body")
.append("svg")
.attr("width", width)
.attr("height", height)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data/scatter_data.csv").then((data) => {
  var xScale = d3
    .scaleLinear()
    .domain([
      d3.min(data, (d) => +d[xColumn]),
      d3.max(data, (d) => +d[xColumn]),
    ])
    .range([0, innerWidth]);

  var yScale = d3
    .scaleLinear()
    .domain([
      d3.min(data, (d) => +d[yColumn]),
      d3.max(data, (d) => +d[yColumn]),
    ])
    .range([innerHeight, 0]);

  var tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "#ffffe3")
    .style("padding", "8px")
    .style("border-radius", "4px");

  svg
    .append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(xScale));

  svg.append("g").call(d3.axisLeft(yScale));

  svg
    .append("text")
    .attr("transform", `translate(${innerWidth / 2}, ${innerHeight  + margin.bottom/1.5})`)
    .style("text-anchor", "middle")
    .text(xColumn);

  svg
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left / 1.5)
  .attr("x", 0 - (innerHeight / 2))
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .text(yColumn);

  svg.append("text")
    .attr("class", "chart-title")
    .attr("x", -margin.left + 50)
    .attr("y", -20)
    .attr("text-anchor", "start")
    .text(`${xColumn} - ${yColumn}`);

  svg
    .selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("r", 5)
    .attr("cx", (d) => xScale(+d[xColumn]))
    .attr("cy", (d) => yScale(+d[yColumn]))
    .style("fill", "#69b3a2")
    .on("mouseover", (event, d) => {
      tooltip
        .style("visibility", "visible")
        .html(
          `${d["Tên mặt hàng"]}
          <br>${xColumn}: ${d[xColumn]}
          <br>${yColumn}: ${d[yColumn]}`
        );
    })
    .on("mousemove", (event) => {
      tooltip
        .style("top", event.pageY - 10 + "px")
        .style("left", event.pageX + 40 + "px");
    })
    .on("mouseout", () => {
      tooltip.style("visibility", "hidden");
    });


});
}

createScatterPlot("Rank tiền lời", "Rank mức SL bán");
createScatterPlot("Rank tổng lợi nhuận", "Rank mức SL bán");
createScatterPlot("Rank mức rẻ", "Rank mức doanh thu");
/////////////////////////////////////////////////////////////////////////////

function createTreeMap() {
  var margin = { top: 90, right: 50, bottom: 60, left: 50 },
    width = 900,
    height = 700;

  var innerWidth = width - margin.left - margin.right;
  var innerHeight = height - margin.top - margin.bottom;

  var svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.csv("data/rfm.csv").then((data) => {
    data.forEach((d) => {
      d.count_share = +d.count_share;
    });

    // Create hierarchy
    var root = d3
      .stratify()
      .id((d) => d.label)
      .parentId((d) => d.parent)(data);

    var treemap = d3.treemap().size([innerWidth, innerHeight]);

    treemap(root.sum((d) => d.count_share));

    var colorScale = d3.scaleOrdinal(d3.schemeDark2);

    var tile = svg
      .selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("transform", (d) => "translate(" + d.x0 + "," + d.y0 + ")");

    tile
      .append("rect")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .style("fill", (d) => colorScale(d.data.label))
      .style("stroke", "white");

    function wrap(text, width) {
      text.each(function () {
        var text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          x = text.attr("x"),
          dy = 0,
          lineHeight = 12; 
          tspan = text
            .text(null)
            .append("tspan")
            .attr("x", x)
            .attr("dy", dy + "px");
        while ((word = words.pop())) {
          line.push(word);
          tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text
              .append("tspan")
              .attr("x", x)
              .attr("dy", ++lineHeight + "pt")
              .text(word);
          }
        }
      });
    }

    tile
    .append("text")
    .attr("x", 4)
    .attr("y", 13)
    .text(
        (d) => d.data.label + " - " + Math.round(d.data.count_share * 100) + "%"
    )
    .call(function (text) {
        text.each(function(d) {
            var tileWidth = d.x1 - d.x0;
            wrap(d3.select(this), tileWidth);
            console.log("Wrap Width:", tileWidth);
        });
    })
    .style("fill", "white");


    svg
      .append("text")
      .attr("class", "chart-title")
      .attr("x", -margin.left + 50)
      .attr("y", -20)
      .attr("text-anchor", "start")
      .text("RFM Segmentation");
  });
}

createTreeMap();
