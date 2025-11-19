/**
 * Safe framer-motion wrapper to prevent production crashes
 * 
 * Framer-motion has known compatibility issues with React 19 in production minified builds.
 * This wrapper provides fallback components that render as regular elements if framer-motion fails.
 */

import React from "react";

// Safe framer-motion components - fallback to regular elements if framer-motion fails
let MotionDiv: any;
let MotionSpan: any;
let MotionSection: any;
let MotionH1: any;
let MotionH2: any;
let MotionH3: any;
let MotionP: any;
let MotionButton: any;
let MotionCard: any;
let AnimatePresence: any;
let motion: any;
let useAnimation: any;

// Try to import framer-motion, but provide fallbacks
try {
  const framerMotion = require("framer-motion");
  MotionDiv = framerMotion.motion.div;
  MotionSpan = framerMotion.motion.span;
  MotionSection = framerMotion.motion.section;
  MotionH1 = framerMotion.motion.h1;
  MotionH2 = framerMotion.motion.h2;
  MotionH3 = framerMotion.motion.h3;
  MotionP = framerMotion.motion.p;
  MotionButton = framerMotion.motion.button;
  MotionCard = framerMotion.motion.div; // Card is usually a div
  AnimatePresence = framerMotion.AnimatePresence;
  motion = framerMotion.motion;
  useAnimation = framerMotion.useAnimation;
} catch (error) {
  // Fallback to regular elements if framer-motion fails
  // Filter out framer-motion specific props to avoid React warnings
  const framerMotionProps = [
    'initial', 'animate', 'exit', 'whileInView', 'whileHover', 'whileTap',
    'whileFocus', 'whileDrag', 'viewport', 'transition', 'variants',
    'custom', 'inherit', 'layout', 'layoutId', 'layoutDependency',
    'drag', 'dragConstraints', 'dragElastic', 'dragDirectionLock',
    'dragMomentum', 'dragPropagation', 'dragTransition', 'onDrag',
    'onDragStart', 'onDragEnd', 'style', 'transformValues'
  ];
  
  const createFallback = (Element: any) => {
    return React.forwardRef(({ children, ...props }: any, ref: any) => {
      // Filter out framer-motion specific props
      const filteredProps = Object.keys(props).reduce((acc: any, key: string) => {
        if (!framerMotionProps.includes(key)) {
          acc[key] = props[key];
        }
        return acc;
      }, {});
      
      return React.createElement(Element, { ref, ...filteredProps }, children);
    });
  };

  MotionDiv = createFallback("div");
  MotionSpan = createFallback("span");
  MotionSection = createFallback("section");
  MotionH1 = createFallback("h1");
  MotionH2 = createFallback("h2");
  MotionH3 = createFallback("h3");
  MotionP = createFallback("p");
  MotionButton = createFallback("button");
  MotionCard = createFallback("div");
  AnimatePresence = ({ children }: any) => <>{children}</>;
  motion = {
    div: MotionDiv,
    span: MotionSpan,
    section: MotionSection,
    h1: MotionH1,
    h2: MotionH2,
    h3: MotionH3,
    p: MotionP,
    button: MotionButton,
  };
  useAnimation = () => ({
    start: () => {},
    stop: () => {},
    set: () => {},
  });
}

export {
  MotionDiv,
  MotionSpan,
  MotionSection,
  MotionH1,
  MotionH2,
  MotionH3,
  MotionP,
  MotionButton,
  MotionCard,
  AnimatePresence,
  motion,
  useAnimation,
};

