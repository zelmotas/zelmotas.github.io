import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment } from "@react-three/drei";
import {
  ArduinoBoard,
  Breadboard,
  Button3D,
  Buzzer3D,
  Lcd3D,
  Led3D,
  Pir3D,
  Pot3D,
  Servo3D,
  Sonar3D,
  Wire,
  pinPos,
} from "./parts";

export type RigState =
  | {
      kind: "reaction";
      lights: number;
      buzzer: boolean;
      lcd: [string, string];
      onButton: () => void;
    }
  | {
      kind: "chess";
      lcd: [string, string];
      rgb: { r: number; g: number; b: number };
      buzzer: boolean;
      onBtn1: () => void;
      onBtn2: () => void;
    }
  | {
      kind: "birthday";
      lcd: [string, string];
      rgb: { r: number; g: number; b: number };
      buzzer: boolean;
      onButton: () => void;
    }
  | {
      kind: "alarm";
      lcd: [string, string];
      rgb: { r: number; g: number; b: number };
      pir: boolean;
      siren: boolean;
      pot: number;
      onPot: (v: number) => void;
      onArm: () => void;
      onSelect: () => void;
    }
  | {
      kind: "gate";
      lcd: [string, string];
      distance: number;
      onDistance: (v: number) => void;
      angle: number;
    };

const rgbHex = (r: number, g: number, b: number) =>
  `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")}`;

function Rig({ s }: { s: RigState }) {
  switch (s.kind) {
    case "reaction": {
      const leds = [0, 1, 2, 3];
      return (
        <group>
          <Breadboard position={[0, 0, -5.2]} />
          {leds.map((i) => {
            const x = -2.4 + i * 1.6;
            const on = i < s.lights;
            return (
              <group key={i}>
                <Led3D position={[x, 0.3, -5.2]} color="#e0483c" intensity={on ? 1 : 0.04} />
                <Wire from={pinPos(2 + i)} to={[x, 0.35, -5.2]} color="#e0483c" lift={1.4} />
              </group>
            );
          })}
          <Button3D position={[3.6, 0, 1.2]} onPress={s.onButton} color="#2ee6c8" />
          <Wire from={pinPos(6)} to={[3.6, 0.3, 1.2]} color="#2ee6c8" lift={2} />
          <Buzzer3D position={[-4.2, 0, 1.4]} active={s.buzzer} />
          <Wire from={pinPos(9)} to={[-4.2, 0.4, 1.4]} color="#8a8f96" lift={2} />
          <Lcd3D position={[0, 0, 5.2]} line1={s.lcd[0]} line2={s.lcd[1]} />
          <Wire from={pinPos(13)} to={[-1.6, 0.3, 4.4]} color="#2ee6c8" lift={2.4} />
        </group>
      );
    }
    case "chess":
    case "birthday": {
      const c = rgbHex(s.rgb.r, s.rgb.g, s.rgb.b);
      const lit = (s.rgb.r + s.rgb.g + s.rgb.b) / 255 / 3;
      return (
        <group>
          <Breadboard position={[0, 0, -5.2]} />
          <Led3D position={[0, 0.3, -5.2]} color={c} intensity={0.15 + lit} />
          {[9, 10, 11].map((p, i) => (
            <Wire
              key={p}
              from={pinPos(p)}
              to={[-0.4 + i * 0.4, 0.35, -5.2]}
              color={["#e0483c", "#4fe07a", "#4f8fe0"][i] ?? "#8a8f96"}
              lift={1.5}
            />
          ))}
          {s.kind === "chess" ? (
            <>
              <Button3D position={[-3.8, 0, 1.4]} onPress={s.onBtn1} color="#e0483c" />
              <Wire from={pinPos(5)} to={[-3.8, 0.3, 1.4]} color="#e0483c" lift={2} />
              <Button3D position={[3.8, 0, 1.4]} onPress={s.onBtn2} color="#2ee6c8" />
              <Wire from={pinPos(4)} to={[3.8, 0.3, 1.4]} color="#2ee6c8" lift={2} />
            </>
          ) : (
            <>
              <Button3D position={[3.8, 0, 1.4]} onPress={s.onButton} color="#e0b040" />
              <Wire from={pinPos(2)} to={[3.8, 0.3, 1.4]} color="#e0b040" lift={2} />
            </>
          )}
          <Buzzer3D position={[-4.4, 0, -1.4]} active={s.buzzer} />
          <Wire from={pinPos(8)} to={[-4.4, 0.4, -1.4]} color="#8a8f96" lift={2} />
          <Lcd3D position={[0, 0, 5.2]} line1={s.lcd[0]} line2={s.lcd[1]} />
          <Wire from={pinPos(13)} to={[-1.6, 0.3, 4.4]} color="#2ee6c8" lift={2.4} />
        </group>
      );
    }
    case "alarm": {
      const c = rgbHex(s.rgb.r, s.rgb.g, s.rgb.b);
      const lit = (s.rgb.r + s.rgb.g + s.rgb.b) / 255 / 3;
      return (
        <group>
          <Breadboard position={[0, 0, -5.2]} />
          <Pir3D position={[-2.6, 0, -5.2]} active={s.pir} />
          <Wire from={pinPos(2)} to={[-2.6, 0.3, -5.2]} color="#e0483c" lift={1.6} />
          <Led3D position={[1.2, 0.3, -5.2]} color={c} intensity={0.15 + lit} />
          <Wire from={pinPos(11)} to={[1.2, 0.35, -5.2]} color="#4f8fe0" lift={1.6} />
          <Pot3D position={[3.9, 0, -1.6]} value={s.pot} onChange={s.onPot} />
          <Wire from={pinPos(0)} to={[3.9, 0.4, -1.6]} color="#e0b040" lift={2} />
          <Button3D position={[-4.2, 0, 1.4]} onPress={s.onArm} color="#e0483c" />
          <Wire from={pinPos(4)} to={[-4.2, 0.3, 1.4]} color="#e0483c" lift={2} />
          <Button3D position={[4.2, 0, 1.4]} onPress={s.onSelect} color="#2ee6c8" />
          <Wire from={pinPos(5)} to={[4.2, 0.3, 1.4]} color="#2ee6c8" lift={2} />
          <Buzzer3D position={[-4.4, 0, -1.8]} active={s.siren} />
          <Wire from={pinPos(7)} to={[-4.4, 0.4, -1.8]} color="#8a8f96" lift={2} />
          <Lcd3D position={[0, 0, 5.2]} line1={s.lcd[0]} line2={s.lcd[1]} />
          <Wire from={pinPos(13)} to={[-1.6, 0.3, 4.4]} color="#2ee6c8" lift={2.4} />
        </group>
      );
    }
    case "gate": {
      return (
        <group>
          <Sonar3D position={[-3.4, 0, -5.4]} distance={s.distance} onChange={s.onDistance} />
          <Wire from={pinPos(3)} to={[-3.4, 0.6, -5.4]} color="#e0b040" lift={2} />
          <Wire from={pinPos(2)} to={[-2.8, 0.6, -5.4]} color="#2ee6c8" lift={2.2} />
          <Servo3D position={[3.4, 0, -1.2]} angle={s.angle} />
          <Wire from={pinPos(7)} to={[3.4, 0.6, -1.2]} color="#4f8fe0" lift={2.2} />
          <Lcd3D position={[0, 0, 5.2]} line1={s.lcd[0]} line2={s.lcd[1]} />
          <Wire from={pinPos(13)} to={[-1.6, 0.3, 4.4]} color="#2ee6c8" lift={2.4} />
        </group>
      );
    }
  }
}

export default function Scene({ state }: { state: RigState }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      camera={{ position: [0, 11, 13], fov: 42 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#0a0c0e"]} />
      <fog attach="fog" args={["#0a0c0e", 22, 42]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[6, 12, 6]} intensity={1.2} castShadow />
      <directionalLight position={[-8, 6, -6]} intensity={0.5} color="#2ee6c8" />
      <Suspense fallback={null}>
        <Environment preset="city" />
        <group position={[0, 0, 0]}>
          <ArduinoBoard />
          <Rig s={state} />
        </group>
        <ContactShadows position={[0, 0, 0]} opacity={0.55} scale={30} blur={2.4} far={8} />
      </Suspense>
      <OrbitControls
        enablePan={false}
        minDistance={8}
        maxDistance={26}
        maxPolarAngle={Math.PI / 2.15}
        autoRotate={false}
      />
    </Canvas>
  );
}
