// ═══════════════════════════════════════════════════════════════
// MONAD PANTHEON — Sunlit Greco-Roman Sanctuary Renderer
// ═══════════════════════════════════════════════════════════════
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { DEITIES, OBSTACLES } from './constants.js';

// ── Per-canvas context ────────────────────────────────────────
const canvasMap = new WeakMap();

// ── Material helpers ──────────────────────────────────────────
const flatMat = (color, emissive = '#000000', ei = 0, metalness = 0.4, roughness = 0.55) =>
  new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: ei, metalness: Math.min(metalness, 0.35), roughness, flatShading: true });

const glowMat = (color, intensity = 2.5) =>
  new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: Math.min(intensity, 1.25), flatShading: true, metalness: 0.2, roughness: 0.55 });

// ═══════════════════════════════════════════════════════════════
// DEITY CHARACTER BUILDERS
// ═══════════════════════════════════════════════════════════════

// ── 0: Molandak-Zeus — Thunder God Mech-Hedgehog ─────────────
function _buildZeus() {
  const g = new THREE.Group();
  const P = '#6c43b8', C = '#8ccbd0', G = '#b58a43', W = '#f4ead6';

  // Hexagonal armored torso
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 0.72, 6), flatMat(P, P, 0.25, 0.6, 0.35));
  torso.castShadow = true;
  g.add(torso);

  // White marble accent strips on torso
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.52, 0.05), flatMat(W, W, 0.35));
    strip.position.set(Math.cos(a) * 0.28, 0, Math.sin(a) * 0.28);
    g.add(strip);
  }

  // Shoulder pauldrons (gold)
  [-0.62, 0.62].forEach(x => {
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.16, 0.15, 5), flatMat(G, G, 0.45, 0.9, 0.15));
    pad.position.set(x, 0.38, 0);
    pad.rotation.z = x < 0 ? 0.28 : -0.28;
    g.add(pad);
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 4), flatMat(P, P, 0.5));
    spike.position.set(x, 0.5, 0);
    g.add(spike);
  });

  // HEAD — faceted octahedron helmet
  const head = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 1), flatMat(P, P, 0.28, 0.5, 0.4));
  head.position.y = 0.76;
  head.castShadow = true;
  g.add(head);

  // White face-plate
  const face = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.22, 0.13), flatMat(W, W, 0.2));
  face.position.set(0, 0.76, 0.2);
  g.add(face);

  // Glowing cyan mecha eyes (fierce slant)
  [-0.11, 0.11].forEach(x => {
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.042, 0.04), glowMat(C, 4.5));
    eye.position.set(x, 0.8, 0.28);
    eye.rotation.z = x < 0 ? -0.32 : 0.32;
    g.add(eye);
  });

  // Zeus lightning-crown crest on forehead
  [-2, -1, 0, 1, 2].forEach(i => {
    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.038, 0.2 - Math.abs(i) * 0.02, 3), glowMat(G, 0.9));
    crest.position.set(i * 0.065, 1.07 + Math.abs(i) * 0.02, 0.12);
    g.add(crest);
  });

  // White energy beard/scarf
  const beard = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.28, 5), glowMat(W, 0.7));
  beard.position.set(0, 0.54, 0.18);
  beard.rotation.x = Math.PI;
  g.add(beard);

  const chiton = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.72, 0.045), flatMat('#f4ead6', '#000000', 0, 0.08, 0.8));
  chiton.position.set(0.16, -0.03, 0.28);
  chiton.rotation.z = -0.48;
  g.add(chiton);
  const sashTrim = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.74, 0.055), flatMat(G, '#000000', 0, 0.2, 0.5));
  sashTrim.position.set(0.21, -0.03, 0.31);
  sashTrim.rotation.z = -0.48;
  g.add(sashTrim);

  const wreath = new THREE.Group();
  wreath.position.set(0, 1.03, 0.02);
  const wreathBand = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.025, 6, 32), flatMat(G, '#000000', 0, 0.25, 0.5));
  wreathBand.scale.set(1, 0.72, 1);
  wreath.add(wreathBand);
  for (let i = 0; i < 12; i++) {
    const angle = i / 12 * Math.PI * 2;
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 4), flatMat(G, '#000000', 0, 0.2, 0.6));
    leaf.scale.set(0.65, 1.6, 0.45);
    leaf.position.set(Math.cos(angle) * 0.27, Math.sin(angle) * 0.19, 0.02);
    leaf.rotation.z = angle;
    wreath.add(leaf);
  }
  g.add(wreath);

  // 15 crystalline quills — swept back in fan
  for (let i = 0; i < 15; i++) {
    const row = Math.floor(i / 5), col = i % 5;
    const spread = (col - 2) * 0.14;
    const depth = 0.52 + row * 0.18;
    const height = 0.42 + row * 0.28;
    const qColor = i % 3 === 0 ? G : i % 3 === 1 ? P : C;
    const q = new THREE.Mesh(new THREE.ConeGeometry(0.034, 0.48 - row * 0.04, 4), glowMat(qColor, 0.85));
    q.position.set(spread, height, -depth);
    q.rotation.x = -(0.72 + row * 0.18);
    q.rotation.z = spread * 0.4;
    g.add(q);
  }

  const boltShape = new THREE.Shape();
  boltShape.moveTo(-0.08, 0.42);
  boltShape.lineTo(0.12, 0.42);
  boltShape.lineTo(0.01, 0.12);
  boltShape.lineTo(0.16, 0.12);
  boltShape.lineTo(-0.12, -0.34);
  boltShape.lineTo(-0.04, -0.02);
  boltShape.lineTo(-0.18, -0.02);
  boltShape.closePath();
  const bolt = new THREE.Mesh(
    new THREE.ExtrudeGeometry(boltShape, { depth: 0.06, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.025, bevelThickness: 0.025 }),
    flatMat(G, '#7a4c12', 0.12, 0.25, 0.35)
  );
  bolt.position.set(0.6, -0.02, 0.38);
  bolt.rotation.z = -0.25;
  bolt.castShadow = true;
  g.add(bolt);

  g.rotation.y = Math.PI / 12;
  return g;
}

// ── 1: Anubis-Chog — Pharaoh Cyber-Jackal ────────────────────
function _buildAnubis() {
  const g = new THREE.Group();
  const BK = '#302720', G = '#b58a43', EM = '#e7a647', BL = '#214b73';

  // Octagonal obsidian torso
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.38, 0.68, 8), flatMat(BK, G, 0.08, 0.7, 0.3));
  torso.castShadow = true;
  g.add(torso);

  // Golden Egyptian collar plates (hexagonal fan)
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.07, 0.05), flatMat(G, G, 0.55, 0.9, 0.1));
    plate.position.set(Math.cos(a) * 0.34, 0.39, Math.sin(a) * 0.34);
    plate.lookAt(0, 0.39, 0); plate.rotateY(Math.PI);
    g.add(plate);
  }

  // Angular jackal skull head (OctahedronGeometry, 0 subdivisions = sharp)
  const head = new THREE.Mesh(new THREE.OctahedronGeometry(0.26, 0), flatMat(BK, G, 0.1, 0.7, 0.3));
  head.position.y = 0.76;
  head.scale.set(1, 1.25, 1);
  head.castShadow = true;
  g.add(head);

  // Elongated angular snout
  const snout = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.42, 4), flatMat('#0d0500', G, 0.04));
  snout.rotation.x = Math.PI / 2;
  snout.position.set(0, 0.68, 0.38);
  g.add(snout);

  // Tall blade-like Anubis ears with gold inner trim
  [-0.22, 0.22].forEach(x => {
    const earOut = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.62, 4), flatMat(BK, G, 0.07));
    earOut.position.set(x, 1.22, 0.02);
    earOut.rotation.z = x < 0 ? 0.12 : -0.12;
    g.add(earOut);
    const earIn = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.44, 4), glowMat(G, 0.55));
    earIn.position.set(x, 1.22, 0.04);
    earIn.rotation.z = x < 0 ? 0.12 : -0.12;
    g.add(earIn);
  });

  [-0.34, 0.34].forEach(x => {
    const flap = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.68, 0.09), flatMat(BL, '#000000', 0, 0.12, 0.6));
    flap.position.set(x, 0.47, 0.04);
    flap.rotation.z = x < 0 ? 0.08 : -0.08;
    g.add(flap);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.7, 0.105), flatMat(G, '#000000', 0, 0.2, 0.45));
    stripe.position.set(x, 0.47, 0.09);
    stripe.rotation.z = x < 0 ? 0.08 : -0.08;
    g.add(stripe);
  });

  // Emerald slit eyes
  [-0.13, 0.13].forEach(x => {
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.038, 0.04), glowMat(EM, 4.5));
    eye.position.set(x, 0.79, 0.22);
    g.add(eye);
  });

  // Hovering gold gauntlets
  [-0.68, 0.68].forEach(x => {
    const gnt = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.2, 0.14), flatMat(G, G, 0.4, 0.9, 0.15));
    gnt.position.set(x, -0.05, 0.12);
    g.add(gnt);
  });

  // Sun-Gate Halo — ring of glowing octahedra
  const haloGrp = new THREE.Group();
  haloGrp.position.set(0, 0.82, -0.62);
  haloGrp.rotation.y = Math.PI / 2;
  haloGrp.userData.isHalo = true;
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const seg = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), glowMat(i % 2 === 0 ? G : BL, 0.9));
    seg.position.set(Math.cos(a) * 0.58, Math.sin(a) * 0.58, 0);
    haloGrp.add(seg);
  }
  const innerRing = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.03, 4, 14), glowMat(G, 1.3));
  haloGrp.add(innerRing);
  g.add(haloGrp);
  const haloLight = new THREE.PointLight(G, 0.6, 3.5); haloLight.position.set(0, 0.82, -0.6);
  g.add(haloLight);

  // Giant diagonal Ankh / Scythe
  const wpn = new THREE.Group();
  wpn.userData.isWeapon = true;
  const stf = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 1.15, 5), flatMat(G, G, 0.6, 0.9, 0.1));
  wpn.add(stf);
  const lp = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.04, 4, 10), glowMat(G, 1.1));
  lp.position.y = 0.67;
  wpn.add(lp);
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.38, 4), flatMat(G, G, 0.6));
  bar.rotation.z = Math.PI / 2; bar.position.y = 0.3;
  wpn.add(bar);
  const blade = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.48, 4), glowMat(EM, 3.0));
  blade.position.set(-0.16, 0.98, 0); blade.rotation.z = Math.PI / 3;
  wpn.add(blade);
  const wl = new THREE.PointLight(EM, 0.9, 2.8); wl.position.set(0, 0.95, 0);
  wpn.add(wl);
  wpn.position.set(0.72, -0.1, 0.12); wpn.rotation.z = -0.48;
  g.add(wpn);

  g.rotation.y = Math.PI / 10;
  return g;
}

// ── 2: Moyaki-Kraken — Abyssal Leviathan Lord ────────────────
function _buildKraken() {
  const g = new THREE.Group();
  const TE = '#8d5f43', C = '#0891b2', NC = '#67e8f9', G = '#b58a43';

  // DodecahedronGeometry mantle (fully faceted armored shell)
  const mantle = new THREE.Mesh(new THREE.DodecahedronGeometry(0.44, 0), flatMat(TE, C, 0.35, 0.5, 0.4));
  mantle.scale.set(1, 1.18, 1); mantle.position.y = 0.18; mantle.castShadow = true;
  g.add(mantle);

  // Bioluminescent rune markings
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const rune = new THREE.Mesh(new THREE.OctahedronGeometry(0.05, 0), glowMat(NC, 3.0));
    rune.position.set(Math.cos(a) * 0.38, 0.22, Math.sin(a) * 0.38);
    g.add(rune);
  }

  // Head section
  const head = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 1), flatMat(TE, C, 0.18));
  head.scale.set(1.1, 0.9, 1.12); head.position.y = 0.74;
  g.add(head);

  // Angry brow ridges
  [-0.22, 0.22].forEach(x => {
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.1), flatMat('#012830', C, 0.3));
    ridge.position.set(x, 0.79, 0.28); ridge.rotation.z = x < 0 ? 0.38 : -0.38;
    g.add(ridge);
  });

  // Menacing neon-cyan visor eyes
  [-0.2, 0.2].forEach(x => {
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.08, 0.05), glowMat(NC, 4.5));
    visor.position.set(x, 0.73, 0.28);
    g.add(visor);
    const irl = new THREE.PointLight(NC, 0.5, 1.5); irl.position.set(x, 0.73, 0.3);
    g.add(irl);
  });

  // Golden Abyssal Crown
  const crGrp = new THREE.Group(); crGrp.position.y = 1.02;
  const crBase = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.33, 0.12, 6), flatMat(G, G, 0.55, 0.9, 0.1));
  crGrp.add(crBase);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.055, i % 2 === 0 ? 0.3 : 0.18, 4), glowMat(G, 0.9));
    tooth.position.set(Math.cos(a) * 0.22, 0.2, Math.sin(a) * 0.22);
    crGrp.add(tooth);
  }
  const crLight = new THREE.PointLight(G, 0.5, 3); crLight.position.y = 0.3;
  crGrp.add(crLight);
  g.add(crGrp);

  // 8 articulated mechanical tentacles
  for (let i = 0; i < 8; i++) {
    const tGrp = new THREE.Group();
    tGrp.userData.isTentacle = true;
    tGrp.userData.tentacleIdx = i;
    const baseAngle = (i / 8) * Math.PI * 2;
    for (let s = 0; s < 4; s++) {
      const nsz = Math.max(0.1 - s * 0.016, 0.038);
      const nColor = s % 2 === 0 ? TE : C;
      const node = new THREE.Mesh(
        new THREE.OctahedronGeometry(nsz, 0),
        new THREE.MeshStandardMaterial({ color: nColor, emissive: s === 3 ? NC : C, emissiveIntensity: s === 3 ? 2.0 : 0.28, flatShading: true })
      );
      const spread = 0.42 + s * 0.26;
      node.position.set(Math.cos(baseAngle) * spread, -(s * 0.17) - 0.08, Math.sin(baseAngle) * spread);
      node.userData.segIdx = s;
      node.userData.bx = node.position.x; node.userData.by = node.position.y; node.userData.bz = node.position.z;
      tGrp.add(node);
    }
    g.add(tGrp);
  }

  // Giant Poseidon Trident (taller than character)
  const trGrp = new THREE.Group(); trGrp.userData.isWeapon = true;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.026, 1.6, 5), flatMat(G, G, 0.55, 0.9, 0.1));
  trGrp.add(shaft);
  [-0.22, 0, 0.22].forEach((x, ti) => {
    const tine = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.55 - Math.abs(x) * 0.5, 4), glowMat(NC, 3.5));
    tine.position.set(x, 1.02 + (ti === 1 ? 0.14 : 0), 0);
    trGrp.add(tine);
  });
  const tl = new THREE.PointLight(NC, 1.4, 4); tl.position.y = 1.1;
  trGrp.add(tl);
  trGrp.position.set(0.78, 0.22, 0.12); trGrp.rotation.z = -0.12;
  g.add(trGrp);

  g.rotation.y = Math.PI / 14;
  return g;
}

// ── 3: Amaterasu-Salmonad — Celestial Dragon-Koi ─────────────
function _buildAmaterasu() {
  const g = new THREE.Group();
  const R = '#dc2626', CR = '#7f1d1d', G = '#b58a43', OR = '#d08c42';

  // S-curved articulated dragon body (5 segments)
  const segs = [
    { y: 0.52, z: 0.1, sx: 1.45, name: 'tail_end' },
    { y: 0.25, z: 0.04, sx: 1.52, name: 'tail' },
    { y: -0.04, z: -0.04, sx: 1.6, name: 'body' },
    { y: -0.32, z: -0.04, sx: 1.4, name: 'chest' },
    { y: -0.56, z: 0.06, sx: 1.0, name: 'head_base' },
  ];
  segs.forEach(({ y, z, sx }, i) => {
    const r = 0.178 - i * 0.011;
    const seg = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), flatMat(i === 0 ? CR : R, R, 0.28, 0.4, 0.5));
    seg.position.set(0, -y, z); seg.scale.x = sx; seg.castShadow = true;
    seg.userData.isSeg = true; seg.userData.segIdx = i;
    g.add(seg);
  });

  // Dragon-fish head
  const headM = new THREE.Mesh(new THREE.OctahedronGeometry(0.27, 0), flatMat(CR, R, 0.22));
  headM.position.set(0, -0.8, 0.2); headM.scale.set(1.32, 0.78, 1.22); headM.castShadow = true;
  g.add(headM);

  // Glowing golden eyes
  [-0.12, 0.12].forEach(x => {
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.048, 0.04), glowMat(G, 4.0));
    eye.position.set(x, -0.76, 0.36);
    g.add(eye);
  });
  const eyeLight = new THREE.PointLight(G, 0.5, 2); eyeLight.position.set(0, -0.76, 0.36);
  g.add(eyeLight);

  // Golden whisker barbels
  [[-0.1, 0.32], [0.1, 0.32], [-0.14, 0.24], [0.14, 0.24]].forEach(([x, zz]) => {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.004, 0.38, 4), flatMat(G, G, 0.65));
    w.position.set(x, -0.82, zz); w.rotation.x = 0.72; w.rotation.z = x < 0 ? 0.5 : -0.5;
    g.add(w);
  });

  // Translucent neon-orange energy wings
  [-1, 1].forEach(side => {
    const wing = new THREE.Mesh(new THREE.ConeGeometry(0.52, 0.95, 4),
      new THREE.MeshStandardMaterial({ color: OR, emissive: OR, emissiveIntensity: 1.6, transparent: true, opacity: 0.62, flatShading: true, side: THREE.DoubleSide }));
    wing.position.set(side * 0.72, -0.04, -0.08);
    wing.rotation.z = side < 0 ? -Math.PI / 2.1 : Math.PI / 2.1;
    wing.rotation.y = side < 0 ? -0.32 : 0.32;
    wing.userData.isWing = true; wing.userData.wingSign = side;
    g.add(wing);
    const fedge = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.02, 0.9, 4), flatMat(G, G, 1.3));
    fedge.position.set(side * 0.96, -0.04, -0.08); fedge.rotation.z = side < 0 ? -Math.PI / 2.1 : Math.PI / 2.1;
    g.add(fedge);
  });

  // Dorsal fin
  const dorsal = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.58, 4),
    new THREE.MeshStandardMaterial({ color: OR, emissive: OR, emissiveIntensity: 2.0, transparent: true, opacity: 0.8, flatShading: true }));
  dorsal.position.set(0, 0.56, 0.02); dorsal.rotation.x = 0.18;
  g.add(dorsal);

  // Sacred Amaterasu Mirror Ring with 8 blazing fire crystals
  const ringGrp = new THREE.Group();
  ringGrp.position.set(0, -0.04, -0.45);
  ringGrp.rotation.y = Math.PI / 2;
  ringGrp.userData.isSacredRing = true;
  const mRing = new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.055, 4, 36), flatMat(G, G, 1.0, 0.9, 0.1));
  ringGrp.add(mRing);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const cr = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), glowMat(OR, 4.0));
    cr.position.set(Math.cos(a) * 0.88, Math.sin(a) * 0.88, 0);
    cr.userData.isOrb = true; cr.userData.orbIdx = i;
    ringGrp.add(cr);
    const ol = new THREE.PointLight(OR, 0.3, 2.0); ol.position.copy(cr.position);
    ringGrp.add(ol);
  }
  g.add(ringGrp);
  const ringLight = new THREE.PointLight(OR, 0.8, 5); ringLight.position.set(0, -0.04, -0.45);
  g.add(ringLight);

  g.rotation.y = Math.PI / 8;
  return g;
}

// ── Public deity builder ──────────────────────────────────────
export function buildDeity3DModel(idxOrId) {
  const idx = typeof idxOrId === 'number' ? idxOrId : DEITIES.findIndex(d => d.id === idxOrId);
  const model = [_buildZeus, _buildAnubis, _buildKraken, _buildAmaterasu][idx]?.() ?? _buildZeus();
  model.traverse(child => {
    if (!child.isMesh || !child.material) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach(material => {
      if (!(material instanceof THREE.MeshStandardMaterial)) return;
      material.metalness = Math.min(material.metalness, 0.35);
      material.roughness = Math.max(material.roughness, 0.45);
      material.emissiveIntensity = Math.min(material.emissiveIntensity, 1.25);
    });
  });
  return model;
}

// ═══════════════════════════════════════════════════════════════
// ARENA GEOMETRY BUILDERS
// ═══════════════════════════════════════════════════════════════

function createMythicTileTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Unable to create the flagstone texture canvas context.');

  let seed = 7261;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  ctx.fillStyle = '#dfd1b8';
  ctx.fillRect(0, 0, 256, 256);
  const slabs = ['#dfd1b8', '#d2c0a3', '#c7b292'];
  for (let i = 0; i < 18; i++) {
    const x = random() * 210;
    const y = random() * 210;
    const width = 24 + random() * 42;
    const height = 20 + random() * 38;
    ctx.fillStyle = slabs[Math.floor(random() * slabs.length)];
    ctx.globalAlpha = 0.25 + random() * 0.25;
    ctx.fillRect(x, y, width, height);
  }
  ctx.globalAlpha = 1;
  for (let i = 0; i < 1800; i++) {
    const shade = random() > 0.55 ? '120,94,60' : '255,248,228';
    ctx.fillStyle = `rgba(${shade},${random() * 0.12})`;
    ctx.fillRect(random() * 256, random() * 256, 1 + random() * 4, 1);
  }
  ctx.strokeStyle = 'rgba(112,83,53,0.28)';
  ctx.lineWidth = 1.5;
  [[22, 36, 1, 1], [208, 40, -1, 1], [40, 210, 1, -1], [214, 198, -1, -1]].forEach(([x, y, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx * 15, y + dy * 9);
    ctx.lineTo(x + dx * 23, y + dy * 25);
    ctx.lineTo(x + dx * 31, y + dy * 30);
    ctx.stroke();
  });
  ctx.strokeStyle = 'rgba(255,248,230,0.45)';
  ctx.lineWidth = 2;
  [[8, 8, 1, 1], [248, 8, -1, 1], [8, 248, 1, -1], [248, 248, -1, -1]].forEach(([x, y, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(x, y + dy * 18);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dx * 18, y);
    ctx.stroke();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createMediterraneanSkyTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Unable to create the Mediterranean sky texture canvas context.');

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#7ec8e3');
  gradient.addColorStop(0.48, '#b6d9df');
  gradient.addColorStop(0.74, '#f7d794');
  gradient.addColorStop(1, '#e8d5b5');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 0.22;
  for (let i = 0; i < 22; i++) {
    const x = (i * 173 + 51) % canvas.width;
    const y = 60 + (i * 67) % 210;
    const cloud = ctx.createRadialGradient(x, y, 4, x, y, 100 + (i % 3) * 28);
    cloud.addColorStop(0, 'rgba(255,250,235,0.8)');
    cloud.addColorStop(1, 'rgba(255,250,235,0)');
    ctx.fillStyle = cloud;
    ctx.fillRect(x - 140, y - 80, 280, 160);
  }
  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function _buildMediterraneanSky(scene) {
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(180, 48, 32),
    new THREE.MeshBasicMaterial({ map: createMediterraneanSkyTexture(), side: THREE.BackSide, depthWrite: false })
  );
  scene.add(sky);
}

function _buildZiggurat(scene) {
  const stone = new THREE.MeshStandardMaterial({ color: '#c7b292', roughness: 0.88, metalness: 0.03 });
  const lower = new THREE.Mesh(new THREE.BoxGeometry(23.8, 0.75, 23.8), stone);
  lower.position.y = -0.42;
  lower.receiveShadow = true;
  lower.castShadow = true;
  scene.add(lower);
  const upper = new THREE.Mesh(new THREE.BoxGeometry(21.8, 0.18, 21.8), new THREE.MeshStandardMaterial({ color: '#dfd1b8', roughness: 0.82, metalness: 0.02 }));
  upper.position.y = -0.09;
  upper.receiveShadow = true;
  upper.castShadow = true;
  scene.add(upper);
}

function _buildColumn(scene, x, z, scale = 1) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.scale.setScalar(scale);
  const limestone = new THREE.MeshStandardMaterial({ color: '#e3d5be', roughness: 0.75, metalness: 0.05 });
  const shadowStone = new THREE.MeshStandardMaterial({ color: '#b9a585', roughness: 0.86, metalness: 0.03 });
  const gold = new THREE.MeshStandardMaterial({ color: '#b58a43', roughness: 0.4, metalness: 0.55 });
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.36, 1.65), shadowStone);
  plinth.position.y = 0.28;
  group.add(plinth);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.78, 0.34, 16), limestone);
  base.position.y = 0.62;
  group.add(base);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.58, 4.4, 20), limestone);
  shaft.position.y = 2.96;
  shaft.castShadow = true;
  shaft.receiveShadow = true;
  group.add(shaft);
  for (let i = 0; i < 16; i++) {
    const angle = i / 16 * Math.PI * 2;
    const flute = new THREE.Mesh(new THREE.BoxGeometry(0.055, 3.95, 0.075), shadowStone);
    flute.position.set(Math.cos(angle) * 0.477, 2.96, Math.sin(angle) * 0.477);
    flute.lookAt(Math.cos(angle) * 2, 2.96, Math.sin(angle) * 2);
    group.add(flute);
  }
  const capital = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.53, 0.62, 16), limestone);
  capital.position.y = 5.46;
  group.add(capital);
  const abacus = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.22, 1.7), limestone);
  abacus.position.y = 5.88;
  group.add(abacus);
  [0.83, 5.99].forEach(y => {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.61, 0.035, 6, 32), gold);
    band.rotation.x = Math.PI / 2;
    band.position.y = y;
    group.add(band);
  });
  scene.add(group);
  return group;
}

function _buildColonnade(scene) {
  const columns = [];
  for (let i = 0; i < 10; i++) {
    const angle = THREE.MathUtils.degToRad(205 + i * (130 / 9));
    columns.push(_buildColumn(scene, Math.cos(angle) * 6.4, -11 + Math.sin(angle) * 6.4, 0.9));
  }
  const arch = new THREE.Mesh(
    new THREE.TorusGeometry(6.4, 0.38, 8, 64, THREE.MathUtils.degToRad(130)),
    new THREE.MeshStandardMaterial({ color: '#c7b292', roughness: 0.84, metalness: 0.03 })
  );
  arch.rotation.x = Math.PI / 2;
  arch.rotation.z = THREE.MathUtils.degToRad(205);
  arch.position.set(0, 5.96, -11);
  scene.add(arch);
  return columns;
}

function _buildStaircases(scene) {
  const stone = new THREE.MeshStandardMaterial({ color: '#d2c0a3', roughness: 0.84, metalness: 0.03 });
  const addStair = (side) => {
    for (let i = 0; i < 6; i++) {
      const rise = 0.12 + i * 0.12;
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(side === 'back' ? 4.2 : 0.95, rise, side === 'back' ? 0.82 : 4.2),
        stone
      );
      const coordinate = 10.9 + i * 0.58;
      if (side === 'back') step.position.set(0, rise / 2 - 0.28, -coordinate);
      if (side === 'left') step.position.set(-coordinate, rise / 2 - 0.28, 0);
      if (side === 'right') step.position.set(coordinate, rise / 2 - 0.28, 0);
      step.receiveShadow = true;
      step.castShadow = true;
      scene.add(step);
    }
  };
  ['back', 'left', 'right'].forEach(addStair);
}

function _buildRockyPerimeter(scene) {
  const rocks = [];
  const foliage = [];
  const stoneColors = ['#c2a67d', '#9e825c', '#b59a70'];
  const leafMaterial = new THREE.MeshStandardMaterial({ color: '#66734a', roughness: 0.9 });
  for (let i = 0; i < 32; i++) {
    const angle = i / 32 * Math.PI * 2;
    const radius = 14.3 + (i % 3) * 0.55;
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.8 + (i % 4) * 0.24, 1),
      new THREE.MeshStandardMaterial({ color: stoneColors[i % stoneColors.length], roughness: 0.92, metalness: 0.01, flatShading: true })
    );
    rock.position.set(Math.cos(angle) * radius, -0.05 + (i % 3) * 0.28, Math.sin(angle) * radius);
    rock.scale.set(1.15 + (i % 2) * 0.25, 0.8 + (i % 3) * 0.18, 0.9);
    rock.rotation.set(i * 0.31, i * 0.7, i * 0.23);
    rock.castShadow = true;
    rock.receiveShadow = true;
    scene.add(rock);
    rocks.push(rock);
    if (i % 4 === 0) {
      for (let leaf = 0; leaf < 3; leaf++) {
        const branch = new THREE.Mesh(new THREE.IcosahedronGeometry(0.23, 1), leafMaterial);
        branch.position.set(rock.position.x + (leaf - 1) * 0.23, rock.position.y + 0.8 + leaf * 0.08, rock.position.z);
        branch.scale.set(1.4, 0.48, 0.7);
        scene.add(branch);
        foliage.push(branch);
      }
    }
  }
  return { rocks, foliage };
}

function _buildMonolith() {
  const g = new THREE.Group();
  const shaftMat = new THREE.MeshStandardMaterial({ color: '#e3d5be', roughness: 0.75, metalness: 0.05 });
  const trimMat = new THREE.MeshStandardMaterial({ color: '#b58a43', roughness: 0.4, metalness: 0.55 });
  const fireMat = new THREE.MeshStandardMaterial({ color: '#ff9f43', emissive: '#f47a26', emissiveIntensity: 0.7, roughness: 0.5, metalness: 0.05 });
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.32, 1.8), shaftMat);
  plinth.position.y = 0.18;
  plinth.castShadow = true;
  plinth.receiveShadow = true;
  g.add(plinth);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.86, 0.32, 12), shaftMat);
  base.receiveShadow = true;
  base.position.y = 0.5;
  g.add(base);
  const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.5, 2.6, 20), shaftMat);
  lower.castShadow = true;
  lower.receiveShadow = true;
  lower.position.y = 1.96;
  g.add(lower);
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const flute = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 2.42, 6), new THREE.MeshStandardMaterial({ color: '#c7b292', roughness: 0.82, metalness: 0.02 }));
    flute.position.set(Math.cos(angle) * 0.42, 1.96, Math.sin(angle) * 0.42);
    flute.castShadow = true;
    g.add(flute);
  }

  const capital = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.48, 0.38, 12), shaftMat);
  capital.position.y = 3.45;
  capital.castShadow = true;
  g.add(capital);
  const capitalBand = new THREE.Mesh(new THREE.TorusGeometry(0.59, 0.045, 8, 32), trimMat);
  capitalBand.rotation.x = Math.PI / 2;
  capitalBand.position.y = 3.28;
  g.add(capitalBand);
  const architrave = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.22, 1.4), shaftMat);
  architrave.position.y = 3.72;
  g.add(architrave);
  for (let i = 0; i < 4; i++) {
    const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.15, 1), shaftMat);
    leaf.position.set((i - 1.5) * 0.16, 3.55, 0.08);
    leaf.scale.set(1, 0.7, 0.7);
    g.add(leaf);
  }
  const brazier = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.34, 0.18, 8), trimMat);
  brazier.position.y = 3.91;
  g.add(brazier);
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.62, 8), fireMat);
  flame.position.y = 4.28;
  flame.userData.isBrazierFlame = true;
  g.add(flame);
  const fireLight = new THREE.PointLight('#ffad55', 0.8, 4);
  fireLight.position.y = 4.3;
  g.add(fireLight);

  return g;
}

// ── Name-tag billboard ────────────────────────────────────────
function _makeNameTag(label, color) {
  const W = 256, H = 52;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(243,234,216,0.94)';
  ctx.beginPath();
  [12, W - 12].forEach((x, i) => { ctx.lineTo(x, i === 0 ? 0 : 0); });
  ctx.roundRect(0, 0, W, H, 10);
  ctx.fill();
  ctx.strokeStyle = '#b58a43'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = '#49351d';
  ctx.font = 'bold 20px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(255,255,255,0.65)'; ctx.shadowBlur = 2;
  ctx.fillText(label, W / 2, H / 2);
  const tex = new THREE.CanvasTexture(cv);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
  sprite.scale.set(2.4, 0.52, 1);
  return sprite;
}

// ── Animate sub-parts ─────────────────────────────────────────
function _animateDeity(group, t) {
  group.traverse(child => {
    if (child.userData.isTentacle) {
      child.children.forEach(seg => {
        if (seg.userData.segIdx !== undefined) {
          seg.position.y = seg.userData.by + Math.sin(t * 4.5 + child.userData.tentacleIdx + seg.userData.segIdx * 0.65) * 0.12 * (seg.userData.segIdx + 1) * 0.2;
        }
      });
    }
    if (child.userData.isWing) {
      child.rotation.z = child.userData.wingSign < 0
        ? -Math.PI / 2.1 + Math.sin(t * 3.2) * 0.2
        : Math.PI / 2.1 - Math.sin(t * 3.2) * 0.2;
    }
    if (child.userData.isSacredRing) child.rotation.y = t * 0.9;
    if (child.userData.isOrb) {
      const a = (child.userData.orbIdx / 8) * Math.PI * 2 + t * 1.3;
      child.position.set(Math.cos(a) * 0.88, Math.sin(a) * 0.88 + Math.sin(t * 2 + child.userData.orbIdx) * 0.06, 0);
    }
    if (child.userData.isHalo) child.rotation.z = t * 0.45;
    if (child.userData.isBrazierFlame) {
      child.scale.y = 0.9 + Math.sin(t * 6 + group.position.x) * 0.12;
    }
    if (child.userData.isWeapon) {
      child.position.y += Math.sin(t * 2.8 + (child.userData.weaponOffset || 0)) * 0.002;
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// INIT THREE.JS (Main Arena — with Bloom)
// ═══════════════════════════════════════════════════════════════
function initThree(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(canvas.width, canvas.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.82;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#e8d5b5');
  scene.fog = new THREE.FogExp2(0xe8d5b5, 0.012);
  _buildMediterraneanSky(scene);

  const aspect = canvas.width / canvas.height;
  const camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 280);
  camera.position.set(0, 20, 26);
  camera.lookAt(0, 0, 0);

  // --- 3-POINT STUDIO LIGHTING ---
  scene.add(new THREE.HemisphereLight(0xfff5e4, 0x8c7355, 1.1));
  const key = new THREE.DirectionalLight(0xffdf9e, 2.2);
  key.position.set(-18, 28, 14); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 1; key.shadow.camera.far = 90;
  key.shadow.camera.left = -18; key.shadow.camera.right = 18;
  key.shadow.camera.top = 18; key.shadow.camera.bottom = -18;
  key.shadow.bias = -0.0008;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xf3e4c8, 0.45);
  fill.position.set(14, 10, -8); scene.add(fill);

  // --- BLOOM POST-PROCESSING ---
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(canvas.width, canvas.height), 0.18, 0.3, 0.92));

  canvasMap.set(canvas, { renderer, scene, camera, composer, objects: {}, _time: 0 });
}

// ═══════════════════════════════════════════════════════════════
// MAIN RENDER LOOP
// ═══════════════════════════════════════════════════════════════
export function renderGame(canvas, state) {
  if (!canvasMap.has(canvas)) initThree(canvas);
  const ctx3 = canvasMap.get(canvas);
  const { scene, camera, composer, objects } = ctx3;
  ctx3._time += 0.016;
  const t = ctx3._time;

  const GRID = state.grid.length;
  const OFFSET = GRID / 2 - 0.5;

  // ── ENVIRONMENT (once) ────────────────────────────────────
  if (!objects.envBuilt) {
    _buildZiggurat(scene);
    objects.colonnade = _buildColonnade(scene);
    _buildStaircases(scene);
    objects.perimeter = _buildRockyPerimeter(scene);
    const frameMat = new THREE.MeshStandardMaterial({ color: '#b9a585', roughness: 0.82, metalness: 0.03 });
    const border = [
      { geometry: new THREE.BoxGeometry(GRID + 0.4, 0.42, 0.42), position: [0, 0.1, -OFFSET - 0.72] },
      { geometry: new THREE.BoxGeometry(GRID + 0.4, 0.42, 0.42), position: [0, 0.1, OFFSET + 0.72] },
      { geometry: new THREE.BoxGeometry(0.42, 0.42, GRID + 0.4), position: [-OFFSET - 0.72, 0.1, 0] },
      { geometry: new THREE.BoxGeometry(0.42, 0.42, GRID + 0.4), position: [OFFSET + 0.72, 0.1, 0] },
    ];
    border.forEach(({ geometry, position }) => {
      const rim = new THREE.Mesh(geometry, frameMat);
      rim.position.set(...position);
      scene.add(rim);
    });
    objects.envBuilt = true;
  }

  // ── TACTICAL TILES (once) ─────────────────────────────────
  if (!objects.tiles) {
    objects.tiles = [];
    const tileTexture = createMythicTileTexture();
    const frameGeo = new THREE.BoxGeometry(0.96, 0.17, 0.96);
    const plateGeo = new THREE.BoxGeometry(0.82, 0.08, 0.82);
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        const frameMat = new THREE.MeshStandardMaterial({ color: '#7d6a50', metalness: 0.02, roughness: 0.88 });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.receiveShadow = true;
        frame.position.set(x - OFFSET, 0, y - OFFSET);
        scene.add(frame);

        const plateMat = new THREE.MeshStandardMaterial({ map: tileTexture, color: 0xd8c8ad, roughness: 0.78, metalness: 0.02 });
        const plate = new THREE.Mesh(plateGeo, plateMat);
        plate.position.set(x - OFFSET, 0.15, y - OFFSET);
        scene.add(plate);

        objects.tiles.push({ frame, plate, x, y });
      }
    }
  }

  // Update tile colours & elevation
  const tilePalette = [
    { stone: '#6c43b8', inlay: '#ffd700' },
    { stone: '#d97706', inlay: '#fde047' },
    { stone: '#0891b2', inlay: '#67e8f9' },
    { stone: '#dc2626', inlay: '#fca5a5' },
  ];
  objects.tiles.forEach(({ frame, plate, x, y }) => {
    const cell = state.grid[y][x];
    if (cell !== null && cell !== 'obstacle') {
      const palette = tilePalette[cell];
      plate.material.color.set(palette.stone);
      plate.material.emissive.set(palette.stone);
      plate.material.emissiveIntensity = 0.08;
      frame.material.color.set(palette.inlay);
      frame.position.y += (0.22 - frame.position.y) * 0.18;
      plate.position.y = frame.position.y + 0.12;
    } else {
      plate.material.color.set('#d8c8ad');
      plate.material.emissive.set('#000000');
      plate.material.emissiveIntensity = 0;
      frame.material.color.set('#7d6a50');
      frame.position.y += (0 - frame.position.y) * 0.18;
      plate.position.y = frame.position.y + 0.15;
    }
  });

  // ── INNER LIMESTONE COLUMNS (once) ───────────────────────
  if (!objects.pillars) {
    objects.pillars = [];
    (state.obstacles || OBSTACLES).forEach(({ x, y }) => {
      const m = _buildMonolith();
      m.position.set(x - OFFSET + 0.5, 0, y - OFFSET + 0.5);
      scene.add(m);
      objects.pillars.push(m);
    });
  }
  objects.pillars.forEach(p => _animateDeity(p, t));

  // ── POWER-UPS ─────────────────────────────────────────────
  if (!objects.pups) objects.pups = {};
  const activePU = new Set();
  (state.powerUps || []).forEach(pu => {
    const k = `${pu.x},${pu.y}`;
    activePU.add(k);
    if (!objects.pups[k]) {
      const cr = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0),
        new THREE.MeshStandardMaterial({ color: '#d5aa56', emissive: '#b58a43', emissiveIntensity: 0.75, metalness: 0.25, roughness: 0.42, flatShading: true, transparent: true, opacity: 0.92 }));
      cr.position.set(pu.x - OFFSET, 0.55, pu.y - OFFSET);
      const pl = new THREE.PointLight('#f0bd65', 0.45, 2.2); pl.position.copy(cr.position);
      scene.add(cr); scene.add(pl);
      objects.pups[k] = { cr, pl };
    }
    const { cr, pl } = objects.pups[k];
    cr.rotation.y = t * 2.2; cr.rotation.x = t * 1.1;
    cr.position.y = 0.55 + Math.sin(t * 3 + pu.x) * 0.14;
    pl.position.copy(cr.position);
  });
  Object.keys(objects.pups).forEach(k => {
    if (!activePU.has(k)) { scene.remove(objects.pups[k].cr); scene.remove(objects.pups[k].pl); delete objects.pups[k]; }
  });

  // ── PLAYERS ───────────────────────────────────────────────
  if (!objects.players) objects.players = {};
  const liveIds = Object.keys(state.players);
  Object.keys(objects.players).forEach(id => {
    if (!liveIds.includes(id)) {
      scene.remove(objects.players[id].group);
      if (objects.players[id].tag) scene.remove(objects.players[id].tag);
      if (objects.players[id].aura) scene.remove(objects.players[id].aura);
      delete objects.players[id];
    }
  });

  liveIds.forEach(id => {
    const pl = state.players[id];
    const deity = DEITIES[pl.deityIndex];
    if (!objects.players[id]) {
      const group = buildDeity3DModel(pl.deityIndex);
      group.scale.setScalar(0.56);
      scene.add(group);
      const label = pl.walletAddress
        ? `${pl.walletAddress.slice(0, 6)}…${pl.walletAddress.slice(-4)}`
        : deity.name;
      const tag = _makeNameTag(label, deity.color);
      scene.add(tag);
      objects.players[id] = { group, tag };
    }

    const { group, tag } = objects.players[id];
    const wx = pl.x - OFFSET, wz = pl.y - OFFSET;
    group.position.x += (wx - group.position.x) * 0.22;
    group.position.z += (wz - group.position.z) * 0.22;
    group.position.y = Math.sin(t * 2.2 + pl.deityIndex * 1.2) * 0.09 + 0.68;

    const ddx = wx - group.position.x, ddz = wz - group.position.z;
    if (Math.abs(ddx) + Math.abs(ddz) > 0.02) group.rotation.y = Math.atan2(ddx, ddz) + Math.PI / 12;

    _animateDeity(group, t);

    // Power-up aura
    if (pl.hasPowerUp && Date.now() < pl.powerUpEndTime) {
      if (!objects.players[id].auraLight) {
        const al = new THREE.PointLight(deity.color, 1.0, 4);
        group.add(al); objects.players[id].auraLight = al;
      }
    } else if (objects.players[id].auraLight) {
      group.remove(objects.players[id].auraLight);
      delete objects.players[id].auraLight;
    }

    if (tag) tag.position.set(group.position.x, group.position.y + 1.2, group.position.z);
  });

  // ── EFFECTS ───────────────────────────────────────────────
  if (!objects.efx) objects.efx = [];
  const now = Date.now();
  (state.effects || []).forEach(e => {
    const age = now - e.at;
    if (age < 0 || age > 650) return;
    if (!e._m3) {
      const spark = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.14, 0),
        new THREE.MeshStandardMaterial({ color: e.color, emissive: e.color, emissiveIntensity: 1.0, transparent: true, opacity: 0.8 })
      );
      spark.position.set(e.x - OFFSET, 0.38, e.y - OFFSET);
      scene.add(spark); e._m3 = spark; objects.efx.push(e);
    }
    const sc = 1 + age * 0.001;
    e._m3.scale.set(sc, sc, sc);
    e._m3.position.y = 0.38 + age * 0.001;
    e._m3.rotation.y = age * 0.006;
    e._m3.material.opacity = Math.max(0, 1 - age / 650);
    if (age > 640) { scene.remove(e._m3); e._m3 = null; }
  });
  objects.efx = objects.efx.filter(e => e._m3);

  // ── CAMERA FOLLOW ─────────────────────────────────────────
  const local = Object.values(state.players).find(p => p.isLocal);
  if (local) {
    const tx = local.x - OFFSET, tz = local.y - OFFSET;
    camera.position.x += (tx - camera.position.x) * 0.055;
    camera.position.z += (tz + 24 - camera.position.z) * 0.055;
    camera.position.y += (19 - camera.position.y) * 0.055;
    camera.lookAt(tx, 0, tz);
  }

  composer.render();
}

// ═══════════════════════════════════════════════════════════════
// LOBBY DEITY PREVIEW (per-card, no heavy bloom)
// ═══════════════════════════════════════════════════════════════
const previewMap = new WeakMap();

export function renderDeityPreview(canvas, idx) {
  if (previewMap.has(canvas)) return; // already running

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(canvas.width, canvas.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, canvas.width / canvas.height, 0.1, 50);
  camera.position.set(0, 1.4, 3.2);
  camera.lookAt(0, 0.9, 0);

  scene.background = new THREE.Color('#efe1c8');
  scene.add(new THREE.HemisphereLight(0xfff5e4, 0x8c7355, 1.1));
  const kl = new THREE.DirectionalLight(0xffdf9e, 1.8); kl.position.set(-3, 5, 4); scene.add(kl);
  const fl = new THREE.DirectionalLight(0xf3e4c8, 0.55); fl.position.set(3, 2, -2); scene.add(fl);

  const limestone = new THREE.MeshStandardMaterial({ color: '#d2c0a3', roughness: 0.82, metalness: 0.03 });
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.22, 1.6), limestone);
  plinth.position.y = -0.94;
  plinth.receiveShadow = true;
  scene.add(plinth);
  const topPlinth = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.16, 1.35), new THREE.MeshStandardMaterial({ color: '#e3d5be', roughness: 0.75, metalness: 0.05 }));
  topPlinth.position.y = -0.74;
  scene.add(topPlinth);

  const relief = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.025, 0.035), new THREE.MeshStandardMaterial({ color: '#b58a43', roughness: 0.4, metalness: 0.55 }));
  relief.position.set(0, -0.64, 0.55);
  scene.add(relief);

  // Floating rune particles above platform
  const rGeo = new THREE.BufferGeometry();
  const rPos = new Float32Array(24);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    rPos[i * 3] = Math.cos(a) * 0.75; rPos[i * 3 + 1] = -0.55; rPos[i * 3 + 2] = Math.sin(a) * 0.75;
  }
  rGeo.setAttribute('position', new THREE.BufferAttribute(rPos, 3));
  const rpts = new THREE.Points(rGeo, new THREE.PointsMaterial({ color: '#b58a43', size: 0.035, transparent: true, opacity: 0.65 }));
  scene.add(rpts);

  const model = buildDeity3DModel(idx);
  model.scale.setScalar(0.78); model.position.y = -0.25;
  scene.add(model);

  const ps = { renderer, scene, camera, model, rpts, time: 0, raf: null };
  previewMap.set(canvas, ps);

  const loop = () => {
    ps.time += 0.016;
    model.rotation.y = ps.time * 0.82;
    _animateDeity(model, ps.time);
    // Rune particles drift
    const pp = rpts.geometry.attributes.position;
    for (let i = 0; i < 8; i++) {
      pp.setY(i, -0.55 + Math.sin(ps.time * 2.5 + i) * 0.08);
    }
    pp.needsUpdate = true;
    renderer.render(scene, camera);
    ps.raf = requestAnimationFrame(loop);
  };
  loop();
}
