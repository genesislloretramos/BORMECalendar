import React, { useState, useEffect } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
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
  const processedLines: string[] = [];
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
  const finalLines: string[] = [];
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
interface Entry { id: string; name: string; details: string; }

const parseEntries = (text: string): Entry[] => {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  return lines.map(line => {
    const match = line.match(/^(\d+)\s*-\s*(.+)$/);
    let id = '', rest = line;
    if (match) {
      id = match[1];
      rest = match[2];
    }
    const dotIdx = rest.indexOf('.');
    let name = rest;
    let details = '';
    if (dotIdx !== -1) {
      name = rest.substring(0, dotIdx).trim();
      details = rest.substring(dotIdx + 1).trim();
    }
    return { id, name, details };
  });
};

const PdfTextExtractor: React.FC<PdfTextExtractorProps> = ({ pdfUrl }) => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [status, setStatus] = useState<string>('Cargando texto...');
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
          const pageText = (content.items as TextItem[]).map(item => item.str).join(' ');
          fullText += processPdfText(pageText) + '\n';
        }
        setEntries(parseEntries(fullText));
        setStatus('');
      } catch (error: unknown) {
        if (error instanceof Error) {
          setStatus(`Error al extraer texto: ${error.message}`);
        } else {
          setStatus('Error al extraer texto');
        }
      }
    }
    extractText();
  }, [pdfUrl]);

  if (status) {
    return <pre>{status}</pre>;
  }

  return (
    <ul>
      {entries.map(entry => (
        <li key={entry.id}>
          <strong>{entry.id}</strong> - <strong>{entry.name}</strong>
          <div>{entry.details}</div>
        </li>
      ))}
    </ul>
  );
};
export default PdfTextExtractor;
