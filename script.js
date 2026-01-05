import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2500);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 5;
controls.maxDistance = 100;

const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
const sunLight = new THREE.PointLight(0xffffff, 2, 500);
scene.add(ambientLight);
scene.add(sunLight);

function createStars() {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  for (let i = 0; i < 5000; i++) {
    vertices.push(
      (Math.random() - 0.5) * 2000,
      (Math.random() - 0.5) * 2000,
      (Math.random() - 0.5) * 2000
    );
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  scene.add(new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 })));
}
createStars();

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xffff00, emissive: 0xffff00 })
);
sun.userData = { name: 'Sun' };
scene.add(sun);
sunLight.position.copy(sun.position);

function createOrbitPath(radius, tilt = 0) {
  const points = [];
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    points.push(new THREE.Vector3(
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius
    ));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0x444444, transparent: true, opacity: 1 });
  const orbit = new THREE.Line(geometry, material);
  orbit.rotation.z = tilt;
  scene.add(orbit);
  return orbit;
}

function createPlanet(name, size, color, distance, speedMultiplier, tilt = 0) {
  const geometry = new THREE.SphereGeometry(size, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color });
  const planet = new THREE.Mesh(geometry, material);
  planet.castShadow = true;
  planet.receiveShadow = true;
  planet.userData = { name };
  
  const orbitGroup = new THREE.Group();
  orbitGroup.rotation.z = tilt;
  scene.add(orbitGroup);
  
  createOrbitPath(distance, tilt);
  planet.position.x = distance;
  orbitGroup.add(planet);
  
  return { planet, orbitGroup, speedMultiplier };
}

const planetData = {
  'Mercury': { name: 'Mercury', type: 'Terrestrial', distance: '57.9M km', diameter: '4,879 km', dayLength: '59 days', yearLength: '88 days', temp: '-173°C to 427°C', moons: 0, desc: 'Smallest planet, closest to the Sun.' },
  'Venus': { name: 'Venus', type: 'Terrestrial', distance: '108.2M km', diameter: '12,104 km', dayLength: '243 days', yearLength: '225 days', temp: '462°C', moons: 0, desc: 'Hottest planet with thick toxic atmosphere.' },
  'Earth': { name: 'Earth', type: 'Terrestrial', distance: '149.6M km', diameter: '12,756 km', dayLength: '24 hours', yearLength: '365 days', temp: '-88°C to 58°C', moons: 1, desc: 'Only known planet with life.' },
  'Mars': { name: 'Mars', type: 'Terrestrial', distance: '227.9M km', diameter: '6,792 km', dayLength: '24.6 hours', yearLength: '687 days', temp: '-153°C to 20°C', moons: 2, desc: 'The Red Planet.' },
  'Jupiter': { name: 'Jupiter', type: 'Gas Giant', distance: '778.5M km', diameter: '142,984 km', dayLength: '9.9 hours', yearLength: '12 years', temp: '-110°C', moons: 95, desc: 'Largest planet with Great Red Spot.' },
  'Saturn': { name: 'Saturn', type: 'Gas Giant', distance: '1.43B km', diameter: '120,536 km', dayLength: '10.7 hours', yearLength: '29 years', temp: '-140°C', moons: 146, desc: 'Famous for its beautiful rings.' },
  'Uranus': { name: 'Uranus', type: 'Ice Giant', distance: '2.87B km', diameter: '51,118 km', dayLength: '17.2 hours', yearLength: '84 years', temp: '-195°C', moons: 27, desc: 'Rotates on its side.' },
  'Neptune': { name: 'Neptune', type: 'Ice Giant', distance: '4.5B km', diameter: '49,528 km', dayLength: '16.1 hours', yearLength: '165 years', temp: '-200°C', moons: 16, desc: 'Windiest planet in the solar system.' }
};

const mercury = createPlanet('Mercury', 0.4, 0x8c7853, 8, 1.6, 0.034);
const venus = createPlanet('Venus', 0.6, 0xffc649, 11, 1.2, 0.03);
const earth = createPlanet('Earth', 0.65, 0x6b93d6, 14, 1.0, 0);
const mars = createPlanet('Mars', 0.5, 0xc1440e, 18, 0.8, 0.032);
const jupiter = createPlanet('Jupiter', 1.4, 0xd8ca9d, 25, 0.4, 0.022);
const saturn = createPlanet('Saturn', 1.2, 0xfad5a5, 32, 0.3, 0.044);
const uranus = createPlanet('Uranus', 0.9, 0x4fd0e7, 38, 0.25, 0.032);
const neptune = createPlanet('Neptune', 0.9, 0x4b70dd, 44, 0.2, 0.025);

const rings = new THREE.Mesh(
  new THREE.RingGeometry(1.5, 2.5, 64),
  new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.6 })
);
rings.rotation.x = Math.PI / 2;
saturn.planet.add(rings);

const planets = new Map();
[mercury, venus, earth, mars, jupiter, saturn, uranus, neptune].forEach(p => planets.set(p.planet, p));

camera.position.set(0, 30, 60);
controls.update();

let speed = 0.01;
let isRotating = true;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

renderer.domElement.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  
  const objects = [sun, ...Array.from(planets.keys())];
  const intersects = raycaster.intersectObjects(objects, true);
  
  if (intersects.length > 0) {
    const obj = intersects[0].object;
    const name = obj.userData.name;
    
    if (name === 'Sun') {
      showDetail({
        name: 'Sun', type: 'Star', distance: '0 km', diameter: '1,392,700 km',
        dayLength: '27 days', yearLength: 'N/A', temp: '5,500°C', moons: 0,
        desc: 'The star at the center of our solar system.'
      });
      focusOn(obj, 10);
    } else {
      const planetInfo = planets.get(obj);
      if (planetInfo) {
        showDetail(planetData[name]);
        focusOn(obj, 8);
      }
    }
  }
});

function focusOn(obj, distance) {
  const pos = new THREE.Vector3();
  obj.getWorldPosition(pos);
  const dir = new THREE.Vector3();
  dir.subVectors(camera.position, pos).normalize();
  camera.position.copy(pos).add(dir.multiplyScalar(distance));
  controls.target.copy(pos);
  controls.update();
}

function showDetail(data) {
  const panel = document.getElementById('planetDetailPanel');
  document.getElementById('detailPlanetName').textContent = data.name;
  document.getElementById('detailContent').innerHTML = `
    <p class="detail-stat"><strong>Type:</strong> ${data.type}</p>
    <p class="detail-stat"><strong>Distance:</strong> ${data.distance}</p>
    <p class="detail-stat"><strong>Diameter:</strong> ${data.diameter}</p>
    <p class="detail-stat"><strong>Day:</strong> ${data.dayLength}</p>
    <p class="detail-stat"><strong>Year:</strong> ${data.yearLength}</p>
    <p class="detail-stat"><strong>Temp:</strong> ${data.temp}</p>
    <p class="detail-stat"><strong>Moons:</strong> ${data.moons}</p>
    <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #555;">${data.desc}</p>
  `;
  panel.classList.remove('hidden');
}

function hideDetail() {
  document.getElementById('planetDetailPanel').classList.add('hidden');
  controls.target.set(0, 0, 0);
  controls.update();
}

function resetView() {
  hideDetail();
  camera.position.set(0, 30, 60);
  controls.target.set(0, 0, 0);
  controls.update();
}

function animate() {
  requestAnimationFrame(animate);
  
  if (isRotating) {
    const planetList = [mercury, venus, earth, mars, jupiter, saturn, uranus, neptune];
    planetList.forEach(p => {
      p.planet.rotation.y += speed;
      p.orbitGroup.rotation.y += speed * p.speedMultiplier;
    });
  }
  
  controls.update();
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

document.getElementById('toggleBtn').addEventListener('click', () => {
  isRotating = !isRotating;
  document.getElementById('toggleBtn').innerText = isRotating ? 'Pause' : 'Play';
});

document.getElementById('speedControl').addEventListener('input', (e) => {
  speed = parseFloat(e.target.value);
});

document.getElementById('closeDetailBtn').addEventListener('click', hideDetail);
document.getElementById('resetViewBtn').addEventListener('click', resetView);
