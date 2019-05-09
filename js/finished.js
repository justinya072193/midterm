'use strict';
/*
1. make a filterByYear function

*/

(function() {

  let data = "no data";
  let seasonData = "no data";
  let svgScatterPlot = ""; // keep SVG reference in global scope

  // load data and make scatter plot after window loads
  window.onload = function() {
    svgScatterPlot = d3.select('body')
      .append('svg')
      .attr('width', 500)
      .attr('height', 500);
    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("./data/data.csv")
      .then((csvData) => {
        data = csvData
        seasonData = csvData;
        makeScatterPlot(data);
      });

  }

  // make scatter plot with trend line
  function makeScatterPlot(data) {

    let viewer_data = data.map((row) => parseFloat(row["AverageViewer"]));
    let year_data = data.map((row) => parseInt(row["year"]));

    let axesLimits = findMinMax(year_data, viewer_data);
    // draw axes and return scaling + mapping functions
    let mapFunctions = drawAxes(axesLimits, "year", "AverageViewer", svgScatterPlot, {min: 50, max: 450}, {min: 50, max: 450});


    let listOfHeight = [400, 345, 303, 312, 
      256, 203, 195, 185, 
      214, 209, 195, 202, 
      154, 183, 129, 115, 105, 99, 
      86, 66, 66, 66, 51, 38, 32]


    var barHeight = []

    // plot data as points and add tooltip functionality
    plotData(mapFunctions, listOfHeight);
    drawAvgLine(viewer_data)
    // draw title and axes labels
    makeLabels();
  }

  function drawAvgLine() {
    let sumData = data.map((row) => parseFloat(row["AverageViewer"]));
    var sum = 0;
    for(let i = 0; i < 25; i++){
      sum += sumData[i]
    }

    let length = sumData.length 
  
    var average = (sum/length).toFixed(2)
    let ScaledAveraged =(sum/length+ 270).toFixed(2)

    let div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    svgScatterPlot
    .append("line")
    .attr("x1", 50)
    .attr("x2", 500)
    .attr("y1", ScaledAveraged)
    .attr("y2", ScaledAveraged) 
    .attr("stroke", "gray")
    .attr("stroke-dasharray", "5,3");

  }

  // make title and axes labels
  function makeLabels() {
    // svgScatterPlot.append('text')
    //   .attr('x', 120)
    //   .attr('y', 30)
    //   .style('font-size', '14pt')
    //   .classed("Myheader", true)
    //   .text("Average Viewership by Season");

    svgScatterPlot.append('text')
      .attr('x', 220)
      .attr('y', 500)
      .style('font-size', '10pt')
      .text('Years')


    svgScatterPlot.append('text')
      .attr('transform', 'translate(15, 300)rotate(-90)')
      .style('font-size', '10pt')
      .text('Avg. Viewers (in million)');

    svgScatterPlot.append('text')
      .attr('x', 350)
      .attr('y', 100)
      .style('font-size', '8pt')
      .text('Viewership Data');

    svgScatterPlot.append('text')
      .attr('x', 363)
      .attr('y', 115)
      .style('font-size', '8pt')
      .text('Actual');

      svgScatterPlot.append('text')
      .attr('x', 363)
      .attr('y', 130)
      .style('font-size', '8pt')
      .text('Estimated');

      svgScatterPlot.append('rect')
      .attr('x', 350)
      .attr('y', 121)
      .attr('width', 10)
      .attr('height', 10)
      .style('font-size', '8pt')
      .style('fill', '#696969');

      svgScatterPlot.append('rect')
      .attr('x', 350)
      .attr('y', 105)
      .attr('width', 10)
      .attr('height', 10)
      .style('font-size', '8pt')
      .style('fill', '#ADD8E6');

  }

  // plot all the data points on the SVG
  // and add tooltip functionality
  function plotData(map, listOfHeight) {
    // get population data as array
    let pop_data = data.map((row) => +row["pop_mlns"]);
    let pop_limits = d3.extent(pop_data);
    // make size scaling function for population
    let pop_map_func = d3.scaleLinear()
      .domain([pop_limits[0], pop_limits[1]])
      .range([3, 20]);

    // mapping functions
    let xMap = map.x;
    let yMap = map.y;
 
    // make tooltip
    let div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
    

    svgScatterPlot.selectAll('.dot')
    .data(data)
    .enter()
    .append('text')
    .attr('x', xMap)
    .attr('y', yMap)
    .style('font-size', '6pt')
    .text(function(d) {return d.AverageViewer;})

    svgScatterPlot.selectAll('.dot')
      .data(data)
      .enter()
      .append('rect')
        .attr('x', xMap)
        .attr('y', yMap)
        .attr('width', 15)
        .data(listOfHeight)
        .attr('height', function(d) { return d; })
        .data(data)
        .attr('fill', function(d) {if(d.Data == 'Actual') {
          return '#ADD8E6';
        }
          else{
            return "#696969";
          }
        })
        .on("mouseover", (d) => {
          div.transition()
            .duration(200)
            .style("opacity", .9);
          div.html("<b style=color:red> Season # " + d.year + "</b> <br/>" + "Year: " + d.year + "<br/>" + "Episode: " + d.Episode + "<br/>" + "Avg Viewers (mil): " + d.AverageViewer + "<br/>" + "<br/>"
             + "Most Watched Episode: " + d.MostWatched + "<br/>" + "Viewers (mil): " + d.Viewers)
            .style("left", (d3.event.pageX) + "px" )
            .style("top", (d3.event.pageY) + "px");
        })
        .on("mouseout", (d) => {
          div.transition()
            .duration(500)
            .style("opacity", 0);
        });
      

  }

  // draw the axes and ticks
  function drawAxes(limits, x, y, svg, rangeX, rangeY) {
    // return x value from a row of data
    let xValue = function(d) { return +d[x]; }

    // function to scale x value
    let xScale = d3.scaleLinear()
      .domain([limits.xMin, limits.xMax + 1]) // give domain buffer room
      .range([rangeX.min, rangeX.max]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) { return xScale(xValue(d)); };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);

    // svg.append("g")
    //   .attr('transform', 'translate(0, ' + rangeY.max + ')')
    //   .call(xAxis)
    //   .selectAll("text")	
    //   .attr("transform", "translate(-6,20) rotate(-90)")
    //   ;
    let listOfYPos = []
    


    for(let i = 0; i < data.length; i++){
      svg.append('text')
      .attr('x', -455)
      .attr('y', 68 + 16 * i)
      .style('font-size', '7pt')
      .text(1994 + i)
      .attr("transform", "translate(-6,20) rotate(-90)")
    }



    svg
    .append("line")
    .attr("x1", 50)
    .attr("x2", 500)
    .attr("y1", 450)
    .attr("y2", 450) 
    .attr("stroke", "black")

    // return y value from a row of data
    let yValue = function(d) { return +d[y]  }

    // function to scale y
    let yScale = d3.scaleLinear()
      .domain([limits.yMax, limits.yMin - 2]) // give domain buffer
      .range([rangeY.min, rangeY.max]);

    // yMap returns a scaled y value from a row of data

    let yMap = function (d) { return yScale(yValue(d)) ; };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);

    svg.append('g')
      .attr('transform', 'translate(' + rangeX.min + ', 0)')
      .call(yAxis);

    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  // find min and max for arrays of x and y
  function findMinMax(x, y) {

    // get min/max x values
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    // get min/max y values
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
      xMin : xMin,
      xMax : xMax,
      yMin : yMin,
      yMax : yMax
    }
  }

  // format numbers
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

})();
