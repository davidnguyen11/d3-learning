import 'regenerator-runtime/runtime'

import * as d3 from 'd3'
import "./styles.css";

async function init() {
  const margin = {top: 20, right: 0, bottom: 30, left: 40}
  const height = 500
  const width = 960

  const parseTime = d3.time.format("%H:%M:%S").parse;
  const a = d3.scaleTime().domain([Date.now(), Date.now() + 24 * 60 * 60 * 1000])
  let data = await d3.csv('data.csv')
  data = d3.extent()

  console.log('data', data)
  const x = d3.scaleTime().domain()

  console.log(a)

}

init()

