import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Environment } from '@react-three/drei';

// 3D Product Box Component
export function ProductBox3D({ position = [0, 0, 0], color = '#3B82F6' }) {
  return (
    <Box position={position} args={[1, 1, 1]}>
      <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
    </Box>
  );
}

// Floating 3D Sphere
export function FloatingSphere({ position = [0, 0, 0], color = '#8B5CF6' }) {
  return (
    <motion.div
      className="absolute"
      style={{
        left: `${position[0]}%`,
        top: `${position[1]}%`,
      }}
      animate={{
        y: [0, -20, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <div
        className="w-16 h-16 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}, ${color}88)`,
          boxShadow: `0 0 30px ${color}66`,
        }}
      />
    </motion.div>
  );
}

// Animated Shopping Cart Icon
export function AnimatedCart({ size = 40 }) {
  return (
    <motion.div
      animate={{
        rotate: [0, 10, -10, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="inline-block"
    >
      <svg
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        className="text-blue-600"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    </motion.div>
  );
}

// Blockchain Node Animation
export function BlockchainNode({ delay = 0, position = { x: 50, y: 50 }, color = '#3B82F6' }) {
  return (
    <motion.div
      className="absolute w-12 h-12 rounded-full"
      style={{
        background: `radial-gradient(circle, ${color}, ${color}88)`,
        left: `${position.x}%`,
        top: `${position.y}%`,
        boxShadow: `0 0 20px ${color}66`,
      }}
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.7, 1, 0.7],
        y: [0, -20, 0],
      }}
      transition={{
        duration: 2 + delay,
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-2 h-2 rounded-full bg-white"
          style={{
            boxShadow: `0 0 10px white`,
          }}
        />
      </div>
    </motion.div>
  );
}

// Ecommerce Product Card 3D Effect
export function ProductCard3D({ children, className = '' }) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </motion.div>
  );
}

// Metaverse Background Particles
export function MetaverseParticles({ count = 30 }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: `linear-gradient(135deg, 
              hsl(${Math.random() * 360}, 70%, 60%), 
              hsl(${Math.random() * 360}, 70%, 50%))`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: `0 0 20px hsl(${Math.random() * 360}, 70%, 60%)`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1],
            x: [0, Math.random() * 50 - 25, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

