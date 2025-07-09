import React from 'react';
import './SumarioViewer.css';
import PdfTextExtractor from './PdfTextExtractor';

interface SumarioViewerProps {
  sumario: any;
}

const SumarioViewer: React.FC<SumarioViewerProps> = ({ sumario }) => {
  const diario = sumario?.data?.sumario?.diario;
  const seccionA = Array.isArray(diario)
    ? diario.map((d: any) => {
        if (d.seccion && Array.isArray(d.seccion)) {
          return d.seccion.find((s: any) => s.codigo === "A");
        }
        return null;
      }).filter((s: any) => s !== null)
    : [];

  if (seccionA.length === 0) {
    return <div>No se encontró la Sección A.</div>;
  }

  const section = seccionA[0];
  const filteredItems = Array.isArray(section.item)
    ? section.item.filter((item: any) => !item.titulo.includes("ÍNDICE ALFABÉTICO DE SOCIEDADES"))
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
            {filteredItems.map((item: any, iIdx: number) => (
              <li key={iIdx} className="item">
                <p><strong>Identificador:</strong> {item.identificador}</p>
                <p><strong>Título:</strong> {item.titulo}</p>
                {item.url_pdf && (
                  <div>
                    <strong>Texto PDF:</strong>
                    <PdfTextExtractor pdfUrl={item.url_pdf.texto} />
                    </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
export default SumarioViewer;
