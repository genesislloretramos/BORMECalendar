// src/Calendar.tsx
import React from 'react';
import './Calendar.css';

const Calendar: React.FC = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0 = enero, 11 = diciembre

  // Simulación: días que tienen datos (por ejemplo, del BORME)
  const daysWithData = [3, 12, 18]; // días del mes con datos

  // Número de días en el mes actual
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Día de la semana en que inicia el mes (0 = domingo, 1 = lunes, etc.)
  const firstDay = new Date(year, month, 1);
  const startingDay = firstDay.getDay();

  // Construimos la matriz de semanas (6 filas, 7 columnas)
  const weeks: (number | null)[][] = [];
  let dayCounter = 1;
  for (let week = 0; week < 6; week++) {
    const weekDays: (number | null)[] = [];
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      if (week === 0 && dayIndex < startingDay) {
        weekDays.push(null);
      } else if (dayCounter > daysInMonth) {
        weekDays.push(null);
      } else {
        weekDays.push(dayCounter);
        dayCounter++;
      }
    }
    weeks.push(weekDays);
  }

  return (
    <div className="calendar-container">
      <h2 className="calendar-header">
        {today.toLocaleString('default', { month: 'long' })} {year}
      </h2>
      <div className="calendar-grid">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((dayName) => (
          <div key={dayName} className="calendar-day-name">
            {dayName}
          </div>
        ))}
        {weeks.map((week, i) =>
          week.map((dayNum, j) => (
            <div key={`${i}-${j}`} className={`calendar-cell ${dayNum ? 'active' : ''}`}>
              {dayNum ? (
                <>
                  <span className="day-number">{dayNum}</span>
                  <span
                    className={`data-indicator ${
                      daysWithData.includes(dayNum) ? 'has-data' : 'no-data'
                    }`}
                  ></span>
                </>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Calendar;
