import 'regenerator-runtime/runtime'

import * as d3 from 'd3'
import "./styles.css";

async function init() {
  const margin = {top: 20, right: 0, bottom: 30, left: 40}
  const height = 500
  const width = 960

  let data = await d3.csv('data.csv')
  const indexTable = getIndexLookupTable(data)

  console.log(data)

  function updateData(newData) {
    data = newData
  }

  function getIndexLookupTable(data) {
    const table = {}
    data.forEach((item, index) => table[item.id] = index)
    return table
  }

  const x = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([margin.left, width])
    .padding(0.3)

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)]).nice()
    .range([height - margin.bottom, margin.top])

  const xAxis = g =>
    g.attr('transform', `translate(0, ${height - margin.bottom})`)
     .call(d3.axisBottom(x).tickSizeOuter(0))

  const yAxis = g =>
    g.attr('transform', `translate(${margin.left}, 0)`)
     .call(d3.axisLeft(y))
     .call(g => g.select('.domain').remove())

  const svg = d3.select('svg');

  const tooltip = d3
  .select('body')
  .append('div')
  .attr('class', 'svg1-tooltip')
  .style('position', 'absolute')
  .style('visibility', 'hidden')

  const drag = d3.drag()
    .on('start', dragStart)
    .on('drag', dragged)
    .on('end', dragEnd);

  function dragStart(e) {
    // d3.select(this).style('cy')
    // console.log('dragStart', e)
  }

  function dragged(e, d) {
    const position = e.y <= 0 ? 0 : e.y
    d3.select(this).attr('y1', position).attr('y2', position)
  }

  function dragEnd(e, d) {
    const { id } = d
    const index = indexTable[id]

    const newValue = y.invert(e.y).toString()

    const newData = [...data]

    newData[index] = {
      ...newData[index],
      value: newValue,
      name: e.subject.name,
    }

    updateData(newData)
    render(newData)
  }

  const rootG = svg.append('g')
    .attr('class', 'bars')
    .attr('fill', 'steelblue')

  function render(data) {
    rootG
    .selectAll('g.mark')
    .data(data, d => d.name)
    .join(
      enter => {
        return enter
        .append('g')
          .classed('mark', true)
          .call(g => g
            .append('rect')
              .attr('x', d => x(d.name))
              .attr('y', d => y(d.value))
              .attr('height', d => {
                return y(0) - y(d.value)
              })
              .attr('width', () => {
                console.log(x.bandwidth())
                return x.bandwidth()
              })
              .on('mouseover', function(e, d) {
                d3.select(this).attr('stroke-width', '2').attr("stroke", "black");
                tooltip.style('visibility', 'visible').text(`frequency: ${d.value * 100}%\nletter: ${d.name}`)
              })
            .on('mousemove', function(e, d) {
              tooltip.style('top', e.pageY - 90)
              tooltip.style('left', e.pageX + 90)
            })
            .on('mouseout', function() {
              // change the selection style
              tooltip.attr('stroke-width', '0');
              tooltip.style('visibility', 'hidden');
            })
          )
          .call(g => {
            g.append('text')
            .text(d => {
              return parseFloat(d.value).toFixed(2).toString()
            })
            .attr('x', function (d) {
              return x(d.name) + x.bandwidth() / 2
            })
            .attr('y', function (d) {
              return y(d.value) - 5
            })
          })
          .call(g => {
            g.append('line').call(setLineStyle).call(drag)

            // g.append('circle')
            //   .call(setCircleStyle)
            //   .call(drag)
          })
      },
      update => {
        return update
        .call(update => update
          .select('rect')
          .attr('x', d => x(d.name))
          .attr('y', d => y(d.value))
          .attr('height', d => y(0) - y(d.value))
          .attr('width', x.bandwidth())
        )
        .call(update => update
          .select('text')
          .text(d => {
            return parseFloat(d.value).toFixed(2).toString()
          })
          .attr('x', function (d) {
            return x(d.name) + x.bandwidth() / 2
          })
          .attr('y', function (d) {
            return y(d.value) - 5
          })
        )
        .call(update => update
          .select('circle')
          .call(setCircleStyle)
        )
      },
    )
  }

  render(data)

  svg.append('g').attr('class', 'x-axis').call(xAxis)
  svg.append('g').attr('class', 'y-axis').call(yAxis)

  function setCircleStyle(selector) {
    return selector.attr('r', '10')
    .attr('cx', d => x.bandwidth() + x(d.name))
    .attr('cy', d => y(d.value))
    .attr('fill', 'black')
  }

  function setLineStyle(selector) {
    return selector
    .attr('x1', d => x(d.name))
    .attr('x2', d => x.bandwidth() + x(d.name))
    .attr('y1', d => y(d.value))
    .attr('y2', d => y(d.value))
    .attr('stroke', 'rgb(255,0,0)')
    .attr('stroke-width', 5)
  }
}

init()

