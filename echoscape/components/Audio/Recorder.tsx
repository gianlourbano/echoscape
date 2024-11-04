import { Canvas, useClock, vec, Circle } from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";
 
export function Recorder() {
  const t = useClock();
 
  const transform = useDerivedValue(() => {
    const scale = (2 / (3 - Math.cos(2 * t.value))) * 20;
    return [
      { translateX: scale * Math.cos(t.value) },
      { translateY: scale * (Math.sin(2 * t.value) / 2) },
    ];
  });
 
  return (
    <Canvas style={{ flex: 1 }}>
      <Circle c={vec(0, 0)} r={50} color="cyan" transform={transform} />
    </Canvas>
  );
}