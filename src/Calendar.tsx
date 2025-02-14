import React, { useState } from 'react';
import './Calendar.css';

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

  // Maneja el clic sobre un día
  const handleDayClick = (day: number) => {
    // Construye la fecha en formato AAAAMMDD
    const date = new Date(displayedDate.getFullYear(), displayedDate.getMonth(), day);
    const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    fetchSumario(formattedDate);
  };

  // Función para llamar a la API del BORME
  const fetchSumario = async (date: string) => {
    try {
      const response = await fetch(`https://boe.es/datosabiertos/api/borme/sumario/${date}`, {
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) {
        setPopupContent(`Error: ${response.status} ${response.statusText}`);
      } else {
        const data = await response.json();
        // Se formatea la respuesta (aquí se muestra en JSON con indentación)
        setPopupContent(JSON.stringify(data, null, 2));
      }
    } catch (error: any) {
      setPopupContent(`Error: ${error.message}`);
    }
    setPopupVisible(true);
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
          return (
            <div
              key={day}
              className="calendar-cell"
              style={style}
              onClick={() => handleDayClick(day)}
            >
              <span className="day-number">{day}</span>
              <span className={`data-indicator ${daysWithData.includes(day) ? 'has-data' : 'no-data'}`}></span>
            </div>
          );
        })}
      </div>

      {/* Popup modal para mostrar la respuesta de la API */}
      {popupVisible && (
        <div className="modal-overlay" onClick={() => setPopupVisible(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPopupVisible(false)}>Cerrar</button>
            <pre>{popupContent}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
