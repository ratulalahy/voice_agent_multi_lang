/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { memo, useState } from 'react';
import { useAgent, useUI } from '@/lib/state';
import { Agent, createNewAgent } from '@/lib/presets/agents';
import voiceStyles from '@/lib/config/voice-styles.json';

function AgentManagement() {
  const { availablePresets, availablePersonal, addAgent, setCurrent, update } = useAgent();
  const { setShowAgentEdit } = useUI();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Extract voice categories from the JSON
  const voiceCategories = [...new Set(Object.values(voiceStyles.voices).map(voice => voice.category))];
  
  const filteredPresets = availablePresets.filter(agent => 
    (selectedCategory === 'All' || getVoiceCategory(agent.voice) === selectedCategory) &&
    (agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    agent.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredCustom = availablePersonal.filter(agent => 
    (selectedCategory === 'All' || getVoiceCategory(agent.voice) === selectedCategory) &&
    (agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    agent.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  function getVoiceCategory(voiceName: string): string {
    // Find voice entry by name and return its category
    const voiceEntry = Object.values(voiceStyles.voices).find(
      voice => voice.name === voiceName
    );
    return voiceEntry?.category || 'Uncategorized';
  }

  function handleSelectAgent(agent: Agent) {
    setCurrent(agent);
  }

  function handleEditAgent(agent: Agent) {
    setCurrent(agent);
    setShowAgentEdit(true);
  }

  function handleAddNewAgent() {
    const newAgent = createNewAgent();
    addAgent(newAgent);
    setCurrent(newAgent);
    setShowAgentEdit(true);
  }

  function handleDeleteAgent(agentId: string) {
    // Currently not supported - would need to add removeAgent to useAgent
    if (confirm('Are you sure you want to delete this agent?')) {
      alert('Delete functionality not yet implemented');
    }
  }

  function getVoiceDescription(voiceName: string): string {
    // Find voice entry by name and return its description
    const voiceEntry = Object.values(voiceStyles.voices).find(
      voice => voice.name === voiceName
    );
    return voiceEntry?.description || 'No description available';
  }

  return (
    <div className="agent-management">
      <div className="page-header">
        <h1 className="page-title">Agent Management</h1>
        <p className="page-subtitle">Create, edit, and test your voice agents</p>
      </div>

      <div className="agent-management-controls">
        <div className="search-filter">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-dropdown">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-filter"
            >
              <option value="All">All Categories</option>
              {voiceCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <button 
          className="btn btn-primary btn-lg"
          onClick={handleAddNewAgent}
        >
          + Create New Agent
        </button>
      </div>
      
      <div className="agents-grid">
        <div className="agent-section">
          <h2 className="section-title">System Agents</h2>
          {filteredPresets.length === 0 ? (
            <div className="no-agents-message">
              No system agents match your search criteria
            </div>
          ) : (
            <div className="agent-cards">
              {filteredPresets.map(agent => (
                <div key={agent.id} className="agent-card">
                  <div className="agent-avatar">🏠</div>
                  <div className="agent-info">
                    <h3>{agent.name}</h3>
                    <p className="agent-description">{agent.description}</p>
                    <div className="agent-voice-info">
                      <span className="voice-label">Voice:</span> 
                      <span className="voice-name">{agent.voice}</span>
                      <span className="voice-description">({getVoiceDescription(agent.voice)})</span>
                    </div>
                  </div>
                  <div className="agent-actions">
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleSelectAgent(agent)}
                    >
                      Select
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleEditAgent(agent)}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="agent-section">
          <h2 className="section-title">Custom Agents</h2>
          {filteredCustom.length === 0 ? (
            <div className="no-agents-message">
              No custom agents yet. Create your first custom agent!
            </div>
          ) : (
            <div className="agent-cards">
              {filteredCustom.map(agent => (
                <div key={agent.id} className="agent-card">
                  <div className="agent-avatar">👤</div>
                  <div className="agent-info">
                    <h3>{agent.name}</h3>
                    <p className="agent-description">{agent.description}</p>
                    <div className="agent-voice-info">
                      <span className="voice-label">Voice:</span> 
                      <span className="voice-name">{agent.voice}</span>
                      <span className="voice-description">({getVoiceDescription(agent.voice)})</span>
                    </div>
                  </div>
                  <div className="agent-actions">
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleSelectAgent(agent)}
                    >
                      Select
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleEditAgent(agent)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleDeleteAgent(agent.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(AgentManagement);