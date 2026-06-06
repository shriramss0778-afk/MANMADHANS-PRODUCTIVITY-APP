"use client";

import { LiquidMetal } from "@paper-design/shaders-react";
import { motion } from "framer-motion";

/**
 * ShadersBackground
 *
 * Fixed, full-viewport animated LiquidMetal shader backdrop, recolored to the
 * app's purple/blue palette (original preset was orange).
 *
 * Notes for this version (@paper-design/shaders-react 0.0.76):
 * - `shape` accepts: none | circle | daisy | diamond | metaballs.
 *   The spec's `shape="plane"` is not valid here, so we use "metaballs"
 *   for a flowing, screen-filling liquid look.
 * - `colorTint` drives the metallic overlay color (app purple).
 */
export default function ShadersBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 bg-[#07070b]"
    >
      <motion.div
        className="h-full w-full"
        initial={{ opacity: 0.5, scale: 1 }}
        animate={{ opacity: 0.7, scale: 1.02, rotate: 2 }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "mirror" }}
      >
        <LiquidMetal
          style={{ width: "100%", height: "100%", filter: "blur(12px)" }}
          colorBack="hsla(240, 30%, 4%, 0)"
          colorTint="hsl(271, 91%, 65%)"
          repetition={4}
          softness={0.6}
          shiftRed={0.25}
          shiftBlue={0.25}
          distortion={0.12}
          contour={1}
          shape="metaballs"
          offsetX={0}
          offsetY={0}
          scale={1}
          rotation={25}
          speed={2}
        />
      </motion.div>
    </div>
  );
}
