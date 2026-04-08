import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Loader2, AlertTriangle } from 'lucide-react';
import './SymptomGuide.css';
import { useAuth } from '../contexts/AuthContext';

const SymptomGuide = () => {
  const { currentUser } = useAuth();
  
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: {
        status: 'chat',
        tier: 'green',
        reply: `Hello, ${currentUser?.displayName || 'Guest'}. I am the MediGuide Advanced AI Assistant! 🤖 \n\nIf you need a formal initial assessment, please describe your health symptoms in detail. If you just want to chat casually as a friend, I'm here for that too! \n\n*Disclaimer: I am an AI, not a doctor. In a medical emergency, please call your local emergency services immediately.*`,
        suggestedChips: [],
        sources: []
      }
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = { role: 'user', content: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const currentHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('http://localhost:5000/api/symptom-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          history: currentHistory, 
          userProfile: currentUser ? { name: currentUser.displayName } : null 
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessages((prev) => [...prev, { role: 'ai', content: data }]);
      } else {
        setMessages((prev) => [...prev, { role: 'error', content: `Backend Error: ${data.error}` }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'error', content: "Failed to reach the backend server. Please make sure your backend is running." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="symptom-guide-container container">
      <div className="sg-header">
        <h1 className="heading-lg">Advanced Symptom Guide</h1>
        <p className="body-text">Powered by AI to help you understand your symptoms instantly.</p>
      </div>

      <div className="chat-interface">
        <div className="chat-messages" ref={scrollRef}>
          {messages.map((msg, index) => (
            <div key={index} className={`message-row ${msg.role === 'user' ? 'message-row-user' : 'message-row-ai'}`}>
              <div className={`message-avatar ${msg.role === 'user' ? 'avatar-user' : msg.role === 'error' ? 'avatar-error' : 'avatar-ai'}`}>
                {msg.role === 'user' ? <User size={20} /> : msg.role === 'error' ? <AlertTriangle size={20} /> : <Bot size={20} />}
              </div>
              <div className={`message-bubble ${msg.role === 'user' ? 'bubble-user' : msg.role === 'error' ? 'bubble-error' : 'bubble-ai'} ${msg.role === 'ai' && typeof msg.content === 'object' && msg.content.tier === 'red' ? 'bubble-emergency' : ''}`}>
                {(() => {
                  if (msg.role === 'user') return <span>{msg.content}</span>;
                  if (msg.role === 'error') return <span>{msg.content}</span>;

                  const aiData = msg.content;
                  
                  if (aiData.status === 'emergency' && aiData.emergencyCard) {
                    return (
                      <div className="emergency-card">
                        <h3><AlertTriangle size={20}/> {aiData.emergencyCard.title}</h3>
                        <p>{aiData.emergencyCard.description}</p>
                        <a href={aiData.emergencyCard.link || "#"} target="_blank" rel="noreferrer" className="emergency-btn">Go to ER Finder</a>
                      </div>
                    );
                  }

                  if (aiData.status === 'handover' && aiData.clinicalBrief) {
                    return (
                      <div className="clinical-brief-card">
                        <div className="brief-header">Clinical Brief for your Doctor</div>
                        <div className="brief-section">
                          <h4>Summary</h4>
                          <p>{aiData.clinicalBrief.summary}</p>
                        </div>
                        <div className="brief-section">
                          <h4>Findings</h4>
                          <p>{aiData.clinicalBrief.findings}</p>
                        </div>
                        <div className="brief-section">
                          <h4>3 Questions to ask your Doctor:</h4>
                          <ul>
                            {aiData.clinicalBrief.questionsForDoctor && aiData.clinicalBrief.questionsForDoctor.map((q, i) => <li key={i}>{q}</li>)}
                          </ul>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="ai-chat-content">
                      {aiData.reply && aiData.reply.split('\n').map((line, i) => {
                        let formattedLine = line
                          .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                          .replace(/\*(.*?)\*/g, '<b>$1</b>');
                        return <span key={i} dangerouslySetInnerHTML={{ __html: formattedLine + '<br/>' }} />;
                      })}
                      
                      {aiData.suggestedChips && aiData.suggestedChips.length > 0 && (
                        <div className="choice-chips">
                          {aiData.suggestedChips.map((chip, i) => (
                            <button 
                              key={i} 
                              type="button"
                              className="chip-btn"
                              onClick={() => setInputValue(chip)}
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      )}

                      {aiData.sources && aiData.sources.length > 0 && (
                        <div className="source-links">
                          <strong>Sources & Evidence:</strong>
                          <div className="sources-list">
                            {aiData.sources.map((src, i) => (
                              <a key={i} href={src.url} target="_blank" rel="noreferrer">{src.title}</a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message-row message-row-ai">
              <div className="message-avatar avatar-ai">
                <Bot size={20} />
              </div>
              <div className="message-bubble bubble-ai loading-bubble">
                <Loader2 className="spinning-icon" size={20} />
                <span>Analyzing symptoms...</span>
              </div>
            </div>
          )}
        </div>

        <form className="chat-input-area" onSubmit={handleSendMessage}>
          <input 
            type="text" 
            className="chat-input" 
            placeholder={messages.some(m => m.role === 'ai' && m.content?.status === 'emergency') ? "Chat is disabled due to medical emergency." : "E.g., I have had a severe migraine and nausea for 2 days..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading || messages.some(m => m.role === 'ai' && m.content?.status === 'emergency')}
          />
          <button type="submit" className="chat-submit-btn" disabled={!inputValue.trim() || isLoading || messages.some(m => m.role === 'ai' && m.content?.status === 'emergency')}>
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default SymptomGuide;
