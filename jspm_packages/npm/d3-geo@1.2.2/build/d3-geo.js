/* */ 
"format cjs";
(function(Buffer) {
  (function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-array')) : typeof define === 'function' && define.amd ? define(['exports', 'd3-array'], factory) : (factory((global.d3 = global.d3 || {}), global.d3));
  }(this, function(exports, d3Array) {
    'use strict';
    function adder() {
      return new Adder;
    }
    function Adder() {
      this.reset();
    }
    Adder.prototype = {
      constructor: Adder,
      reset: function() {
        this.s = this.t = 0;
      },
      add: function(y) {
        add(temp, y, this.t);
        add(this, temp.s, this.s);
        if (this.s)
          this.t += temp.t;
        else
          this.s = temp.t;
      },
      valueOf: function() {
        return this.s;
      }
    };
    var temp = new Adder;
    function add(adder, a, b) {
      var x = adder.s = a + b,
          bv = x - a,
          av = x - bv;
      adder.t = (a - av) + (b - bv);
    }
    var epsilon = 1e-6;
    var epsilon2 = 1e-12;
    var pi = Math.PI;
    var halfPi = pi / 2;
    var quarterPi = pi / 4;
    var tau = pi * 2;
    var degrees = 180 / pi;
    var radians = pi / 180;
    var abs = Math.abs;
    var atan = Math.atan;
    var atan2 = Math.atan2;
    var cos = Math.cos;
    var ceil = Math.ceil;
    var exp = Math.exp;
    var log = Math.log;
    var pow = Math.pow;
    var sin = Math.sin;
    var sign = Math.sign || function(x) {
      return x > 0 ? 1 : x < 0 ? -1 : 0;
    };
    var sqrt = Math.sqrt;
    var tan = Math.tan;
    function acos(x) {
      return x > 1 ? 0 : x < -1 ? pi : Math.acos(x);
    }
    function asin(x) {
      return x > 1 ? halfPi : x < -1 ? -halfPi : Math.asin(x);
    }
    function haversin(x) {
      return (x = sin(x / 2)) * x;
    }
    function noop() {}
    function streamGeometry(geometry, stream) {
      if (geometry && streamGeometryType.hasOwnProperty(geometry.type)) {
        streamGeometryType[geometry.type](geometry, stream);
      }
    }
    var streamObjectType = {
      Feature: function(feature, stream) {
        streamGeometry(feature.geometry, stream);
      },
      FeatureCollection: function(object, stream) {
        var features = object.features,
            i = -1,
            n = features.length;
        while (++i < n)
          streamGeometry(features[i].geometry, stream);
      }
    };
    var streamGeometryType = {
      Sphere: function(object, stream) {
        stream.sphere();
      },
      Point: function(object, stream) {
        object = object.coordinates;
        stream.point(object[0], object[1], object[2]);
      },
      MultiPoint: function(object, stream) {
        var coordinates = object.coordinates,
            i = -1,
            n = coordinates.length;
        while (++i < n)
          object = coordinates[i], stream.point(object[0], object[1], object[2]);
      },
      LineString: function(object, stream) {
        streamLine(object.coordinates, stream, 0);
      },
      MultiLineString: function(object, stream) {
        var coordinates = object.coordinates,
            i = -1,
            n = coordinates.length;
        while (++i < n)
          streamLine(coordinates[i], stream, 0);
      },
      Polygon: function(object, stream) {
        streamPolygon(object.coordinates, stream);
      },
      MultiPolygon: function(object, stream) {
        var coordinates = object.coordinates,
            i = -1,
            n = coordinates.length;
        while (++i < n)
          streamPolygon(coordinates[i], stream);
      },
      GeometryCollection: function(object, stream) {
        var geometries = object.geometries,
            i = -1,
            n = geometries.length;
        while (++i < n)
          streamGeometry(geometries[i], stream);
      }
    };
    function streamLine(coordinates, stream, closed) {
      var i = -1,
          n = coordinates.length - closed,
          coordinate;
      stream.lineStart();
      while (++i < n)
        coordinate = coordinates[i], stream.point(coordinate[0], coordinate[1], coordinate[2]);
      stream.lineEnd();
    }
    function streamPolygon(coordinates, stream) {
      var i = -1,
          n = coordinates.length;
      stream.polygonStart();
      while (++i < n)
        streamLine(coordinates[i], stream, 1);
      stream.polygonEnd();
    }
    function geoStream(object, stream) {
      if (object && streamObjectType.hasOwnProperty(object.type)) {
        streamObjectType[object.type](object, stream);
      } else {
        streamGeometry(object, stream);
      }
    }
    var areaRingSum = adder();
    var areaSum = adder();
    var lambda00;
    var phi00;
    var lambda0;
    var cosPhi0;
    var sinPhi0;
    var areaStream = {
      point: noop,
      lineStart: noop,
      lineEnd: noop,
      polygonStart: function() {
        areaRingSum.reset();
        areaStream.lineStart = areaRingStart;
        areaStream.lineEnd = areaRingEnd;
      },
      polygonEnd: function() {
        var areaRing = +areaRingSum;
        areaSum.add(areaRing < 0 ? tau + areaRing : areaRing);
        this.lineStart = this.lineEnd = this.point = noop;
      },
      sphere: function() {
        areaSum.add(tau);
      }
    };
    function areaRingStart() {
      areaStream.point = areaPointFirst;
    }
    function areaRingEnd() {
      areaPoint(lambda00, phi00);
    }
    function areaPointFirst(lambda, phi) {
      areaStream.point = areaPoint;
      lambda00 = lambda, phi00 = phi;
      lambda *= radians, phi *= radians;
      lambda0 = lambda, cosPhi0 = cos(phi = phi / 2 + quarterPi), sinPhi0 = sin(phi);
    }
    function areaPoint(lambda, phi) {
      lambda *= radians, phi *= radians;
      phi = phi / 2 + quarterPi;
      var dLambda = lambda - lambda0,
          sdLambda = dLambda >= 0 ? 1 : -1,
          adLambda = sdLambda * dLambda,
          cosPhi = cos(phi),
          sinPhi = sin(phi),
          k = sinPhi0 * sinPhi,
          u = cosPhi0 * cosPhi + k * cos(adLambda),
          v = k * sdLambda * sin(adLambda);
      areaRingSum.add(atan2(v, u));
      lambda0 = lambda, cosPhi0 = cosPhi, sinPhi0 = sinPhi;
    }
    function area(object) {
      areaSum.reset();
      geoStream(object, areaStream);
      return areaSum * 2;
    }
    function spherical(cartesian) {
      return [atan2(cartesian[1], cartesian[0]), asin(cartesian[2])];
    }
    function cartesian(spherical) {
      var lambda = spherical[0],
          phi = spherical[1],
          cosPhi = cos(phi);
      return [cosPhi * cos(lambda), cosPhi * sin(lambda), sin(phi)];
    }
    function cartesianDot(a, b) {
      return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }
    function cartesianCross(a, b) {
      return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    }
    function cartesianAddInPlace(a, b) {
      a[0] += b[0], a[1] += b[1], a[2] += b[2];
    }
    function cartesianScale(vector, k) {
      return [vector[0] * k, vector[1] * k, vector[2] * k];
    }
    function cartesianNormalizeInPlace(d) {
      var l = sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
      d[0] /= l, d[1] /= l, d[2] /= l;
    }
    var lambda0$1;
    var phi0;
    var lambda1;
    var phi1;
    var lambda2;
    var lambda00$1;
    var phi00$1;
    var p0;
    var deltaSum = adder();
    var ranges;
    var range$1;
    var boundsStream = {
      point: boundsPoint,
      lineStart: boundsLineStart,
      lineEnd: boundsLineEnd,
      polygonStart: function() {
        boundsStream.point = boundsRingPoint;
        boundsStream.lineStart = boundsRingStart;
        boundsStream.lineEnd = boundsRingEnd;
        deltaSum.reset();
        areaStream.polygonStart();
      },
      polygonEnd: function() {
        areaStream.polygonEnd();
        boundsStream.point = boundsPoint;
        boundsStream.lineStart = boundsLineStart;
        boundsStream.lineEnd = boundsLineEnd;
        if (areaRingSum < 0)
          lambda0$1 = -(lambda1 = 180), phi0 = -(phi1 = 90);
        else if (deltaSum > epsilon)
          phi1 = 90;
        else if (deltaSum < -epsilon)
          phi0 = -90;
        range$1[0] = lambda0$1, range$1[1] = lambda1;
      }
    };
    function boundsPoint(lambda, phi) {
      ranges.push(range$1 = [lambda0$1 = lambda, lambda1 = lambda]);
      if (phi < phi0)
        phi0 = phi;
      if (phi > phi1)
        phi1 = phi;
    }
    function linePoint(lambda, phi) {
      var p = cartesian([lambda * radians, phi * radians]);
      if (p0) {
        var normal = cartesianCross(p0, p),
            equatorial = [normal[1], -normal[0], 0],
            inflection = cartesianCross(equatorial, normal);
        cartesianNormalizeInPlace(inflection);
        inflection = spherical(inflection);
        var delta = lambda - lambda2,
            sign = delta > 0 ? 1 : -1,
            lambdai = inflection[0] * degrees * sign,
            phii,
            antimeridian = abs(delta) > 180;
        if (antimeridian ^ (sign * lambda2 < lambdai && lambdai < sign * lambda)) {
          phii = inflection[1] * degrees;
          if (phii > phi1)
            phi1 = phii;
        } else if (lambdai = (lambdai + 360) % 360 - 180, antimeridian ^ (sign * lambda2 < lambdai && lambdai < sign * lambda)) {
          phii = -inflection[1] * degrees;
          if (phii < phi0)
            phi0 = phii;
        } else {
          if (phi < phi0)
            phi0 = phi;
          if (phi > phi1)
            phi1 = phi;
        }
        if (antimeridian) {
          if (lambda < lambda2) {
            if (angle(lambda0$1, lambda) > angle(lambda0$1, lambda1))
              lambda1 = lambda;
          } else {
            if (angle(lambda, lambda1) > angle(lambda0$1, lambda1))
              lambda0$1 = lambda;
          }
        } else {
          if (lambda1 >= lambda0$1) {
            if (lambda < lambda0$1)
              lambda0$1 = lambda;
            if (lambda > lambda1)
              lambda1 = lambda;
          } else {
            if (lambda > lambda2) {
              if (angle(lambda0$1, lambda) > angle(lambda0$1, lambda1))
                lambda1 = lambda;
            } else {
              if (angle(lambda, lambda1) > angle(lambda0$1, lambda1))
                lambda0$1 = lambda;
            }
          }
        }
      } else {
        boundsPoint(lambda, phi);
      }
      p0 = p, lambda2 = lambda;
    }
    function boundsLineStart() {
      boundsStream.point = linePoint;
    }
    function boundsLineEnd() {
      range$1[0] = lambda0$1, range$1[1] = lambda1;
      boundsStream.point = boundsPoint;
      p0 = null;
    }
    function boundsRingPoint(lambda, phi) {
      if (p0) {
        var delta = lambda - lambda2;
        deltaSum.add(abs(delta) > 180 ? delta + (delta > 0 ? 360 : -360) : delta);
      } else {
        lambda00$1 = lambda, phi00$1 = phi;
      }
      areaStream.point(lambda, phi);
      linePoint(lambda, phi);
    }
    function boundsRingStart() {
      areaStream.lineStart();
    }
    function boundsRingEnd() {
      boundsRingPoint(lambda00$1, phi00$1);
      areaStream.lineEnd();
      if (abs(deltaSum) > epsilon)
        lambda0$1 = -(lambda1 = 180);
      range$1[0] = lambda0$1, range$1[1] = lambda1;
      p0 = null;
    }
    function angle(lambda0, lambda1) {
      return (lambda1 -= lambda0) < 0 ? lambda1 + 360 : lambda1;
    }
    function rangeCompare(a, b) {
      return a[0] - b[0];
    }
    function rangeContains(range, x) {
      return range[0] <= range[1] ? range[0] <= x && x <= range[1] : x < range[0] || range[1] < x;
    }
    function bounds(feature) {
      var i,
          n,
          a,
          b,
          merged,
          deltaMax,
          delta;
      phi1 = lambda1 = -(lambda0$1 = phi0 = Infinity);
      ranges = [];
      geoStream(feature, boundsStream);
      if (n = ranges.length) {
        ranges.sort(rangeCompare);
        for (i = 1, a = ranges[0], merged = [a]; i < n; ++i) {
          b = ranges[i];
          if (rangeContains(a, b[0]) || rangeContains(a, b[1])) {
            if (angle(a[0], b[1]) > angle(a[0], a[1]))
              a[1] = b[1];
            if (angle(b[0], a[1]) > angle(a[0], a[1]))
              a[0] = b[0];
          } else {
            merged.push(a = b);
          }
        }
        for (deltaMax = -Infinity, n = merged.length - 1, i = 0, a = merged[n]; i <= n; a = b, ++i) {
          b = merged[i];
          if ((delta = angle(a[1], b[0])) > deltaMax)
            deltaMax = delta, lambda0$1 = b[0], lambda1 = a[1];
        }
      }
      ranges = range$1 = null;
      return lambda0$1 === Infinity || phi0 === Infinity ? [[NaN, NaN], [NaN, NaN]] : [[lambda0$1, phi0], [lambda1, phi1]];
    }
    var W0;
    var W1;
    var X0;
    var Y0;
    var Z0;
    var X1;
    var Y1;
    var Z1;
    var X2;
    var Y2;
    var Z2;
    var lambda00$2;
    var phi00$2;
    var x0;
    var y0;
    var z0;
    var centroidStream = {
      sphere: noop,
      point: centroidPoint,
      lineStart: centroidLineStart,
      lineEnd: centroidLineEnd,
      polygonStart: function() {
        centroidStream.lineStart = centroidRingStart;
        centroidStream.lineEnd = centroidRingEnd;
      },
      polygonEnd: function() {
        centroidStream.lineStart = centroidLineStart;
        centroidStream.lineEnd = centroidLineEnd;
      }
    };
    function centroidPoint(lambda, phi) {
      lambda *= radians, phi *= radians;
      var cosPhi = cos(phi);
      centroidPointCartesian(cosPhi * cos(lambda), cosPhi * sin(lambda), sin(phi));
    }
    function centroidPointCartesian(x, y, z) {
      ++W0;
      X0 += (x - X0) / W0;
      Y0 += (y - Y0) / W0;
      Z0 += (z - Z0) / W0;
    }
    function centroidLineStart() {
      centroidStream.point = centroidLinePointFirst;
    }
    function centroidLinePointFirst(lambda, phi) {
      lambda *= radians, phi *= radians;
      var cosPhi = cos(phi);
      x0 = cosPhi * cos(lambda);
      y0 = cosPhi * sin(lambda);
      z0 = sin(phi);
      centroidStream.point = centroidLinePoint;
      centroidPointCartesian(x0, y0, z0);
    }
    function centroidLinePoint(lambda, phi) {
      lambda *= radians, phi *= radians;
      var cosPhi = cos(phi),
          x = cosPhi * cos(lambda),
          y = cosPhi * sin(lambda),
          z = sin(phi),
          w = atan2(sqrt((w = y0 * z - z0 * y) * w + (w = z0 * x - x0 * z) * w + (w = x0 * y - y0 * x) * w), x0 * x + y0 * y + z0 * z);
      W1 += w;
      X1 += w * (x0 + (x0 = x));
      Y1 += w * (y0 + (y0 = y));
      Z1 += w * (z0 + (z0 = z));
      centroidPointCartesian(x0, y0, z0);
    }
    function centroidLineEnd() {
      centroidStream.point = centroidPoint;
    }
    function centroidRingStart() {
      centroidStream.point = centroidRingPointFirst;
    }
    function centroidRingEnd() {
      centroidRingPoint(lambda00$2, phi00$2);
      centroidStream.point = centroidPoint;
    }
    function centroidRingPointFirst(lambda, phi) {
      lambda00$2 = lambda, phi00$2 = phi;
      lambda *= radians, phi *= radians;
      centroidStream.point = centroidRingPoint;
      var cosPhi = cos(phi);
      x0 = cosPhi * cos(lambda);
      y0 = cosPhi * sin(lambda);
      z0 = sin(phi);
      centroidPointCartesian(x0, y0, z0);
    }
    function centroidRingPoint(lambda, phi) {
      lambda *= radians, phi *= radians;
      var cosPhi = cos(phi),
          x = cosPhi * cos(lambda),
          y = cosPhi * sin(lambda),
          z = sin(phi),
          cx = y0 * z - z0 * y,
          cy = z0 * x - x0 * z,
          cz = x0 * y - y0 * x,
          m = sqrt(cx * cx + cy * cy + cz * cz),
          u = x0 * x + y0 * y + z0 * z,
          v = m && -acos(u) / m,
          w = atan2(m, u);
      X2 += v * cx;
      Y2 += v * cy;
      Z2 += v * cz;
      W1 += w;
      X1 += w * (x0 + (x0 = x));
      Y1 += w * (y0 + (y0 = y));
      Z1 += w * (z0 + (z0 = z));
      centroidPointCartesian(x0, y0, z0);
    }
    function centroid(object) {
      W0 = W1 = X0 = Y0 = Z0 = X1 = Y1 = Z1 = X2 = Y2 = Z2 = 0;
      geoStream(object, centroidStream);
      var x = X2,
          y = Y2,
          z = Z2,
          m = x * x + y * y + z * z;
      if (m < epsilon2) {
        x = X1, y = Y1, z = Z1;
        if (W1 < epsilon)
          x = X0, y = Y0, z = Z0;
        m = x * x + y * y + z * z;
        if (m < epsilon2)
          return [NaN, NaN];
      }
      return [atan2(y, x) * degrees, asin(z / sqrt(m)) * degrees];
    }
    function constant(x) {
      return function() {
        return x;
      };
    }
    function compose(a, b) {
      function compose(x, y) {
        return x = a(x, y), b(x[0], x[1]);
      }
      if (a.invert && b.invert)
        compose.invert = function(x, y) {
          return x = b.invert(x, y), x && a.invert(x[0], x[1]);
        };
      return compose;
    }
    function rotationIdentity(lambda, phi) {
      return [lambda > pi ? lambda - tau : lambda < -pi ? lambda + tau : lambda, phi];
    }
    rotationIdentity.invert = rotationIdentity;
    function rotateRadians(deltaLambda, deltaPhi, deltaGamma) {
      return (deltaLambda %= tau) ? (deltaPhi || deltaGamma ? compose(rotationLambda(deltaLambda), rotationPhiGamma(deltaPhi, deltaGamma)) : rotationLambda(deltaLambda)) : (deltaPhi || deltaGamma ? rotationPhiGamma(deltaPhi, deltaGamma) : rotationIdentity);
    }
    function forwardRotationLambda(deltaLambda) {
      return function(lambda, phi) {
        return lambda += deltaLambda, [lambda > pi ? lambda - tau : lambda < -pi ? lambda + tau : lambda, phi];
      };
    }
    function rotationLambda(deltaLambda) {
      var rotation = forwardRotationLambda(deltaLambda);
      rotation.invert = forwardRotationLambda(-deltaLambda);
      return rotation;
    }
    function rotationPhiGamma(deltaPhi, deltaGamma) {
      var cosDeltaPhi = cos(deltaPhi),
          sinDeltaPhi = sin(deltaPhi),
          cosDeltaGamma = cos(deltaGamma),
          sinDeltaGamma = sin(deltaGamma);
      function rotation(lambda, phi) {
        var cosPhi = cos(phi),
            x = cos(lambda) * cosPhi,
            y = sin(lambda) * cosPhi,
            z = sin(phi),
            k = z * cosDeltaPhi + x * sinDeltaPhi;
        return [atan2(y * cosDeltaGamma - k * sinDeltaGamma, x * cosDeltaPhi - z * sinDeltaPhi), asin(k * cosDeltaGamma + y * sinDeltaGamma)];
      }
      rotation.invert = function(lambda, phi) {
        var cosPhi = cos(phi),
            x = cos(lambda) * cosPhi,
            y = sin(lambda) * cosPhi,
            z = sin(phi),
            k = z * cosDeltaGamma - y * sinDeltaGamma;
        return [atan2(y * cosDeltaGamma + z * sinDeltaGamma, x * cosDeltaPhi + k * sinDeltaPhi), asin(k * cosDeltaPhi - x * sinDeltaPhi)];
      };
      return rotation;
    }
    function rotation(rotate) {
      rotate = rotateRadians(rotate[0] * radians, rotate[1] * radians, rotate.length > 2 ? rotate[2] * radians : 0);
      function forward(coordinates) {
        coordinates = rotate(coordinates[0] * radians, coordinates[1] * radians);
        return coordinates[0] *= degrees, coordinates[1] *= degrees, coordinates;
      }
      forward.invert = function(coordinates) {
        coordinates = rotate.invert(coordinates[0] * radians, coordinates[1] * radians);
        return coordinates[0] *= degrees, coordinates[1] *= degrees, coordinates;
      };
      return forward;
    }
    function circleStream(stream, radius, delta, direction, t0, t1) {
      if (!delta)
        return;
      var cosRadius = cos(radius),
          sinRadius = sin(radius),
          step = direction * delta;
      if (t0 == null) {
        t0 = radius + direction * tau;
        t1 = radius - step / 2;
      } else {
        t0 = circleRadius(cosRadius, t0);
        t1 = circleRadius(cosRadius, t1);
        if (direction > 0 ? t0 < t1 : t0 > t1)
          t0 += direction * tau;
      }
      for (var point,
          t = t0; direction > 0 ? t > t1 : t < t1; t -= step) {
        point = spherical([cosRadius, -sinRadius * cos(t), -sinRadius * sin(t)]);
        stream.point(point[0], point[1]);
      }
    }
    function circleRadius(cosRadius, point) {
      point = cartesian(point), point[0] -= cosRadius;
      cartesianNormalizeInPlace(point);
      var radius = acos(-point[1]);
      return ((-point[2] < 0 ? -radius : radius) + tau - epsilon) % tau;
    }
    function circle() {
      var center = constant([0, 0]),
          radius = constant(90),
          precision = constant(6),
          ring,
          rotate,
          stream = {point: point};
      function point(x, y) {
        ring.push(x = rotate(x, y));
        x[0] *= degrees, x[1] *= degrees;
      }
      function circle() {
        var c = center.apply(this, arguments),
            r = radius.apply(this, arguments) * radians,
            p = precision.apply(this, arguments) * radians;
        ring = [];
        rotate = rotateRadians(-c[0] * radians, -c[1] * radians, 0).invert;
        circleStream(stream, r, p, 1);
        c = {
          type: "Polygon",
          coordinates: [ring]
        };
        ring = rotate = null;
        return c;
      }
      circle.center = function(_) {
        return arguments.length ? (center = typeof _ === "function" ? _ : constant([+_[0], +_[1]]), circle) : center;
      };
      circle.radius = function(_) {
        return arguments.length ? (radius = typeof _ === "function" ? _ : constant(+_), circle) : radius;
      };
      circle.precision = function(_) {
        return arguments.length ? (precision = typeof _ === "function" ? _ : constant(+_), circle) : precision;
      };
      return circle;
    }
    function clipBuffer() {
      var lines = [],
          line;
      return {
        point: function(x, y) {
          line.push([x, y]);
        },
        lineStart: function() {
          lines.push(line = []);
        },
        lineEnd: noop,
        rejoin: function() {
          if (lines.length > 1)
            lines.push(lines.pop().concat(lines.shift()));
        },
        result: function() {
          var result = lines;
          lines = [];
          line = null;
          return result;
        }
      };
    }
    function clipLine(a, b, x0, y0, x1, y1) {
      var ax = a[0],
          ay = a[1],
          bx = b[0],
          by = b[1],
          t0 = 0,
          t1 = 1,
          dx = bx - ax,
          dy = by - ay,
          r;
      r = x0 - ax;
      if (!dx && r > 0)
        return;
      r /= dx;
      if (dx < 0) {
        if (r < t0)
          return;
        if (r < t1)
          t1 = r;
      } else if (dx > 0) {
        if (r > t1)
          return;
        if (r > t0)
          t0 = r;
      }
      r = x1 - ax;
      if (!dx && r < 0)
        return;
      r /= dx;
      if (dx < 0) {
        if (r > t1)
          return;
        if (r > t0)
          t0 = r;
      } else if (dx > 0) {
        if (r < t0)
          return;
        if (r < t1)
          t1 = r;
      }
      r = y0 - ay;
      if (!dy && r > 0)
        return;
      r /= dy;
      if (dy < 0) {
        if (r < t0)
          return;
        if (r < t1)
          t1 = r;
      } else if (dy > 0) {
        if (r > t1)
          return;
        if (r > t0)
          t0 = r;
      }
      r = y1 - ay;
      if (!dy && r < 0)
        return;
      r /= dy;
      if (dy < 0) {
        if (r > t1)
          return;
        if (r > t0)
          t0 = r;
      } else if (dy > 0) {
        if (r < t0)
          return;
        if (r < t1)
          t1 = r;
      }
      if (t0 > 0)
        a[0] = ax + t0 * dx, a[1] = ay + t0 * dy;
      if (t1 < 1)
        b[0] = ax + t1 * dx, b[1] = ay + t1 * dy;
      return true;
    }
    function pointEqual(a, b) {
      return abs(a[0] - b[0]) < epsilon && abs(a[1] - b[1]) < epsilon;
    }
    function Intersection(point, points, other, entry) {
      this.x = point;
      this.z = points;
      this.o = other;
      this.e = entry;
      this.v = false;
      this.n = this.p = null;
    }
    function clipPolygon(segments, compareIntersection, startInside, interpolate, stream) {
      var subject = [],
          clip = [],
          i,
          n;
      segments.forEach(function(segment) {
        if ((n = segment.length - 1) <= 0)
          return;
        var n,
            p0 = segment[0],
            p1 = segment[n],
            x;
        if (pointEqual(p0, p1)) {
          stream.lineStart();
          for (i = 0; i < n; ++i)
            stream.point((p0 = segment[i])[0], p0[1]);
          stream.lineEnd();
          return;
        }
        subject.push(x = new Intersection(p0, segment, null, true));
        clip.push(x.o = new Intersection(p0, null, x, false));
        subject.push(x = new Intersection(p1, segment, null, false));
        clip.push(x.o = new Intersection(p1, null, x, true));
      });
      if (!subject.length)
        return;
      clip.sort(compareIntersection);
      link(subject);
      link(clip);
      for (i = 0, n = clip.length; i < n; ++i) {
        clip[i].e = startInside = !startInside;
      }
      var start = subject[0],
          points,
          point;
      while (1) {
        var current = start,
            isSubject = true;
        while (current.v)
          if ((current = current.n) === start)
            return;
        points = current.z;
        stream.lineStart();
        do {
          current.v = current.o.v = true;
          if (current.e) {
            if (isSubject) {
              for (i = 0, n = points.length; i < n; ++i)
                stream.point((point = points[i])[0], point[1]);
            } else {
              interpolate(current.x, current.n.x, 1, stream);
            }
            current = current.n;
          } else {
            if (isSubject) {
              points = current.p.z;
              for (i = points.length - 1; i >= 0; --i)
                stream.point((point = points[i])[0], point[1]);
            } else {
              interpolate(current.x, current.p.x, -1, stream);
            }
            current = current.p;
          }
          current = current.o;
          points = current.z;
          isSubject = !isSubject;
        } while (!current.v);
        stream.lineEnd();
      }
    }
    function link(array) {
      if (!(n = array.length))
        return;
      var n,
          i = 0,
          a = array[0],
          b;
      while (++i < n) {
        a.n = b = array[i];
        b.p = a;
        a = b;
      }
      a.n = b = array[0];
      b.p = a;
    }
    var clipMax = 1e9;
    var clipMin = -clipMax;
    function clipExtent(x0, y0, x1, y1) {
      function visible(x, y) {
        return x0 <= x && x <= x1 && y0 <= y && y <= y1;
      }
      function interpolate(from, to, direction, stream) {
        var a = 0,
            a1 = 0;
        if (from == null || (a = corner(from, direction)) !== (a1 = corner(to, direction)) || comparePoint(from, to) < 0 ^ direction > 0) {
          do
            stream.point(a === 0 || a === 3 ? x0 : x1, a > 1 ? y1 : y0);
 while ((a = (a + direction + 4) % 4) !== a1);
        } else {
          stream.point(to[0], to[1]);
        }
      }
      function corner(p, direction) {
        return abs(p[0] - x0) < epsilon ? direction > 0 ? 0 : 3 : abs(p[0] - x1) < epsilon ? direction > 0 ? 2 : 1 : abs(p[1] - y0) < epsilon ? direction > 0 ? 1 : 0 : direction > 0 ? 3 : 2;
      }
      function compareIntersection(a, b) {
        return comparePoint(a.x, b.x);
      }
      function comparePoint(a, b) {
        var ca = corner(a, 1),
            cb = corner(b, 1);
        return ca !== cb ? ca - cb : ca === 0 ? b[1] - a[1] : ca === 1 ? a[0] - b[0] : ca === 2 ? a[1] - b[1] : b[0] - a[0];
      }
      return function(stream) {
        var activeStream = stream,
            bufferStream = clipBuffer(),
            segments,
            polygon,
            ring,
            x__,
            y__,
            v__,
            x_,
            y_,
            v_,
            first,
            clean;
        var clipStream = {
          point: point,
          lineStart: lineStart,
          lineEnd: lineEnd,
          polygonStart: polygonStart,
          polygonEnd: polygonEnd
        };
        function point(x, y) {
          if (visible(x, y))
            activeStream.point(x, y);
        }
        function polygonInside() {
          var winding = 0;
          for (var i = 0,
              n = polygon.length; i < n; ++i) {
            for (var ring = polygon[i],
                j = 1,
                m = ring.length,
                point = ring[0],
                a0,
                a1,
                b0 = point[0],
                b1 = point[1]; j < m; ++j) {
              a0 = b0, a1 = b1, point = ring[j], b0 = point[0], b1 = point[1];
              if (a1 <= y1) {
                if (b1 > y1 && (b0 - a0) * (y1 - a1) > (b1 - a1) * (x0 - a0))
                  ++winding;
              } else {
                if (b1 <= y1 && (b0 - a0) * (y1 - a1) < (b1 - a1) * (x0 - a0))
                  --winding;
              }
            }
          }
          return winding;
        }
        function polygonStart() {
          activeStream = bufferStream, segments = [], polygon = [], clean = true;
        }
        function polygonEnd() {
          var startInside = polygonInside(),
              cleanInside = clean && startInside,
              visible = (segments = d3Array.merge(segments)).length;
          if (cleanInside || visible) {
            stream.polygonStart();
            if (cleanInside) {
              stream.lineStart();
              interpolate(null, null, 1, stream);
              stream.lineEnd();
            }
            if (visible) {
              clipPolygon(segments, compareIntersection, startInside, interpolate, stream);
            }
            stream.polygonEnd();
          }
          activeStream = stream, segments = polygon = ring = null;
        }
        function lineStart() {
          clipStream.point = linePoint;
          if (polygon)
            polygon.push(ring = []);
          first = true;
          v_ = false;
          x_ = y_ = NaN;
        }
        function lineEnd() {
          if (segments) {
            linePoint(x__, y__);
            if (v__ && v_)
              bufferStream.rejoin();
            segments.push(bufferStream.result());
          }
          clipStream.point = point;
          if (v_)
            activeStream.lineEnd();
        }
        function linePoint(x, y) {
          var v = visible(x, y);
          if (polygon)
            ring.push([x, y]);
          if (first) {
            x__ = x, y__ = y, v__ = v;
            first = false;
            if (v) {
              activeStream.lineStart();
              activeStream.point(x, y);
            }
          } else {
            if (v && v_)
              activeStream.point(x, y);
            else {
              var a = [x_ = Math.max(clipMin, Math.min(clipMax, x_)), y_ = Math.max(clipMin, Math.min(clipMax, y_))],
                  b = [x = Math.max(clipMin, Math.min(clipMax, x)), y = Math.max(clipMin, Math.min(clipMax, y))];
              if (clipLine(a, b, x0, y0, x1, y1)) {
                if (!v_) {
                  activeStream.lineStart();
                  activeStream.point(a[0], a[1]);
                }
                activeStream.point(b[0], b[1]);
                if (!v)
                  activeStream.lineEnd();
                clean = false;
              } else if (v) {
                activeStream.lineStart();
                activeStream.point(x, y);
                clean = false;
              }
            }
          }
          x_ = x, y_ = y, v_ = v;
        }
        return clipStream;
      };
    }
    function extent() {
      var x0 = 0,
          y0 = 0,
          x1 = 960,
          y1 = 500,
          cache,
          cacheStream,
          clip;
      return clip = {
        stream: function(stream) {
          return cache && cacheStream === stream ? cache : cache = clipExtent(x0, y0, x1, y1)(cacheStream = stream);
        },
        extent: function(_) {
          return arguments.length ? (x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1], cache = cacheStream = null, clip) : [[x0, y0], [x1, y1]];
        }
      };
    }
    var lengthSum = adder();
    var lambda0$2;
    var sinPhi0$1;
    var cosPhi0$1;
    var lengthStream = {
      sphere: noop,
      point: noop,
      lineStart: lengthLineStart,
      lineEnd: noop,
      polygonStart: noop,
      polygonEnd: noop
    };
    function lengthLineStart() {
      lengthStream.point = lengthPointFirst;
      lengthStream.lineEnd = lengthLineEnd;
    }
    function lengthLineEnd() {
      lengthStream.point = lengthStream.lineEnd = noop;
    }
    function lengthPointFirst(lambda, phi) {
      lambda *= radians, phi *= radians;
      lambda0$2 = lambda, sinPhi0$1 = sin(phi), cosPhi0$1 = cos(phi);
      lengthStream.point = lengthPoint;
    }
    function lengthPoint(lambda, phi) {
      lambda *= radians, phi *= radians;
      var sinPhi = sin(phi),
          cosPhi = cos(phi),
          delta = abs(lambda - lambda0$2),
          cosDelta = cos(delta),
          sinDelta = sin(delta),
          x = cosPhi * sinDelta,
          y = cosPhi0$1 * sinPhi - sinPhi0$1 * cosPhi * cosDelta,
          z = sinPhi0$1 * sinPhi + cosPhi0$1 * cosPhi * cosDelta;
      lengthSum.add(atan2(sqrt(x * x + y * y), z));
      lambda0$2 = lambda, sinPhi0$1 = sinPhi, cosPhi0$1 = cosPhi;
    }
    function length(object) {
      lengthSum.reset();
      geoStream(object, lengthStream);
      return +lengthSum;
    }
    var coordinates = [null, null];
    var object = {
      type: "LineString",
      coordinates: coordinates
    };
    function distance(a, b) {
      coordinates[0] = a;
      coordinates[1] = b;
      return length(object);
    }
    function graticuleX(y0, y1, dy) {
      var y = d3Array.range(y0, y1 - epsilon, dy).concat(y1);
      return function(x) {
        return y.map(function(y) {
          return [x, y];
        });
      };
    }
    function graticuleY(x0, x1, dx) {
      var x = d3Array.range(x0, x1 - epsilon, dx).concat(x1);
      return function(y) {
        return x.map(function(x) {
          return [x, y];
        });
      };
    }
    function graticule() {
      var x1,
          x0,
          X1,
          X0,
          y1,
          y0,
          Y1,
          Y0,
          dx = 10,
          dy = dx,
          DX = 90,
          DY = 360,
          x,
          y,
          X,
          Y,
          precision = 2.5;
      function graticule() {
        return {
          type: "MultiLineString",
          coordinates: lines()
        };
      }
      function lines() {
        return d3Array.range(ceil(X0 / DX) * DX, X1, DX).map(X).concat(d3Array.range(ceil(Y0 / DY) * DY, Y1, DY).map(Y)).concat(d3Array.range(ceil(x0 / dx) * dx, x1, dx).filter(function(x) {
          return abs(x % DX) > epsilon;
        }).map(x)).concat(d3Array.range(ceil(y0 / dy) * dy, y1, dy).filter(function(y) {
          return abs(y % DY) > epsilon;
        }).map(y));
      }
      graticule.lines = function() {
        return lines().map(function(coordinates) {
          return {
            type: "LineString",
            coordinates: coordinates
          };
        });
      };
      graticule.outline = function() {
        return {
          type: "Polygon",
          coordinates: [X(X0).concat(Y(Y1).slice(1), X(X1).reverse().slice(1), Y(Y0).reverse().slice(1))]
        };
      };
      graticule.extent = function(_) {
        if (!arguments.length)
          return graticule.extentMinor();
        return graticule.extentMajor(_).extentMinor(_);
      };
      graticule.extentMajor = function(_) {
        if (!arguments.length)
          return [[X0, Y0], [X1, Y1]];
        X0 = +_[0][0], X1 = +_[1][0];
        Y0 = +_[0][1], Y1 = +_[1][1];
        if (X0 > X1)
          _ = X0, X0 = X1, X1 = _;
        if (Y0 > Y1)
          _ = Y0, Y0 = Y1, Y1 = _;
        return graticule.precision(precision);
      };
      graticule.extentMinor = function(_) {
        if (!arguments.length)
          return [[x0, y0], [x1, y1]];
        x0 = +_[0][0], x1 = +_[1][0];
        y0 = +_[0][1], y1 = +_[1][1];
        if (x0 > x1)
          _ = x0, x0 = x1, x1 = _;
        if (y0 > y1)
          _ = y0, y0 = y1, y1 = _;
        return graticule.precision(precision);
      };
      graticule.step = function(_) {
        if (!arguments.length)
          return graticule.stepMinor();
        return graticule.stepMajor(_).stepMinor(_);
      };
      graticule.stepMajor = function(_) {
        if (!arguments.length)
          return [DX, DY];
        DX = +_[0], DY = +_[1];
        return graticule;
      };
      graticule.stepMinor = function(_) {
        if (!arguments.length)
          return [dx, dy];
        dx = +_[0], dy = +_[1];
        return graticule;
      };
      graticule.precision = function(_) {
        if (!arguments.length)
          return precision;
        precision = +_;
        x = graticuleX(y0, y1, 90);
        y = graticuleY(x0, x1, precision);
        X = graticuleX(Y0, Y1, 90);
        Y = graticuleY(X0, X1, precision);
        return graticule;
      };
      return graticule.extentMajor([[-180, -90 + epsilon], [180, 90 - epsilon]]).extentMinor([[-180, -80 - epsilon], [180, 80 + epsilon]]);
    }
    function interpolate(a, b) {
      var x0 = a[0] * radians,
          y0 = a[1] * radians,
          x1 = b[0] * radians,
          y1 = b[1] * radians,
          cy0 = cos(y0),
          sy0 = sin(y0),
          cy1 = cos(y1),
          sy1 = sin(y1),
          kx0 = cy0 * cos(x0),
          ky0 = cy0 * sin(x0),
          kx1 = cy1 * cos(x1),
          ky1 = cy1 * sin(x1),
          d = 2 * asin(sqrt(haversin(y1 - y0) + cy0 * cy1 * haversin(x1 - x0))),
          k = sin(d);
      var interpolate = d ? function(t) {
        var B = sin(t *= d) / k,
            A = sin(d - t) / k,
            x = A * kx0 + B * kx1,
            y = A * ky0 + B * ky1,
            z = A * sy0 + B * sy1;
        return [atan2(y, x) * degrees, atan2(z, sqrt(x * x + y * y)) * degrees];
      } : function() {
        return [x0 * degrees, y0 * degrees];
      };
      interpolate.distance = d;
      return interpolate;
    }
    function identity(x) {
      return x;
    }
    var areaSum$1 = adder();
    var areaRingSum$1 = adder();
    var x00;
    var y00;
    var x0$1;
    var y0$1;
    var areaStream$1 = {
      point: noop,
      lineStart: noop,
      lineEnd: noop,
      polygonStart: function() {
        areaStream$1.lineStart = areaRingStart$1;
        areaStream$1.lineEnd = areaRingEnd$1;
      },
      polygonEnd: function() {
        areaStream$1.lineStart = areaStream$1.lineEnd = areaStream$1.point = noop;
        areaSum$1.add(abs(areaRingSum$1));
        areaRingSum$1.reset();
      },
      result: function() {
        var area = areaSum$1 / 2;
        areaSum$1.reset();
        return area;
      }
    };
    function areaRingStart$1() {
      areaStream$1.point = areaPointFirst$1;
    }
    function areaPointFirst$1(x, y) {
      areaStream$1.point = areaPoint$1;
      x00 = x0$1 = x, y00 = y0$1 = y;
    }
    function areaPoint$1(x, y) {
      areaRingSum$1.add(y0$1 * x - x0$1 * y);
      x0$1 = x, y0$1 = y;
    }
    function areaRingEnd$1() {
      areaPoint$1(x00, y00);
    }
    var x0$2 = Infinity;
    var y0$2 = x0$2;
    var x1 = -x0$2;
    var y1 = x1;
    var boundsStream$1 = {
      point: boundsPoint$1,
      lineStart: noop,
      lineEnd: noop,
      polygonStart: noop,
      polygonEnd: noop,
      result: function() {
        var bounds = [[x0$2, y0$2], [x1, y1]];
        x1 = y1 = -(y0$2 = x0$2 = Infinity);
        return bounds;
      }
    };
    function boundsPoint$1(x, y) {
      if (x < x0$2)
        x0$2 = x;
      if (x > x1)
        x1 = x;
      if (y < y0$2)
        y0$2 = y;
      if (y > y1)
        y1 = y;
    }
    var X0$1 = 0;
    var Y0$1 = 0;
    var Z0$1 = 0;
    var X1$1 = 0;
    var Y1$1 = 0;
    var Z1$1 = 0;
    var X2$1 = 0;
    var Y2$1 = 0;
    var Z2$1 = 0;
    var x00$1;
    var y00$1;
    var x0$3;
    var y0$3;
    var centroidStream$1 = {
      point: centroidPoint$1,
      lineStart: centroidLineStart$1,
      lineEnd: centroidLineEnd$1,
      polygonStart: function() {
        centroidStream$1.lineStart = centroidRingStart$1;
        centroidStream$1.lineEnd = centroidRingEnd$1;
      },
      polygonEnd: function() {
        centroidStream$1.point = centroidPoint$1;
        centroidStream$1.lineStart = centroidLineStart$1;
        centroidStream$1.lineEnd = centroidLineEnd$1;
      },
      result: function() {
        var centroid = Z2$1 ? [X2$1 / Z2$1, Y2$1 / Z2$1] : Z1$1 ? [X1$1 / Z1$1, Y1$1 / Z1$1] : Z0$1 ? [X0$1 / Z0$1, Y0$1 / Z0$1] : [NaN, NaN];
        X0$1 = Y0$1 = Z0$1 = X1$1 = Y1$1 = Z1$1 = X2$1 = Y2$1 = Z2$1 = 0;
        return centroid;
      }
    };
    function centroidPoint$1(x, y) {
      X0$1 += x;
      Y0$1 += y;
      ++Z0$1;
    }
    function centroidLineStart$1() {
      centroidStream$1.point = centroidPointFirstLine;
    }
    function centroidPointFirstLine(x, y) {
      centroidStream$1.point = centroidPointLine;
      centroidPoint$1(x0$3 = x, y0$3 = y);
    }
    function centroidPointLine(x, y) {
      var dx = x - x0$3,
          dy = y - y0$3,
          z = sqrt(dx * dx + dy * dy);
      X1$1 += z * (x0$3 + x) / 2;
      Y1$1 += z * (y0$3 + y) / 2;
      Z1$1 += z;
      centroidPoint$1(x0$3 = x, y0$3 = y);
    }
    function centroidLineEnd$1() {
      centroidStream$1.point = centroidPoint$1;
    }
    function centroidRingStart$1() {
      centroidStream$1.point = centroidPointFirstRing;
    }
    function centroidRingEnd$1() {
      centroidPointRing(x00$1, y00$1);
    }
    function centroidPointFirstRing(x, y) {
      centroidStream$1.point = centroidPointRing;
      centroidPoint$1(x00$1 = x0$3 = x, y00$1 = y0$3 = y);
    }
    function centroidPointRing(x, y) {
      var dx = x - x0$3,
          dy = y - y0$3,
          z = sqrt(dx * dx + dy * dy);
      X1$1 += z * (x0$3 + x) / 2;
      Y1$1 += z * (y0$3 + y) / 2;
      Z1$1 += z;
      z = y0$3 * x - x0$3 * y;
      X2$1 += z * (x0$3 + x);
      Y2$1 += z * (y0$3 + y);
      Z2$1 += z * 3;
      centroidPoint$1(x0$3 = x, y0$3 = y);
    }
    function PathContext(context) {
      var pointRadius = 4.5;
      var stream = {
        point: point,
        lineStart: function() {
          stream.point = pointLineStart;
        },
        lineEnd: lineEnd,
        polygonStart: function() {
          stream.lineEnd = lineEndPolygon;
        },
        polygonEnd: function() {
          stream.lineEnd = lineEnd;
          stream.point = point;
        },
        pointRadius: function(_) {
          pointRadius = _;
          return stream;
        },
        result: noop
      };
      function point(x, y) {
        context.moveTo(x + pointRadius, y);
        context.arc(x, y, pointRadius, 0, tau);
      }
      function pointLineStart(x, y) {
        context.moveTo(x, y);
        stream.point = pointLine;
      }
      function pointLine(x, y) {
        context.lineTo(x, y);
      }
      function lineEnd() {
        stream.point = point;
      }
      function lineEndPolygon() {
        context.closePath();
      }
      return stream;
    }
    function PathString() {
      var pointCircle = circle$1(4.5),
          string = [];
      var stream = {
        point: point,
        lineStart: lineStart,
        lineEnd: lineEnd,
        polygonStart: function() {
          stream.lineEnd = lineEndPolygon;
        },
        polygonEnd: function() {
          stream.lineEnd = lineEnd;
          stream.point = point;
        },
        pointRadius: function(_) {
          pointCircle = circle$1(_);
          return stream;
        },
        result: function() {
          if (string.length) {
            var result = string.join("");
            string = [];
            return result;
          }
        }
      };
      function point(x, y) {
        string.push("M", x, ",", y, pointCircle);
      }
      function pointLineStart(x, y) {
        string.push("M", x, ",", y);
        stream.point = pointLine;
      }
      function pointLine(x, y) {
        string.push("L", x, ",", y);
      }
      function lineStart() {
        stream.point = pointLineStart;
      }
      function lineEnd() {
        stream.point = point;
      }
      function lineEndPolygon() {
        string.push("Z");
      }
      return stream;
    }
    function circle$1(radius) {
      return "m0," + radius + "a" + radius + "," + radius + " 0 1,1 0," + -2 * radius + "a" + radius + "," + radius + " 0 1,1 0," + 2 * radius + "z";
    }
    function index() {
      var pointRadius = 4.5,
          projection,
          projectionStream,
          context,
          contextStream;
      function path(object) {
        if (object) {
          if (typeof pointRadius === "function")
            contextStream.pointRadius(+pointRadius.apply(this, arguments));
          geoStream(object, projectionStream(contextStream));
        }
        return contextStream.result();
      }
      path.area = function(object) {
        geoStream(object, projectionStream(areaStream$1));
        return areaStream$1.result();
      };
      path.bounds = function(object) {
        geoStream(object, projectionStream(boundsStream$1));
        return boundsStream$1.result();
      };
      path.centroid = function(object) {
        geoStream(object, projectionStream(centroidStream$1));
        return centroidStream$1.result();
      };
      path.projection = function(_) {
        return arguments.length ? (projectionStream = (projection = _) == null ? identity : _.stream, path) : projection;
      };
      path.context = function(_) {
        if (!arguments.length)
          return context;
        contextStream = (context = _) == null ? new PathString : new PathContext(_);
        if (typeof pointRadius !== "function")
          contextStream.pointRadius(pointRadius);
        return path;
      };
      path.pointRadius = function(_) {
        if (!arguments.length)
          return pointRadius;
        pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
        return path;
      };
      return path.projection(null).context(null);
    }
    var sum = adder();
    function polygonContains(polygon, point) {
      var lambda = point[0],
          phi = point[1],
          normal = [sin(lambda), -cos(lambda), 0],
          angle = 0,
          winding = 0;
      sum.reset();
      for (var i = 0,
          n = polygon.length; i < n; ++i) {
        if (!(m = (ring = polygon[i]).length))
          continue;
        var ring,
            m,
            point0 = ring[m - 1],
            lambda0 = point0[0],
            phi0 = point0[1] / 2 + quarterPi,
            sinPhi0 = sin(phi0),
            cosPhi0 = cos(phi0);
        for (var j = 0; j < m; ++j, lambda0 = lambda1, sinPhi0 = sinPhi1, cosPhi0 = cosPhi1, point0 = point1) {
          var point1 = ring[j],
              lambda1 = point1[0],
              phi1 = point1[1] / 2 + quarterPi,
              sinPhi1 = sin(phi1),
              cosPhi1 = cos(phi1),
              delta = lambda1 - lambda0,
              sign = delta >= 0 ? 1 : -1,
              absDelta = sign * delta,
              antimeridian = absDelta > pi,
              k = sinPhi0 * sinPhi1;
          sum.add(atan2(k * sign * sin(absDelta), cosPhi0 * cosPhi1 + k * cos(absDelta)));
          angle += antimeridian ? delta + sign * tau : delta;
          if (antimeridian ^ lambda0 >= lambda ^ lambda1 >= lambda) {
            var arc = cartesianCross(cartesian(point0), cartesian(point1));
            cartesianNormalizeInPlace(arc);
            var intersection = cartesianCross(normal, arc);
            cartesianNormalizeInPlace(intersection);
            var phiArc = (antimeridian ^ delta >= 0 ? -1 : 1) * asin(intersection[2]);
            if (phi > phiArc || phi === phiArc && (arc[0] || arc[1])) {
              winding += antimeridian ^ delta >= 0 ? 1 : -1;
            }
          }
        }
      }
      return (angle < -epsilon || angle < epsilon && sum < -epsilon) ^ (winding & 1);
    }
    function clip(pointVisible, clipLine, interpolate, start) {
      return function(rotate, sink) {
        var line = clipLine(sink),
            rotatedStart = rotate.invert(start[0], start[1]),
            ringBuffer = clipBuffer(),
            ringSink = clipLine(ringBuffer),
            polygonStarted = false,
            polygon,
            segments,
            ring;
        var clip = {
          point: point,
          lineStart: lineStart,
          lineEnd: lineEnd,
          polygonStart: function() {
            clip.point = pointRing;
            clip.lineStart = ringStart;
            clip.lineEnd = ringEnd;
            segments = [];
            polygon = [];
          },
          polygonEnd: function() {
            clip.point = point;
            clip.lineStart = lineStart;
            clip.lineEnd = lineEnd;
            segments = d3Array.merge(segments);
            var startInside = polygonContains(polygon, rotatedStart);
            if (segments.length) {
              if (!polygonStarted)
                sink.polygonStart(), polygonStarted = true;
              clipPolygon(segments, compareIntersection, startInside, interpolate, sink);
            } else if (startInside) {
              if (!polygonStarted)
                sink.polygonStart(), polygonStarted = true;
              sink.lineStart();
              interpolate(null, null, 1, sink);
              sink.lineEnd();
            }
            if (polygonStarted)
              sink.polygonEnd(), polygonStarted = false;
            segments = polygon = null;
          },
          sphere: function() {
            sink.polygonStart();
            sink.lineStart();
            interpolate(null, null, 1, sink);
            sink.lineEnd();
            sink.polygonEnd();
          }
        };
        function point(lambda, phi) {
          var point = rotate(lambda, phi);
          if (pointVisible(lambda = point[0], phi = point[1]))
            sink.point(lambda, phi);
        }
        function pointLine(lambda, phi) {
          var point = rotate(lambda, phi);
          line.point(point[0], point[1]);
        }
        function lineStart() {
          clip.point = pointLine;
          line.lineStart();
        }
        function lineEnd() {
          clip.point = point;
          line.lineEnd();
        }
        function pointRing(lambda, phi) {
          ring.push([lambda, phi]);
          var point = rotate(lambda, phi);
          ringSink.point(point[0], point[1]);
        }
        function ringStart() {
          ringSink.lineStart();
          ring = [];
        }
        function ringEnd() {
          pointRing(ring[0][0], ring[0][1]);
          ringSink.lineEnd();
          var clean = ringSink.clean(),
              ringSegments = ringBuffer.result(),
              i,
              n = ringSegments.length,
              m,
              segment,
              point;
          ring.pop();
          polygon.push(ring);
          ring = null;
          if (!n)
            return;
          if (clean & 1) {
            segment = ringSegments[0];
            if ((m = segment.length - 1) > 0) {
              if (!polygonStarted)
                sink.polygonStart(), polygonStarted = true;
              sink.lineStart();
              for (i = 0; i < m; ++i)
                sink.point((point = segment[i])[0], point[1]);
              sink.lineEnd();
            }
            return;
          }
          if (n > 1 && clean & 2)
            ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));
          segments.push(ringSegments.filter(validSegment));
        }
        return clip;
      };
    }
    function validSegment(segment) {
      return segment.length > 1;
    }
    function compareIntersection(a, b) {
      return ((a = a.x)[0] < 0 ? a[1] - halfPi - epsilon : halfPi - a[1]) - ((b = b.x)[0] < 0 ? b[1] - halfPi - epsilon : halfPi - b[1]);
    }
    var clipAntimeridian = clip(function() {
      return true;
    }, clipAntimeridianLine, clipAntimeridianInterpolate, [-pi, -halfPi]);
    function clipAntimeridianLine(stream) {
      var lambda0 = NaN,
          phi0 = NaN,
          sign0 = NaN,
          clean;
      return {
        lineStart: function() {
          stream.lineStart();
          clean = 1;
        },
        point: function(lambda1, phi1) {
          var sign1 = lambda1 > 0 ? pi : -pi,
              delta = abs(lambda1 - lambda0);
          if (abs(delta - pi) < epsilon) {
            stream.point(lambda0, phi0 = (phi0 + phi1) / 2 > 0 ? halfPi : -halfPi);
            stream.point(sign0, phi0);
            stream.lineEnd();
            stream.lineStart();
            stream.point(sign1, phi0);
            stream.point(lambda1, phi0);
            clean = 0;
          } else if (sign0 !== sign1 && delta >= pi) {
            if (abs(lambda0 - sign0) < epsilon)
              lambda0 -= sign0 * epsilon;
            if (abs(lambda1 - sign1) < epsilon)
              lambda1 -= sign1 * epsilon;
            phi0 = clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1);
            stream.point(sign0, phi0);
            stream.lineEnd();
            stream.lineStart();
            stream.point(sign1, phi0);
            clean = 0;
          }
          stream.point(lambda0 = lambda1, phi0 = phi1);
          sign0 = sign1;
        },
        lineEnd: function() {
          stream.lineEnd();
          lambda0 = phi0 = NaN;
        },
        clean: function() {
          return 2 - clean;
        }
      };
    }
    function clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1) {
      var cosPhi0,
          cosPhi1,
          sinLambda0Lambda1 = sin(lambda0 - lambda1);
      return abs(sinLambda0Lambda1) > epsilon ? atan((sin(phi0) * (cosPhi1 = cos(phi1)) * sin(lambda1) - sin(phi1) * (cosPhi0 = cos(phi0)) * sin(lambda0)) / (cosPhi0 * cosPhi1 * sinLambda0Lambda1)) : (phi0 + phi1) / 2;
    }
    function clipAntimeridianInterpolate(from, to, direction, stream) {
      var phi;
      if (from == null) {
        phi = direction * halfPi;
        stream.point(-pi, phi);
        stream.point(0, phi);
        stream.point(pi, phi);
        stream.point(pi, 0);
        stream.point(pi, -phi);
        stream.point(0, -phi);
        stream.point(-pi, -phi);
        stream.point(-pi, 0);
        stream.point(-pi, phi);
      } else if (abs(from[0] - to[0]) > epsilon) {
        var lambda = from[0] < to[0] ? pi : -pi;
        phi = direction * lambda / 2;
        stream.point(-lambda, phi);
        stream.point(0, phi);
        stream.point(lambda, phi);
      } else {
        stream.point(to[0], to[1]);
      }
    }
    function clipCircle(radius, delta) {
      var cr = cos(radius),
          smallRadius = cr > 0,
          notHemisphere = abs(cr) > epsilon;
      function interpolate(from, to, direction, stream) {
        circleStream(stream, radius, delta, direction, from, to);
      }
      function visible(lambda, phi) {
        return cos(lambda) * cos(phi) > cr;
      }
      function clipLine(stream) {
        var point0,
            c0,
            v0,
            v00,
            clean;
        return {
          lineStart: function() {
            v00 = v0 = false;
            clean = 1;
          },
          point: function(lambda, phi) {
            var point1 = [lambda, phi],
                point2,
                v = visible(lambda, phi),
                c = smallRadius ? v ? 0 : code(lambda, phi) : v ? code(lambda + (lambda < 0 ? pi : -pi), phi) : 0;
            if (!point0 && (v00 = v0 = v))
              stream.lineStart();
            if (v !== v0) {
              point2 = intersect(point0, point1);
              if (pointEqual(point0, point2) || pointEqual(point1, point2)) {
                point1[0] += epsilon;
                point1[1] += epsilon;
                v = visible(point1[0], point1[1]);
              }
            }
            if (v !== v0) {
              clean = 0;
              if (v) {
                stream.lineStart();
                point2 = intersect(point1, point0);
                stream.point(point2[0], point2[1]);
              } else {
                point2 = intersect(point0, point1);
                stream.point(point2[0], point2[1]);
                stream.lineEnd();
              }
              point0 = point2;
            } else if (notHemisphere && point0 && smallRadius ^ v) {
              var t;
              if (!(c & c0) && (t = intersect(point1, point0, true))) {
                clean = 0;
                if (smallRadius) {
                  stream.lineStart();
                  stream.point(t[0][0], t[0][1]);
                  stream.point(t[1][0], t[1][1]);
                  stream.lineEnd();
                } else {
                  stream.point(t[1][0], t[1][1]);
                  stream.lineEnd();
                  stream.lineStart();
                  stream.point(t[0][0], t[0][1]);
                }
              }
            }
            if (v && (!point0 || !pointEqual(point0, point1))) {
              stream.point(point1[0], point1[1]);
            }
            point0 = point1, v0 = v, c0 = c;
          },
          lineEnd: function() {
            if (v0)
              stream.lineEnd();
            point0 = null;
          },
          clean: function() {
            return clean | ((v00 && v0) << 1);
          }
        };
      }
      function intersect(a, b, two) {
        var pa = cartesian(a),
            pb = cartesian(b);
        var n1 = [1, 0, 0],
            n2 = cartesianCross(pa, pb),
            n2n2 = cartesianDot(n2, n2),
            n1n2 = n2[0],
            determinant = n2n2 - n1n2 * n1n2;
        if (!determinant)
          return !two && a;
        var c1 = cr * n2n2 / determinant,
            c2 = -cr * n1n2 / determinant,
            n1xn2 = cartesianCross(n1, n2),
            A = cartesianScale(n1, c1),
            B = cartesianScale(n2, c2);
        cartesianAddInPlace(A, B);
        var u = n1xn2,
            w = cartesianDot(A, u),
            uu = cartesianDot(u, u),
            t2 = w * w - uu * (cartesianDot(A, A) - 1);
        if (t2 < 0)
          return;
        var t = sqrt(t2),
            q = cartesianScale(u, (-w - t) / uu);
        cartesianAddInPlace(q, A);
        q = spherical(q);
        if (!two)
          return q;
        var lambda0 = a[0],
            lambda1 = b[0],
            phi0 = a[1],
            phi1 = b[1],
            z;
        if (lambda1 < lambda0)
          z = lambda0, lambda0 = lambda1, lambda1 = z;
        var delta = lambda1 - lambda0,
            polar = abs(delta - pi) < epsilon,
            meridian = polar || delta < epsilon;
        if (!polar && phi1 < phi0)
          z = phi0, phi0 = phi1, phi1 = z;
        if (meridian ? polar ? phi0 + phi1 > 0 ^ q[1] < (abs(q[0] - lambda0) < epsilon ? phi0 : phi1) : phi0 <= q[1] && q[1] <= phi1 : delta > pi ^ (lambda0 <= q[0] && q[0] <= lambda1)) {
          var q1 = cartesianScale(u, (-w + t) / uu);
          cartesianAddInPlace(q1, A);
          return [q, spherical(q1)];
        }
      }
      function code(lambda, phi) {
        var r = smallRadius ? radius : pi - radius,
            code = 0;
        if (lambda < -r)
          code |= 1;
        else if (lambda > r)
          code |= 2;
        if (phi < -r)
          code |= 4;
        else if (phi > r)
          code |= 8;
        return code;
      }
      return clip(visible, clipLine, interpolate, smallRadius ? [0, -radius] : [-pi, radius - pi]);
    }
    function transform(prototype) {
      return {stream: transform$1(prototype)};
    }
    function transform$1(prototype) {
      function T() {}
      var p = T.prototype = Object.create(Transform.prototype);
      for (var k in prototype)
        p[k] = prototype[k];
      return function(stream) {
        var t = new T;
        t.stream = stream;
        return t;
      };
    }
    function Transform() {}
    Transform.prototype = {
      point: function(x, y) {
        this.stream.point(x, y);
      },
      sphere: function() {
        this.stream.sphere();
      },
      lineStart: function() {
        this.stream.lineStart();
      },
      lineEnd: function() {
        this.stream.lineEnd();
      },
      polygonStart: function() {
        this.stream.polygonStart();
      },
      polygonEnd: function() {
        this.stream.polygonEnd();
      }
    };
    function fit(project, extent, object) {
      var w = extent[1][0] - extent[0][0],
          h = extent[1][1] - extent[0][1],
          clip = project.clipExtent && project.clipExtent();
      project.scale(150).translate([0, 0]);
      if (clip != null)
        project.clipExtent(null);
      geoStream(object, project.stream(boundsStream$1));
      var b = boundsStream$1.result(),
          k = Math.min(w / (b[1][0] - b[0][0]), h / (b[1][1] - b[0][1])),
          x = +extent[0][0] + (w - k * (b[1][0] + b[0][0])) / 2,
          y = +extent[0][1] + (h - k * (b[1][1] + b[0][1])) / 2;
      if (clip != null)
        project.clipExtent(clip);
      return project.scale(k * 150).translate([x, y]);
    }
    function fitSize(project) {
      return function(size, object) {
        return fit(project, [[0, 0], size], object);
      };
    }
    function fitExtent(project) {
      return function(extent, object) {
        return fit(project, extent, object);
      };
    }
    var maxDepth = 16;
    var cosMinDistance = cos(30 * radians);
    function resample(project, delta2) {
      return +delta2 ? resample$1(project, delta2) : resampleNone(project);
    }
    function resampleNone(project) {
      return transform$1({point: function(x, y) {
          x = project(x, y);
          this.stream.point(x[0], x[1]);
        }});
    }
    function resample$1(project, delta2) {
      function resampleLineTo(x0, y0, lambda0, a0, b0, c0, x1, y1, lambda1, a1, b1, c1, depth, stream) {
        var dx = x1 - x0,
            dy = y1 - y0,
            d2 = dx * dx + dy * dy;
        if (d2 > 4 * delta2 && depth--) {
          var a = a0 + a1,
              b = b0 + b1,
              c = c0 + c1,
              m = sqrt(a * a + b * b + c * c),
              phi2 = asin(c /= m),
              lambda2 = abs(abs(c) - 1) < epsilon || abs(lambda0 - lambda1) < epsilon ? (lambda0 + lambda1) / 2 : atan2(b, a),
              p = project(lambda2, phi2),
              x2 = p[0],
              y2 = p[1],
              dx2 = x2 - x0,
              dy2 = y2 - y0,
              dz = dy * dx2 - dx * dy2;
          if (dz * dz / d2 > delta2 || abs((dx * dx2 + dy * dy2) / d2 - 0.5) > 0.3 || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) {
            resampleLineTo(x0, y0, lambda0, a0, b0, c0, x2, y2, lambda2, a /= m, b /= m, c, depth, stream);
            stream.point(x2, y2);
            resampleLineTo(x2, y2, lambda2, a, b, c, x1, y1, lambda1, a1, b1, c1, depth, stream);
          }
        }
      }
      return function(stream) {
        var lambda00,
            x00,
            y00,
            a00,
            b00,
            c00,
            lambda0,
            x0,
            y0,
            a0,
            b0,
            c0;
        var resampleStream = {
          point: point,
          lineStart: lineStart,
          lineEnd: lineEnd,
          polygonStart: function() {
            stream.polygonStart();
            resampleStream.lineStart = ringStart;
          },
          polygonEnd: function() {
            stream.polygonEnd();
            resampleStream.lineStart = lineStart;
          }
        };
        function point(x, y) {
          x = project(x, y);
          stream.point(x[0], x[1]);
        }
        function lineStart() {
          x0 = NaN;
          resampleStream.point = linePoint;
          stream.lineStart();
        }
        function linePoint(lambda, phi) {
          var c = cartesian([lambda, phi]),
              p = project(lambda, phi);
          resampleLineTo(x0, y0, lambda0, a0, b0, c0, x0 = p[0], y0 = p[1], lambda0 = lambda, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
          stream.point(x0, y0);
        }
        function lineEnd() {
          resampleStream.point = point;
          stream.lineEnd();
        }
        function ringStart() {
          lineStart();
          resampleStream.point = ringPoint;
          resampleStream.lineEnd = ringEnd;
        }
        function ringPoint(lambda, phi) {
          linePoint(lambda00 = lambda, phi), x00 = x0, y00 = y0, a00 = a0, b00 = b0, c00 = c0;
          resampleStream.point = linePoint;
        }
        function ringEnd() {
          resampleLineTo(x0, y0, lambda0, a0, b0, c0, x00, y00, lambda00, a00, b00, c00, maxDepth, stream);
          resampleStream.lineEnd = lineEnd;
          lineEnd();
        }
        return resampleStream;
      };
    }
    var transformRadians = transform$1({point: function(x, y) {
        this.stream.point(x * radians, y * radians);
      }});
    function projection(project) {
      return projectionMutator(function() {
        return project;
      })();
    }
    function projectionMutator(projectAt) {
      var project,
          k = 150,
          x = 480,
          y = 250,
          dx,
          dy,
          lambda = 0,
          phi = 0,
          deltaLambda = 0,
          deltaPhi = 0,
          deltaGamma = 0,
          rotate,
          projectRotate,
          theta = null,
          preclip = clipAntimeridian,
          x0 = null,
          y0,
          x1,
          y1,
          postclip = identity,
          delta2 = 0.5,
          projectResample = resample(projectTransform, delta2),
          cache,
          cacheStream;
      function projection(point) {
        point = projectRotate(point[0] * radians, point[1] * radians);
        return [point[0] * k + dx, dy - point[1] * k];
      }
      function invert(point) {
        point = projectRotate.invert((point[0] - dx) / k, (dy - point[1]) / k);
        return point && [point[0] * degrees, point[1] * degrees];
      }
      function projectTransform(x, y) {
        return x = project(x, y), [x[0] * k + dx, dy - x[1] * k];
      }
      projection.stream = function(stream) {
        return cache && cacheStream === stream ? cache : cache = transformRadians(preclip(rotate, projectResample(postclip(cacheStream = stream))));
      };
      projection.clipAngle = function(_) {
        return arguments.length ? (preclip = +_ ? clipCircle(theta = _ * radians, 6 * radians) : (theta = null, clipAntimeridian), reset()) : theta * degrees;
      };
      projection.clipExtent = function(_) {
        return arguments.length ? (postclip = _ == null ? (x0 = y0 = x1 = y1 = null, identity) : clipExtent(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]), reset()) : x0 == null ? null : [[x0, y0], [x1, y1]];
      };
      projection.scale = function(_) {
        return arguments.length ? (k = +_, recenter()) : k;
      };
      projection.translate = function(_) {
        return arguments.length ? (x = +_[0], y = +_[1], recenter()) : [x, y];
      };
      projection.center = function(_) {
        return arguments.length ? (lambda = _[0] % 360 * radians, phi = _[1] % 360 * radians, recenter()) : [lambda * degrees, phi * degrees];
      };
      projection.rotate = function(_) {
        return arguments.length ? (deltaLambda = _[0] % 360 * radians, deltaPhi = _[1] % 360 * radians, deltaGamma = _.length > 2 ? _[2] % 360 * radians : 0, recenter()) : [deltaLambda * degrees, deltaPhi * degrees, deltaGamma * degrees];
      };
      projection.precision = function(_) {
        return arguments.length ? (projectResample = resample(projectTransform, delta2 = _ * _), reset()) : sqrt(delta2);
      };
      projection.fitExtent = fitExtent(projection);
      projection.fitSize = fitSize(projection);
      function recenter() {
        projectRotate = compose(rotate = rotateRadians(deltaLambda, deltaPhi, deltaGamma), project);
        var center = project(lambda, phi);
        dx = x - center[0] * k;
        dy = y + center[1] * k;
        return reset();
      }
      function reset() {
        cache = cacheStream = null;
        return projection;
      }
      return function() {
        project = projectAt.apply(this, arguments);
        projection.invert = project.invert && invert;
        return recenter();
      };
    }
    function conicProjection(projectAt) {
      var phi0 = 0,
          phi1 = pi / 3,
          m = projectionMutator(projectAt),
          p = m(phi0, phi1);
      p.parallels = function(_) {
        return arguments.length ? m(phi0 = _[0] * radians, phi1 = _[1] * radians) : [phi0 * degrees, phi1 * degrees];
      };
      return p;
    }
    function conicEqualAreaRaw(y0, y1) {
      var sy0 = sin(y0),
          n = (sy0 + sin(y1)) / 2,
          c = 1 + sy0 * (2 * n - sy0),
          r0 = sqrt(c) / n;
      function project(x, y) {
        var r = sqrt(c - 2 * n * sin(y)) / n;
        return [r * sin(x *= n), r0 - r * cos(x)];
      }
      project.invert = function(x, y) {
        var r0y = r0 - y;
        return [atan2(x, r0y) / n, asin((c - (x * x + r0y * r0y) * n * n) / (2 * n))];
      };
      return project;
    }
    function conicEqualArea() {
      return conicProjection(conicEqualAreaRaw).scale(155.424).center([0, 33.6442]);
    }
    function albers() {
      return conicEqualArea().parallels([29.5, 45.5]).scale(1070).translate([480, 250]).rotate([96, 0]).center([-0.6, 38.7]);
    }
    function multiplex(streams) {
      var n = streams.length;
      return {
        point: function(x, y) {
          var i = -1;
          while (++i < n)
            streams[i].point(x, y);
        },
        sphere: function() {
          var i = -1;
          while (++i < n)
            streams[i].sphere();
        },
        lineStart: function() {
          var i = -1;
          while (++i < n)
            streams[i].lineStart();
        },
        lineEnd: function() {
          var i = -1;
          while (++i < n)
            streams[i].lineEnd();
        },
        polygonStart: function() {
          var i = -1;
          while (++i < n)
            streams[i].polygonStart();
        },
        polygonEnd: function() {
          var i = -1;
          while (++i < n)
            streams[i].polygonEnd();
        }
      };
    }
    function albersUsa() {
      var cache,
          cacheStream,
          lower48 = albers(),
          lower48Point,
          alaska = conicEqualArea().rotate([154, 0]).center([-2, 58.5]).parallels([55, 65]),
          alaskaPoint,
          hawaii = conicEqualArea().rotate([157, 0]).center([-3, 19.9]).parallels([8, 18]),
          hawaiiPoint,
          point,
          pointStream = {point: function(x, y) {
              point = [x, y];
            }};
      function albersUsa(coordinates) {
        var x = coordinates[0],
            y = coordinates[1];
        return point = null, (lower48Point.point(x, y), point) || (alaskaPoint.point(x, y), point) || (hawaiiPoint.point(x, y), point);
      }
      albersUsa.invert = function(coordinates) {
        var k = lower48.scale(),
            t = lower48.translate(),
            x = (coordinates[0] - t[0]) / k,
            y = (coordinates[1] - t[1]) / k;
        return (y >= 0.120 && y < 0.234 && x >= -0.425 && x < -0.214 ? alaska : y >= 0.166 && y < 0.234 && x >= -0.214 && x < -0.115 ? hawaii : lower48).invert(coordinates);
      };
      albersUsa.stream = function(stream) {
        return cache && cacheStream === stream ? cache : cache = multiplex([lower48.stream(cacheStream = stream), alaska.stream(stream), hawaii.stream(stream)]);
      };
      albersUsa.precision = function(_) {
        if (!arguments.length)
          return lower48.precision();
        lower48.precision(_), alaska.precision(_), hawaii.precision(_);
        return albersUsa;
      };
      albersUsa.scale = function(_) {
        if (!arguments.length)
          return lower48.scale();
        lower48.scale(_), alaska.scale(_ * 0.35), hawaii.scale(_);
        return albersUsa.translate(lower48.translate());
      };
      albersUsa.translate = function(_) {
        if (!arguments.length)
          return lower48.translate();
        var k = lower48.scale(),
            x = +_[0],
            y = +_[1];
        lower48Point = lower48.translate(_).clipExtent([[x - 0.455 * k, y - 0.238 * k], [x + 0.455 * k, y + 0.238 * k]]).stream(pointStream);
        alaskaPoint = alaska.translate([x - 0.307 * k, y + 0.201 * k]).clipExtent([[x - 0.425 * k + epsilon, y + 0.120 * k + epsilon], [x - 0.214 * k - epsilon, y + 0.234 * k - epsilon]]).stream(pointStream);
        hawaiiPoint = hawaii.translate([x - 0.205 * k, y + 0.212 * k]).clipExtent([[x - 0.214 * k + epsilon, y + 0.166 * k + epsilon], [x - 0.115 * k - epsilon, y + 0.234 * k - epsilon]]).stream(pointStream);
        return albersUsa;
      };
      albersUsa.fitExtent = fitExtent(albersUsa);
      albersUsa.fitSize = fitSize(albersUsa);
      return albersUsa.scale(1070);
    }
    function azimuthalRaw(scale) {
      return function(x, y) {
        var cx = cos(x),
            cy = cos(y),
            k = scale(cx * cy);
        return [k * cy * sin(x), k * sin(y)];
      };
    }
    function azimuthalInvert(angle) {
      return function(x, y) {
        var z = sqrt(x * x + y * y),
            c = angle(z),
            sc = sin(c),
            cc = cos(c);
        return [atan2(x * sc, z * cc), asin(z && y * sc / z)];
      };
    }
    var azimuthalEqualAreaRaw = azimuthalRaw(function(cxcy) {
      return sqrt(2 / (1 + cxcy));
    });
    azimuthalEqualAreaRaw.invert = azimuthalInvert(function(z) {
      return 2 * asin(z / 2);
    });
    function azimuthalEqualArea() {
      return projection(azimuthalEqualAreaRaw).scale(124.75).clipAngle(180 - 1e-3);
    }
    var azimuthalEquidistantRaw = azimuthalRaw(function(c) {
      return (c = acos(c)) && c / sin(c);
    });
    azimuthalEquidistantRaw.invert = azimuthalInvert(function(z) {
      return z;
    });
    function azimuthalEquidistant() {
      return projection(azimuthalEquidistantRaw).scale(79.4188).clipAngle(180 - 1e-3);
    }
    function mercatorRaw(lambda, phi) {
      return [lambda, log(tan((halfPi + phi) / 2))];
    }
    mercatorRaw.invert = function(x, y) {
      return [x, 2 * atan(exp(y)) - halfPi];
    };
    function mercator() {
      return mercatorProjection(mercatorRaw).scale(961 / tau);
    }
    function mercatorProjection(project) {
      var m = projection(project),
          scale = m.scale,
          translate = m.translate,
          clipExtent = m.clipExtent,
          clipAuto;
      m.scale = function(_) {
        return arguments.length ? (scale(_), clipAuto && m.clipExtent(null), m) : scale();
      };
      m.translate = function(_) {
        return arguments.length ? (translate(_), clipAuto && m.clipExtent(null), m) : translate();
      };
      m.clipExtent = function(_) {
        if (!arguments.length)
          return clipAuto ? null : clipExtent();
        if (clipAuto = _ == null) {
          var k = pi * scale(),
              t = translate();
          _ = [[t[0] - k, t[1] - k], [t[0] + k, t[1] + k]];
        }
        clipExtent(_);
        return m;
      };
      return m.clipExtent(null);
    }
    function tany(y) {
      return tan((halfPi + y) / 2);
    }
    function conicConformalRaw(y0, y1) {
      var cy0 = cos(y0),
          n = y0 === y1 ? sin(y0) : log(cy0 / cos(y1)) / log(tany(y1) / tany(y0)),
          f = cy0 * pow(tany(y0), n) / n;
      if (!n)
        return mercatorRaw;
      function project(x, y) {
        if (f > 0) {
          if (y < -halfPi + epsilon)
            y = -halfPi + epsilon;
        } else {
          if (y > halfPi - epsilon)
            y = halfPi - epsilon;
        }
        var r = f / pow(tany(y), n);
        return [r * sin(n * x), f - r * cos(n * x)];
      }
      project.invert = function(x, y) {
        var fy = f - y,
            r = sign(n) * sqrt(x * x + fy * fy);
        return [atan2(x, fy) / n, 2 * atan(pow(f / r, 1 / n)) - halfPi];
      };
      return project;
    }
    function conicConformal() {
      return conicProjection(conicConformalRaw).scale(109.5).parallels([30, 30]);
    }
    function equirectangularRaw(lambda, phi) {
      return [lambda, phi];
    }
    equirectangularRaw.invert = equirectangularRaw;
    function equirectangular() {
      return projection(equirectangularRaw).scale(152.63);
    }
    function conicEquidistantRaw(y0, y1) {
      var cy0 = cos(y0),
          n = y0 === y1 ? sin(y0) : (cy0 - cos(y1)) / (y1 - y0),
          g = cy0 / n + y0;
      if (abs(n) < epsilon)
        return equirectangularRaw;
      function project(x, y) {
        var gy = g - y,
            nx = n * x;
        return [gy * sin(nx), g - gy * cos(nx)];
      }
      project.invert = function(x, y) {
        var gy = g - y;
        return [atan2(x, gy) / n, g - sign(n) * sqrt(x * x + gy * gy)];
      };
      return project;
    }
    function conicEquidistant() {
      return conicProjection(conicEquidistantRaw).scale(131.154).center([0, 13.9389]);
    }
    function gnomonicRaw(x, y) {
      var cy = cos(y),
          k = cos(x) * cy;
      return [cy * sin(x) / k, sin(y) / k];
    }
    gnomonicRaw.invert = azimuthalInvert(atan);
    function gnomonic() {
      return projection(gnomonicRaw).scale(144.049).clipAngle(60);
    }
    function orthographicRaw(x, y) {
      return [cos(y) * sin(x), sin(y)];
    }
    orthographicRaw.invert = azimuthalInvert(asin);
    function orthographic() {
      return projection(orthographicRaw).scale(249.5).clipAngle(90 + epsilon);
    }
    function stereographicRaw(x, y) {
      var cy = cos(y),
          k = 1 + cos(x) * cy;
      return [cy * sin(x) / k, sin(y) / k];
    }
    stereographicRaw.invert = azimuthalInvert(function(z) {
      return 2 + atan(z);
    });
    function stereographic() {
      return projection(stereographicRaw).scale(250).clipAngle(142);
    }
    function transverseMercatorRaw(lambda, phi) {
      return [log(tan((halfPi + phi) / 2)), -lambda];
    }
    transverseMercatorRaw.invert = function(x, y) {
      return [-y, 2 * atan(exp(x)) - halfPi];
    };
    function transverseMercator() {
      var m = mercatorProjection(transverseMercatorRaw),
          center = m.center,
          rotate = m.rotate;
      m.center = function(_) {
        return arguments.length ? center([-_[1], _[0]]) : (_ = center(), [_[1], -_[0]]);
      };
      m.rotate = function(_) {
        return arguments.length ? rotate([_[0], _[1], _.length > 2 ? _[2] + 90 : 90]) : (_ = rotate(), [_[0], _[1], _[2] - 90]);
      };
      return rotate([0, 0, 90]).scale(159.155);
    }
    exports.geoArea = area;
    exports.geoBounds = bounds;
    exports.geoCentroid = centroid;
    exports.geoCircle = circle;
    exports.geoClipExtent = extent;
    exports.geoDistance = distance;
    exports.geoGraticule = graticule;
    exports.geoInterpolate = interpolate;
    exports.geoLength = length;
    exports.geoPath = index;
    exports.geoAlbers = albers;
    exports.geoAlbersUsa = albersUsa;
    exports.geoAzimuthalEqualArea = azimuthalEqualArea;
    exports.geoAzimuthalEqualAreaRaw = azimuthalEqualAreaRaw;
    exports.geoAzimuthalEquidistant = azimuthalEquidistant;
    exports.geoAzimuthalEquidistantRaw = azimuthalEquidistantRaw;
    exports.geoConicConformal = conicConformal;
    exports.geoConicConformalRaw = conicConformalRaw;
    exports.geoConicEqualArea = conicEqualArea;
    exports.geoConicEqualAreaRaw = conicEqualAreaRaw;
    exports.geoConicEquidistant = conicEquidistant;
    exports.geoConicEquidistantRaw = conicEquidistantRaw;
    exports.geoEquirectangular = equirectangular;
    exports.geoEquirectangularRaw = equirectangularRaw;
    exports.geoGnomonic = gnomonic;
    exports.geoGnomonicRaw = gnomonicRaw;
    exports.geoProjection = projection;
    exports.geoProjectionMutator = projectionMutator;
    exports.geoMercator = mercator;
    exports.geoMercatorRaw = mercatorRaw;
    exports.geoOrthographic = orthographic;
    exports.geoOrthographicRaw = orthographicRaw;
    exports.geoStereographic = stereographic;
    exports.geoStereographicRaw = stereographicRaw;
    exports.geoTransverseMercator = transverseMercator;
    exports.geoTransverseMercatorRaw = transverseMercatorRaw;
    exports.geoRotation = rotation;
    exports.geoStream = geoStream;
    exports.geoTransform = transform;
    Object.defineProperty(exports, '__esModule', {value: true});
  }));
})(require('buffer').Buffer);
