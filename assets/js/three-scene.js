// Three.js ambient animations for the whole site.
// Each scene attaches itself to a section, only animates while that section is on screen,
// stays still for visitors who prefer reduced motion, and is skipped if WebGL is unavailable.
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

// The shaders below write the brand colours as-is, so skip linear colour conversion.
THREE.ColorManagement.enabled = false;

const COLORS = { cinnamon: 0xa9603a, ember: 0xe0592a, sand: 0xf4ece1, gold: 0xf6c9a8 };
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const small = matchMedia("(max-width: 640px)").matches;

const pointer = new THREE.Vector2();
addEventListener("pointermove", (e) => {
  pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
}, { passive: true });

// Soft round dot shared by every particle scene.
const dotFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(uColor, (1.0 - smoothstep(0.0, 0.5, d)) * vAlpha * uOpacity);
  }
`;

function pointsMaterial(vertexShader, color, opacity, blending = THREE.NormalBlending) {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader: dotFragment,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uAspect: { value: 1 },
      uPointer: { value: new THREE.Vector2() },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
    },
    transparent: true,
    depthWrite: false,
    blending,
  });
}

// Voice: rings of light rippling outward like sound on water, with soft ✺ petals.
function ripples(renderer) {
  const rings = small ? 11 : 16;
  const perRing = small ? 90 : 150;
  const radius = new Float32Array(rings * perRing);
  const angle = new Float32Array(rings * perRing);
  for (let r = 0, i = 0; r < rings; r++) {
    for (let k = 0; k < perRing; k++, i++) {
      radius[i] = 0.35 + (r / (rings - 1)) * 4.1;
      angle[i] = (k / perRing) * Math.PI * 2 + r * 0.07;
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(rings * perRing * 3), 3));
  geometry.setAttribute("aRadius", new THREE.BufferAttribute(radius, 1));
  geometry.setAttribute("aAngle", new THREE.BufferAttribute(angle, 1));

  const material = pointsMaterial(/* glsl */ `
    uniform float uTime;
    uniform float uPixelRatio;
    attribute float aRadius;
    attribute float aAngle;
    varying float vAlpha;
    void main() {
      float wave = sin(aRadius * 2.2 - uTime * 1.1) * 0.2;
      float petals = sin(aAngle * 8.0 + uTime * 0.25) * 0.05 * aRadius;
      float r = aRadius + petals * 0.35;
      vec3 p = vec3(cos(aAngle) * r, sin(aAngle) * r, wave + petals * 0.25);
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = uPixelRatio * (3.6 + wave * 7.0) * (9.0 / -mv.z);
      vAlpha = (1.0 - smoothstep(1.0, 4.6, aRadius)) * clamp(0.7 + wave * 1.5, 0.0, 1.0);
    }
  `, COLORS.cinnamon, 0.7);

  const scene = new THREE.Scene();
  const group = new THREE.Group();
  group.add(new THREE.Points(geometry, material));
  scene.add(group);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  return {
    resize(w, h, pr) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      material.uniforms.uPixelRatio.value = pr;
      // Rise out of the bottom-right corner so the headline and intro text stay clear.
      const halfHeight = Math.tan(THREE.MathUtils.degToRad(21)) * 9;
      const halfWidth = halfHeight * camera.aspect;
      group.position.set(halfWidth - 0.9, -halfHeight + 0.5, 0);
      group.scale.setScalar(camera.aspect < 0.8 ? 0.7 : 0.9);
    },
    render(t) {
      material.uniforms.uTime.value = t;
      group.rotation.x += (-0.8 + pointer.y * 0.12 - group.rotation.x) * 0.04;
      group.rotation.y += (pointer.x * 0.22 - group.rotation.y) * 0.04;
      group.rotation.z = t * 0.03;
      renderer.render(scene, camera);
    },
  };
}

// Golden dust: glowing motes drifting upward, twinkling softly.
function dust(renderer, { color, count, opacity, size = 1 }) {
  const position = new Float32Array(count * 3);
  const aSize = new Float32Array(count);
  const aPhase = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    position[i * 3] = Math.random() * 2 - 1;
    position[i * 3 + 1] = Math.random() * 2 - 1;
    aSize[i] = (1 + Math.random() * 3) * size;
    aPhase[i] = Math.random();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(aSize, 1));
  geometry.setAttribute("aPhase", new THREE.BufferAttribute(aPhase, 1));

  const material = pointsMaterial(/* glsl */ `
    uniform float uTime;
    uniform float uPixelRatio;
    uniform float uAspect;
    uniform vec2 uPointer;
    attribute float aSize;
    attribute float aPhase;
    varying float vAlpha;
    void main() {
      vec3 p = position;
      p.y = mod(p.y + 1.0 + uTime * (0.02 + aPhase * 0.035), 2.0) - 1.0;
      float depth = aSize / 4.0;
      p.x = p.x * uAspect + sin(uTime * 0.35 + aPhase * 6.2831) * 0.06 + uPointer.x * 0.05 * depth;
      p.y += uPointer.y * 0.03 * depth;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      gl_PointSize = aSize * uPixelRatio * 2.2;
      float edge = 1.0 - smoothstep(0.7, 1.0, abs(p.y));
      vAlpha = edge * (0.25 + 0.75 * pow(abs(sin(uTime * 0.6 + aPhase * 20.0)), 2.0));
    }
  `, color, opacity, THREE.AdditiveBlending);

  const scene = new THREE.Scene();
  scene.add(new THREE.Points(geometry, material));
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);

  return {
    resize(w, h, pr) {
      const aspect = w / h;
      Object.assign(camera, { left: -aspect, right: aspect });
      camera.updateProjectionMatrix();
      material.uniforms.uAspect.value = aspect;
      material.uniforms.uPixelRatio.value = pr;
    },
    render(t) {
      material.uniforms.uTime.value = t;
      material.uniforms.uPointer.value.lerp(pointer, 0.05);
      renderer.render(scene, camera);
    },
  };
}

// Breath: a field of points rising and falling like breathing earth.
function flow(renderer, { color, opacity }) {
  const cols = small ? 60 : 120;
  const rows = small ? 22 : 38;
  const position = new Float32Array(cols * rows * 3);
  for (let r = 0, i = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++, i += 3) {
      position[i] = (c / (cols - 1)) * 14 - 7;
      position[i + 2] = (r / (rows - 1)) * 7 - 4;
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));

  const material = pointsMaterial(/* glsl */ `
    uniform float uTime;
    uniform float uPixelRatio;
    varying float vAlpha;
    void main() {
      vec3 p = position;
      p.y = sin(p.x * 0.6 + uTime * 0.45) * 0.28
          + cos(p.z * 1.1 + uTime * 0.3) * 0.2
          + sin((p.x + p.z) * 0.35 - uTime * 0.22) * 0.18;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = uPixelRatio * 3.2 * (6.0 / -mv.z);
      vAlpha = (1.0 - smoothstep(4.0, 13.0, -mv.z)) * (1.0 - smoothstep(5.0, 7.0, abs(p.x)))
             * clamp(0.75 + p.y, 0.25, 1.0);
    }
  `, color, opacity, THREE.AdditiveBlending);

  const scene = new THREE.Scene();
  const field = new THREE.Points(geometry, material);
  scene.add(field);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  const target = new THREE.Vector3(0, 0.4, -1);

  return {
    resize(w, h, pr) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      material.uniforms.uPixelRatio.value = pr;
      // Keep the field low in the band so it frames, rather than crosses, the text.
      field.position.y = w / h > 1.4 ? -1.9 : -2.6;
    },
    render(t) {
      material.uniforms.uTime.value = t;
      camera.position.x += (pointer.x * 0.8 - camera.position.x) * 0.03;
      camera.position.y = 1.4 + pointer.y * 0.2;
      camera.position.z = 5.5;
      camera.lookAt(target);
      renderer.render(scene, camera);
    },
  };
}

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const active = [];

function mount(el, factory, options = {}) {
  const canvas = document.createElement("canvas");
  canvas.className = "three-canvas";
  canvas.setAttribute("aria-hidden", "true");
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  } catch {
    return;
  }
  el.classList.add("has-three");
  el.prepend(canvas);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setClearColor(0x000000, 0);

  const scene = factory(renderer, options);
  const item = { scene, visible: false, shown: false, canvas };
  const fit = () => {
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    scene.resize(w, h, renderer.getPixelRatio());
    if (reduceMotion) draw(item, 6);
  };
  new ResizeObserver(fit).observe(el);
  new IntersectionObserver(([entry]) => { item.visible = entry.isIntersecting; }, { rootMargin: "120px" }).observe(el);
  fit();
  active.push(item);
}

function draw(item, t) {
  item.scene.render(t);
  if (!item.shown) {
    item.shown = true;
    item.canvas.classList.add("ready");
  }
}

if (webglAvailable()) {
  document.querySelectorAll(".hero-text").forEach((el) => mount(el, ripples));
  document.querySelectorAll(".page-hero").forEach((el) =>
    mount(el, dust, { color: COLORS.gold, count: small ? 70 : 150, opacity: 0.9 }));
  document.querySelectorAll(".section.bg-olive, .section.bg-ink").forEach((el) =>
    mount(el, flow, { color: COLORS.sand, opacity: el.classList.contains("bg-ink") ? 0.8 : 0.7 }));
  document.querySelectorAll(".newsletter.bg-olive .inner").forEach((el) =>
    mount(el, dust, { color: COLORS.gold, count: small ? 45 : 100, opacity: 0.75 }));
  document.querySelectorAll(".site-footer").forEach((el) =>
    mount(el, dust, { color: COLORS.sand, count: small ? 35 : 70, opacity: 0.5, size: 0.9 }));

  if (!reduceMotion) {
    const clock = new THREE.Clock();
    const loop = () => {
      const t = clock.getElapsedTime();
      for (const item of active) if (item.visible) draw(item, t);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}
