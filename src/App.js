import { useEffect, useState, Suspense, useRef, useMemo } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Physics, usePlane, useSphere } from "@react-three/cannon";
import { paletteData } from "./paletteData";

const PaletteSelector = ({ setSelectedPallete }) => {
  const [number, setNumber] = useState(null);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1
        style={{
          textAlign: "center",
        }}
        className=""
      >
        Enter your pallete number
      </h1>
      <form
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
        onSubmit={() => setSelectedPallete(paletteData[number])}
      >
        <input
          type="number"
          onChange={(e) => setNumber(e.target.value)}
        ></input>
        <br />
        <button>Start</button>
      </form>
    </div>
  );
};

export default function App() {
  const [selectedPallete, setSelectedPallete] = useState(null);

  if (!selectedPallete) {
    return <PaletteSelector setSelectedPallete={setSelectedPallete} />;
  }

  return (
    <Canvas
      shadows
      gl={{
        stencil: false,
        depth: false,
        alpha: false,
        antialias: false,
      }}
      camera={{ position: [0, 0, 20], fov: 50, near: 17, far: 40 }}
    >
      <fog attach="fog" args={[selectedPallete[0], 25, 40]} />
      <color attach="background" args={[selectedPallete[0]]} />
      <ambientLight intensity={2} />
      <directionalLight
        position={[50, 50, 25]}
        angle={0.3}
        intensity={2}
        castShadow
        shadow-mapSize-width={64}
        shadow-mapSize-height={64}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />
      <Physics
        gravity={[0, -50, 0]}
        defaultContactMaterial={{ restitution: 0.5 }}
      >
        <group position={[0, 0, -10]}>
          <Mouse />
          <Borders />
          <InstancedSpheres selectedPallete={selectedPallete} />
        </group>
      </Physics>
    </Canvas>
  );
}

// A physical sphere tied to mouse coordinates without visual representation
function Mouse() {
  const { viewport } = useThree();
  const [, api] = useSphere(() => ({ type: "Kinematic", args: 6 }));
  return useFrame((state) =>
    api.position.set(
      (state.mouse.x * viewport.width) / 2,
      (state.mouse.y * viewport.height) / 2,
      7
    )
  );
}

// A physical plane without visual representation
function Plane({ color, ...props }) {
  usePlane(() => ({ ...props }));
  return null;
}

// Creates a crate that catches the spheres
function Borders() {
  const { viewport } = useThree();
  return (
    <>
      <Plane
        position={[0, -viewport.height / 2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <Plane
        position={[-viewport.width / 2 - 1, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <Plane
        position={[viewport.width / 2 + 1, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      />
      <Plane position={[0, 0, 0]} rotation={[0, 0, 0]} />
      <Plane position={[0, 0, 12]} rotation={[0, -Math.PI, 0]} />
    </>
  );
}

// Spheres falling down
function InstancedSpheres({ count = 200, selectedPallete }) {
  const { viewport } = useThree();
  const [ref] = useSphere((index) => ({
    mass: 100,
    position: [4 - Math.random() * 8, viewport.height, 0, 0],
    args: 1,
  }));

  const colors = useMemo(() => {
    const colorsArray = selectedPallete.slice(1, 5);

    const array = new Float32Array(count * 4);
    const color = new THREE.Color();
    for (let i = 0; i < count; i++)
      color
        .set(colorsArray[Math.floor(Math.random() * 4)])
        .convertSRGBToLinear()
        .toArray(array, i * 3);
    return array;
  }, [count]);

  return (
    <instancedMesh
      ref={ref}
      castShadow
      receiveShadow
      args={[null, null, count]}
    >
      <sphereBufferGeometry args={[1, 32, 32]}>
        <instancedBufferAttribute
          attachObject={["attributes", "color"]}
          args={[colors, 3]}
        />
      </sphereBufferGeometry>
      <meshPhongMaterial attach="material" vertexColors={THREE.VertexColors} />
    </instancedMesh>
  );
}
