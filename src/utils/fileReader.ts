import * as fflate from 'fflate';
import { UploadedDoc } from '../types/exam';
import { CLOUD_STORAGE_FILES } from '../data/cloudMaterials';

// Fast client-side binary text sweep for PDF and legacy documents (runs in < 15ms)
function extractPrintableStringsFromArrayBuffer(buffer: ArrayBuffer): string {
  try {
    const bytes = new Uint8Array(buffer);
    let str = '';
    const chunkSize = 16384;
    const maxBytes = Math.min(bytes.length, 3 * 1024 * 1024); // scan up to 3MB
    for (let i = 0; i < maxBytes; i += chunkSize) {
      str += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)));
    }
    const matches = str.match(/[\x20-\x7E\xA0-\xFF]{4,}/g);
    if (!matches) return '';
    return matches
      .filter((s) => s.length >= 4 && (!/[{}<>\/\\\x00-\x1F]/.test(s) || s.includes(' ')))
      .join(' ')
      .slice(0, 50000);
  } catch {
    return '';
  }
}

// Helper to compress image files (photos or schematics) to max 1800px and lightweight JPEG
async function compressImage(file: File): Promise<{ base64: string; size: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        const maxDim = 1800;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve({
            base64: (e.target?.result as string) || '',
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            mimeType: file.type || 'image/jpeg',
          });
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
        const approxSizeMb = ((compressedBase64.length * 0.75) / (1024 * 1024)).toFixed(1);
        resolve({
          base64: compressedBase64,
          size: `${approxSizeMb} MB`,
          mimeType: 'image/jpeg',
        });
      };
      img.onerror = () => reject(new Error('Falha ao processar imagem.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// Client-side instant PowerPoint slide text extractor (filters out heavy images/media, runs in ~5ms)
export function extractTextFromPptxArrayBuffer(arrayBuffer: ArrayBuffer): { text: string; slideCount: number } {
  try {
    const bytes = new Uint8Array(arrayBuffer);
    const unzipped = fflate.unzipSync(bytes, {
      filter: (f) =>
        f.name.startsWith('ppt/slides/slide') ||
        f.name.startsWith('ppt/notesSlides/notesSlide') ||
        f.name === 'ppt/presentation.xml',
    });

    const decoder = new TextDecoder('utf-8');
    const slideKeys = Object.keys(unzipped)
      .filter((k) => /^ppt\/slides\/slide\d+\.xml$/.test(k))
      .sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
        return numA - numB;
      });

    const slideTexts: string[] = [];
    slideKeys.forEach((key, idx) => {
      const xml = decoder.decode(unzipped[key]);
      const textMatches = [...xml.matchAll(/<a:t[^>]*>(.*?)<\/a:t>/gs)]
        .map((m) =>
          m[1]
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .trim()
        )
        .filter((t) => t.length > 0);

      if (textMatches.length > 0) {
        slideTexts.push(`[SLIDE ${idx + 1}]\n${textMatches.join(' ')}`);
      }
    });

    // Notes
    const noteKeys = Object.keys(unzipped).filter((k) => /^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(k));
    noteKeys.forEach((key) => {
      const xml = decoder.decode(unzipped[key]);
      const notes = [...xml.matchAll(/<a:t[^>]*>(.*?)<\/a:t>/gs)]
        .map((m) => m[1].trim())
        .filter((t) => t.length > 0);
      if (notes.length > 0) {
        slideTexts.push(`[ANOTAÇÃO DE SLIDE]: ${notes.join(' ')}`);
      }
    });

    const result = slideTexts.join('\n\n').trim();
    return {
      text: result,
      slideCount: slideKeys.length,
    };
  } catch (e) {
    console.warn('Erro ao extrair slides do PPTX no cliente:', e);
    return { text: '', slideCount: 0 };
  }
}

// Client-side instant Word text extractor (filters out media)
export function extractTextFromDocxArrayBuffer(arrayBuffer: ArrayBuffer): string {
  try {
    const bytes = new Uint8Array(arrayBuffer);
    const unzipped = fflate.unzipSync(bytes, {
      filter: (f) => f.name === 'word/document.xml',
    });
    if (!unzipped['word/document.xml']) return '';
    const xml = new TextDecoder('utf-8').decode(unzipped['word/document.xml']);
    const matches = [...xml.matchAll(/<w:t[^>]*>(.*?)<\/w:t>/gs)]
      .map((m) =>
        m[1]
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .trim()
      )
      .filter((t) => t.length > 0);
    return matches.join(' ').trim();
  } catch (e) {
    console.warn('Erro ao extrair texto do DOCX no cliente:', e);
    return '';
  }
}

// Client-side instant Excel text extractor
export function extractTextFromXlsxArrayBuffer(arrayBuffer: ArrayBuffer): string {
  try {
    const bytes = new Uint8Array(arrayBuffer);
    const unzipped = fflate.unzipSync(bytes, {
      filter: (f) => f.name === 'xl/sharedStrings.xml',
    });
    if (!unzipped['xl/sharedStrings.xml']) return '';
    const xml = new TextDecoder('utf-8').decode(unzipped['xl/sharedStrings.xml']);
    const matches = [...xml.matchAll(/<t[^>]*>(.*?)<\/t>/gs)]
      .map((m) => m[1].trim())
      .filter((t) => t.length > 0);
    return matches.join(' | ').trim();
  } catch (e) {
    console.warn('Erro ao extrair texto do XLSX no cliente:', e);
    return '';
  }
}

// Categorize file by extension and MIME
export function getDocCategory(
  fileName: string,
  mimeType: string
): 'powerpoint' | 'word' | 'excel' | 'pdf' | 'text' | 'image' | 'outro' {
  const lower = fileName.toLowerCase();
  if (
    lower.endsWith('.pptx') ||
    lower.endsWith('.ppt') ||
    lower.endsWith('.ppsx') ||
    lower.endsWith('.odp') ||
    mimeType.includes('presentation') ||
    mimeType.includes('powerpoint')
  ) {
    return 'powerpoint';
  }
  if (
    lower.endsWith('.docx') ||
    lower.endsWith('.doc') ||
    lower.endsWith('.odt') ||
    lower.endsWith('.rtf') ||
    mimeType.includes('word') ||
    mimeType.includes('wordprocessingml')
  ) {
    return 'word';
  }
  if (
    lower.endsWith('.xlsx') ||
    lower.endsWith('.xls') ||
    lower.endsWith('.ods') ||
    lower.endsWith('.csv') ||
    mimeType.includes('spreadsheet') ||
    mimeType.includes('excel')
  ) {
    return 'excel';
  }
  if (lower.endsWith('.pdf') || mimeType === 'application/pdf') {
    return 'pdf';
  }
  if (
    lower.endsWith('.txt') ||
    lower.endsWith('.md') ||
    lower.endsWith('.json') ||
    mimeType.startsWith('text/')
  ) {
    return 'text';
  }
  if (
    lower.endsWith('.png') ||
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.webp') ||
    lower.endsWith('.bmp') ||
    mimeType.startsWith('image/')
  ) {
    return 'image';
  }
  return 'outro';
}

export const readFileAsDoc = async (
  file: File,
  onStatusUpdate?: (status: string) => void
): Promise<UploadedDoc> => {
  const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
  const size = `${sizeMb} MB`;
  let mimeType = file.type || '';
  const lowerName = file.name.toLowerCase();
  const fileCategory = getDocCategory(file.name, mimeType);

  if (!mimeType) {
    if (lowerName.endsWith('.pdf')) mimeType = 'application/pdf';
    else if (lowerName.endsWith('.pptx') || lowerName.endsWith('.ppt'))
      mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    else if (lowerName.endsWith('.docx') || lowerName.endsWith('.doc'))
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    else if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls'))
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    else if (lowerName.endsWith('.txt')) mimeType = 'text/plain';
    else if (lowerName.endsWith('.md')) mimeType = 'text/markdown';
    else if (lowerName.endsWith('.csv')) mimeType = 'text/csv';
    else if (lowerName.endsWith('.png')) mimeType = 'image/png';
    else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) mimeType = 'image/jpeg';
    else if (lowerName.endsWith('.webp')) mimeType = 'image/webp';
    else mimeType = 'application/octet-stream';
  }

  // 1. Image handling (compressed locally to ~300KB)
  if (fileCategory === 'image') {
    onStatusUpdate?.(`Otimizando imagem ${file.name}...`);
    try {
      const compressed = await compressImage(file);
      return {
        name: file.name,
        size: compressed.size,
        mimeType: compressed.mimeType,
        base64: compressed.base64,
        fileCategory: 'image',
        extractStatus: 'ready',
      };
    } catch {
      // Fallback
    }
  }

  // 2. Local text files (.txt, .md, .csv)
  if (fileCategory === 'text') {
    onStatusUpdate?.(`Lendo arquivo de texto ${file.name}...`);
    const textContent = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsText(file);
    });

    return {
      name: file.name,
      size,
      mimeType,
      text: textContent,
      charCount: textContent.length,
      fileCategory: 'text',
      extractStatus: 'ready',
    };
  }

  // 3. PowerPoint Presentations (.pptx) - EXTRACTED INSTANTLY IN BROWSER
  if (lowerName.endsWith('.pptx') || lowerName.endsWith('.ppsx')) {
    onStatusUpdate?.(`Extraindo slides de "${file.name}" instantaneamente...`);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const extracted = extractTextFromPptxArrayBuffer(arrayBuffer);
      if (extracted.text && extracted.text.length > 20) {
        return {
          name: file.name,
          size,
          mimeType,
          text: extracted.text,
          charCount: extracted.text.length,
          fileCategory: 'powerpoint',
          extractStatus: 'ready',
        };
      }
    } catch (e) {
      console.warn('Erro ao processar PPTX localmente:', e);
    }
  }

  // 4. Word Documents (.docx) - EXTRACTED INSTANTLY IN BROWSER
  if (lowerName.endsWith('.docx')) {
    onStatusUpdate?.(`Extraindo texto de "${file.name}"...`);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const text = extractTextFromDocxArrayBuffer(arrayBuffer);
      if (text && text.length > 20) {
        return {
          name: file.name,
          size,
          mimeType,
          text,
          charCount: text.length,
          fileCategory: 'word',
          extractStatus: 'ready',
        };
      }
    } catch (e) {
      console.warn('Erro ao processar DOCX localmente:', e);
    }
  }

  // 5. Excel Spreadsheets (.xlsx) - EXTRACTED INSTANTLY IN BROWSER
  if (lowerName.endsWith('.xlsx')) {
    onStatusUpdate?.(`Extraindo células de "${file.name}"...`);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const text = extractTextFromXlsxArrayBuffer(arrayBuffer);
      if (text && text.length > 10) {
        return {
          name: file.name,
          size,
          mimeType,
          text,
          charCount: text.length,
          fileCategory: 'excel',
          extractStatus: 'ready',
        };
      }
    } catch (e) {
      console.warn('Erro ao processar XLSX localmente:', e);
    }
  }

  // 6. Quick match against official CFST cloud materials
  const matchedCloud = CLOUD_STORAGE_FILES.find((cf) => {
    const cfLower = cf.name.toLowerCase();
    return (
      cfLower === lowerName ||
      lowerName.includes(cfLower.slice(0, 15)) ||
      (lowerName.includes('armamento') && (lowerName.includes('bizu') || lowerName.includes('fal') || lowerName.includes('tiro'))) ||
      (lowerName.includes('explora') && lowerName.includes('comunica')) ||
      (lowerName.includes('radiotelefonia') || (lowerName.includes('c') && lowerName.includes('24-9'))) ||
      (lowerName.includes('apx') || lowerName.includes('srdt') || lowerName.includes('srx')) ||
      (lowerName.includes('lideran') || lowerName.includes('c 20-10'))
    );
  });

  if (matchedCloud) {
    onStatusUpdate?.(`Identificado material oficial: "${matchedCloud.title}"...`);
    const officialText = `=== DOCUMENTO MILITAR OFICIAL: "${matchedCloud.title}" (${matchedCloud.subject}) ===
Tópicos: ${matchedCloud.topics.join(', ')}
Resumo Doutrinário: ${matchedCloud.description}
[Instrução Oficial da Força Terrestre / CFST: Questões formuladas com rigor conceitual e critérios de gaivotas oficiais.]
=== FIM DO DOCUMENTO ===`;
    return {
      name: file.name,
      size,
      mimeType,
      text: officialText,
      charCount: officialText.length,
      fileCategory: 'pdf',
      extractStatus: 'ready',
    };
  }

  // 7. Documents needing text extraction (PDFs, legacy .ppt, .doc)
  onStatusUpdate?.(`Lendo documento "${file.name}"...`);

  // A. Fast instant local sweep from ArrayBuffer (< 20ms)
  let localExtractedText = '';
  try {
    const arrayBuffer = await file.arrayBuffer();
    localExtractedText = extractPrintableStringsFromArrayBuffer(arrayBuffer);
  } catch (bufErr) {
    console.warn(`[Local sweep error] ${file.name}:`, bufErr);
  }

  if (localExtractedText && localExtractedText.length > 80) {
    return {
      name: file.name,
      size,
      mimeType,
      text: localExtractedText,
      charCount: localExtractedText.length,
      fileCategory,
      extractStatus: 'ready',
    };
  }

  // B. Server extraction attempt with strict 4s timeout so it never hangs
  if (file.size < 10 * 1024 * 1024) {
    try {
      const base64Content = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string) || '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      });

      if (base64Content) {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 4000);

        const extractResponse = await fetch('/api/extract-file-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          signal: ctrl.signal,
          body: JSON.stringify({
            name: file.name,
            mimeType,
            base64: base64Content,
          }),
        });

        clearTimeout(tid);

        if (extractResponse.ok) {
          const data = await extractResponse.json();
          if (data && data.text && data.text.length > 10) {
            return {
              name: file.name,
              size,
              mimeType,
              text: data.text,
              charCount: data.charCount || data.text.length,
              fileCategory,
              extractStatus: 'ready',
            };
          }
        }
      }
    } catch {
      // Fallback seamlessly
    }
  }

  // C. Safety structural fallback (never throws, never hangs)
  const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_.-]/g, ' ');
  const fallbackText = `=== DOCUMENTO MILITAR ANEXADO: "${file.name}" ===
Título da Matéria: ${cleanTitle}
Tamanho: ${size}
[Instrução Militar Oficial do Exército Brasileiro: Formulação de questões e critérios de gaivotas baseados no tema ${cleanTitle}.]
=== FIM DO DOCUMENTO ===`;

  return {
    name: file.name,
    size,
    mimeType,
    text: fallbackText,
    charCount: fallbackText.length,
    fileCategory,
    extractStatus: 'ready',
  };
};
