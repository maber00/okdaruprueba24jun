// src/app/dashboard/admin/team/components/AvailabilityCalendar.tsx
'use client';
import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { TeamMember } from '@/app/types/auth';

interface AvailabilityCalendarProps {
 member: TeamMember;
 onAvailabilityChange: (dates: {start: Date, end: Date}) => void;
}

interface CalendarEvent {
 id: string;
 title: string;
 start: Date;
 end: Date;
 backgroundColor: string;
}

export function AvailabilityCalendar({ member, onAvailabilityChange }: AvailabilityCalendarProps) {
 const [events, setEvents] = useState<CalendarEvent[]>(() => 
   (member.projects || []).map(project => ({
     id: project,
     title: 'Proyecto asignado',
     start: new Date(),
     end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
     backgroundColor: '#4F46E5'
   }))
 );

 const updateEvents = (newEvent: CalendarEvent) => {
   setEvents(prevEvents => [...prevEvents, newEvent]);
 };

 return (
   <div className="bg-white p-4 rounded-lg shadow">
     <FullCalendar
       plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
       initialView="timeGridWeek"
       headerToolbar={{
         left: 'prev,next today',
         center: 'title',
         right: 'dayGridMonth,timeGridWeek'
       }}
       events={events}
       editable={true}
       selectable={true}
       selectMirror={true}
       weekends={true}
       height="auto"
       select={(selectInfo) => {
         const newEvent: CalendarEvent = {
           id: `event-${Date.now()}`,
           title: 'Nueva disponibilidad',
           start: selectInfo.start,
           end: selectInfo.end,
           backgroundColor: '#34D399'
         };
         updateEvents(newEvent);
         onAvailabilityChange({ start: selectInfo.start, end: selectInfo.end });
       }}
       eventClick={(clickInfo) => {
         if (window.confirm('¿Eliminar este evento?')) {
           setEvents(prevEvents => prevEvents.filter(event => event.id !== clickInfo.event.id));
         }
       }}
       locale="es"
     />
   </div>
 );
}