import { readFile } from 'fs/promises';
import * as mammoth from 'mammoth';

// Простая реализация PDF парсера без зависимостей
async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    // Базовый парсер для простых PDF
    const pdfText = buffer.toString('utf-8');
    
    // Пытаемся найти текстовые объекты в PDF
    const textMatches = pdfText.match(/\(([^)]+)\)/g);
    
    if (textMatches && textMatches.length > 0) {
      const extractedText = textMatches
        .map(match => match.slice(1, -1)) // Убираем скобки
        .filter(text => text.length > 1 && !text.startsWith('\\')) // Фильтруем служебные строки
        .join(' ');
      
      if (extractedText.length > 10) {
        return extractedText;
      }
    }
    
    // Альтернативный метод - ищем потоковые объекты
    const streamMatches = pdfText.match(/stream[\s\S]*?endstream/gi);
    if (streamMatches) {
      let streamText = '';
      streamMatches.forEach(stream => {
        const content = stream.replace(/stream[\s\S]*?endstream/gi, '');
        // Пытаемся декодировать простой текст
        const decoded = content.replace(/\\\(/g, '(').replace(/\\\)/g, ')');
        streamText += decoded + ' ';
      });
      
      if (streamText.trim().length > 10) {
        return streamText.substring(0, 20000);
      }
    }
    
    return '[PDF документ не содержит извлекаемого текста или требуется более продвинутый парсер]';
    
  } catch (error) {
    console.error('PDF parsing error:', error);
    return '[Не удалось обработать PDF файл]';
  }
}

export async function extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
  try {
    console.log('🔍 [fileProcessor] Начало обработки файла:', filePath);
    console.log('🔍 [fileProcessor] MIME тип:', mimeType);
    
    const buffer = await readFile(filePath);
    console.log('🔍 [fileProcessor] Размер файла:', buffer.length, 'байт');

    // Обработка PDF файлов
    if (mimeType === 'application/pdf') {
      console.log('📄 [fileProcessor] Обработка PDF файла');
      try {
        const text = await parsePDF(buffer);
        console.log('✅ [fileProcessor] PDF обработан, извлечено символов:', text.length);
        return text.substring(0, 20000);
      } catch (pdfError) {
        console.error('❌ [fileProcessor] Ошибка обработки PDF:', pdfError);
        return '[Не удалось извлечь текст из PDF файла]';
      }
    }

    // Обработка Word документов
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        mimeType === 'application/msword') {
      console.log('📝 [fileProcessor] Обработка Word документа');
      try {
        const result = await mammoth.extractRawText({ buffer });
        const text = result.value;
        console.log('✅ [fileProcessor] Word обработан, извлечено символов:', text.length);
        
        if (text.trim().length === 0) {
          return '[Документ Word не содержит извлекаемого текста]';
        }
        
        return text.substring(0, 15000);
      } catch (wordError) {
        console.error('❌ [fileProcessor] Ошибка обработки Word:', wordError);
        return '[Не удалось извлечь текст из Word документа]';
      }
    }

    // Обработка текстовых файлов
    if (mimeType.startsWith('text/') || mimeType === 'application/json') {
      const content = buffer.toString('utf-8');
      console.log('✅ [fileProcessor] Текст извлечен, длина:', content.length);
      return content.substring(0, 15000);
    }

    console.log('⚠️ [fileProcessor] Неподдерживаемый тип файла');
    return `[Неподдерживаемый тип файла: ${mimeType}]`;
    
  } catch (error) {
    console.error('❌ [fileProcessor] Критическая ошибка:', error);
    throw new Error(`Не удалось прочитать файл: ${error}`);
  }
}
