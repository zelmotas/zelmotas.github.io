import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

export const PIN_Y = 0.28;

/** world position of a digital pin on the Uno header */
export function pinPos(pin: number): [number, number, number] {
  const i = Math.max(0, Math.min(13, pin));
  return [-1.65 + i * 0.25, PIN_Y, -2.45];
}

export function Wire({
  from,
  to,
  color = "#e0b040",
  lift = 1.6,
}: {
  from: [number, number, number];
  to: [number, number, number];
  color?: string;
  lift?: number;
}) {
  const geo = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const mid = a.clone().lerp(b, 0.5);
    mid.y += lift;
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    return new THREE.TubeGeometry(curve, 32, 0.035, 8, false);
  }, [from, to, lift]);
  return (
    <mesh geometry={geo} castShadow>
      <meshStandardMaterial color={color} roughness={0.45} />
    </mesh>
  );
}

export function ArduinoBoard() {
  return (
    <group>
      {/* PCB */}
      <mesh position={[0, 0.075, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.9, 0.15, 5.3]} />
        <meshStandardMaterial color="#0d5f6e" roughness={0.55} metalness={0.15} />
      </mesh>
      {/* silk text */}
      <Text
        position={[0, 0.16, 1.35]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.26}
        color="#eaf7f7"
        anchorX="center"
      >
        ARDUINO UNO
      </Text>
      {/* headers */}
      {[-2.45, 2.45].map((z) => (
        <mesh key={z} position={[0, 0.24, z]}>
          <boxGeometry args={[3.6, 0.2, 0.24]} />
          <meshStandardMaterial color="#111417" roughness={0.8} />
        </mesh>
      ))}
      {Array.from({ length: 14 }).map((_, i) => (
        <mesh key={i} position={[-1.65 + i * 0.25, 0.36, -2.45]}>
          <boxGeometry args={[0.06, 0.16, 0.06]} />
          <meshStandardMaterial color="#d8c07a" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}
      {/* USB */}
      <mesh position={[-1.15, 0.35, 2.75]}>
        <boxGeometry args={[1.1, 0.5, 0.9]} />
        <meshStandardMaterial color="#b9bdc4" metalness={0.9} roughness={0.28} />
      </mesh>
      {/* barrel jack */}
      <mesh position={[1.1, 0.35, 2.85]}>
        <boxGeometry args={[0.9, 0.5, 0.7]} />
        <meshStandardMaterial color="#0b0d10" roughness={0.7} />
      </mesh>
      {/* MCU */}
      <mesh position={[0.3, 0.22, -0.6]}>
        <boxGeometry args={[1.5, 0.14, 0.7]} />
        <meshStandardMaterial color="#15181c" roughness={0.6} />
      </mesh>
      {/* power LED */}
      <mesh position={[-1.5, 0.19, -1.1]}>
        <boxGeometry args={[0.14, 0.08, 0.2]} />
        <meshStandardMaterial color="#5ef08a" emissive="#3ce07a" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

export function Breadboard({ position = [0, 0, 0] as [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.15, 0]} receiveShadow castShadow>
        <boxGeometry args={[6.4, 0.3, 2.6]} />
        <meshStandardMaterial color="#e9e6dd" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.31, 0]}>
        <boxGeometry args={[6.4, 0.02, 0.35]} />
        <meshStandardMaterial color="#cfcabc" />
      </mesh>
    </group>
  );
}

export function Led3D({
  position,
  color,
  intensity,
}: {
  position: [number, number, number];
  color: string;
  intensity: number;
}) {
  const c = useMemo(() => new THREE.Color(color), [color]);
  return (
    <group position={position}>
      <mesh position={[0, 0.32, 0]} castShadow>
        <capsuleGeometry args={[0.16, 0.24, 6, 16]} />
        <meshStandardMaterial
          color={c}
          transparent
          opacity={0.85}
          emissive={c}
          emissiveIntensity={intensity * 2.2}
          roughness={0.15}
        />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.19, 0.19, 0.1, 20]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={intensity} />
      </mesh>
      {intensity > 0.05 && (
        <pointLight position={[0, 0.5, 0]} color={c} intensity={intensity * 2.2} distance={3.2} />
      )}
    </group>
  );
}

export function Button3D({
  position,
  onPress,
  color = "#e0483c",
}: {
  position: [number, number, number];
  onPress: () => void;
  color?: string;
}) {
  const [down, setDown] = useState(false);
  const [hover, setHover] = useState(false);
  const cap = useRef<THREE.Mesh>(null);
  useFrame((_, d) => {
    if (!cap.current) return;
    const target = down ? 0.24 : 0.34;
    cap.current.position.y += (target - cap.current.position.y) * Math.min(1, d * 18);
  });
  return (
    <group
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = "auto";
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        setDown(true);
        onPress();
      }}
      onPointerUp={() => setDown(false)}
    >
      <mesh position={[0, 0.14, 0]} castShadow>
        <boxGeometry args={[0.62, 0.28, 0.62]} />
        <meshStandardMaterial color="#1b1f24" roughness={0.7} />
      </mesh>
      <mesh ref={cap} position={[0, 0.34, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.2, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hover ? 0.65 : 0.18}
          roughness={0.35}
        />
      </mesh>
    </group>
  );
}

export function Lcd3D({
  position,
  line1,
  line2,
  rotation = [0, 0, 0] as [number, number, number],
}: {
  position: [number, number, number];
  line1: string;
  line2: string;
  rotation?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[4.6, 0.3, 1.9]} />
        <meshStandardMaterial color="#0f4f3a" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.31, -0.1]}>
        <boxGeometry args={[3.9, 0.04, 1.15]} />
        <meshStandardMaterial color="#1fb6a8" emissive="#1fb6a8" emissiveIntensity={1.4} />
      </mesh>
      <Text
        position={[-1.85, 0.35, -0.38]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.23}
        color="#04231f"
        anchorX="left"
        maxWidth={3.8}
      >
        {line1}
      </Text>
      <Text
        position={[-1.85, 0.35, 0.05]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.23}
        color="#04231f"
        anchorX="left"
        maxWidth={3.8}
      >
        {line2}
      </Text>
    </group>
  );
}

export function Buzzer3D({
  position,
  active,
}: {
  position: [number, number, number];
  active: boolean;
}) {
  const ring = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ring.current) return;
    const t = clock.getElapsedTime();
    const s = active ? 1 + Math.sin(t * 22) * 0.14 : 1;
    ring.current.scale.setScalar(s);
  });
  return (
    <group position={position}>
      <mesh ref={ring} position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.45, 0.5, 28]} />
        <meshStandardMaterial
          color="#0b0d10"
          emissive={active ? "#e0b040" : "#000000"}
          emissiveIntensity={active ? 0.8 : 0}
          roughness={0.6}
        />
      </mesh>
      <mesh position={[0, 0.51, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.04, 16]} />
        <meshStandardMaterial color="#3a3f46" />
      </mesh>
    </group>
  );
}

export function Servo3D({
  position,
  angle,
}: {
  position: [number, number, number];
  angle: number;
}) {
  const arm = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (!arm.current) return;
    const target = THREE.MathUtils.degToRad(angle);
    arm.current.rotation.y += (target - arm.current.rotation.y) * Math.min(1, d * 8);
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[1.2, 0.8, 0.6]} />
        <meshStandardMaterial color="#1c6fd8" roughness={0.5} />
      </mesh>
      <mesh position={[0.3, 0.85, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.12, 20]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>
      <group ref={arm} position={[0.3, 0.95, 0]}>
        <mesh position={[0.9, 0, 0]} castShadow>
          <boxGeometry args={[2.0, 0.08, 0.24]} />
          <meshStandardMaterial color="#e0b040" emissive="#e0b040" emissiveIntensity={0.25} />
        </mesh>
      </group>
    </group>
  );
}

export function Pot3D({
  position,
  value,
  onChange,
}: {
  position: [number, number, number];
  value: number; // 0..1
  onChange?: (v: number) => void;
}) {
  const knob = useRef<THREE.Group>(null);
  useFrame(() => {
    if (knob.current) knob.current.rotation.y = -value * Math.PI * 1.5;
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.7, 0.4, 0.7]} />
        <meshStandardMaterial color="#1b6ad8" roughness={0.6} />
      </mesh>
      <group
        ref={knob}
        position={[0, 0.5, 0]}
        onPointerOver={() => onChange && (document.body.style.cursor = "ew-resize")}
        onPointerOut={() => (document.body.style.cursor = "auto")}
        onPointerDown={(e) => {
          if (!onChange) return;
          e.stopPropagation();
          const startX = e.clientX;
          const start = value;
          const move = (ev: PointerEvent) => {
            onChange(Math.min(1, Math.max(0, start + (ev.clientX - startX) / 260)));
          };
          const up = () => {
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", up);
          };
          window.addEventListener("pointermove", move);
          window.addEventListener("pointerup", up);
        }}
      >
        <mesh castShadow>
          <cylinderGeometry args={[0.34, 0.3, 0.3, 24]} />
          <meshStandardMaterial color="#101317" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.16, 0.2]}>
          <boxGeometry args={[0.07, 0.03, 0.3]} />
          <meshStandardMaterial color="#e0b040" emissive="#e0b040" emissiveIntensity={0.8} />
        </mesh>
      </group>
    </group>
  );
}

export function Pir3D({ position, active }: { position: [number, number, number]; active: boolean }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[1.2, 0.3, 1.2]} />
        <meshStandardMaterial color="#0e6b3e" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.55, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#f1f3f5"
          transparent
          opacity={0.75}
          emissive={active ? "#e0483c" : "#000000"}
          emissiveIntensity={active ? 1.4 : 0}
        />
      </mesh>
    </group>
  );
}

export function Sonar3D({
  position,
  distance,
  onChange,
}: {
  position: [number, number, number];
  distance: number; // cm
  onChange?: (v: number) => void;
}) {
  const wave = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!wave.current) return;
    const t = (clock.getElapsedTime() % 1) / 1;
    wave.current.scale.setScalar(0.2 + t * 2.4);
    (wave.current.material as THREE.MeshBasicMaterial).opacity = 0.5 * (1 - t);
  });
  const z = position[2] + Math.min(9, distance / 6);
  return (
    <group>
      <group position={position}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[1.7, 0.9, 0.3]} />
          <meshStandardMaterial color="#12303f" roughness={0.6} />
        </mesh>
        {[-0.42, 0.42].map((x) => (
          <mesh key={x} position={[x, 0.55, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.32, 0.32, 0.28, 24]} />
            <meshStandardMaterial color="#9aa2ab" metalness={0.7} roughness={0.35} />
          </mesh>
        ))}
        <mesh ref={wave} position={[0, 0.55, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.62, 32]} />
          <meshBasicMaterial color="#2ee6c8" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {/* draggable target object */}
      <group
        position={[position[0], 0, z]}
        onPointerOver={() => onChange && (document.body.style.cursor = "grab")}
        onPointerOut={() => (document.body.style.cursor = "auto")}
        onPointerDown={(e) => {
          if (!onChange) return;
          e.stopPropagation();
          const startY = e.clientY;
          const start = distance;
          const move = (ev: PointerEvent) => {
            onChange(Math.min(60, Math.max(2, start + (ev.clientY - startY) / 6)));
          };
          const up = () => {
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", up);
          };
          window.addEventListener("pointermove", move);
          window.addEventListener("pointerup", up);
        }}
      >
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[1.2, 1.2, 1.2]} />
          <meshStandardMaterial color="#e0b040" roughness={0.4} emissive="#e0b040" emissiveIntensity={0.2} />
        </mesh>
      </group>
    </group>
  );
}
