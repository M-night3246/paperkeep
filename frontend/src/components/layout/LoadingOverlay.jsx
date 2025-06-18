import React, { useEffect, useState } from 'react';
import './loading-overlay.css';

export default function LoadingOverlay({
  messages = [
    { delay: 0, text: 'Uploading...' },
    { delay: 5000, text: 'Processing...' },
    { delay: 20000, text: 'This process could take a while, please be patient...' },
  ],
}) {
  const [currentText, setCurrentText] = useState(messages[0]?.text || '');

  useEffect(() => {
    const timeouts = messages.map((msg, index) =>
      setTimeout(() => {
        setCurrentText(msg.text);
      }, msg.delay)
    );

    return () => timeouts.forEach(clearTimeout);
  }, [messages]);

  return (
    <div className="loading-overlay">
      <div className="spinner" />
      <p className="loading-text">{currentText}</p>
    </div>
  );
}
