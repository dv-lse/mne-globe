/* */ 
"format cjs";
import "projection";

function laskowski(λ, φ) {
  var λ2 = λ * λ, φ2 = φ * φ;
  return [
    λ * (.975534 + φ2 * (-.119161 + λ2 * -.0143059 + φ2 * -.0547009)),
    φ * (1.00384 + λ2 * (.0802894 + φ2 * -.02855 + λ2 * .000199025) + φ2 * (.0998909 + φ2 * -.0491032))
  ];
}

laskowski.invert = function(x, y) {
  var λ = sgn(x) * π,
      φ = y / 2,
      i = 50;
  do {
    var λ2 = λ * λ,
        φ2 = φ * φ,
        λφ = λ * φ,
        fx = λ * (.975534 + φ2 * (-.119161 + λ2 * -.0143059 + φ2 * -.0547009)) - x,
        fy = φ * (1.00384 + λ2 * (.0802894 + φ2 * -.02855 + λ2 * .000199025) + φ2 * (.0998909 + φ2 * -.0491032)) - y,
        δxδλ = .975534 - φ2 * (.119161 + 3 * λ2 * .0143059 + φ2 * .0547009),
        δxδφ = -λφ * (2 * .119161 + 4 * .0547009 * φ2 + 2 * .0143059 * λ2),
        δyδλ = λφ * (2 * .0802894 + 4 * .000199025 * λ2 + 2 * -.02855 * φ2),
        δyδφ = 1.00384 + λ2 * (.0802894 + .000199025 * λ2) + φ2 * (3 * (.0998909 - .02855 * λ2) - 5 * .0491032 * φ2),
        denominator = δxδφ * δyδλ - δyδφ * δxδλ,
        δλ = (fy * δxδφ - fx * δyδφ) / denominator,
        δφ = (fx * δyδλ - fy * δxδλ) / denominator;
    λ -= δλ, φ -= δφ;
  } while ((Math.abs(δλ) > ε || Math.abs(δφ) > ε) && --i > 0);
  return i && [λ, φ];
};

(d3.geo.laskowski = function() { return projection(laskowski); }).raw = laskowski;
