import { useState, useRef, useEffect } from 'react';
import { Message, AttachedFile } from '../types/chatbot';
import { createAttachedFile, generateBotResponse } from '../utils/chatbot';

export const useChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'bot',
      content: 'Halo! Saya Scarletbot, asisten AI Anda. Bagaimana saya bisa membantu Anda hari ini?',
      timestamp: new Date()
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileAttach = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newFiles = files.map(createAttachedFile);
    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId: number) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const simulateTyping = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 1500);
  };

  const sendMessage = () => {
    if (inputMessage.trim() === '' && attachedFiles.length === 0) return;

    const newMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      files: attachedFiles.length > 0 ? attachedFiles : undefined,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    
    // Simulate bot response
    simulateTyping();
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage);
      setMessages(prev => [...prev, botResponse]);
    }, 1500);

    // Reset input
    setInputMessage('');
    setAttachedFiles([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return {
    // State
    messages,
    inputMessage,
    attachedFiles,
    isTyping,
    
    // Refs
    fileInputRef,
    messagesEndRef,
    
    // Actions
    setInputMessage,
    handleFileAttach,
    removeFile,
    sendMessage,
    handleKeyPress
  };
};