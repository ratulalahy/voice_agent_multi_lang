/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useState, useRef } from 'react';
import { useLiveAPIContext } from '../../../contexts/LiveAPIContext';

// Minimum volume level that indicates audio output is occurring
const AUDIO_OUTPUT_DETECTION_THRESHOLD = 0.05;

// Number of bars in the visualization
const BAR_COUNT = 12;

// Animation and visual constants
const BAR_WIDTH = 4;
const BAR_SPACING = 8;
const MAX_BAR_HEIGHT = 80;
const MIN_BAR_HEIGHT = 4;
const ANIMATION_SMOOTHING = 0.15;

type AudioVisualizerProps = {
  /** The color theme for the visualizer */
  color?: string;
};

export default function AudioVisualizer({ color = '#1e3a8a' }: AudioVisualizerProps) {
  const { volume, connected } = useLiveAPIContext();
  const [bars, setBars] = useState<number[]>(new Array(BAR_COUNT).fill(MIN_BAR_HEIGHT));
  const [isActive, setIsActive] = useState(false);
  const animationRef = useRef<number | null>(null);
  const targetBarsRef = useRef<number[]>(new Array(BAR_COUNT).fill(MIN_BAR_HEIGHT));

  // Generate random bar heights when audio is detected
  useEffect(() => {
    if (volume > AUDIO_OUTPUT_DETECTION_THRESHOLD) {
      setIsActive(true);
      // Generate different heights for each bar based on volume
      const newTargetBars = Array.from({ length: BAR_COUNT }, (_, index) => {
        // Create variation in bar heights with some based on volume and some random
        const baseHeight = volume * MAX_BAR_HEIGHT * 0.8;
        const variation = Math.random() * MAX_BAR_HEIGHT * 0.4;
        const centerBoost = 1 - Math.abs(index - BAR_COUNT / 2) / (BAR_COUNT / 2) * 0.3;
        return Math.max(MIN_BAR_HEIGHT, Math.min(MAX_BAR_HEIGHT, (baseHeight + variation) * centerBoost));
      });
      targetBarsRef.current = newTargetBars;
    } else {
      setIsActive(false);
      // Gradually return to minimum height
      targetBarsRef.current = new Array(BAR_COUNT).fill(MIN_BAR_HEIGHT * 2);
    }
  }, [volume]);

  // Smooth animation loop
  useEffect(() => {
    function animate() {
      setBars(currentBars => {
        return currentBars.map((currentHeight, index) => {
          const targetHeight = targetBarsRef.current[index];
          const difference = targetHeight - currentHeight;
          return currentHeight + difference * ANIMATION_SMOOTHING;
        });
      });
      animationRef.current = requestAnimationFrame(animate);
    }

    if (connected) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [connected]);

  // Idle animation when not talking
  useEffect(() => {
    if (!isActive && connected) {
      const interval = setInterval(() => {
        targetBarsRef.current = Array.from({ length: BAR_COUNT }, () => {
          return MIN_BAR_HEIGHT + Math.random() * 8;
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isActive, connected]);

  const containerWidth = (BAR_WIDTH + BAR_SPACING) * BAR_COUNT - BAR_SPACING;

  return (
    <div className="audio-visualizer">
      <div 
        className="visualizer-container"
        style={{ width: `${containerWidth}px` }}
      >
        {bars.map((height, index) => (
          <div
            key={index}
            className="audio-bar"
            style={{
              width: `${BAR_WIDTH}px`,
              height: `${height}px`,
              backgroundColor: color,
              opacity: isActive ? 0.8 + (height / MAX_BAR_HEIGHT) * 0.2 : 0.4,
              transform: `scaleY(${isActive ? 1 : 0.7})`,
            }}
          />
        ))}
      </div>
      
      {/* Connection status indicator */}
      <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
        <div className="status-dot" style={{ backgroundColor: color }} />
        <span className="status-text">
          {connected ? 'Voice Agent Ready' : 'Connecting...'}
        </span>
      </div>
    </div>
  );
}
