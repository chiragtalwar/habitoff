import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface FallingLeavesProps {
  isAnimating: boolean;
  plantType: string;
}

const LEAF_TYPES = {
  flower: ["🌿", "🌿", "🌿", "✨"],
  tree: ["🌿", "🌿", "🌿", "✨"],
  succulent: ["🌿", "🌿", "✨", "🌿"],
  herb: ["🌿", "🌿", "🌿", "✨"]
};

const getRandomNumber = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

const Leaf = ({ emoji, initialX }: { emoji: string; initialX: number }) => {
  const startX = initialX;
  const amplitude = getRandomNumber(100, 200); // Wider sine wave
  const fallDuration = getRandomNumber(4, 8); // Slower fall
  const size = getRandomNumber(20, 35);
  const rotationAmplitude = getRandomNumber(180, 720); // Random rotation amount
  const swayCount = Math.floor(getRandomNumber(2, 4)); // Number of sways

  // Calculate control points for a more natural path
  const controlPoints = Array.from({ length: swayCount * 2 }, (_, i) => {
    const progress = i / (swayCount * 2);
    const xOffset = amplitude * (i % 2 === 0 ? 1 : -1);
    return {
      x: startX + xOffset,
      y: window.innerHeight * progress
    };
  });

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        y: -50,
        x: startX,
        scale: 0,
        rotate: 0
      }}
      animate={{ 
        opacity: [0, 1, 1, 0.8, 0],
        y: [
          -50,
          ...controlPoints.map(point => point.y),
          window.innerHeight + 50
        ],
        x: [
          startX,
          ...controlPoints.map(point => point.x),
          startX
        ],
        scale: [0, 1, 1, 0.8],
        rotate: [0, rotationAmplitude]
      }}
      transition={{
        duration: fallDuration,
        ease: "easeInOut",
        times: [0, 0.1, 0.8, 0.9, 1],
        rotate: {
          duration: fallDuration,
          ease: [0.45, 0.05, 0.55, 0.95] // Custom easing for rotation
        }
      }}
      style={{
        position: 'fixed',
        fontSize: size,
        zIndex: 9999,
        pointerEvents: 'none',
        userSelect: 'none',
        transformOrigin: 'center',
        textShadow: '0 0 10px rgba(255,255,255,0.3)',
        willChange: 'transform'
      }}
    >
      {emoji}
    </motion.div>
  );
};

export const FallingLeaves = ({ isAnimating, plantType }: FallingLeavesProps) => {
  const [leaves, setLeaves] = useState<{ id: number; emoji: string; x: number }[]>([]);

  useEffect(() => {
    if (isAnimating) {
      const leafEmojis = LEAF_TYPES[plantType as keyof typeof LEAF_TYPES] || LEAF_TYPES.flower;
      
      // Create leaves in batches for a more natural effect
      const createLeafBatch = (batchSize: number, delay: number) => {
        setTimeout(() => {
          setLeaves(prevLeaves => [
            ...prevLeaves,
            ...Array.from({ length: batchSize }, (_, i) => ({
              id: Date.now() + i,
              emoji: leafEmojis[Math.floor(Math.random() * leafEmojis.length)],
              x: getRandomNumber(-50, window.innerWidth + 50) // Wider spawn range
            }))
          ]);
        }, delay);
      };

      // Create multiple batches of leaves
      createLeafBatch(8, 0);    // Initial batch
      createLeafBatch(5, 300);  // Second batch
      createLeafBatch(7, 600);  // Third batch

      // Clear leaves after animation
      const timer = setTimeout(() => {
        setLeaves([]);
      }, 8000); // Longer duration for slower leaves

      return () => {
        clearTimeout(timer);
      };
    }
  }, [isAnimating, plantType]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 pointer-events-none">
        {leaves.map((leaf) => (
          <Leaf key={leaf.id} emoji={leaf.emoji} initialX={leaf.x} />
        ))}
      </div>
    </AnimatePresence>
  );
}; 