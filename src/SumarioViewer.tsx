import React from 'react';
import './SumarioViewer.css';
import PdfTextExtractor from './PdfTextExtractor';

interface SumarioViewerProps {
  sumario: Record<string, unknown>;
}

const SumarioViewer: React.FC<SumarioViewerProps> = ({ sumario }) => {
  const diario = sumario?.data?.sumario?.diario;
  const seccionA = Array.isArray(diario)
    ? diario
        .map(d => {
          if (typeof d === 'object' && d && Array.isArray((d as Record<string, unknown>).seccion as unknown[])) {
            const sectionArr = (d as Record<string, unknown>).seccion as unknown[];
            return sectionArr.find(s => (s as Record<string, unknown>).codigo === "A") as Record<string, unknown> | null;
          }
          return null;
        })
        .filter(s => s !== null)
    : [];

  if (seccionA.length === 0) {
    return <div>No se encontró la Sección A.</div>;
  }

  const section = seccionA[0];
  const filteredItems = Array.isArray((section as Record<string, unknown>).item as unknown[])
    ? ((section as Record<string, unknown>).item as unknown[]).filter(item =>
        !(item as Record<string, unknown>).titulo?.includes("ÍNDICE ALFABÉTICO DE SOCIEDADES")
      )
    : [];

  return (
    <div className="sumario-viewer">
      <div className="popup-header">
        <h2>Sección A – SECCIÓN PRIMERA. Empresarios. Actos inscritos</h2>
      </div>
      <div className="seccion">
        <h5>Sección {section.codigo} – {section.nombre}</h5>
        {filteredItems.length > 0 && (
          <ul className="items">
            {filteredItems.map((item: Record<string, unknown>, iIdx: number) => {
              const obj = item as Record<string, unknown>;
              return (
                <li key={iIdx} className="item">
                  <p><strong>Identificador:</strong> {obj.identificador}</p>
                  <p><strong>Título:</strong> {obj.titulo}</p>
                  {obj.url_pdf && (
                    <div>
                      <strong>Texto PDF:</strong>
                      <PdfTextExtractor pdfUrl={obj.url_pdf.texto} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
export default SumarioViewer;
