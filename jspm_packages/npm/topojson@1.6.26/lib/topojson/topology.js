/* */ 
(function(process) {
  var type = require('./type'),
      stitch = require('./stitch'),
      systems = require('./coordinate-systems'),
      topologize = require('./topology/index'),
      delta = require('./delta'),
      geomify = require('./geomify'),
      prequantize = require('./pre-quantize'),
      postquantize = require('./post-quantize'),
      bounds = require('./bounds'),
      computeId = require('./compute-id'),
      transformProperties = require('./transform-properties');
  var ε = 1e-6;
  module.exports = function(objects, options) {
    var Q0 = 1e4,
        Q1 = 1e4,
        id = function(d) {
          return d.id;
        },
        propertyTransform = function() {},
        transform,
        minimumArea = 0,
        stitchPoles = true,
        verbose = false,
        system = null;
    if (options)
      "verbose" in options && (verbose = !!options["verbose"]), "stitch-poles" in options && (stitchPoles = !!options["stitch-poles"]), "coordinate-system" in options && (system = systems[options["coordinate-system"]]), "minimum-area" in options && (minimumArea = +options["minimum-area"]), "quantization" in options && (Q0 = Q1 = +options["quantization"]), "pre-quantization" in options && (Q0 = +options["pre-quantization"]), "post-quantization" in options && (Q1 = +options["post-quantization"]), "id" in options && (id = options["id"]), "property-transform" in options && (propertyTransform = options["property-transform"]);
    if (Q0 / Q1 % 1)
      throw new Error("post-quantization is not a divisor of pre-quantization");
    if (Q0 && !Q1)
      throw new Error("post-quantization is required when input is already quantized");
    computeId(objects, id);
    transformProperties(objects, propertyTransform);
    geomify(objects);
    var bbox = bounds(objects);
    var oversize = bbox[0] < -180 - ε || bbox[1] < -90 - ε || bbox[2] > 180 + ε || bbox[3] > 90 + ε;
    if (!system) {
      system = systems[oversize ? "cartesian" : "spherical"];
      if (options)
        options["coordinate-system"] = system.name;
    }
    if (system === systems.spherical) {
      if (oversize)
        throw new Error("spherical coordinates outside of [±180°, ±90°]");
      if (bbox[0] < -180 + ε)
        bbox[0] = -180;
      if (bbox[1] < -90 + ε)
        bbox[1] = -90;
      if (bbox[2] > 180 - ε)
        bbox[2] = 180;
      if (bbox[3] > 90 - ε)
        bbox[3] = 90;
    }
    if (verbose) {
      process.stderr.write("bounds: " + bbox.join(" ") + " (" + system.name + ")\n");
    }
    if (Q0) {
      transform = prequantize(objects, bbox, Q0, Q1);
      if (verbose) {
        process.stderr.write("pre-quantization: " + transform.scale.map(function(k) {
          return system.formatDistance(k);
        }).join(" ") + "\n");
      }
    }
    if (system === systems.spherical && stitchPoles) {
      stitch(objects, transform);
    }
    var topology = topologize(objects);
    if (Q0)
      topology.transform = transform;
    topology.bbox = bbox;
    if (verbose) {
      process.stderr.write("topology: " + topology.arcs.length + " arcs, " + topology.arcs.reduce(function(p, v) {
        return p + v.length;
      }, 0) + " points\n");
    }
    if (Q1 && Q1 !== Q0) {
      postquantize(topology, Q0, Q1);
      transform = topology.transform;
      if (verbose) {
        process.stderr.write("post-quantization: " + transform.scale.map(function(k) {
          return system.formatDistance(k);
        }).join(" ") + "\n");
      }
    }
    if (Q1) {
      delta(topology);
    }
    return topology;
  };
})(require('process'));
