(function (root) {
  // Machado, Oliveira and Fernandes (2009) simulation matrices, severity 0.0 to 1.0 in steps of 0.1,
  // copied from the authors' page (inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation). Index = severity * 10.
  var MATS = {"protan":[[[1.0,0.0,-0.0],[0.0,1.0,0.0],[-0.0,-0.0,1.0]],[[0.856167,0.182038,-0.038205],[0.029342,0.955115,0.015544],[-0.00288,-0.001563,1.004443]],[[0.734766,0.334872,-0.069637],[0.05184,0.919198,0.028963],[-0.004928,-0.004209,1.009137]],[[0.630323,0.465641,-0.095964],[0.069181,0.890046,0.040773],[-0.006308,-0.007724,1.014032]],[[0.539009,0.579343,-0.118352],[0.082546,0.866121,0.051332],[-0.007136,-0.011959,1.019095]],[[0.458064,0.679578,-0.137642],[0.092785,0.846313,0.060902],[-0.007494,-0.016807,1.024301]],[[0.38545,0.769005,-0.154455],[0.100526,0.829802,0.069673],[-0.007442,-0.02219,1.029632]],[[0.319627,0.849633,-0.169261],[0.106241,0.815969,0.07779],[-0.007025,-0.028051,1.035076]],[[0.259411,0.923008,-0.18242],[0.110296,0.80434,0.085364],[-0.006276,-0.034346,1.040622]],[[0.203876,0.990338,-0.194214],[0.112975,0.794542,0.092483],[-0.005222,-0.041043,1.046265]],[[0.152286,1.052583,-0.204868],[0.114503,0.786281,0.099216],[-0.003882,-0.048116,1.051998]]],"deutan":[[[1.0,0.0,-0.0],[0.0,1.0,0.0],[-0.0,-0.0,1.0]],[[0.866435,0.177704,-0.044139],[0.049567,0.939063,0.01137],[-0.003453,0.007233,0.99622]],[[0.760729,0.319078,-0.079807],[0.090568,0.889315,0.020117],[-0.006027,0.013325,0.992702]],[[0.675425,0.43385,-0.109275],[0.125303,0.847755,0.026942],[-0.00795,0.018572,0.989378]],[[0.605511,0.52856,-0.134071],[0.155318,0.812366,0.032316],[-0.009376,0.023176,0.9862]],[[0.547494,0.607765,-0.155259],[0.181692,0.781742,0.036566],[-0.01041,0.027275,0.983136]],[[0.498864,0.674741,-0.173604],[0.205199,0.754872,0.039929],[-0.011131,0.030969,0.980162]],[[0.457771,0.731899,-0.18967],[0.226409,0.731012,0.042579],[-0.011595,0.034333,0.977261]],[[0.422823,0.781057,-0.203881],[0.245752,0.709602,0.044646],[-0.011843,0.037423,0.974421]],[[0.392952,0.82361,-0.216562],[0.263559,0.69021,0.046232],[-0.01191,0.040281,0.97163]],[[0.367322,0.860646,-0.227968],[0.280085,0.672501,0.047413],[-0.01182,0.04294,0.968881]]],"tritan":[[[1.0,0.0,-0.0],[0.0,1.0,0.0],[-0.0,-0.0,1.0]],[[0.92667,0.092514,-0.019184],[0.021191,0.964503,0.014306],[0.008437,0.054813,0.93675]],[[0.89572,0.13333,-0.02905],[0.029997,0.9454,0.024603],[0.013027,0.104707,0.882266]],[[0.905871,0.127791,-0.033662],[0.026856,0.941251,0.031893],[0.01341,0.148296,0.838294]],[[0.948035,0.08949,-0.037526],[0.014364,0.946792,0.038844],[0.010853,0.193991,0.795156]],[[1.017277,0.027029,-0.044306],[-0.006113,0.958479,0.047634],[0.006379,0.248708,0.744913]],[[1.104996,-0.046633,-0.058363],[-0.032137,0.971635,0.060503],[0.001336,0.317922,0.680742]],[[1.193214,-0.109812,-0.083402],[-0.058496,0.97941,0.079086],[-0.002346,0.403492,0.598854]],[[1.257728,-0.139648,-0.118081],[-0.078003,0.975409,0.102594],[-0.003316,0.501214,0.502102]],[[1.278864,-0.125333,-0.153531],[-0.084748,0.957674,0.127074],[-0.000989,0.601151,0.399838]],[[1.255528,-0.076749,-0.178779],[-0.078411,0.930809,0.147602],[0.004733,0.691367,0.3039]]]};
  var TYPES = ['protan', 'deutan', 'tritan'];
  function parseHex(s) {
    s = String(s).trim().replace(/^#/, '');
    if (/^[0-9a-fA-F]{3}$/.test(s)) s = s.replace(/(.)/g, '$1$1');
    if (!/^[0-9a-fA-F]{6}$/.test(s)) return null;
    return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
  }
  function toHex(rgb) { return '#' + rgb.map(function (v) { var h = Math.round(v).toString(16); return (h.length < 2 ? '0' : '') + h; }).join(''); }
  function lin(c) { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  function unlin(v) { v = Math.max(0, Math.min(1, v)); return 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055); }
  // matrix for any severity in [0,1]: linear blend of the two nearest tabulated matrices (the page suggests this)
  function matrix(type, sev) {
    var set = MATS[type]; if (!set) throw new Error('unknown type ' + type);
    sev = Math.max(0, Math.min(1, sev)); var x = sev * 10, i = Math.floor(x + 1e-9), w = x - i;
    if (i >= 10) return set[10].map(function (r) { return r.slice(); });
    if (w < 1e-9) return set[i].map(function (r) { return r.slice(); });
    return set[i].map(function (r, k) { return r.map(function (v, j) { return v * (1 - w) + set[i + 1][k][j] * w; }); });
  }
  // opts.linear (default true): apply the matrix to linearised sRGB, otherwise directly to the 0-255 values
  function simulate(rgb, type, sev, opts) {
    var useLin = !(opts && opts.linear === false), M = matrix(type, sev);
    var v = rgb.map(function (c) { return useLin ? lin(c) : c / 255; });
    return [0, 1, 2].map(function (k) { var s = M[k][0] * v[0] + M[k][1] * v[1] + M[k][2] * v[2]; return useLin ? unlin(s) : Math.max(0, Math.min(1, s)) * 255; });
  }
  // CIE L*a*b* (D65, 2 degrees) and CIE76 distance
  function lab(rgb) {
    var r = lin(rgb[0]), g = lin(rgb[1]), b = lin(rgb[2]);
    var X = 0.4124564 * r + 0.3575761 * g + 0.1804375 * b, Y = 0.2126729 * r + 0.7151522 * g + 0.0721750 * b, Z = 0.0193339 * r + 0.1191920 * g + 0.9503041 * b;
    function f(t) { return t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116; }
    var fx = f(X / 0.95047), fy = f(Y), fz = f(Z / 1.08883);
    return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
  }
  function deltaE(a, b) { var p = lab(a), q = lab(b); return Math.sqrt(Math.pow(p[0] - q[0], 2) + Math.pow(p[1] - q[1], 2) + Math.pow(p[2] - q[2], 2)); }
  // pairs of palette colors that look different normally but fall under `limit` (CIE76) after simulation
  function clashes(colors, type, sev, opts, limit) {
    limit = limit || 10; var out = [], sim = colors.map(function (c) { return simulate(c, type, sev, opts); }), i, j;
    for (i = 0; i < colors.length; i++) for (j = i + 1; j < colors.length; j++) {
      var before = deltaE(colors[i], colors[j]), after = deltaE(sim[i], sim[j]);
      if (after < limit) out.push({ a: i, b: j, before: before, after: after, wasDistinct: before >= limit });
    }
    return out;
  }
  var api = { TYPES: TYPES, MATS: MATS, parseHex: parseHex, toHex: toHex, matrix: matrix, simulate: simulate, lab: lab, deltaE: deltaE, clashes: clashes, lin: lin, unlin: unlin };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.HueClash = api;
})(typeof window !== 'undefined' ? window : this);
