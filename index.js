import * as d3 from 'd3'

import { geoOrthographic, geoPath, geoGraticule, geoInterpolate } from 'd3-geo'
import { feature } from 'topojson'
import { queue } from 'd3-queue'

import './css/styles.css!'

const width = 800
const height = 600

const earth_tilt = 11.5 // actual tilt is 23.4

let projection = geoOrthographic()
  .scale(d3.min([width, height]) / 2 - 20)
  .translate([width / 2, height / 2])
  .clipAngle(90)
  .precision(0.6)

let canvas = d3.select('body').append('canvas')
  .attr('width', width)
  .attr('height', height)

let context = canvas.node().getContext('2d')

let path = geoPath()
  .projection(projection)
  .context(context)
  .pointRadius(2)

let graticule = geoGraticule()

console.time('ajax')
queue()
  .defer(d3.json, 'data/world-110m.json')
  .defer(d3.csv, 'data/fdi_usa.csv')
  .await(function(err, world, fdi) {
    if (err) return console.error(err)

    console.timeEnd('ajax')

    console.time('postprocess')
    let countries = feature(world, world.objects.countries)

    fdi = fdi.filter( (d) => d.investing_company === 'Microsoft' )

    fdi.forEach((d) => {
      d.source_lat_def = +d.source_lat_def
      d.source_long_def = +d.source_long_def
      d.destination_lat_def = +d.destination_lat_def
      d.destination_long_def = +d.destination_long_def
    })
    console.timeEnd('postprocess')

    let start = d3.now()
    d3.interval( (elapsed) => update(countries, fdi, (elapsed - start) * 0.01), 38 )
})

function update(countries, fdi, r) {
  projection.rotate([r, 0, earth_tilt])

  context.clearRect(0, 0, width, height)

  console.time('sphere')
  context.save()
  context.beginPath()
  context.lineWidth = 1
  context.setLineDash([1, 3])
  context.strokeStyle = '#c9c4bc'
  path( graticule() )
  context.stroke()
  context.restore()
  console.timeEnd('sphere')

  console.time('countries')
  context.save()
  context.beginPath()
  context.lineWidth = 1
  context.strokeStyle = 'gray'
  context.fillStyle = 'white'
  path(countries)
  context.fill()
  context.stroke()
  context.restore()
  console.timeEnd('countries')

  let percent = (r % 50) / 50

  console.time('fdis')
  context.save()
  context.lineWidth = 1.5
  context.strokeStyle = 'red'
  context.beginPath()
  fdi.forEach( (d) => {
    let coords = [[d.source_long_def, d.source_lat_def], [d.destination_long_def, d.destination_lat_def]]
    let i = geoInterpolate(coords[0], coords[1])
    path({ type: "LineString", coordinates: coords})
    path({ type: "Point", coordinates: i(percent) })
  })
  context.stroke()
  context.restore()
  console.timeEnd('fdis')
}
