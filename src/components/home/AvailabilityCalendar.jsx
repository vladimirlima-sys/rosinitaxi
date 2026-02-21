import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export default function AvailabilityCalendar({ selectedDate, onDateChange }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateString = date.toISOString().split('T')[0];
    onDateChange(dateString);
  };

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const isDateSelected = (day) => {
    if (!day || !selectedDate) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateString = date.toISOString().split('T')[0];
    return dateString === selectedDate;
  };

  const isDateInPast = (day) => {
    if (!day) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="bg-zinc-900 p-6 rounded-2xl border border-[#C9A96E] shadow-[0_0_30px_rgba(201,169,110,0.1)]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#C9A96E]" />
          <h4 className="text-white font-bold">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h4>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-white/60 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-white/60 hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-white/40 text-xs font-semibold py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => (
          <button
            key={idx}
            onClick={() => day && !isDateInPast(day) && handleDateClick(day)}
            disabled={!day || isDateInPast(day)}
            className={`aspect-square rounded-lg text-sm font-medium transition-all ${
              !day
                ? 'invisible'
                : isDateInPast(day)
                ? 'bg-zinc-800/50 text-white/20 cursor-not-allowed'
                : isDateSelected(day)
                ? 'bg-[#C9A96E] text-black font-bold'
                : 'bg-zinc-800 text-white hover:bg-zinc-700'
            }`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}