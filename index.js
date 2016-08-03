import * as d3 from 'd3'

import { geoOrthographic, geoPath } from 'd3-geo'
import { feature } from 'topojson'
import { queue } from 'd3-queue'

import './css/styles.css!'


const width = 800
const height = 600

queue()
  .defer(d3.json, 'data/world-topo.json')
  .await(function(err, world) {
    if (err) return console.error(err)

    let projection = geoOrthographic()
      .scale(250)
      .translate([width / 2, height / 2])
      .clipAngle(90)

    let path = geoPath()
      .projection(projection)

    let svg = d3.select('body').append('svg')
      .attr('width', width)
      .attr('height', height)

    svg.append('path')
      .attr('class', 'globe')
      .datum(feature(world, world.objects.countries))
      .attr('d', path)
})
