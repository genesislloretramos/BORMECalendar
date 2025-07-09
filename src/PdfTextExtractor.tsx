import React, { useState, useEffect } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PdfTextExtractorProps {
  pdfUrl: string;
}

interface CompanyData {
  nombre?: string;
  comienzo?: string;
  objeto?: string;
  domicilio?: string;
  capital?: string;
  nombramientos?: string;
  datos?: string;
}

interface PdfEntry {
  id: string;
  text: string;
  parsed?: CompanyData;
}

const parseConstitutionText = (text: string): CompanyData | null => {
  if (!text.includes('Constituci')) {
    return null;
  }
  const data: CompanyData = {};
  const nombreMatch = text.match(/^(.+?)\s+Constituci/i);
  if (nombreMatch) {
    data.nombre = nombreMatch[1].trim();
  }
  const comienzoMatch = text.match(/Comienzo de operaciones:\s*(.+?)(?=\.\s+[A-ZÁÉÍÓÚÑ]|$)/i);
  if (comienzoMatch) {
    data.comienzo = comienzoMatch[1].trim();
  }
  const objetoMatch = text.match(/Objeto social:\s*(.+?)\s+Domicilio:/i);
  if (objetoMatch) {
    data.objeto = objetoMatch[1].trim();
  }
  const domicilioMatch = text.match(/Domicilio:\s*([^\.]+)\./i);
  if (domicilioMatch) {
    data.domicilio = domicilioMatch[1].trim();
  }
  const capitalMatch = text.match(/Capital:\s*(.+?)(?=\.\s+[A-ZÁÉÍÓÚÑ]|$)/i);
  if (capitalMatch) {
    data.capital = capitalMatch[1].trim();
  }
  const nomMatch = text.match(/Nombramientos\.\s*(.+?)(?=\.\s+[A-ZÁÉÍÓÚÑ]|$)/i);
  if (nomMatch) {
    data.nombramientos = nomMatch[1].trim();
  }
  const datosMatch = text.match(/Datos registrales\.\s*(.+)$/i);
  if (datosMatch) {
    data.datos = datosMatch[1].trim();
  }
  return data;
};

const processPdfText = (text: string): string[] => {
  text = text.replace(/\s{3,}/g, '\n');
  text = text.replace(/\s{2,}/g, '\n');
  let lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const firstIndex = lines.findIndex((l) => /^\d+\s*-/.test(l));
  if (firstIndex !== -1) {
    lines = lines.slice(firstIndex);
  }

  const cleanedLines: string[] = [];
  let skipMode = false;
  for (const line of lines) {
    if (!skipMode) {
      if (line.includes('BOLETÍN OFICIAL DEL REGISTRO MERCANTIL')) {
        skipMode = true;
        continue;
      }
      cleanedLines.push(line);
    } else if (line.includes('https://www.boe.es')) {
      skipMode = false;
    }
  }

  const entries: string[] = [];
  let current = '';
  const pattern = /^\d+\s*-\s*.+/;
  for (const line of cleanedLines) {
    if (pattern.test(line)) {
      if (current) {
        entries.push(current.trim());
      }
      current = line;
    } else {
      current += (current ? ' ' : '') + line;
    }
  }
  if (current) {
    entries.push(current.trim());
  }
  return entries;
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
              const textPart = match[2].trim();
              const parsedData = parseConstitutionText(textPart);
              if (parsedData) {
                return { id: match[1], text: textPart, parsed: parsedData } as PdfEntry;
              }
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
        <li key={e.id} className="pdf-entry">
          <details>
            <summary>
              <strong>{e.id}</strong> - {e.parsed?.nombre ?? e.text.slice(0, 50)}
              {(!e.parsed && e.text.length > 50) ? '…' : ''}
            </summary>
            {e.parsed ? (
              <ul>
                {e.parsed.comienzo && (
                  <li><strong>Comienzo de operaciones:</strong> {e.parsed.comienzo}</li>
                )}
                {e.parsed.objeto && (
                  <li><strong>Objeto social:</strong> {e.parsed.objeto}</li>
                )}
                {e.parsed.domicilio && (
                  <li><strong>Domicilio:</strong> {e.parsed.domicilio}</li>
                )}
                {e.parsed.capital && (
                  <li><strong>Capital:</strong> {e.parsed.capital}</li>
                )}
                {e.parsed.nombramientos && (
                  <li><strong>Nombramientos:</strong> {e.parsed.nombramientos}</li>
                )}
                {e.parsed.datos && (
                  <li><strong>Datos registrales:</strong> {e.parsed.datos}</li>
                )}
              </ul>
            ) : (
              <p>{e.text}</p>
            )}
          </details>
        </li>
      ))}
    </ul>
  );
};
export default PdfTextExtractor;
