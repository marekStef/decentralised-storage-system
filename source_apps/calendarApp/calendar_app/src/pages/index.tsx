import React, { useState } from 'react';

// Represents a single event
const Event = ({ event }) => (
  <div style={{ padding: '5px', margin: '5px 0', backgroundColor: 'lightgrey', borderRadius: '5px'}}>
    <strong>{event.title}</strong> <br />
    {event.startTime} - {event.endTime}
  </div>
);

const WeekView = () => {
  // Sample events for demonstration
  const [events, setEvents] = useState({
    Monday: [{title: 'Meeting', startTime: '10:00 AM', endTime: '11:00 AM'}],
    Tuesday: [],
    Wednesday: [],
    Thursday: [{title: 'Workshop', startTime: '1:00 PM', endTime: '2:00 PM'}],
    Friday: [],
    Saturday: [],
    Sunday: []
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', padding: '20px' }}>
      {daysOfWeek.map(day => (
        <div key={day} style={{ width: '100px' }}>
          <h3>{day}</h3>
          {events[day].map((event, index) => (
            <Event key={index} event={event} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default WeekView;