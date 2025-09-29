import { readFile } from 'fs/promises';

export async function extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
  try {
    console.log('🔍 [fileProcessor] Начало обработки файла:', filePath);
    console.log('🔍 [fileProcessor] MIME тип:', mimeType);
    
    const buffer = await readFile(filePath);
    console.log('🔍 [fileProcessor] Размер файла:', buffer.length, 'байт');

    if (mimeType.startsWith('text/') || mimeType === 'application/json') {
      const content = buffer.toString('utf-8');
      console.log('🔍 [fileProcessor] Извлеченный текст (первые 100 символов):', content.substring(0, 100));
      return content.substring(0, 10000); // Ограничиваем размер
    }

    console.log('🔍 [fileProcessor] Бинарный файл, возвращаем информацию');
    return `[Файл: ${mimeType}, размер: ${buffer.length} байт]`;
    
  } catch (error) {
    console.error('❌ [fileProcessor] Ошибка:', error);
    throw new Error(`Не удалось прочитать файл: ${error}`);
  }
}
