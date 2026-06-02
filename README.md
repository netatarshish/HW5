# Computer Graphics – Exercise 5 – WebGL Bowling Alley

A 3D bowling alley scene built with **Three.js (r128)** and WebGL. This exercise
implements the static infrastructure: a detailed lane with markings, ten pins in
regulation formation, a bowling ball with finger holes, lighting with shadows, an
interactive orbit camera, and the UI framework.

> Interactive controls, ball physics, pin collisions, and the scoring system will
> be implemented in the next exercise (HW06).

## Group Members

- Amit Manoshevitz
- Neta Tarshish

## How to Run

1. Make sure you have **Node.js** installed.
2. From the project folder, install dependencies (only needed once):
   ```bash
   npm install
   ```
3. Start the local web server:
   ```bash
   node index.js
   ```
4. Open your browser at **http://localhost:8000**

> Note: the scene uses ES modules, so it must be served over HTTP. Do **not** open
> `index.html` directly from the file system — use the local server above.

## Controls

- **O** — toggle the orbit camera on/off
- **Drag** — rotate the camera
- **Scroll** — zoom in / out

## Implemented Features

### Bowling lane and markings
- Maple-wood lane surface with a glossy finish (~60 × 3.5 units)
- Red foul line across the full lane width
- Two rows of approach dots
- Seven targeting arrows embedded in the lane
- Gutters on both sides, set slightly below the lane surface
- A separate approach area in a darker, less glossy shade

### Pins
- Ten pins in the standard 1-2-3-4 triangular formation
- Pin shape built with `THREE.LatheGeometry` (wide body, narrow neck, rounded top)
- White body with red stripe bands near the neck
- A distinct pin-deck surface behind the pins

### Bowling ball
- Glossy sphere (radius 0.45) with high shininess
- Three finger holes (two adjacent + one offset thumb hole)
- Positioned statically on the approach area (no physics)

### Lighting, shadows and camera
- Ambient + directional lighting
- Shadows enabled (PCF soft shadows); the directional light's shadow camera is
  sized to cover the entire lane and pins
- Interactive orbit camera with an initial bowler's-perspective position

### UI framework
- HTML container for a future 10-frame scorecard
- HTML container for the controls panel
- CSS styling for both, positioned over the canvas
- Window-resize handling keeps the view correct when the window size changes

## Bonus Features

- **Ball-return machine** behind the pin deck: an inclined return funnel with side
  rails, a collection hopper, and support legs.

## Known Issues / Limitations

- This submission is the static infrastructure only — there is no ball rolling,
  pin collision, or scoring yet (these are part of HW06, as stated in the
  assignment).
- The scene is fully procedural; no external 3D models or textures are used.

## External Assets

- **Three.js r128** — loaded from the cdnjs CDN.
- **OrbitControls.js** — from the Three.js examples (provided with the starter code).
- No external textures, images, models, or sounds were used; all geometry is
  generated in code.

## Screenshots

**Overall view of the lane and pins**
**Close-up of the pin formation**
**Bowling ball on the approach area**
**Side view demonstrating the orbit camera (and the ball-return machine)**
