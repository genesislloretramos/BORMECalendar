import React, { useState } from 'react';
import './Calendar.css';

const xmlToJson = (xmlNode: Node): any => {
  // Si es nodo de texto, devolvemos su contenido si no es vacío.
  if (xmlNode.nodeType === Node.TEXT_NODE) {
    const text = xmlNode.nodeValue?.trim();
    return text ? text : null;
  }

  let obj: any = {};

  // Procesar atributos solo en elementos.
  if (xmlNode.nodeType === Node.ELEMENT_NODE) {
    const element = xmlNode as Element;
    if (element.attributes.length > 0) {
      obj['@attributes'] = {};
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes.item(i);
        if (attr) {
          obj['@attributes'][attr.name] = attr.value;
        }
      }
    }
  }

  // Procesar nodos hijos
  if (xmlNode.hasChildNodes()) {
    for (let i = 0; i < xmlNode.childNodes.length; i++) {
      const child = xmlNode.childNodes[i];
      const childObj = xmlToJson(child);
      if (childObj !== null) {
        const nodeName = child.nodeName;
        if (obj[nodeName] === undefined) {
          obj[nodeName] = childObj;
        } else {
          if (!Array.isArray(obj[nodeName])) {
            obj[nodeName] = [obj[nodeName]];
          }
          obj[nodeName].push(childObj);
        }
      }
    }
  }
  return obj;
};

const Calendar: React.FC = () => {
  const today = new Date();
  const [displayedDate, setDisplayedDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const year = displayedDate.getFullYear();
  const month = displayedDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1);
  const dayOfWeek = firstDay.getDay();
  const adjustedStartingDay = dayOfWeek === 0 ? 7 : dayOfWeek;
  const daysWithData = month % 2 === 0 ? [3, 12, 18] : [5, 15, 25];
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupContent, setPopupContent] = useState<string>('');

  const prevMonth = () => {
    setDisplayedDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setDisplayedDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const date = new Date(displayedDate.getFullYear(), displayedDate.getMonth(), day);
    const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    fetchSumario(formattedDate);
  };

  const fetchSumario = async (date: string) => {
    try {
      const response = await fetch(`/api-borme/sumario/${date}`, {
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) {
        setPopupContent(`Error: ${response.status} ${response.statusText}`);
      } else {
        const text = await response.text();
        // Verificamos que la respuesta empiece con "<"
        if (!text.trim().startsWith('<')) {
          setPopupContent(`Error: La respuesta no es XML. Se recibió: ${text}`);
          setPopupVisible(true);
          return;
        }
        // Parsear el XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text.trim(), 'text/xml');
        // Comprobar si hay errores de parseo
        const errors = xmlDoc.getElementsByTagName('parsererror');
        if (errors.length > 0) {
          setPopupContent(`XML Parse Error: ${errors[0].textContent}`);
        } else {
          const jsonResult = xmlToJson(xmlDoc);
          setPopupContent(JSON.stringify(jsonResult, null, 2));
        }
      }
    } catch (error: any) {
      setPopupContent(`Error: ${error.message}`);
    }
    setPopupVisible(true);
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={prevMonth} className="nav-button" aria-label="Mes anterior">
          &#8592;
        </button>
        <h2>{displayedDate.toLocaleString('default', { month: 'long' })} {year}</h2>
        <button onClick={nextMonth} className="nav-button" aria-label="Mes siguiente">
          &#8594;
        </button>
      </div>
      <div className="calendar-day-names">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(dayName => (
          <div key={dayName} className="calendar-day-name">
            {dayName}
          </div>
        ))}
      </div>
      <div className="calendar-grid">
        {daysArray.map((day, index) => {
          const style: React.CSSProperties = {};
          if (index === 0 && adjustedStartingDay !== 1) {
            style.gridColumnStart = adjustedStartingDay;
          }
          return (
            <div
              key={day}
              className="calendar-cell"
              style={style}
              onClick={() => handleDayClick(day)}
            >
              <span className="day-number">{day}</span>
              <span
                className={`data-indicator ${daysWithData.includes(day) ? 'has-data' : 'no-data'}`}
              ></span>
            </div>
          );
        })}
      </div>
      {popupVisible && (
        <div className="modal-overlay" onClick={() => setPopupVisible(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPopupVisible(false)}>Cerrar</button>
            <pre>{popupContent}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
