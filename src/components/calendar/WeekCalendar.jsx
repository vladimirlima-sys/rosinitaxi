import React, { useState } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { CalendarDays } from 'lucide-react';
import CalendarBookingCard from './CalendarBookingCard';

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function MobileListView({ days, bookings, drivers, onAssignDriver, getBookingsForDay }) {
  const today = new Date();
  return (
    <div className="space-y-4">
      {days.map((day, idx) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const isToday = isSameDay(day, today);
        const dayBookings = getBookingsForDay(day);
        if (dayBookings.length === 0) return null;
        return (
          <div key={dateStr}>
            <div className={`flex items-center gap-2 mb-2 ${isToday ? 'text-[#F5C300]' : 'text-white/50'}`}>
              <span className="text-xs uppercase tracking-wider font-semibold">{DAY_NAMES[idx]}</span>
              <span className="font-bold">{format(day, 'd MMM', { locale: fr })}</span>
              {isToday && <span className="text-xs bg-[#F5C300]/20 px-2 py-0.5 rounded-full">Aujourd'hui</span>}
            </div>
            <div className="space-y-2">
              {dayBookings.map(booking => (
                <CalendarBookingCard
                  key={booking.id}
                  booking={booking}
                  drivers={drivers}
                  onAssignDriver={onAssignDriver}
                  isDragging={false}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function WeekCalendar({ weekStart, bookings, drivers, onAssignDriver, onReschedule }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();

  const getBookingsForDay = (day) => {
    return bookings
      .filter(b => {
        if (!b.departure_date) return false;
        const bDate = new Date(b.departure_date + 'T00:00:00');
        return isSameDay(bDate, day);
      })
      .sort((a, b) => (a.departure_time || '').localeCompare(b.departure_time || ''));
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;
    const newDate = destination.droppableId;
    const booking = bookings.find(b => b.id === draggableId);
    if (!booking) return;
    await onReschedule(draggableId, newDate, booking.departure_time);
  };

  const hasAnyBookings = bookings.length > 0;

  return (
    <>
      {/* Mobile list view */}
      <div className="block md:hidden">
        {!hasAnyBookings ? (
          <EmptyWeek />
        ) : (
          <MobileListView
            days={days}
            bookings={bookings}
            drivers={drivers}
            onAssignDriver={onAssignDriver}
            getBookingsForDay={getBookingsForDay}
          />
        )}
      </div>

      {/* Desktop grid view */}
      <div className="hidden md:block">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-7 gap-2 min-h-[60vh]">
            {days.map((day, idx) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const isToday = isSameDay(day, today);
              const dayBookings = getBookingsForDay(day);

              return (
                <div key={dateStr} className={`flex flex-col rounded-xl border ${isToday ? 'border-[#F5C300]/60 bg-[#F5C300]/5' : 'border-white/10 bg-white/[0.02]'} overflow-hidden`}>
                  {/* Header */}
                  <div className={`text-center py-2 px-1 ${isToday ? 'bg-[#F5C300]/10' : 'bg-white/[0.03]'} border-b ${isToday ? 'border-[#F5C300]/30' : 'border-white/10'}`}>
                    <p className={`text-xs uppercase tracking-wider ${isToday ? 'text-[#F5C300]' : 'text-white/40'}`}>{DAY_NAMES[idx]}</p>
                    <p className={`text-lg font-bold mt-0.5 ${isToday ? 'text-[#F5C300]' : 'text-white/80'}`}>{format(day, 'd')}</p>
                    {dayBookings.length > 0 && (
                      <p className="text-xs text-white/30 mt-0.5">{dayBookings.length} course{dayBookings.length > 1 ? 's' : ''}</p>
                    )}
                  </div>

                  {/* Droppable area */}
                  <Droppable droppableId={dateStr}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-1.5 space-y-1.5 min-h-[80px] transition-colors ${snapshot.isDraggingOver ? 'bg-[#F5C300]/10' : ''}`}
                      >
                        {dayBookings.map((booking, index) => (
                          <Draggable key={booking.id} draggableId={booking.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <CalendarBookingCard
                                  booking={booking}
                                  drivers={drivers}
                                  onAssignDriver={onAssignDriver}
                                  isDragging={snapshot.isDragging}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {dayBookings.length === 0 && (
                          <div className="flex items-center justify-center h-full min-h-[60px]">
                            <p className="text-white/10 text-xs">—</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </>
  );
}

function EmptyWeek() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <CalendarDays className="w-10 h-10 text-white/10 mb-3" />
      <p className="text-white/30 text-sm">Aucune course cette semaine</p>
      <p className="text-white/15 text-xs mt-1">Naviguez vers une autre semaine ou ajoutez une réservation</p>
    </div>
  );
}