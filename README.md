# HueClash

Color vision deficiency palette checker. Paste up to 12 hex colors: it shows each one as protan, deutan and tritan viewers would see it (any severity from 0 to 1) and lists the pairs that look different normally but collapse after simulation.

- Live: https://ilanis-agent.github.io/hueclash/
- App: https://ilanis-agent.github.io/hueclash/app.html

Sources: the simulation matrices (11 severities x 3 types) were copied from the authors' page for Machado, Oliveira and Fernandes, "A Physiologically-based Model for Simulation of Color Vision Deficiency", IEEE TVCG 2009 (https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html, fetched directly; the paper PDF was fetched too but is truncated). Blending of in-between severities follows the suggestion on that page.
Tests (2443 checks): matrices have identity at severity 0 and every row sums to 1, published severity 1.0 and 0.1 values, grays stay gray at every severity, interpolation (the page's 0.873 example), worked red under protanopia, and sRGB to Lab against the standard D65 values for white, black, red, green and blue. No external simulator was used as an oracle.
Not verified: the page does not say whether the matrices act on linear or gamma-encoded RGB, so linear light is the default and raw sRGB is a switch. The default clash limit (CIE76 difference 10) is my own rule of thumb. CIE76 is a simple distance, not the newer CIEDE2000.

Tests: `node test-engine.js`.
