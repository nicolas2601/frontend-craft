// The shape of a stand-up coffee bag, for data-product3d: a boxy body with soft edges, side gussets folded inward,
// narrowing to a flat crimped heat seal at the top, standing on a flat bottom. Front and back are printed with the
// artwork; the gussets, the bottom and the seal edge take one colour.

const EDGE = 6; // superellipse exponent of the cross-section: boxy with rounded edges
const ROWS = 80;
const FACE_COLS = 44;
const SIDE_COLS = 18;
const FACE = 0.9; // share of the half-width printed flat; the rest rounds into the gusset
export const SEAL = 0.085; // share of the height taken by the flat seal at the top
const TAPER = 0.22; // share of the height below the seal where the bag narrows
const SEAL_DEPTH = 0.012; // share of the depth left at the seal
const BULGE = 0.07; // the filled bag swells a little in the middle of each face
const FOLD = 0.42; // how deep the gusset folds in, as a share of the half-depth

const clamp01 = (t) => Math.min(1, Math.max(0, t));
const smooth = (t) => { const x = clamp01(t); return x * x * (3 - 2 * x); };

/** Half-depth of the bag at height share yn (0 bottom, 1 top): the full body, narrowing to the seal. */
export function halfDepth(yn, d) {
  const sealStart = 1 - SEAL;
  const flat = (d * SEAL_DEPTH) / 2;
  if (yn >= sealStart) return flat;
  const k = smooth((yn - (sealStart - TAPER)) / TAPER);
  const foot = 0.94 + 0.06 * smooth(yn / 0.05); // the bottom edge rounds where the bag stands
  return (d / 2) * foot * (1 - k) + flat * k;
}

/** Depth of the face at x for a row of half-depth hd: flat across, rounding into the edge, swelling in the middle. */
export function faceDepth(x, W, hd, bodyShare) {
  const u = Math.min(1, Math.abs(x) / W);
  const edge = Math.max(0, 1 - u ** EDGE) ** (1 / EDGE);
  const swell = 1 + BULGE * bodyShare * (1 - (u / FACE) ** 2);
  return hd * edge * Math.max(1, swell);
}

/** One row of the bag's outline, in order around it: front left to right, right gusset, back, left gusset. */
function outline(W, hd, bodyShare) {
  const xFace = FACE * W;
  const zEdge = faceDepth(xFace, W, hd, 0);
  const front = [];
  for (let i = 0; i <= FACE_COLS; i += 1) {
    const x = -xFace + (2 * xFace * i) / FACE_COLS;
    front.push([x, faceDepth(x, W, hd, bodyShare)]);
  }
  const side = (sign) => {
    const pts = [];
    for (let i = 0; i <= SIDE_COLS; i += 1) {
      const z = sign * (zEdge - (2 * zEdge * i) / SIDE_COLS);
      const along = zEdge ? Math.abs(z) / zEdge : 1;
      const out = W * Math.max(0, 1 - (Math.abs(z) / Math.max(hd, 1e-6)) ** EDGE) ** (1 / EDGE);
      const fold = FOLD * hd * (1 - along); // the gusset's crease, deepest in the middle
      pts.push([sign * Math.max(xFace, out - fold), z]);
    }
    return pts;
  };
  const back = front.map(([x, z]) => [-x, -z]);
  return { front, right: side(1), back, left: side(-1) };
}

const SEGMENTS = ['front', 'back', 'right', 'left'];

/** BufferGeometry of the bag, centred on the origin, with groups 0 front, 1 back, 2 gussets and caps. */
export function bagGeometry(THREE, w, h, d) {
  const W = w / 2;
  const rows = [];
  for (let r = 0; r <= ROWS; r += 1) {
    const yn = r / ROWS;
    const hd = halfDepth(yn, d);
    rows.push({ y: -h / 2 + yn * h, yn, rings: outline(W, hd, hd / (d / 2)) });
  }
  // Normals from the closed ring so the shading runs smoothly across the seams between print and gusset.
  const ringOf = ({ rings: o }) => [...o.front, ...o.right.slice(1), ...o.back.slice(1), ...o.left.slice(1, -1)];
  const shared = new THREE.BufferGeometry();
  const loop = ringOf(rows[0]).length;
  const sp = [];
  for (const row of rows) for (const [x, z] of ringOf(row)) sp.push(x, row.y, z);
  shared.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  const si = [];
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < loop; c += 1) {
      const a = r * loop + c, b = r * loop + ((c + 1) % loop), e = a + loop, f = b + loop;
      si.push(a, b, f, a, f, e);
    }
  }
  shared.setIndex(si);
  shared.computeVertexNormals();
  const sn = shared.attributes.normal;
  const offset = { front: 0, right: FACE_COLS, back: FACE_COLS + SIDE_COLS, left: 2 * FACE_COLS + SIDE_COLS };

  const pos = [], nor = [], uv = [], idx = [];
  const groups = [];
  for (const seg of SEGMENTS) {
    const start = idx.length;
    const base = pos.length / 3;
    const cols = rows[0].rings[seg].length;
    rows.forEach((row, r) => {
      row.rings[seg].forEach(([x, z], c) => {
        pos.push(x, row.y, z);
        const k = r * loop + ((offset[seg] + c) % loop);
        nor.push(sn.getX(k), sn.getY(k), sn.getZ(k));
        uv.push(c / (cols - 1), row.yn);
      });
    });
    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < cols - 1; c += 1) {
        const a = base + r * cols + c, b = a + 1, e = a + cols, f = b + cols;
        idx.push(a, b, f, a, f, e);
      }
    }
    groups.push([start, idx.length - start, seg === 'front' ? 0 : seg === 'back' ? 1 : 2]);
  }
  // Flat bottom and the thin top edge of the seal.
  for (const [row, ny] of [[rows[0], -1], [rows[ROWS], 1]]) {
    const start = idx.length;
    const centre = pos.length / 3;
    pos.push(0, row.y, 0); nor.push(0, ny, 0); uv.push(0.5, 0.5);
    const ring = ringOf(row);
    ring.forEach(([x, z]) => { pos.push(x, row.y, z); nor.push(0, ny, 0); uv.push(0.5, 0.5); });
    for (let c = 0; c < ring.length; c += 1) {
      const a = centre + 1 + c, b = centre + 1 + ((c + 1) % ring.length);
      if (ny < 0) idx.push(centre, b, a); else idx.push(centre, a, b);
    }
    groups.push([start, idx.length - start, 2]);
  }
  shared.dispose();
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  for (const [s, n, m] of groups) g.addGroup(s, n, m);
  return g;
}

/** A point on the front face and its outward normal, for a feature printed or fixed on it (u 0-1 across, v 0-1 from the top). */
export function onFront(u, v, w, h, d) {
  const W = w / 2;
  const x = (u * 2 - 1) * FACE * W;
  const yn = 1 - v;
  const at = (xx, yy) => {
    const hd = halfDepth(yy, d);
    return faceDepth(xx, W, hd, hd / (d / 2));
  };
  const z = at(x, yn);
  const e = 1e-3;
  const dzdx = (at(x + e, yn) - at(x - e, yn)) / (2 * e);
  const dzdy = (at(x, yn + e / h) - at(x, yn - e / h)) / (2 * e);
  const n = [-dzdx, -dzdy, 1];
  const len = Math.hypot(...n);
  return { x, y: -h / 2 + yn * h, z, normal: n.map((c) => c / len) };
}

/** A bump map for the print: the crimped lines of the heat seal across the top. */
export function crimpCanvas() {
  const c = document.createElement('canvas');
  c.width = 4;
  c.height = 1024;
  const g = c.getContext('2d');
  g.fillStyle = '#808080';
  g.fillRect(0, 0, 4, 1024);
  const band = Math.round(SEAL * 1024);
  for (let y = 6; y < band - 4; y += 7) {
    g.fillStyle = '#b4b4b4';
    g.fillRect(0, y, 4, 3);
    g.fillStyle = '#5a5a5a';
    g.fillRect(0, y + 3, 4, 2);
  }
  g.fillStyle = '#4a4a4a';
  g.fillRect(0, band - 2, 4, 2);
  return c;
}
