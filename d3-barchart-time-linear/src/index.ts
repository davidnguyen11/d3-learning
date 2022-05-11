import 'regenerator-runtime/runtime'

import * as d3 from 'd3'
import "./styles.css";

async function init() {
  const margin = {top: 20, right: 0, bottom: 30, left: 40}
  const height = 500
  const width = 960

  const parseTime = d3.timeParse('%H:%M:%S');
  const data = await d3.csv('data.csv')

  const timeDomain = d3.extent(data, function(d) {
    return parseTime(d.time)
  })

  const x = d3
    .scaleTime()
    .domain(timeDomain)
    .range([margin.left, width])

  const xBand = d3
    .scaleBand()
    .domain(d3.timeMinute.range(...x.domain()))
    .range([margin.left, width])
    .padding(0.3)

  const barWidth = xBand.bandwidth()

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => parseInt(d.level1))])
    .nice()
    .range([height - margin.bottom, margin.top])

  const xAxis = g => g
    .attr('transform', `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickSizeOuter(0))

  const yAxis = g =>
    g.attr('transform', `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select('.domain').remove())

  const svg = d3.select('svg');
  const rootG = svg.append('g')

  rootG
    .selectAll('g.mark')
    .data(data, d => d.time)
    .join('rect')
    .classed('mark', true)
    .attr('x', d => x(parseTime(d.time)))
    .attr('y', d => y(d.level1))
    .attr('width', (d, i) => {
      console.log('iii', i)
      return barWidth
    })
    .attr("height", function(d) { return y(0) - y(d.level1); })
    .style("fill", "steelblue");

  function zoom() {
    const extent = [[margin.left, margin.top], [width - margin.right, height - margin.top]];

    svg.call(d3.zoom()
        .scaleExtent([1, 8])
        .translateExtent(extent)
        .extent(extent)
        .on("zoom", zoomed));

    function zoomed(event) {
      x.range([margin.left, width].map(d => {
        return event.transform.applyX(d)
      }));
      const xBand1 = d3
      .scaleBand()
      .domain(d3.timeMinute.range(...x.domain()))
      .range(x.range())
      .padding(0.3)

      svg.selectAll(".mark")
        .attr("x", d => x(parseTime(d.time)))
        .attr("width", d => xBand1.bandwidth()*2)

      svg.selectAll(".x-axis").call(xAxis);
    }
  }

  svg.append('g').attr('class', 'x-axis').call(xAxis)
  svg.append('g').attr('class', 'y-axis').call(yAxis)
  svg.call(zoom)
}

init()

