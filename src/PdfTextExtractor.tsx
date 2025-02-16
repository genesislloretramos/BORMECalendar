import React, { useState, useEffect } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PdfTextExtractorProps {
  pdfUrl: string;
}

const processPdfText = (text: string): string => {
  text = text.replace(/\s{3,}/g, '\n');
  text = text.replace(/\s{2,}/g, '\n');
  let lines = text.split('\n');
  if (lines.length > 10) { lines = lines.slice(10); }
  if (lines.length > 3) { lines = lines.slice(0, -3); }
  let processedLines: string[] = [];
  let skipMode = false;
  for (let i = 0; i < lines.length; i++) {
    if (!skipMode) {
      if (lines[i].includes('BOLETÍN OFICIAL DEL REGISTRO MERCANTIL')) {
        skipMode = true;
        continue;
      } else { processedLines.push(lines[i]); }
    } else {
      if (lines[i].includes('https://www.boe.es')) { skipMode = false; }
      continue;
    }
  }
  let finalLines: string[] = [];
  let accumulator = '';
  const pattern = /^\d+\s*-\s*.+/;
  for (let i = 0; i < processedLines.length; i++) {
    const line = processedLines[i].trim();
    if (pattern.test(line)) {
      if (accumulator) {
        finalLines.push(accumulator.trim());
        accumulator = '';
      }
      finalLines.push(line);
    } else {
      accumulator += (accumulator ? ' ' : '') + line;
    }
  }
  if (accumulator) { finalLines.push(accumulator.trim()); }
  return finalLines.join('\n');
};
const PdfTextExtractor: React.FC<PdfTextExtractorProps> = ({ pdfUrl }) => {
  const [text, setText] = useState<string>('Cargando texto...');
  useEffect(() => {
    async function extractText() {
      try {
        const proxyUrl = pdfUrl.replace('https://www.boe.es/', '/pdf-proxy/');
        const response = await fetch(proxyUrl);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const pdf = await getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          const pageText = content.items.map((item: any) => item.str).join(' ');
          fullText += processPdfText(pageText) + '\n';
        }
        setText(fullText);
      } catch (error: any) {
        setText(`Error al extraer texto: ${error.message}`);
      }
    }
    extractText();
  }, [pdfUrl]);
  return <pre>{text}</pre>;
};
export default PdfTextExtractor;
