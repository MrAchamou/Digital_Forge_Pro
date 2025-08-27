
import React, { memo, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIAdvancedOrbProps {
  status: 'idle' | 'analyzing' | 'generating' | 'optimizing' | 'complete' | 'error';
  size?: number;
  intensity?: number;
  brainActivity?: number;
  className?: string;
}

const AIAdvancedOrb = memo(({ 
  status = 'idle', 
  size = 100, 
  intensity = 1,
  brainActivity = 0.5,
  className = "" 
}: AIAdvancedOrbProps) => {
  
  const orbVariants = useMemo(() => ({
    idle: {
      scale: 1,
      rotate: 0,
      filter: "hue-rotate(0deg) brightness(1)",
      transition: { duration: 2, repeat: Infinity, repeatType: "reverse" as const }
    },
    analyzing: {
      scale: [1, 1.1, 1],
      rotate: [0, 180, 360],
      filter: "hue-rotate(120deg) brightness(1.5)",
      transition: { duration: 1.5, repeat: Infinity }
    },
    generating: {
      scale: [1, 1.2, 1],
      rotate: [0, 360],
      filter: "hue-rotate(240deg) brightness(2)",
      transition: { duration: 1, repeat: Infinity }
    },
    optimizing: {
      scale: [1, 0.9, 1.1, 1],
      rotate: [0, 90, 180, 270, 360],
      filter: "hue-rotate(300deg) brightness(1.8)",
      transition: { duration: 0.8, repeat: Infinity }
    },
    complete: {
      scale: [1, 1.3, 1],
      rotate: 0,
      filter: "hue-rotate(90deg) brightness(2.5)",
      transition: { duration: 0.5 }
    },
    error: {
      scale: [1, 0.8, 1],
      rotate: [0, -45, 45, 0],
      filter: "hue-rotate(0deg) brightness(0.8) saturate(2)",
      transition: { duration: 0.3, repeat: 3 }
    }
  }), []);

  const neuralPulses = useMemo(() => 
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      delay: i * 0.2,
      angle: (360 / 8) * i,
      intensity: 0.3 + (brainActivity * 0.7)
    })), [brainActivity]
  );

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'analyzing': return '#00f5ff';
      case 'generating': return '#ff1493';
      case 'optimizing': return '#ffd700';
      case 'complete': return '#00ff00';
      case 'error': return '#ff4500';
      default: return '#00d4ff';
    }
  }, []);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Main Orb */}
      <motion.div
        className="relative rounded-full bg-gradient-to-br from-forge-cyan via-forge-electric to-forge-plasma"
        style={{ 
          width: size, 
          height: size,
          boxShadow: `0 0 ${size/2}px ${getStatusColor(status)}40`
        }}
        variants={orbVariants}
        animate={status}
        whileHover={{ scale: 1.05 }}
      >
        {/* Neural Network Overlay */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          {neuralPulses.map((pulse) => (
            <motion.div
              key={pulse.id}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: '50%',
                top: '50%',
                transformOrigin: `0 ${size/4}px`,
                transform: `rotate(${pulse.angle}deg) translateY(-${size/4}px)`
              }}
              animate={{
                opacity: [0, pulse.intensity, 0],
                scale: [0.5, 1.5, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: pulse.delay
              }}
            />
          ))}
        </div>

        {/* Core Glow */}
        <motion.div
          className="absolute inset-4 rounded-full bg-white/20"
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Status Indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: getStatusColor(status) }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity
            }}
          />
        </div>
      </motion.div>

      {/* Advanced Particle Effects */}
      <AnimatePresence>
        {status === 'generating' && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-forge-plasma rounded-full"
                style={{
                  left: '50%',
                  top: '50%'
                }}
                animate={{
                  x: [0, Math.cos(i * 30 * Math.PI / 180) * (size/1.5)],
                  y: [0, Math.sin(i * 30 * Math.PI / 180) * (size/1.5)],
                  opacity: [1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Brain Activity Waves */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-forge-cyan/30"
            animate={{
              scale: [1, 2, 3],
              opacity: [0.8, 0.3, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 1
            }}
          />
        ))}
      </div>
    </div>
  );
});

AIAdvancedOrb.displayName = 'AIAdvancedOrb';

export default AIAdvancedOrb;
