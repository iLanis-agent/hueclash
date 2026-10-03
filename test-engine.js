var H = require('./engine.js'); var fails = 0, n = 0;
function eq(a, b, m) { n++; if (JSON.stringify(a) !== JSON.stringify(b)) { fails++; console.log('FAIL', m, JSON.stringify(a), JSON.stringify(b)); } }
function near(a, b, tol, m) { n++; if (!(Math.abs(a - b) <= tol)) { fails++; console.log('FAIL', m, a, b); } }
// matrices copied from Machado, Oliveira and Fernandes (2009) page: 11 severities per type, identity at 0.0
H.TYPES.forEach(function (t) {
  eq(H.MATS[t].length, 11, t + ' has 11 severities'); eq(H.MATS[t][0], [[1, 0, 0], [0, 1, 0], [0, 0, 1]].map(function (r, i) { return r.map(function (v, j) { return H.MATS[t][0][i][j] === v ? v : 'x'; }); }), t + ' sev 0 is identity');
  H.MATS[t].forEach(function (M, s) { M.forEach(function (row, k) { near(row[0] + row[1] + row[2], 1, 0.00002, t + ' ' + s + ' row ' + k + ' sums to 1 (white is preserved)'); }); });
});
// published values at severity 1.0 and 0.1
eq(H.MATS.protan[10][0], [0.152286, 1.052583, -0.204868], 'protanopia row 1'); eq(H.MATS.deutan[10][1], [0.280085, 0.672501, 0.047413], 'deuteranopia row 2'); eq(H.MATS.tritan[10][2], [0.004733, 0.691367, 0.3039], 'tritanopia row 3');
eq(H.MATS.deutan[1][0], [0.866435, 0.177704, -0.044139], 'deuteranomaly 0.1'); eq(H.MATS.protan[1][0], [0.856167, 0.182038, -0.038205], 'protanomaly 0.1');
// grays do not change, at any severity, in either mode
for (var g = 0; g <= 255; g += 15) H.TYPES.forEach(function (t) { [0, 0.3, 0.5, 0.873, 1].forEach(function (s) { var o = H.simulate([g, g, g], t, s); near(o[0], g, 0.6, 'gray r ' + t + g); near(o[1], g, 0.6, 'gray g'); near(o[2], g, 0.6, 'gray b'); var p = H.simulate([g, g, g], t, s, { linear: false }); near(p[1], g, 0.6, 'gray raw'); }); });
// severity 0 changes nothing
H.TYPES.forEach(function (t) { eq(H.simulate([200, 30, 90], t, 0).map(Math.round), [200, 30, 90], 'sev 0 identity ' + t); });
// interpolation: the page gives severity 0.873 as 0.8 and 0.9 with weight 0.73
var M = H.matrix('deutan', 0.873); for (var r = 0; r < 3; r++) for (var c = 0; c < 3; c++) near(M[r][c], H.MATS.deutan[8][r][c] * 0.27 + H.MATS.deutan[9][r][c] * 0.73, 1e-9, 'interp 0.873');
eq(H.matrix('deutan', 1), H.MATS.deutan[10], 'sev 1 exact'); eq(H.matrix('deutan', 0.4), H.MATS.deutan[4], 'sev 0.4 exact'); eq(H.matrix('deutan', 7), H.MATS.deutan[10], 'clamped high'); eq(H.matrix('deutan', -1), H.MATS.deutan[0], 'clamped low');
// worked example: pure red under protanopia (linear light): R' = 0.152286, G' = 0.114503, B' = -0.003882 -> clamp 0
var red = H.simulate([255, 0, 0], 'protan', 1); near(red[0], H.unlin(0.152286), 0.01, 'red r'); near(red[1], H.unlin(0.114503), 0.01, 'red g'); eq(Math.round(red[2]), 0, 'red b clamped');
// raw-value mode multiplies the 0-255 values directly
var raw = H.simulate([255, 0, 0], 'deutan', 1, { linear: false }); near(raw[0], 0.367322 * 255, 0.01, 'raw r'); near(raw[1], 0.280085 * 255, 0.01, 'raw g');
// sRGB to Lab, D65 2 degrees; reference values for the sRGB primaries and white
function lab(rgb, L, a, b, m) { var o = H.lab(rgb); near(o[0], L, 0.02, m + ' L'); near(o[1], a, 0.03, m + ' a'); near(o[2], b, 0.03, m + ' b'); }
lab([255, 255, 255], 100, 0, 0, 'white'); lab([0, 0, 0], 0, 0, 0, 'black'); lab([255, 0, 0], 53.2408, 80.0925, 67.2032, 'red'); lab([0, 255, 0], 87.7347, -86.1827, 83.1793, 'green'); lab([0, 0, 255], 32.2970, 79.1875, -107.8602, 'blue');
near(H.deltaE([255, 255, 255], [0, 0, 0]), 100, 0.001, 'white-black'); near(H.deltaE([10, 20, 30], [10, 20, 30]), 0, 1e-12, 'same color'); near(H.deltaE([1, 2, 3], [200, 100, 50]), H.deltaE([200, 100, 50], [1, 2, 3]), 1e-12, 'symmetric');
// hex
eq(H.parseHex('#ff8800'), [255, 136, 0], 'hex 6'); eq(H.parseHex('f80'), [255, 136, 0], 'hex 3'); eq(H.parseHex('#ggg'), null, 'bad hex'); eq(H.parseHex(''), null, 'empty'); eq(H.toHex([255, 136, 0]), '#ff8800', 'toHex');
for (var i = 0; i < 300; i++) { var rgb = [(i * 37) % 256, (i * 91) % 256, (i * 53) % 256]; eq(H.parseHex(H.toHex(rgb)), rgb, 'hex roundtrip'); H.TYPES.forEach(function (t) { var o = H.simulate(rgb, t, 1); eq(o.every(function (v) { return v >= 0 && v <= 255; }), true, 'in gamut'); }); }
// classic problem pairs: red vs green collapse for red-green deficiency, not for tritan; blue vs yellow survive
var rg = [[200, 40, 40], [60, 160, 60]];
n++; if (!(H.deltaE(rg[0], rg[1]) > 40)) { fails++; console.log('FAIL rg normal'); }
n++; if (!(H.deltaE(H.simulate(rg[0], 'deutan', 1), H.simulate(rg[1], 'deutan', 1)) < H.deltaE(rg[0], rg[1]) / 2)) { fails++; console.log('FAIL rg deutan collapse'); }
n++; if (!(H.deltaE(H.simulate([0, 0, 255], 'deutan', 1), H.simulate([255, 255, 0], 'deutan', 1)) > 60)) { fails++; console.log('FAIL blue yellow survives'); }
var R = H.parseHex('#c8402a'), G = H.parseHex('#6b8e23'); near(H.deltaE(R, G), 82, 0.5, 'landing: normal difference 82'); near(H.deltaE(H.simulate(R, 'deutan', 1), H.simulate(G, 'deutan', 1)), 2.9, 0.1, 'landing: deutan difference 2.9'); eq(H.clashes([R, G], 'deutan', 1).length, 1, 'red and olive clash for deutan'); eq(H.clashes([R, G], 'tritan', 1).length, 0, 'but not for tritan');
eq(H.clashes([[255, 0, 0], [255, 0, 0]], 'deutan', 1).length, 1, 'identical colors clash'); eq(H.clashes([[255, 255, 255], [0, 0, 0]], 'deutan', 1).length, 0, 'black white never clash');
console.log(n + ' checks, ' + fails + ' failures'); process.exit(fails ? 1 : 0);
