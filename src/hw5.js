import {OrbitControls} from './OrbitControls.js'

// THREE.JS SCENE SETUP

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// Set background color
scene.background = new THREE.Color(0x1a1a2e);

// LIGHTING & SHADOWS

// Add lights to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(8, 30, -25);
scene.add(directionalLight);

// Aim the light down the lane so the shadow camera is centred on the scene
directionalLight.target.position.set(0, 0, -30);
scene.add(directionalLight.target);

// Enable shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(2048, 2048);

// Widen the shadow camera so the WHOLE lane + pins fit inside its frustum.
// (Three.js r128 defaults to a tiny 10x10 box centred on the origin, which
//  would leave every pin and the ball-return machine without shadows.)
directionalLight.shadow.camera.left   = -40;
directionalLight.shadow.camera.right  =  40;
directionalLight.shadow.camera.top    =  45;
directionalLight.shadow.camera.bottom = -45;
directionalLight.shadow.camera.near   = 1;
directionalLight.shadow.camera.far    = 150;
directionalLight.shadow.camera.updateProjectionMatrix();

function degrees_to_radians(degrees) {
  var pi = Math.PI;
  return degrees * (pi/180);
}

// Create bowling lane and infrastructure
function createBowlingLane() {
  // Lane surface - light maple wood surface
  const laneGeometry = new THREE.BoxGeometry(3.5, 0.2, 60);
  const laneMaterial = new THREE.MeshPhongMaterial({
    color: 0xDEB887,  // Light maple wood color
    shininess: 80
  });
  const lane = new THREE.Mesh(laneGeometry, laneMaterial);
  lane.position.set(0, 0, -30);  // Lane extends from Z=0 (foul line) to Z=-60 (pin end)
  lane.receiveShadow = true;
  scene.add(lane);

  // Gutters (both sides, slightly lower than lane surface)
  [-1.9, 1.9].forEach(x => {
    const gutterGeometry = new THREE.BoxGeometry(0.3, 0.08, 60);
    const gutterMaterial = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
    const gutter = new THREE.Mesh(gutterGeometry, gutterMaterial);
    gutter.position.set(x, -0.01, -30);  // Slightly lower than lane surface (Y=0)
    gutter.receiveShadow = true;
    scene.add(gutter);
  });

  // Foul line (Z = 0)
  const foulGeometry = new THREE.BoxGeometry(3.5, 0.12, 0.05);
  const foulMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
  const foul = new THREE.Mesh(foulGeometry, foulMaterial);
  foul.position.set(0, 0.1, 0);
  scene.add(foul);

  // Approach dots (two rows at Z = +3 and Z = +6, on the approach area)
  [3, 6].forEach(z => {
    [-1.5, -0.75, 0, 0.75, 1.5].forEach(x => {
      const dotGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.02, 16);
      const dotMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
      const dot = new THREE.Mesh(dotGeometry, dotMaterial);
      dot.position.set(x, 0.11, z);
      scene.add(dot);
    });
  });

  // Lane arrows (7 arrows at Z = -15)
  [-1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5].forEach(x => {
    const arrowGeometry = new THREE.ConeGeometry(0.08, 0.25, 3);
    const arrowMaterial = new THREE.MeshPhongMaterial({ color: 0xcc4400 });
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrow.rotation.x = Math.PI;           // point toward pins (−Z)
    arrow.position.set(x, 0.11, -15);
    scene.add(arrow);
  });

  // Pin deck
  const deckGeometry = new THREE.BoxGeometry(3.5, 0.12, 4);
  const deckMaterial = new THREE.MeshPhongMaterial({ color: 0xddd5aa });
  const deck = new THREE.Mesh(deckGeometry, deckMaterial);
  deck.position.set(0, 0.101, -58);
  scene.add(deck);

  // Approach area - BEHIND the foul line (positive Z)
  const approachGeometry = new THREE.BoxGeometry(3.5, 0.2, 15);
  const approachMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x8B6F47,  // darker, more brownish tone - clearly different from lane
    shininess: 40     // less glossy than the lane
  });
  const approach = new THREE.Mesh(approachGeometry, approachMaterial);
  approach.position.set(0, 0, 7.5);  // Z=0 to Z=+15, so center at +7.5
  approach.receiveShadow = true;
  scene.add(approach);
}

// Create a single bowling pin using LatheGeometry
function createPin() {
  // Profile points (r, y) traced from base to top
  const points = [
    new THREE.Vector2(0.19, 0.0),   // base rim
    new THREE.Vector2(0.19, 0.05),
    new THREE.Vector2(0.12, 0.35),  // waist
    new THREE.Vector2(0.08, 0.55),  // neck
    new THREE.Vector2(0.12, 0.80),  // belly
    new THREE.Vector2(0.14, 0.90),
    new THREE.Vector2(0.10, 1.15),  // shoulder
    new THREE.Vector2(0.055, 1.22), // head
    new THREE.Vector2(0.0,  1.25),  // top centre
  ];
  const pinGeometry = new THREE.LatheGeometry(points, 24);

  // White body
  const pinMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 60 });
  const pin = new THREE.Mesh(pinGeometry, pinMaterial);
  pin.castShadow = true;

  // Red stripes (two tori at neck height)
  const stripeMaterial = new THREE.MeshPhongMaterial({ color: 0xcc0000 });
  
  const stripeTop = new THREE.Mesh(new THREE.TorusGeometry(0.082, 0.010, 8, 24), stripeMaterial);
  stripeTop.position.y = 0.58;
  stripeTop.rotation.x = Math.PI / 2;
  pin.add(stripeTop);

  const stripeBottom = stripeTop.clone();
  stripeBottom.position.y = 0.52;
  pin.add(stripeBottom);

  return pin;
}

// BALL RETURN MACHINE

function createBallReturn() {
  // Machine positioned behind the pin deck (Z < -60)
  // Main return Funnel (inclined surface for balls to roll)
  const funnelGeometry = new THREE.BoxGeometry(3.5, 0.15, 12);
  const funnelMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xA0522D,  // sienna brown - wooden funnel
    shininess: 30
  });
  const funnel = new THREE.Mesh(funnelGeometry, funnelMaterial);
  funnel.position.set(0, 1.0, -72);
  funnel.rotation.x = degrees_to_radians(-7);  // Downward tilt
  funnel.receiveShadow = true;
  funnel.castShadow = true;
  scene.add(funnel);

  // Collection hopper (ball storage)
  const hopperGeometry = new THREE.BoxGeometry(3.8, 1.2, 2.5);
  const hopperMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x696969,  // dim gray - metal hopper
    shininess: 80
  });
  const hopper = new THREE.Mesh(hopperGeometry, hopperMaterial);
  hopper.position.set(0, 0.3, -80);
  hopper.receiveShadow = true;
  hopper.castShadow = true;
  scene.add(hopper);

  // Left side rail - child of Funnel for perfect attachment
  const railLeftGeometry = new THREE.BoxGeometry(0.2, 1.0, 12);
  const railMaterial = new THREE.MeshPhongMaterial({ color: 0x2F4F4F });
  const railLeft = new THREE.Mesh(railLeftGeometry, railMaterial);
  railLeft.position.set(-1.85, 0.5, 0);  // Position relative to Funnel
  railLeft.castShadow = true;
  funnel.add(railLeft);  // Make it a child of Funnel

  // Right side rail - child of Funnel for perfect attachment
  const railRight = railLeft.clone();
  railRight.position.x = 1.85;
  funnel.add(railRight);  // Make it a child of Funnel

  // Support legs - 4 vertical supports
  const legGeometry = new THREE.BoxGeometry(0.12, 1.0, 0.12);
  const legMaterial = new THREE.MeshPhongMaterial({ color: 0x2F4F4F });

  const legPositions = [
    [-1.6, -72],
    [1.6, -72],
    [-1.6, -80],
    [1.6, -80],
  ];

  legPositions.forEach(([x, z]) => {
    const leg = new THREE.Mesh(legGeometry, legMaterial);
    leg.position.set(x, 0.4, z);
    leg.castShadow = true;
    scene.add(leg);
  });
}

// Create all elements
createBowlingLane();
createBallReturn();  // Bonus feature: ball return machine

// BOWLING PINS (10 pins in standard triangular formation)

// Pin positions - standard triangular formation
const PIN_POSITIONS = [
  { x:  0.0, z: -57.000 },  // 1 head pin
  { x: -0.5, z: -57.866 },  // 2
  { x:  0.5, z: -57.866 },  // 3
  { x: -1.0, z: -58.732 },  // 4
  { x:  0.0, z: -58.732 },  // 5
  { x:  1.0, z: -58.732 },  // 6
  { x: -1.5, z: -59.598 },  // 7
  { x: -0.5, z: -59.598 },  // 8
  { x:  0.5, z: -59.598 },  // 9
  { x:  1.5, z: -59.598 },  // 10
];

// Place all pins
PIN_POSITIONS.forEach(pos => {
  const pin = createPin();
  pin.position.set(pos.x, 0.16, pos.z);  // sit on the pin-deck surface (top ≈ 0.161)
  scene.add(pin);
});

// Create bowling ball
// Main sphere
const ballGeometry = new THREE.SphereGeometry(0.45, 32, 32);
const ballMaterial = new THREE.MeshPhongMaterial({
  color: 0x2a3a4a,
  shininess: 150,
  specular: 0x6666ff,
});
const ball = new THREE.Mesh(ballGeometry, ballMaterial);
ball.position.set(0, 0.55, 5);   // on approach area, centered (0.1 surface + 0.45 radius)
ball.castShadow = true;
scene.add(ball);

// Finger holes: two adjacent + one offset
const holeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
const holeGeometry = new THREE.CylinderGeometry(0.045, 0.045, 0.14, 12);

const holeOffsets = [
  { x: -0.13, y: 0.32, z: 0.27 },  // left finger
  { x:  0.13, y: 0.32, z: 0.27 },  // right finger
  { x:  0.0,  y: 0.15, z: 0.42 },  // thumb (offset lower, more forward)
];
holeOffsets.forEach(o => {
  const hole = new THREE.Mesh(holeGeometry, holeMaterial);
  
  // Keep position just slightly inside (97% of surface distance) so holes are visible
  hole.position.set(o.x * 0.97, o.y * 0.97, o.z * 0.97);
  hole.lookAt(new THREE.Vector3(0, 0, 0));
  ball.add(hole);   // add as child so it moves with the ball
});

// CAMERA & CONTROLS

// Set camera position for bowler's perspective
const cameraTranslate = new THREE.Matrix4();
cameraTranslate.makeTranslation(0, 5, 12);
camera.applyMatrix4(cameraTranslate);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, -30);
controls.update();
let isOrbitEnabled = true;

// Handle key events
function handleKeyDown(e) {
  if (e.key === "o" || e.key === "O") {
    isOrbitEnabled = !isOrbitEnabled;
    controls.enabled = isOrbitEnabled;
  }
}

document.addEventListener('keydown', handleKeyDown);

// Keep the camera and renderer in sync when the window is resized
function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleResize);

// ANIMATION LOOP

// Animation function
function animate() {
  requestAnimationFrame(animate);

  // Update controls
  controls.enabled = isOrbitEnabled;
  controls.update();

  renderer.render(scene, camera);
}

animate();
