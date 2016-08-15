import * as d3 from 'd3'

import { geoPath, geoGraticule, geoOrthographic } from 'd3-geo'
import { feature } from 'topojson'
import { queue } from 'd3-queue'

import './css/styles.css!'

const width = 800
const height = 600

const filter_cols = [ 'source_country_std', 'destination_country_std', 'business_activity', 'investing_company' ]
const filter_col_labels = [ 'Source Country', 'Destination Country', 'Business Activity', 'Investing Company' ]
const null_suffix = ' (All)'

let filters = {}

let rotate = null

const earth_tilt = 11.5 // actual tilt is 23.4

let drop_downs = d3.select('body').append('div')
  .selectAll('select')
    .data(filter_cols)

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

//console.time('ajax')
queue()
  .defer(d3.json, 'data/world-110m.json')
  .defer(d3.csv, 'data/fdi_excerpt.csv')
  .await(function(err, world, fdi) {
    if (err) return console.error(err)

    //console.timeEnd('ajax')

    //console.time('postprocess')
    let countries = feature(world, world.objects.countries)

    console.log('size: ' + fdi.length)

    fdi.forEach((d) => {
      d.source_lat_def = +d.source_lat_def
      d.source_long_def = +d.source_long_def
      d.destination_lat_def = +d.destination_lat_def
      d.destination_long_def = +d.destination_long_def
    })

    // model
    let source_geom = { type: "MultiLineString", coordinates: [] }

    // recalculate lines when source changes

    let domains = {}
    filter_cols.forEach( (col,i ) => {
      domains[col] = d3.set(fdi, (d) => d[col]).values()
      domains[col].sort(d3.ascending)
    })

    drop_downs.enter().append('select')
      .attr('class', 'filter')
      .on('change', function(col) {
        filters[col] = this.value.endsWith(null_suffix) ? null : this.value
        // default: when no filters, no arcs
        if(d3.values(filters).some((d) => d)) update_geom()
        else source_geom.coordinates = []
      })
      .selectAll('option')
        .data( (col,i) => [filter_col_labels[i] + null_suffix].concat(domains[col]))
      .enter().append('option')
        .text( (d) => d )

    //console.timeEnd('postprocess')

    d3.interval( (elapsed) => {
      update(countries, source_geom, elapsed * 0.01),
      38 })

    function update_geom() {
      let coords = fdi.filter(in_filter).map( (d) => {
        let src = [d.source_long_def, d.source_lat_def]
        let dest = [d.destination_long_def, d.destination_lat_def]

        return [src, dest]
      })

      source_geom.coordinates = coords
    }

    function in_filter(d) {
      return filter_cols.every( (col) => !filters[col] || d[col] === filters[col] )
    }
})

function update(countries, fdis, r) {
  projection.rotate([rotate || r, 0, earth_tilt])

  context.clearRect(0, 0, width, height)

  canvas.on('click', () => rotate = (!rotate && r))

  //console.time('sphere')
  context.save()
  context.lineWidth = 1
  context.setLineDash([1, 3])
  context.strokeStyle = '#c9c4bc'
  context.beginPath()
  path( graticule() )
  context.stroke()
  context.restore()
  //console.timeEnd('sphere')

  //console.time('countries')
  context.save()
  context.lineWidth = 1
  context.strokeStyle = 'gray'
  context.fillStyle = 'lightgray'
  context.beginPath()
  path(countries)
  context.fill()
  context.stroke()
  context.restore()
  //console.timeEnd('countries')

  let percent = (r * 10 % 100) / 100.0
  const dashes = [5,10]
  const dashes_total = dashes.reduce( (a,b) => a+b )

  //console.time('fdis')
  context.save()
  context.lineWidth = 1
  context.strokeStyle = 'rgba(0,200,200,0.7)'
  context.setLineDash(dashes)
  context.lineDashOffset = -percent * dashes_total
  context.beginPath()
  path(fdis)
  context.stroke()
  context.restore()
  //console.timeEnd('fdis')
}
