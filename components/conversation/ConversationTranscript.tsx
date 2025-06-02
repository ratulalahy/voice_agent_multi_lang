/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { memo, useEffect, useRef, useState } from 'react';
import { useLiveAPIContext } from '../../contexts/LiveAPIContext';
import { useAgent } from '../../lib/state';
import { LiveServerContent } from '@google/genai';

export interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  isComplete: boolean;
}

export interface ConversationTranscriptProps {
  className?: string;
}

function ConversationTranscript({ className }: ConversationTranscriptProps) {
  const { client, connected } = useLiveAPIContext();
  const { current: agent } = useAgent();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentAgentMessage, setCurrentAgentMessage] = useState<string>('');
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentAgentMessage]);

  // Handle user audio input detection
  useEffect(() => {
    if (!connected || !client) return;

    let userSpeechBuffer = '';
    let isUserSpeaking = false;
    let userSpeechTimeout: NodeJS.Timeout | null = null;

    const handleServerContent = (data: LiveServerContent) => {
      // Handle agent responses
      if (data.modelTurn?.parts) {
        for (const part of data.modelTurn.parts) {
          if (part.text) {
            setCurrentAgentMessage(prev => prev + part.text);
            setIsAgentSpeaking(true);
          }
        }
      }
    };

    const handleTurnComplete = () => {
      setIsAgentSpeaking(false);
      
      // Save completed agent message
      if (currentAgentMessage.trim()) {
        setMessages(prev => [
          ...prev,
          {
            id: `agent-${Date.now()}`,
            type: 'agent',
            content: currentAgentMessage.trim(),
            timestamp: new Date(),
            isComplete: true,
          },
        ]);
        setCurrentAgentMessage('');
      }

      // If user was speaking, finalize their message
      if (isUserSpeaking && userSpeechBuffer.trim()) {
        setMessages(prev => [
          ...prev,
          {
            id: `user-${Date.now()}`,
            type: 'user',
            content: userSpeechBuffer.trim(),
            timestamp: new Date(),
            isComplete: true,
          },
        ]);
        userSpeechBuffer = '';
        isUserSpeaking = false;
      }
    };

    const handleInterrupted = () => {
      setIsAgentSpeaking(false);
      
      // Save partial agent message if interrupted
      if (currentAgentMessage.trim()) {
        setMessages(prev => [
          ...prev,
          {
            id: `agent-${Date.now()}-interrupted`,
            type: 'agent',
            content: currentAgentMessage.trim(),
            timestamp: new Date(),
            isComplete: false,
          },
        ]);
        setCurrentAgentMessage('');
      }
    };

    // Listen for Live API events
    client.on('content', handleServerContent);
    client.on('turncomplete', handleTurnComplete);
    client.on('interrupted', handleInterrupted);

    // For demo purposes, simulate user speech detection
    const simulateUserSpeech = () => {
      if (Math.random() > 0.98) { // 2% chance per interval
        const userMessages = [
          "I'm looking for a property in the downtown area",
          "What's the current market situation like?",
          "Can you help me schedule a viewing?",
          "I need a 3-bedroom house with a garden",
          "What are the property prices in this neighborhood?",
          "I'm interested in commercial properties",
          "Can you show me luxury homes available?",
          "I want to rent an apartment near the university"
        ];
        
        const randomMessage = userMessages[Math.floor(Math.random() * userMessages.length)];
        
        setMessages(prev => [
          ...prev,
          {
            id: `user-${Date.now()}`,
            type: 'user',
            content: randomMessage,
            timestamp: new Date(),
            isComplete: true,
          },
        ]);
      }
    };

    const intervalId = setInterval(simulateUserSpeech, 3000);

    return () => {
      client.off('content', handleServerContent);
      client.off('turncomplete', handleTurnComplete);
      client.off('interrupted', handleInterrupted);
      clearInterval(intervalId);
      if (userSpeechTimeout) {
        clearTimeout(userSpeechTimeout);
      }
    };
  }, [connected, client, currentAgentMessage]);

    // Handle connection state changes
  useEffect(() => {
    if (!connected) {
      setMessages([]);
      setCurrentAgentMessage('');
      setIsAgentSpeaking(false);
      return;
    }

    // Add welcome message when connection starts
    const welcomeTimeout = setTimeout(() => {
      setMessages([{
        id: 'welcome',
        type: 'agent',
        content: `Hello! I'm ${agent.name}. How can I help you with your real estate needs today?`,
        timestamp: new Date(),
        isComplete: true,
      }]);
    }, 1500);

    return () => clearTimeout(welcomeTimeout);
  }, [connected, agent.name]);

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const clearConversation = () => {
    setMessages([]);
    setCurrentAgentMessage('');
    setIsAgentSpeaking(false);
  };

  // Simulate user messages for demo purposes
  const simulateUserMessage = (content: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        type: 'user',
        content,
        timestamp: new Date(),
        isComplete: true,
      },
    ]);
  };

  return (
    <div className={`conversation-transcript ${className || ''}`}>
      <div className="transcript-header">
        <div className="header-content">
          <h3>Live Conversation</h3>
          <div className="connection-status">
            <div className={`status-indicator ${connected ? 'connected' : 'disconnected'}`} />
            <span>{connected ? 'Live' : 'Disconnected'}</span>
          </div>
        </div>
        <div className="header-actions">
          <button 
            onClick={clearConversation}
            className="clear-button"
            title="Clear conversation"
            disabled={!connected}
          >
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>

      <div className="transcript-messages">
        {messages.length === 0 && !currentAgentMessage && (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <p>{connected ? 'Start speaking to see the conversation transcript' : 'Connect to start a conversation'}</p>
          </div>
        )}

        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message ${message.type} ${!message.isComplete ? 'incomplete' : ''}`}
          >
            <div className="message-content">
              <div className="message-bubble">
                <div className="message-text">{message.content}</div>
                {!message.isComplete && (
                  <span className="incomplete-indicator" title="Message was interrupted">
                    <span className="material-symbols-outlined">warning</span>
                  </span>
                )}
              </div>
              <div className="message-time">{formatTime(message.timestamp)}</div>
            </div>
            <div className="message-avatar">
              {message.type === 'user' ? (
                <span className="material-symbols-outlined">person</span>
              ) : (
                <span className="material-symbols-outlined">smart_toy</span>
              )}
            </div>
          </div>
        ))}

        {currentAgentMessage && (
          <div className="message agent typing">
            <div className="message-content">
              <div className="message-bubble">
                <div className="message-text">{currentAgentMessage}</div>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div className="message-time">Now</div>
            </div>
            <div className="message-avatar">
              <span className="material-symbols-outlined">smart_toy</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Speech status indicator */}
      {connected && (
        <div className="transcript-footer">
          <div className="speech-status">
            <div className="listening-indicator">
              <span className="material-symbols-outlined">mic</span>
              <span>Listening...</span>
              <div className="pulse-dot" />
            </div>
            {isAgentSpeaking && (
              <div className="agent-speaking">
                <span className="material-symbols-outlined">record_voice_over</span>
                <span>{agent.name} is speaking</span>
              </div>
            )}
          </div>
          
          {/* Development: Quick test buttons */}
          <div className="dev-controls">
            <button 
              onClick={() => simulateUserMessage("I'm looking for a 3-bedroom house in downtown")}
              className="sim-button"
            >
              💬 House search
            </button>
            <button 
              onClick={() => simulateUserMessage("What's the current market like?")}
              className="sim-button"
            >
              📈 Market inquiry
            </button>
            <button 
              onClick={() => simulateUserMessage("Can you schedule a viewing for tomorrow?")}
              className="sim-button"
            >
              📅 Schedule viewing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(ConversationTranscript);
