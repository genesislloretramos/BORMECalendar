import React, { useState, useEffect } from 'react';
import './Calendar.css';
import SumarioViewer from './SumarioViewer';

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

interface DayData {
  status: string;
  data?: any;
  error?: string;
}

const Calendar: React.FC = () => {
  const today = new Date();
  const [displayedDate, setDisplayedDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [daysData, setDaysData] = useState<{ [key: number]: DayData }>({});
  const [popupData, setPopupData] = useState<any>(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const year = displayedDate.getFullYear();
  const month = displayedDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1);
  const dayOfWeek = firstDay.getDay();
  const adjustedStartingDay = dayOfWeek === 0 ? 7 : dayOfWeek;
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  useEffect(() => {
    async function fetchAllDays() {
      let newDaysData: { [key: number]: DayData } = {};
      for (let day = 1; day <= daysInMonth; day++) {
        const formattedDate = `${displayedDate.getFullYear()}${(displayedDate.getMonth() + 1)
          .toString()
          .padStart(2, '0')}${day.toString().padStart(2, '0')}`;
        try {
          const response = await fetch(`/api-borme/sumario/${formattedDate}`, {
            headers: { Accept: 'application/json' }
          });
          if (!response.ok) {
            newDaysData[day] = { status: "red", error: `Error: ${response.status} ${response.statusText}` };
          } else {
            const text = await response.text();
            const trimmed = text.trim();
            let jsonResult: any;
            if (trimmed.startsWith('<')) {
              const parser = new DOMParser();
              const xmlDoc = parser.parseFromString(trimmed, 'text/xml');
              const errors = xmlDoc.getElementsByTagName('parsererror');
              if (errors.length > 0) {
                newDaysData[day] = { status: "red", error: `XML Parse Error: ${errors[0].textContent}` };
              } else {
                jsonResult = xmlToJson(xmlDoc);
              }
            } else if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
              jsonResult = JSON.parse(trimmed);
            } else {
              newDaysData[day] = { status: "red", error: `Respuesta inesperada: ${trimmed}` };
            }
            if (jsonResult) {
              if (jsonResult?.status?.code === "200") {
                newDaysData[day] = { status: "green", data: jsonResult };
              } else {
                newDaysData[day] = { status: "red", data: jsonResult };
              }
            }
          }
        } catch (error: any) {
          newDaysData[day] = { status: "red", error: error.message };
        }
      }
      setDaysData(newDaysData);
    }
    fetchAllDays();
  }, [displayedDate, daysInMonth]);

  const prevMonth = () => {
    setDisplayedDate(new Date(year, month - 1, 1));
    setDaysData({});
    setPopupVisible(false);
  };

  const nextMonth = () => {
    setDisplayedDate(new Date(year, month + 1, 1));
    setDaysData({});
    setPopupVisible(false);
  };

  const handleDayClick = (day: number) => {
    if (daysData[day]?.status === "green") {
      setPopupData(daysData[day].data);
      setPopupVisible(true);
    }
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={prevMonth} className="nav-button" aria-label="Mes anterior">&#8592;</button>
        <h2>{displayedDate.toLocaleString('default', { month: 'long' })} {year}</h2>
        <button onClick={nextMonth} className="nav-button" aria-label="Mes siguiente">&#8594;</button>
      </div>
      <div className="calendar-day-names">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(dayName => (
          <div key={dayName} className="calendar-day-name">{dayName}</div>
        ))}
      </div>
      <div className="calendar-grid">
        {daysArray.map((day, index) => {
          const style: React.CSSProperties = {};
          if (index === 0 && adjustedStartingDay !== 1) {
            style.gridColumnStart = adjustedStartingDay;
          }
          let dotClass = "default-indicator";
          if (daysData[day]?.status === "green") {
            dotClass = "status-green";
          } else if (daysData[day]?.status === "red") {
            dotClass = "status-red";
          }
          return (
            <div key={day} className="calendar-cell" style={style} onClick={() => handleDayClick(day)}>
              <span className="day-number">{day}</span>
              <span className={`data-indicator ${dotClass}`}></span>
            </div>
          );
        })}
      </div>
      {popupVisible && (
        <div className="modal-overlay" onClick={() => setPopupVisible(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPopupVisible(false)}>Cerrar</button>
            {popupData ? (
              <SumarioViewer sumario={popupData} />
            ) : (
              <div className="error-message">Sin datos</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;