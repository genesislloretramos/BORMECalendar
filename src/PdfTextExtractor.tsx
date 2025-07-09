import React, { useState, useEffect } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PdfTextExtractorProps {
  pdfUrl: string;
}

interface PdfEntry {
  id: string;
  text: string;
}

const processPdfText = (text: string): string[] => {
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
  return finalLines;
};
const PdfTextExtractor: React.FC<PdfTextExtractorProps> = ({ pdfUrl }) => {
  const [entries, setEntries] = useState<PdfEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    async function extractText() {
      try {
        const proxyUrl = pdfUrl.replace('https://www.boe.es/', '/pdf-proxy/');
        const response = await fetch(proxyUrl);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const pdf = await getDocument({ data: arrayBuffer }).promise;
        let lines: string[] = [];
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          const pageText = (content.items as TextItem[]).map((item) => item.str).join(' ');
          lines = lines.concat(processPdfText(pageText));
        }
        const parsed: PdfEntry[] = lines
          .map((line) => {
            const match = line.match(/^(\d+)\s*-\s*(.+)$/);
            if (match) {
              return { id: match[1], text: match[2].trim() } as PdfEntry;
            }
            return null;
          })
          .filter((e): e is PdfEntry => e !== null);
        setEntries(parsed);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(`Error al extraer texto: ${message}`);
      }
    }
    extractText();
  }, [pdfUrl]);

  if (error) {
    return <p>{error}</p>;
  }

  if (entries.length === 0) {
    return <p>Cargando texto...</p>;
  }

  return (
    <ul className="pdf-entries">
      {entries.map((e) => (
        <li key={e.id}>
          <details>
            <summary>
              <strong>{e.id}</strong>
              {e.text.length > 80 ? ` - ${e.text.slice(0, 80)}...` : ` - ${e.text}`}
            </summary>
            <p>{e.text}</p>
          </details>
        </li>
      ))}
    </ul>
  );
};
export default PdfTextExtractor;
