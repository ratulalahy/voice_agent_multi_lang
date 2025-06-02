/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useLiveAPIContext } from '@/contexts/LiveAPIContext';
import { Agent, createNewAgent } from '@/lib/presets/agents';
import { useAgent, useUI, useUser } from '@/lib/state';
import c from 'classnames';
import { useEffect, useState } from 'react';

export default function Header() {
  const { showUserConfig, setShowUserConfig, setShowAgentEdit } = useUI();
  const { name } = useUser();
  const { current, setCurrent, availablePresets, availablePersonal, addAgent } =
    useAgent();
  const { disconnect } = useLiveAPIContext();

  let [showRoomList, setShowRoomList] = useState(false);

  useEffect(() => {
    addEventListener('click', () => setShowRoomList(false));
    return () => removeEventListener('click', () => setShowRoomList(false));
  }, []);

  function changeAgent(agent: Agent | string) {
    disconnect();
    setCurrent(agent);
  }

  function addNewChatterBot() {
    disconnect();
    addAgent(createNewAgent());
    setShowAgentEdit(true);
  }

  return (
    <header className="real-estate-header">
      <div className="header-content">
        <div className="brand-section">
          <div className="brand-logo">🏠</div>
          <div className="brand-info">
            <h1 className="brand-title">DataMindLabs</h1>
            <p className="brand-subtitle">AI Voice Agent Platform</p>
          </div>
        </div>

        <div className="agent-selector">
          <button
            className="agent-dropdown-btn"
            onClick={e => {
              e.stopPropagation();
              setShowRoomList(!showRoomList);
            }}
          >
            <span className="current-agent">
              {current.name || 'Select Agent'}
            </span>
            <span className={`dropdown-icon ${showRoomList ? 'open' : ''}`}>
              ⌄
            </span>
          </button>

          <button
            onClick={() => setShowAgentEdit(true)}
            className="button createButton"
          >
            <span className="icon">edit</span> Edit ChatterBot
          </button>
        </div>

        <div className={c('agent-dropdown', { active: showRoomList })}>
          <div className="dropdown-section">
            <h3>Real Estate Agents</h3>
            <ul>
              {availablePresets
                .filter(agent => agent.id !== current.id)
                .map(agent => (
                  <li key={agent.name}>
                    <button 
                      className="agent-option"
                      onClick={() => changeAgent(agent)}
                    >
                      <span className="agent-emoji">🏠</span>
                      {agent.name}
                    </button>
                  </li>
                ))}
            </ul>
          </div>

          <div className="dropdown-section">
            <h3>Custom Agents</h3>
            <ul>
              {availablePersonal.length ? (
                availablePersonal.map(({ id, name }) => (
                  <li key={name}>
                    <button 
                      className="agent-option"
                      onClick={() => changeAgent(id)}
                    >
                      <span className="agent-emoji">🤖</span>
                      {name}
                    </button>
                  </li>
                ))
              ) : (
                <p className="no-agents">No custom agents yet</p>
              )}
            </ul>
            <button
              className="create-agent-btn"
              onClick={() => {
                addNewChatterBot();
              }}
            >
              <span className="btn-icon">+</span>
              Create New Agent
            </button>
          </div>
        </div>
      </div>
      
      <div className="header-actions">
        <button
          className="header-btn secondary"
          onClick={() => setShowAgentEdit(true)}
        >
          <span className="btn-icon">⚙️</span>
          Edit Agent
        </button>
        
        <button
          className="header-btn primary"
          onClick={() => setShowUserConfig(!showUserConfig)}
        >
          <span className="btn-icon">👤</span>
          {name || 'Admin'}
        </button>
      </div>
    </header>
  );
}
