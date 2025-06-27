import { useState, useRef, useEffect } from 'react';
import { Message, ChatbotState, AttachedFile } from '../types/chatbot';
import { createAttachedFile, processAttachedFiles, getRecommendations } from '../utils/chatbot';

export const useChatbot = () => {
  const [state, setState] = useState<ChatbotState>({
    messages: [
      {
        id: 1,
        type: 'bot',
        content: 'Halo! Saya Scarletbot, asisten AI Anda. Bagaimana saya bisa membantu Anda hari ini?',
        timestamp: new Date()
      }
    ],
    inputMessage: '',
    attachedFiles: [],
    isTyping: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages, state.isTyping]);

  const setInputMessage = (message: string) => {
    setState(prev => ({ ...prev, inputMessage: message }));
  };

  const handleFileAttach = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newAttachedFiles = files.map(createAttachedFile);
    
    setState(prev => ({
      ...prev,
      attachedFiles: [...prev.attachedFiles, ...newAttachedFiles]
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileId: number) => {
    setState(prev => ({
      ...prev,
      attachedFiles: prev.attachedFiles.filter(file => file.id !== fileId)
    }));
  };

  const sendMessage = async () => {
    if (state.inputMessage.trim() === '' && state.attachedFiles.length === 0) {
      return;
    }

    const currentMessage = state.inputMessage;
    const currentFiles = state.attachedFiles;

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: currentMessage,
      files: currentFiles.length > 0 ? currentFiles : undefined,
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      inputMessage: '',
      attachedFiles: [],
      isTyping: true
    }));

    try {
      let requestData: any = {
        message: currentMessage,
        attachedFiles: []
      };

      if (currentFiles.length > 0) {
        const processedFiles = await processAttachedFiles(currentFiles);
        requestData.attachedFiles = processedFiles.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
          data: file.data
        }));
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const botMessage: Message = {
          id: Date.now() + 1,
          type: 'bot',
          content: data.response, 
          recommendations: data.showRecommendation ? getRecommendations() : undefined, // Ganti dari shouldShowRecommendation
          timestamp: new Date()
        };

        setState(prev => ({
          ...prev,
          messages: [...prev.messages, botMessage],
          isTyping: false
        }));
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: Date.now() + 1,
        type: 'bot',
        content: `Maaf, terjadi kesalahan: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isTyping: false
      }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return {
    messages: state.messages,
    inputMessage: state.inputMessage,
    attachedFiles: state.attachedFiles,
    isTyping: state.isTyping,
    fileInputRef,
    messagesEndRef,
    setInputMessage,
    handleFileAttach,
    removeFile,
    sendMessage,
    handleKeyPress
  };
};