// Worked example built on illustration-isometric-mono's iso.mjs kit: a microbiology bench (scope, flask, tubes,
// incubator, laptop, petri stack, books, mug). One green ramp = also the colour of a Penicillium colony.
//   node science-kit/bench-iso.gen.mjs out.svg
// Rules followed from the pack: shadows + glows first, flushFloor(), then objects back to front (small x+y first).
import * as I from '../packs/illustration/illustration-isometric-mono/scripts/iso.mjs';
const { M, MG, DG, box, circle, prismZ, castShadow, rectFoot, glow } = I;

I.init('bn-');
I.floorDefs();

const LP = { x0: -40, x1: 34, y0: 10, y1: 60 };
const SCOPE = { x: -78, y: -70, s: 1.45 };
const FLASK = { x: -10, y: -78, r: 17 };
const TUBES = { x0: -112, x1: -62, y0: 52, y1: 76 };
const INC = { x0: 66, x1: 112, y0: -98, y1: -40, h: 50 };
const PETRI = { x: 76, y: 34, r: 22 };
const MUG = { x: 84, y: 92, r: 10.2 };
const BOOKS = { x: 10, y: 95.5, s: 1.1 };

I.platform();
castShadow(rectFoot(SCOPE.x - 14 * SCOPE.s, SCOPE.x + 14 * SCOPE.s, SCOPE.y - 9 * SCOPE.s, SCOPE.y + 9 * SCOPE.s), 52, 0.62, 0.24);
castShadow(circle(FLASK.x, FLASK.y, FLASK.r, 10), 30, 0.62, 0.24);
castShadow(rectFoot(TUBES.x0, TUBES.x1, TUBES.y0, TUBES.y1), 24, 0.62, 0.22);
castShadow(rectFoot(INC.x0, INC.x1, INC.y0, INC.y1), INC.h * 0.7, 0.62, 0.26);
castShadow(rectFoot(LP.x0, LP.x1, LP.y0 - 8, LP.y1), 26, 0.62, 0.22);
castShadow(circle(PETRI.x, PETRI.y, PETRI.r + 3, 12), 14, 0.62, 0.24);
castShadow(circle(MUG.x, MUG.y, MUG.r + 5, 8), 20, 0.62, 0.24);
glow((LP.x0 + LP.x1) / 2, LP.y1 + 6, 52, 30, MG, 0.5);
glow(INC.x0 + 22, INC.y1 + 12, 34, 16, MG, 0.42);
glow(PETRI.x, PETRI.y, PETRI.r + 12, PETRI.r + 12, DG, 0.3);
glow(MUG.x, MUG.y, MUG.r + 9, MUG.r + 9, DG, 0.34);
I.flushFloor();

// microscope: base, pillar, arm, head, eyepiece, objective, stage (all dimensions scaled by SCOPE.s)
{ const { x, y, s: k } = SCOPE;
  box(x - 14 * k, x + 14 * k, y - 9 * k, y + 9 * k, 0, 4 * k, M.mid);
  box(x - 3 * k, x + 3 * k, y - 6 * k, y - 2 * k, 4 * k, 38 * k, M.light);                    // pillar sits behind the optical axis
  box(x - 11 * k, x + 11 * k, y - 5 * k, y + 7 * k, 15 * k, 18 * k, M.pale);                  // stage
  prismZ(circle(x, y + 2 * k, 3.4 * k, 8), 18 * k, 28 * k, M.deep);                            // objective
  box(x - 6 * k, x + 6 * k, y - 6 * k, y + 5 * k, 34 * k, 42 * k, M.mid);                      // head
  prismZ(circle(x, y - 1 * k, 3 * k, 8), 42 * k, 52 * k, M.light); }                           // eyepiece
// flask (Erlenmeyer built as four stacked prisms)
prismZ(circle(FLASK.x, FLASK.y, FLASK.r, 12), 0, 6, M.light);
prismZ(circle(FLASK.x, FLASK.y, FLASK.r - 3.5, 12), 6, 13, M.light);
prismZ(circle(FLASK.x, FLASK.y, FLASK.r - 7, 12), 13, 20, M.pale);
prismZ(circle(FLASK.x, FLASK.y, 4.2, 10), 20, 31, M.pale);
prismZ(circle(FLASK.x, FLASK.y, FLASK.r - 2, 12), 1, 5, M.deep, { sw: 0.4 });              // liquid band
// test-tube rack
box(TUBES.x0, TUBES.x1, TUBES.y0, TUBES.y1, 0, 3, M.mid);
for (let i = 0; i < 5; i++) {
  const x = TUBES.x0 + 7 + i * 8.2, y = (TUBES.y0 + TUBES.y1) / 2;
  prismZ(circle(x, y, 3.2, 8), 3, 24, M.pale);
  prismZ(circle(x, y, 3.2, 8), 3, 3 + 6 + (i % 3) * 3, M.deep, { sw: 0.35 });              // liquid level
}
box(TUBES.x0, TUBES.x1, TUBES.y0 + 3, TUBES.y0 + 6, 18, 20, M.mid);
// incubator
box(INC.x0, INC.x1, INC.y0, INC.y1, 0, INC.h, M.mid);
box(INC.x0 + 5, INC.x1 - 5, INC.y1 - 0.2, INC.y1 + 1.4, 8, INC.h - 10, M.deep, { sw: 0.5 });  // door window
box(INC.x1 - 12, INC.x1 - 9, INC.y1, INC.y1 + 3, 20, 34, M.pale, { sw: 0.5 });             // handle
box(INC.x0 + 5, INC.x1 - 5, INC.y1 - 0.1, INC.y1 + 0.8, INC.h - 8, INC.h - 6.6, M.deep, { sw: 0.2 });          // vent slot
// laptop = hero
I.laptop(LP);
// petri stack
for (let k = 0; k < 3; k++) {
  prismZ(circle(PETRI.x, PETRI.y, PETRI.r, 14), k * 3.4, k * 3.4 + 3.2, k === 2 ? M.light : M.pale);
  prismZ(circle(PETRI.x, PETRI.y, PETRI.r - 3, 14), k * 3.4 + 0.5, k * 3.4 + 3.4, M.deep, { sw: 0.35 });
}
I.books(BOOKS);
I.mug(MUG);

I.writeSVG(process.argv[2] || 'bench.svg', 'Banco de microbiología');
