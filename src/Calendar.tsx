// src/Calendar.tsx
import React, { useState } from 'react';
import './Calendar.css';

const Calendar: React.FC = () => {
  const today = new Date();
  // Estado para el mes y año que se muestran (inicialmente el mes actual)
  const [displayedDate, setDisplayedDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = displayedDate.getFullYear();
  const month = displayedDate.getMonth();

  // Cantidad de días en el mes mostrado
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Determinamos el día de la semana en que inicia el mes (0 = domingo, 1 = lunes, etc.)
  const firstDay = new Date(year, month, 1);
  const startingDay = firstDay.getDay();

  // Simulación de datos: cambiamos el patrón según el mes (por ejemplo, para simular diferencias)
  const daysWithData = month % 2 === 0 ? [3, 12, 18] : [5, 15, 25];

  // Array de días [1, 2, 3, ..., daysInMonth]
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Funciones para navegar entre meses
  const prevMonth = () => {
    setDisplayedDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setDisplayedDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={prevMonth} className="nav-button">Anterior</button>
        <h2>
          {displayedDate.toLocaleString('default', { month: 'long' })} {year}
        </h2>
        <button onClick={nextMonth} className="nav-button">Siguiente</button>
      </div>
      <div className="calendar-day-names">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(dayName => (
          <div key={dayName} className="calendar-day-name">{dayName}</div>
        ))}
      </div>
      <div className="calendar-grid">
        {daysArray.map((day, index) => {
          // Solo para el primer día se aplica gridColumnStart para alinear el inicio
          const style: React.CSSProperties = {};
          if (index === 0 && startingDay !== 0) {
            style.gridColumnStart = startingDay + 1;
          }
          return (
            <div key={day} className="calendar-cell" style={style}>
              <span className="day-number">{day}</span>
              <span
                className={`data-indicator ${daysWithData.includes(day) ? 'has-data' : 'no-data'}`}
              ></span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
