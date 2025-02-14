import React, { useState } from 'react';
import './SumarioViewer.css';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface SumarioViewerProps {
  sumario: any;
}

const SumarioViewer: React.FC<SumarioViewerProps> = ({ sumario }) => {
  const [pdfText, setPdfText] = useState<string>('');
  const [loadingText, setLoadingText] = useState<boolean>(false);

  const handleExtractPdfText = async (pdfUrl: string) => {
    setLoadingText(true);
    // Use proxy if needed, otherwise use the pdfUrl directly
    const proxyUrl = pdfUrl.replace('https://www.boe.es/', '/pdf-proxy/');
    try {
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        alert(`Error al obtener PDF: ${response.status}`);
        setLoadingText(false);
        return;
      }
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const pdf = await getDocument({ data: arrayBuffer }).promise;
      let textContent = '';
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textItems = await page.getTextContent();
        const pageText = textItems.items.map((item: any) => item.str).join(' ');
        textContent += pageText + '\n';
      }
      setPdfText(textContent);
    } catch (error: any) {
      alert(`Error: ${error}`);
    }
    setLoadingText(false);
  };

  const { status, data } = sumario;
  const metadatos = data?.sumario?.metadatos;
  const diario = data?.sumario?.diario;
  return (
    <div className="sumario-viewer">
      <div className="popup-header">
        <h2>Sumario BORME</h2>
        {status && (
          <div className="status">
            <span className="status-code">{status.code}</span>
            <span className="status-text">{status.text}</span>
          </div>
        )}
      </div>
      {metadatos && (
        <div className="metadatos">
          <h3>Metadatos</h3>
          <p><strong>Publicación:</strong> {metadatos.publicacion}</p>
          <p><strong>Fecha de Publicación:</strong> {metadatos.fecha_publicacion}</p>
        </div>
      )}
      {diario && (
        <div className="diario">
          <h3>Diario</h3>
          {Array.isArray(diario) ? (
            diario.map((d: any, idx: number) => (
              <div key={idx} className="diario-item">
                <h4>Diario Número: {d.numero}</h4>
                {d.sumario_diario && (
                  <div className="sumario-diario">
                    <p><strong>Identificador:</strong> {d.sumario_diario.identificador}</p>
                    {d.sumario_diario.url_pdf && (
                      <p>
                        <strong>Texto PDF:</strong>{' '}
                        <button onClick={() => handleExtractPdfText(d.sumario_diario.url_pdf.texto)}>
                          {loadingText ? 'Cargando...' : 'Ver Texto'}
                        </button>
                      </p>
                    )}
                  </div>
                )}
                {d.seccion && (
                  <div className="secciones">
                    {Array.isArray(d.seccion)
                      ? d.seccion.map((s: any, sIdx: number) => (
                          <div key={sIdx} className="seccion">
                            <h5>Sección {s.codigo} – {s.nombre}</h5>
                            {s.item && (
                              <ul className="items">
                                {Array.isArray(s.item)
                                  ? s.item.map((item: any, iIdx: number) => (
                                      <li key={iIdx} className="item">
                                        <p><strong>Identificador:</strong> {item.identificador}</p>
                                        <p><strong>Título:</strong> {item.titulo}</p>
                                        {item.url_pdf && (
                                          <p>
                                            <strong>Texto PDF:</strong>{' '}
                                            <button onClick={() => handleExtractPdfText(item.url_pdf.texto)}>
                                              {loadingText ? 'Cargando...' : 'Ver Texto'}
                                            </button>
                                          </p>
                                        )}
                                      </li>
                                    ))
                                  : null}
                              </ul>
                            )}
                          </div>
                        ))
                      : null}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div>No se encontraron datos en el diario.</div>
          )}
        </div>
      )}
      {pdfText && (
        <div className="pdf-text">
          <h3>Contenido del PDF</h3>
          <pre>{pdfText}</pre>
        </div>
      )}
    </div>
  );
};

export default SumarioViewer;
