import * as d3 from 'd3'

import { geoAzimuthalEqualArea, geoPath } from 'd3-geo'
import { feature } from 'topojson'
import { queue } from 'd3-queue'

import './css/styles.css!'

const width = 800
const height = 600

let projection = geoAzimuthalEqualArea()
  .scale(250)
  .translate([width / 2, height / 2])
  .clipAngle(90)

let canvas = d3.select('body').append('canvas')
  .attr('width', width)
  .attr('height', height)

let context = canvas.node().getContext('2d')

let path = geoPath()
  .projection(projection)
  .context(context)

queue()
  .defer(d3.json, 'data/world-topo.json')
  .await(function(err, world) {
    if (err) return console.error(err)

    path(feature(world, world.objects.countries))
    context.stroke()
})
