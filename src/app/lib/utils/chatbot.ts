import { AttachedFile, Recommendation } from '../types/chatbot';

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const createAttachedFile = (file: File): AttachedFile => ({
  id: Date.now() + Math.random(),
  name: file.name,
  type: file.type,
  size: file.size,
  file: file
});

export const getRecommendations = (): Recommendation[] => [
  {
    type: 'video',
    title: 'Tutorial Komprehensif tentang Topik Ini',
    thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=200&fit=crop',
    duration: '15:30'
  },
  {
    type: 'pdf',
    title: 'Panduan Lengkap & Best Practices',
    pages: 45,
    size: '2.3 MB'
  },
  {
    type: 'image',
    title: 'Infografik & Diagram Penjelasan',
    src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop'
  }
];

export const shouldShowRecommendation = (message: string): boolean => {
  return message.toLowerCase().includes('berikan rekomendasi terkait topik');
};

export const generateBotResponse = (userMessage: string) => {
  const baseResponse = {
    id: Date.now() + 1,
    type: 'bot' as const,
    timestamp: new Date()
  };

  if (shouldShowRecommendation(userMessage)) {
    return {
      ...baseResponse,
      content: 'Berikut adalah rekomendasi terkait topik yang Anda minta:',
      recommendations: getRecommendations()
    };
  }

  return {
    ...baseResponse,
    content: 'Terima kasih atas pesan Anda. Saya akan memproses informasi yang Anda berikan dan memberikan respons yang sesuai.'
  };
};