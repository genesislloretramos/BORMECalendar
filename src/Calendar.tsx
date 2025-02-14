import React, { useState } from 'react';
import './Calendar.css';

// Función que convierte el XML a un objeto JSON recursivamente
const xmlToJson = (xmlNode: Node): any => {
  if (xmlNode.nodeType === Node.TEXT_NODE) {
    const text = xmlNode.nodeValue?.trim();
    return text ? text : null;
  }

  let obj: any = {};

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

// Componente recursivo para mostrar el JSON en HTML de forma decorada
const JsonViewer = ({ data }: { data: any }) => {
  if (typeof data !== 'object' || data === null) {
    return <span className="json-value">{String(data)}</span>;
  }

  if (Array.isArray(data)) {
    return (
      <ul className="json-array">
        {data.map((item, index) => (
          <li key={index}>
            <JsonViewer data={item} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="json-object">
      {Object.entries(data).map(([key, value]) => (
        <li key={key}>
          <span className="json-key">{key}:</span> <JsonViewer data={value} />
        </li>
      ))}
    </ul>
  );
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
  const [popupData, setPopupData] = useState<any>(null);
  const [popupContent, setPopupContent] = useState<string>('');
  const [popupVisible, setPopupVisible] = useState(false);
  const prevMonth = () => { setDisplayedDate(new Date(year, month - 1, 1)); };
  const nextMonth = () => { setDisplayedDate(new Date(year, month + 1, 1)); };
  const handleDayClick = (day: number) => {
    const date = new Date(displayedDate.getFullYear(), displayedDate.getMonth(), day);
    const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    fetchSumario(formattedDate);
  };
  const fetchSumario = async (date: string) => {
    try {
      const response = await fetch(`/api-borme/sumario/${date}`, { headers: { Accept: 'application/json' } });
      if (!response.ok) {
        setPopupContent(`Error: ${response.status} ${response.statusText}`);
        setPopupData(null);
      } else {
        const text = await response.text();
        if (!text.trim().startsWith('<')) {
          setPopupContent(`Error: La respuesta no es XML. Se recibió: ${text}`);
          setPopupData(null);
          setPopupVisible(true);
          return;
        }
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text.trim(), 'text/xml');
        const errors = xmlDoc.getElementsByTagName('parsererror');
        if (errors.length > 0) {
          setPopupContent(`XML Parse Error: ${errors[0].textContent}`);
          setPopupData(null);
        } else {
          const jsonResult = xmlToJson(xmlDoc);
          setPopupData(jsonResult);
          setPopupContent('');
        }
      }
    } catch (error: any) {
      setPopupContent(`Error: ${error.message}`);
      setPopupData(null);
    }
    setPopupVisible(true);
  };
  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={prevMonth} className="nav-button" aria-label="Mes anterior">
          &#8592;
        </button>
        <h2>
          {displayedDate.toLocaleString('default', { month: 'long' })} {year}
        </h2>
        <button onClick={nextMonth} className="nav-button" aria-label="Mes siguiente">
          &#8594;
        </button>
      </div>
      <div className="calendar-day-names"> 
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(dayName => ( <div key={dayName} className="calendar-day-name"> {dayName} </div> ))}
      </div>
      <div className="calendar-grid">
        {daysArray.map((day, index) => {
          const style: React.CSSProperties = {};
          if (index === 0 && adjustedStartingDay !== 1) { style.gridColumnStart = adjustedStartingDay; }
          return (
            <div key={day} className="calendar-cell" style={style} onClick={() => handleDayClick(day)}>
              <span className="day-number">{day}</span>
              <span className={`data-indicator ${daysWithData.includes(day) ? 'has-data' : 'no-data'}`}></span>
            </div>
          );
        })}
      </div>
      {popupVisible && (
        <div className="modal-overlay" onClick={() => setPopupVisible(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPopupVisible(false)}>Cerrar</button>
            {popupData ? ( <JsonViewer data={popupData} /> ) : ( <div className="error-message">{popupContent}</div> )}
          </div>
        </div>
      )}
    </div>
  );
};
export default Calendar;