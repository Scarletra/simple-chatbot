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

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const processAttachedFiles = async (files: AttachedFile[]): Promise<AttachedFile[]> => {
  const processedFiles = await Promise.all(
    files.map(async (attachedFile) => {
      try {
        const base64Data = await fileToBase64(attachedFile.file);
        return {
          ...attachedFile,
          data: base64Data
        };
      } catch (error) {
        console.error('Error processing file:', attachedFile.name, error);
        return attachedFile;
      }
    })
  );
  return processedFiles;
};

export const getRecommendations = (): Recommendation[] => [
  {
    type: 'video',
    title: 'Video Demonstrasi Cara Membuat Moving Object pada Unity',
    thumbnail: '/uploads/rekomendasi-thumbnail.png',
    duration: '4:30',
    downloadUrl: '/uploads/rekomendasi-video.mp4',
    filename: 'tutorial-unity.mp4'
  },
  {
    type: 'pdf',
    title: 'Catatan Materi Kriptografi untuk Pemula',
    pages: 12,
    size: '2.3 MB',
    downloadUrl: '/uploads/rekomendasi-dokumen.pdf',
    filename: 'catatan-kriptografi.pdf'
  },
  {
    type: 'image',
    title: 'Contoh Case Study Rekayasa Perangkat Lunak',
    src: '/uploads/rekomendasi-gambar.png',
    downloadUrl: '/uploads/rekomendasi-gambar.png',
    filename: 'contoh-casestudy.png'
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