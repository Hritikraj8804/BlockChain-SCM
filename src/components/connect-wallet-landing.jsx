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
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="relative z-10 flex items-center justify-center min-h-screen px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-5xl"
        >
          <Card className="bg-card/60 backdrop-blur-md border border-border/60 shadow-xl">
            <CardContent className="p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left: Title/CTA */}
                <div className="lg:col-span-3 space-y-4">
                  <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">AI Supply Chain Commerce</h1>
                  <p className="text-sm md:text-base text-muted-foreground">Blockchain-based ecommerce and logistics dashboard with role-based access. Connect your wallet to get started.</p>
                  <div>
                    <ConnectButton.Custom>
                      {({ account, openConnectModal, mounted }) => (
                        <div aria-hidden={!mounted}>
                          {account ? (
                            <Button
                              variant="ghost"
                              className="rounded-full border border-border/60 bg-card/40 hover:bg-card/60 backdrop-blur-md text-foreground px-5 h-10"
                            >
                              {account.displayName}
                            </Button>
                          ) : (
                            <Button
                              onClick={openConnectModal}
                              className="rounded-full h-10 px-6 font-medium text-foreground"
                              style={{
                                background:
                                  'linear-gradient(135deg, hsla(210,20%,30%,0.6), hsla(265,18%,40%,0.6))',
                                border: '1px solid hsl(var(--border))',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                              }}
                            >
                              Connect Wallet
                            </Button>
                          )}
                        </div>
                      )}
                    </ConnectButton.Custom>
                  </div>
                </div>

                {/* Right: Bento grid */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
                  {[
                    { title: 'Real-Time Tracking', desc: 'Track orders and shipments instantly.' },
                    { title: 'Smart Inventory', desc: 'Automate stock and fulfillment.' },
                    { title: 'Immutable Records', desc: 'Tamper-proof, transparent logs.' },
                  ].map((item, i) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="rounded-xl border border-border/60 bg-background/40 p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-foreground">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

