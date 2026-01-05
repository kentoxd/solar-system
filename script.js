import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  2500
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 5;
controls.maxDistance = 100;
controls.autoRotate = false;

// Ambient light
const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
scene.add(ambientLight);

// Point light (Sun)
const sunLight = new THREE.PointLight(0xffffff, 2, 500);
scene.add(sunLight);

// Stars background
function createStars() {
  const starsGeometry = new THREE.BufferGeometry();
  const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
  
  const starsVertices = [];
  for (let i = 0; i < 10000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starsVertices.push(x, y, z);
  }
  
  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
  const stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);
}
createStars();

// Sun
const sunGeometry = new THREE.SphereGeometry(3, 64, 64);
const sunMaterial = new THREE.MeshBasicMaterial({ 
  color: 0xffff00,
  emissive: 0xffff00,
  emissiveIntensity: 0.5
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.castShadow = false;
sun.receiveShadow = false;
scene.add(sun);
sunLight.position.copy(sun.position);

function createPlanet(size, color, distance, speedMultiplier, tilt = 0) {
  const geometry = new THREE.SphereGeometry(size, 64, 64);
  const material = new THREE.MeshStandardMaterial({ 
    color,
    roughness: 0.8,
    metalness: 0.2
  });
  const planet = new THREE.Mesh(geometry, material);
  planet.castShadow = true;
  planet.receiveShadow = true;
  
  // Create orbit group
  const orbitGroup = new THREE.Group();
  orbitGroup.rotation.z = tilt;
  scene.add(orbitGroup);
  
  planet.position.x = distance;
  orbitGroup.add(planet);
  
  return { planet, orbitGroup, speedMultiplier };
}

const mercury = createPlanet(0.4, 0x8c7853, 8, 1.6, 0.034);
const venus = createPlanet(0.6, 0xffc649, 11, 1.2, 0.03);
const earth = createPlanet(0.65, 0x6b93d6, 14, 1.0, 0);
const mars = createPlanet(0.5, 0xc1440e, 18, 0.8, 0.032);
const jupiter = createPlanet(1.4, 0xd8ca9d, 25, 0.4, 0.022);
const saturn = createPlanet(1.2, 0xfad5a5, 32, 0.3, 0.044);
const uranus = createPlanet(0.9, 0x4fd0e7, 38, 0.25, 0.032);
const neptune = createPlanet(0.9, 0x4b70dd, 44, 0.2, 0.025);

const ringGeometry = new THREE.RingGeometry(1.5, 2.5, 64);
const ringMaterial = new THREE.MeshBasicMaterial({ 
  color: 0xffffff, 
  side: THREE.DoubleSide,
  opacity: 0.6,
  transparent: true
});
const rings = new THREE.Mesh(ringGeometry, ringMaterial);
rings.rotation.x = Math.PI / 2;
saturn.planet.add(rings);

camera.position.set(0, 30, 60);
controls.update();

let speed = 0.01;
let isRotating = true;

function animate() {
  requestAnimationFrame(animate);
  
  if (isRotating) {
    mercury.planet.rotation.y += speed * 1.5;
    venus.planet.rotation.y += speed * 0.8;
    earth.planet.rotation.y += speed;
    mars.planet.rotation.y += speed * 0.9;
    jupiter.planet.rotation.y += speed * 2.5;
    saturn.planet.rotation.y += speed * 2.3;
    uranus.planet.rotation.y += speed * 1.4;
    neptune.planet.rotation.y += speed * 1.5;
    
    mercury.orbitGroup.rotation.y += speed * mercury.speedMultiplier;
    venus.orbitGroup.rotation.y += speed * venus.speedMultiplier;
    earth.orbitGroup.rotation.y += speed * earth.speedMultiplier;
    mars.orbitGroup.rotation.y += speed * mars.speedMultiplier;
    jupiter.orbitGroup.rotation.y += speed * jupiter.speedMultiplier;
    saturn.orbitGroup.rotation.y += speed * saturn.speedMultiplier;
    uranus.orbitGroup.rotation.y += speed * uranus.speedMultiplier;
    neptune.orbitGroup.rotation.y += speed * neptune.speedMultiplier;
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

const toggleBtn = document.getElementById("toggleBtn");
toggleBtn.addEventListener("click", () => {
  isRotating = !isRotating;
  toggleBtn.innerText = isRotating ? "Pause" : "Play";
});

document.getElementById("speedControl").addEventListener("input", (e) => {
  speed = parseFloat(e.target.value);
});