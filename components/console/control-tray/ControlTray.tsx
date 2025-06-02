/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import cn from 'classnames';

import { memo, ReactNode, useEffect, useRef, useState } from 'react';
import { AudioRecorder } from '../../../lib/audio-recorder';

import { useLiveAPIContext } from '../../../contexts/LiveAPIContext';
import { useUI } from '@/lib/state';

export type ControlTrayProps = {
  children?: ReactNode;
};

function ControlTray({ children }: ControlTrayProps) {
  const [audioRecorder] = useState(() => new AudioRecorder());
  const [muted, setMuted] = useState(false);
  const [userVolume, setUserVolume] = useState(0);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const connectButtonRef = useRef<HTMLButtonElement>(null);

  const { showAgentEdit, showUserConfig } = useUI();
  const { client, connected, connect, disconnect, volume: agentVolume } = useLiveAPIContext();

  // Stop the current agent if the user is editing the agent or user config
  useEffect(() => {
    if (showAgentEdit || showUserConfig) {
      if (connected) disconnect();
    }
  }, [showUserConfig, showAgentEdit, connected, disconnect]);

  useEffect(() => {
    if (!connected && connectButtonRef.current) {
      connectButtonRef.current.focus();
    }
  }, [connected]);

  useEffect(() => {
    const onData = (base64: string) => {
      client.sendRealtimeInput([
        {
          mimeType: 'audio/pcm;rate=16000',
          data: base64,
        },
      ]);
    };

    const onVolume = (volume: number) => {
      setUserVolume(volume);
    };

    if (connected && !muted && audioRecorder) {
      audioRecorder.on('data', onData).on('volume', onVolume).start();
    } else {
      audioRecorder.stop();
    }
    return () => {
      audioRecorder.off('data', onData).off('volume', onVolume);
    };
  }, [connected, client, muted, audioRecorder]);

  // Reset disconnecting state when connection state changes
  useEffect(() => {
    if (!connected && isDisconnecting) {
      const timer = setTimeout(() => setIsDisconnecting(false), 500);
      return () => clearTimeout(timer);
    }
  }, [connected, isDisconnecting]);

  const handleAgentToggle = async () => {
    if (isDisconnecting) return; // Prevent multiple clicks during disconnect
    
    if (connected) {
      setIsDisconnecting(true);
      try {
        // Force disconnect immediately
        disconnect();
        // Also stop audio recorder if it's running
        if (audioRecorder) {
          audioRecorder.stop();
        }
      } catch (error) {
        console.error('Error during disconnect:', error);
      } finally {
        // Reset the disconnecting state after a short delay
        setTimeout(() => setIsDisconnecting(false), 1000);
      }
    } else {
      try {
        await connect();
      } catch (error) {
        console.error('Error during connect:', error);
      }
    }
  };

  return (
    <section className="control-tray">
      <div className="premium-control-container">
        <button
          className={cn('premium-mic-button', { 
            muted, 
            connected,
            'user-speaking': userVolume > 0.01,
            'ready-to-talk': connected && !muted && userVolume === 0
          })}
          onClick={() => setMuted(!muted)}
          data-volume={userVolume}
          title={muted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          <span className="material-symbols-outlined">
            {!muted ? 'mic' : 'mic_off'}
          </span>
          <div className="button-aura" />
        </button>

        <button
          ref={connectButtonRef}
          className={cn('premium-agent-button', { 
            connected,
            'agent-speaking': agentVolume > 0.05,
            'disconnecting': isDisconnecting
          })}
          onClick={handleAgentToggle}
          disabled={isDisconnecting}
          data-volume={agentVolume}
          title={isDisconnecting ? 'Stopping...' : (connected ? 'Stop Voice Agent' : 'Start Voice Agent')}
        >
          <span className="material-symbols-outlined">
            {isDisconnecting ? 'hourglass_empty' : (connected ? 'face' : 'face_2')}
          </span>
          <div className="button-aura" />
        </button>
      </div>
      
      {children}
    </section>
  );
}

export default memo(ControlTray);
