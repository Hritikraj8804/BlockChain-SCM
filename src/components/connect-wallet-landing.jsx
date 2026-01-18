import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// 3D CSS-based Supply Chain Elements
function FloatingBox({ delay, position, color }) {
  return (
    <motion.div
      className="absolute w-16 h-16 rounded-lg shadow-2xl"
      style={{
        background: `linear-gradient(135deg, ${color}, ${color}dd)`,
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
      animate={{
        y: [0, -30, 0],
        rotate: [0, 360],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 3 + delay,
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut",
      }}
    />
  );
}

function Factory3D({ delay, position }) {
  return (
    <motion.div
      className="absolute"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transformStyle: 'preserve-3d',
      }}
      animate={{
        rotateY: [0, 360],
      }}
      transition={{
        duration: 20 + delay,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
        {/* Main building */}
        <div
          className="absolute bg-gradient-to-b from-indigo-600 to-indigo-800 shadow-xl"
          style={{
            width: '60px',
            height: '90px',
            transform: 'translateZ(0px)',
          }}
        />
        {/* Chimney */}
        <div
          className="absolute bg-indigo-500 shadow-lg"
          style={{
            width: '8px',
            height: '30px',
            left: '45px',
            top: '-15px',
            transform: 'translateZ(0px)',
          }}
        />
        {/* Windows */}
        {[-15, 15].map((x, i) => (
          <div
            key={i}
            className="absolute bg-yellow-400 shadow-lg"
            style={{
              width: '12px',
              height: '16px',
              left: `${30 + x}px`,
              top: '20px',
              transform: 'translateZ(0px)',
              boxShadow: '0 0 10px rgba(251, 191, 36, 0.8)',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function Truck3D({ delay, position }) {
  return (
    <motion.div
      className="absolute"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
      animate={{
        x: [0, 100, 0],
      }}
      transition={{
        duration: 8 + delay,
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut",
      }}
    >
      <div className="relative">
        {/* Truck body */}
        <div
          className="absolute bg-gradient-to-b from-green-500 to-green-600 shadow-lg rounded"
          style={{
            width: '50px',
            height: '25px',
            transform: 'translateZ(0px)',
          }}
        />
        {/* Truck cabin */}
        <div
          className="absolute bg-green-600 shadow-lg rounded"
          style={{
            width: '25px',
            height: '25px',
            left: '-12px',
            transform: 'translateZ(0px)',
          }}
        />
        {/* Wheels */}
        {[-10, 10].map((x, i) => (
          <div
            key={i}
            className="absolute bg-gray-800 rounded-full shadow-md"
            style={{
              width: '12px',
              height: '12px',
              left: `${x}px`,
              top: '20px',
              transform: 'translateZ(0px)',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function BlockchainNode({ delay, position, color }) {
  return (
    <motion.div
      className="absolute w-8 h-8 rounded-full shadow-2xl"
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
    />
  );
}

export function ConnectWalletLanding() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* 3D CSS Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Supply Boxes */}
        <FloatingBox delay={0} position={{ x: 10, y: 20 }} color="#3B82F6" />
        <FloatingBox delay={0.5} position={{ x: 85, y: 30 }} color="#8B5CF6" />
        <FloatingBox delay={1} position={{ x: 50, y: 15 }} color="#10B981" />
        <FloatingBox delay={1.5} position={{ x: 20, y: 70 }} color="#F59E0B" />
        <FloatingBox delay={2} position={{ x: 75, y: 75 }} color="#EF4444" />

        {/* Factories */}
        <Factory3D delay={0} position={{ x: 5, y: 50 }} />
        <Factory3D delay={5} position={{ x: 90, y: 60 }} />

        {/* Trucks */}
        <Truck3D delay={0} position={{ x: 0, y: 40 }} />
        <Truck3D delay={4} position={{ x: 0, y: 80 }} />

        {/* Blockchain Nodes */}
        <BlockchainNode delay={0} position={{ x: 15, y: 25 }} color="#3B82F6" />
        <BlockchainNode delay={0.3} position={{ x: 80, y: 35 }} color="#8B5CF6" />
        <BlockchainNode delay={0.6} position={{ x: 50, y: 20 }} color="#10B981" />
        <BlockchainNode delay={0.9} position={{ x: 25, y: 75 }} color="#F59E0B" />
        <BlockchainNode delay={1.2} position={{ x: 70, y: 80 }} color="#EF4444" />

        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <motion.line
            x1="15%"
            y1="25%"
            x2="80%"
            y2="35%"
            stroke="#3B82F6"
            strokeWidth="2"
            animate={{
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
          <motion.line
            x1="80%"
            y1="35%"
            x2="50%"
            y2="20%"
            stroke="#8B5CF6"
            strokeWidth="2"
            animate={{
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0.5,
            }}
          />
          <motion.line
            x1="50%"
            y1="20%"
            x2="15%"
            y2="25%"
            stroke="#10B981"
            strokeWidth="2"
            animate={{
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 1,
            }}
          />
        </svg>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-2xl"
        >
          <Card className="backdrop-blur-xl bg-slate-800/40 border-blue-500/30 shadow-2xl">
            <CardContent className="p-12 text-center space-y-8">
              {/* Logo/Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="flex justify-center mb-6"
              >
                <div className="relative">
                  <motion.div
                    className="w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center shadow-2xl"
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                    }}
                  >
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </motion.div>
                  {/* Glowing ring */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-4 border-blue-400/50"
                    animate={{
                      boxShadow: [
                        "0 0 20px rgba(59, 130, 246, 0.5)",
                        "0 0 40px rgba(139, 92, 246, 0.8)",
                        "0 0 20px rgba(59, 130, 246, 0.5)",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <h1 className="text-5xl md:text-6xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    AI-Driven Ecommerce
                  </span>
                </h1>
                <p className="text-xl text-white/80 mb-2">Blockchain based supply chain management</p>
                <div className="h-1 w-24 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto rounded-full" />
              </motion.div>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-lg text-white/70 leading-relaxed"
              >
                Connect your wallet to access the next-generation
                <br />
                <span className="text-blue-300 font-semibold">blockchain-powered supply chain</span> management platform
              </motion.p>

              {/* Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="grid grid-cols-3 gap-4 pt-4"
              >
                {[
                  { icon: "📦", label: "Track Orders" },
                  { icon: "🏭", label: "Manage Supply" },
                  { icon: "🔗", label: "Blockchain" },
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    className="p-4 rounded-xl bg-slate-800/30 backdrop-blur-sm border border-blue-500/20"
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="text-3xl mb-2">{feature.icon}</div>
                    <div className="text-sm text-white/80 font-medium">{feature.label}</div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Connect Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1, type: "spring", stiffness: 200 }}
                className="pt-6"
              >
                <div className="inline-block">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ConnectButton.Custom>
                      {({ account, chain, openConnectModal, mounted }) => {
                        return (
                          <Button
                            onClick={openConnectModal}
                            size="lg"
                            className="text-lg px-8 py-6 gradient-primary text-white shadow-2xl hover:shadow-blue-500/50 transition-all duration-300"
                          >
                            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Connect Your Wallet
                          </Button>
                        );
                      }}
                    </ConnectButton.Custom>
                  </motion.div>
                </div>
              </motion.div>

              {/* Additional Info */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
                className="text-sm text-white/50 pt-4"
              >
                Powered by Ethereum • Secure • Decentralized
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
