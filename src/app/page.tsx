'use client';

import { useChatbot } from './lib/hooks/useChatbot';
import { formatFileSize, parseBoldToJSX } from './lib/utils/chatbot';
import { Send, Paperclip, Bot, User, X, File, FileImage, FileText, Video, Download } from 'lucide-react';

export default function ScarletraChatbot() {
  const {
    messages,
    inputMessage,
    attachedFiles,
    isTyping,
    fileInputRef,
    messagesEndRef,
    setInputMessage,
    handleFileAttach,
    removeFile,
    sendMessage,
    handleKeyPress
  } = useChatbot();

  const handleDownload = (downloadUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <FileImage className="w-4 h-4" />;
    if (fileType.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 to-red-800 shadow-lg border-b border-red-700/30">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-red-200 to-white bg-clip-text text-transparent">
                Scarletra
              </h1>
              <p className="text-red-200 text-sm">AI Assistant</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex space-x-3 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-br from-red-600 to-red-800' 
                    : 'bg-gradient-to-br from-red-500 to-red-700'
                }`}>
                  {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                
                <div className={`rounded-2xl px-4 py-3 shadow-lg ${
                  message.type === 'user'
                    ? 'bg-gradient-to-br from-red-700 to-red-800 border border-red-600/30'
                    : 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50'
                }`}>
                  {message.content && (
                    <p className="text-sm leading-relaxed">{parseBoldToJSX(message.content)}</p>
                  )}
                  
                  {/* File attachments */}
                  {message.files && message.files.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.files.map((file) => (
                        <div key={file.id} className="flex items-center space-x-2 bg-black/20 rounded-lg p-2">
                          {getFileIcon(file.type)}
                          <span className="text-xs text-gray-300 flex-1 truncate">{file.name}</span>
                          <span className="text-xs text-gray-400">{formatFileSize(file.size)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recommendations */}
                  {message.recommendations && (
                    <div className="mt-4 space-y-3">
                      {message.recommendations.map((rec, index) => (
                        <div key={index} className="bg-black/30 rounded-xl p-4 border border-red-800/30">
                          
                          {/* Video */}
                          {rec.type === 'video' && (
                            <div className="flex space-x-3 items-center">
                              <div className="relative">
                                <img src={rec.thumbnail} alt={rec.title} className="w-20 h-14 rounded-lg object-cover" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Video className="w-6 h-6 text-white drop-shadow-lg" />
                                </div>
                                <span className="absolute bottom-1 right-1 bg-black/70 text-xs px-1 rounded">
                                  {rec.duration}
                                </span>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-red-200">{rec.title}</h4>
                                <p className="text-xs text-gray-400 mt-1">Video Tutorial</p>
                              </div>
                              {rec.downloadUrl && (
                                <button
                                  onClick={() => handleDownload(rec.downloadUrl!, rec.filename || rec.title)}
                                  className="flex items-center justify-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 w-10 h-10 rounded-full text-xs text-white transition-colors cursor-pointer"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )}
                          
                          {/* PDF */}
                          {rec.type === 'pdf' && (
                            <div className="flex space-x-3 items-center">
                              <div className="w-12 h-12 bg-red-700/30 rounded-lg flex items-center justify-center">
                                <FileText className="w-6 h-6 text-red-300" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-red-200">{rec.title}</h4>
                                <p className="text-xs text-gray-400">{rec.pages} halaman • {rec.size}</p>
                              </div>
                              {rec.downloadUrl && (
                                <button
                                  onClick={() => handleDownload(rec.downloadUrl!, rec.filename || rec.title)}
                                  className="flex items-center justify-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 w-10 h-10 rounded-full text-xs text-white transition-colors cursor-pointer"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )}
                          
                          {/* Image */}
                          {rec.type === 'image' && (
                            <div className="flex space-x-3 items-center">
                              <img src={rec.src} alt={rec.title} className="w-20 h-14 rounded-lg object-cover" />
                              <div className="flex-1">
                                <h4 className="font-medium text-red-200">{rec.title}</h4>
                                <p className="text-xs text-gray-400 mt-1">Sumber tidak diketahui</p>
                              </div>
                              {rec.downloadUrl && (
                                <button
                                  onClick={() => handleDownload(rec.downloadUrl!, rec.filename || rec.title)}
                                  className="flex items-center justify-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 w-10 h-10 rounded-full text-xs text-white transition-colors cursor-pointer"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-400 mt-2">
                    {message.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex space-x-3 max-w-3xl">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-red-900/30 bg-gradient-to-r from-gray-900 to-red-950">
        <div className="max-w-4xl mx-auto p-4">
          {/* Attached Files */}
          {attachedFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachedFiles.map((file) => (
                <div key={file.id} className="flex items-center space-x-2 bg-red-900/30 border border-red-800/50 rounded-lg px-3 py-2">
                  {getFileIcon(file.type)}
                  <span className="text-xs text-gray-300 max-w-32 truncate">{file.name}</span>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 bg-red-800/50 hover:bg-red-700/50 rounded-full flex items-center justify-center transition-colors border border-red-700/50 cursor-pointer"
            >
              <Paperclip className="w-5 h-5 text-red-300" />
            </button>
            
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Masukkan pesan Anda di sini..."
                className="w-full bg-gray-800/50 border border-red-800/30 rounded-2xl px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/20 resize-none max-h-32"
                rows={1}
                style={{ minHeight: '44px' }}
              />
            </div>
            
            <button
              onClick={sendMessage}
              disabled={inputMessage.trim() === '' && attachedFiles.length === 0}
              className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-700 disabled:to-gray-800 rounded-full flex items-center justify-center transition-all shadow-lg disabled:shadow-none"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileAttach}
        accept="image/*,video/*,.pdf,.doc,.docx,.txt"
      />
    </div>
  );
}