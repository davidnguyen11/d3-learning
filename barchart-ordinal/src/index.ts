import 'regenerator-runtime/runtime'

import * as d3 from 'd3'
import "./styles.css";

// move to scale ordinal
// zoom

async function init() {
  const margin = {top: 20, right: 0, bottom: 30, left: 40}
  const height = 500
  const width = 960

  const data = await d3.csv('data.csv')
  console.log('data', data)
  const bandWidth = 212;
  const r = data.map((d, index) => margin.left + index * bandWidth)
  console.log(r)

  const x = d3
    .scaleOrdinal()
    .domain(data.map(d => d.quarter))
    .range(r)

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.revenue)]).nice()
    .range([height - margin.bottom, margin.top])

  const xAxis = g =>
    g.attr('transform', `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickSizeOuter(0))

  const yAxis = g =>
    g.attr('transform', `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select('.domain').remove())

  const svg = d3.select('svg');
  const rootG = svg.append('g')
  .attr('class', 'bars')
  .attr('fill', 'steelblue')

  function renderBar(step = 0) {
    rootG
    .selectAll('g.mark')
    .data(data, d => d.quarter)
    .join(
      enter => {
        return enter
          .append('g')
          .classed('mark', true)
          .call(g => g
            .append('rect')
            .attr('x', d => x(d.quarter) + step - 10)
            .attr('y', d => y(d.revenue))
            .attr('height', d => y(0) - y(d.revenue))
            .attr('width', d => 20)
          )
      },
      update => {
        return update
          .select('rect')
          .attr('x', d => x(d.quarter) + step - 10)
          .attr('y', d => y(d.revenue))
          .attr('height', d => y(0) - y(d.revenue))
          .attr('width', d => 20)
      }
    )
    
  }
  renderBar()

  const a = svg.append('g').attr('class', 'x-axis').call(xAxis)
  svg.append('g').attr('class', 'y-axis').call(yAxis)

  const drag = d3.drag()
  .on('start', dragStart)
  .on('drag', dragged)
  .on('end', dragEnd);
  
  let tx = 0;
  function dragStart() {}

  function dragged(e, d) {
    tx += e.dx
    if (tx > 0) return
    console.log(tx)
    a.attr('transform', `translate(${tx}, ${height - margin.bottom})`)
    renderBar(tx)
  }
  function dragEnd() {}

  svg.call(drag)
}

init()

