 import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Clock, Star, Download, MapPin, Users, DollarSign, Building2, Zap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const EVENT_COLORS = {
  workshop: 'bg-red-400',
  conference: 'bg-green-400',
  hackathon: 'bg-purple-400',
  meetup: 'bg-yellow-400',
  recurring: 'bg-blue-400'
};

function getNthDayOfMonth(year, month, dayOfWeek, n) {
  const firstDay = new Date(year, month, 1);
  const firstTargetDay = new Date(firstDay);
  
  // Adjust to first occurrence of target day
  while (firstTargetDay.getDay() !== dayOfWeek) {
    firstTargetDay.setDate(firstTargetDay.getDate() + 1);
  }
  
  // Add weeks to get to nth occurrence
  const targetDay = new Date(firstTargetDay);
  targetDay.setDate(firstTargetDay.getDate() + (n - 1) * 7);
  
  // If we've moved to next month, return null
  if (targetDay.getMonth() !== month) return null;
  
  return targetDay;
}

const TechCalendar = () => {
  const [eventData, setEventData] = useState({ recurring: [], oneTime: [] });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showSponsors, setShowSponsors] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/data/events.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load calendar data');
        }
        return response.json();
      })
      .then(data => setEventData(data))
      .catch(err => setError(err.message));
  }, []);

  const recurringEvents = useMemo(() => {
    const events = [];
    const year = 2025;

    eventData.recurring.forEach(event => {
      for (let month = 0; month < 12; month++) {
        event.occurrences.forEach(occurrence => {
          const date = getNthDayOfMonth(year, month, event.dayOfWeek, occurrence);
          if (date) {
            events.push({
              ...event,
              date: date.toISOString(),
              id: `${event.id}-${date.toISOString()}`
            });
          }
        });
      }
    });

    return events;
  }, [eventData.recurring]);

  const getEventsForMonth = (monthIndex) => {
    const oneTimeEvents = eventData.oneTime.filter(
      event => new Date(event.date).getMonth() === monthIndex
    );

    const monthlyRecurringEvents = recurringEvents.filter(
      event => new Date(event.date).getMonth() === monthIndex
    );

    return [...oneTimeEvents, ...monthlyRecurringEvents].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  };

  // Helper function to format date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">2025 Tech Community Calendar</h1>
        <button
          onClick={() => setShowSponsors(!showSponsors)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {showSponsors ? 'Show Calendar' : 'See Sponsors'}
          <Users className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6 mb-8">
        <div className="flex flex-wrap gap-4 justify-center">
          {Object.entries(EVENT_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${color}`}></div>
              <span className="capitalize">{type}</span>
            </div>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span>Major Event</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            <span>News Worthy</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span>Has Sponsors</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span>Needs Sponsors</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MONTHS.map((month, index) => (
          <div key={month} className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-4">{month}</h2>
            <div className="space-y-2">
              {getEventsForMonth(index).map(event => (
                <div
                  key={event.id}
                  onClick={() => {
                    setSelectedEvent(event);
                    setIsDialogOpen(true);
                  }}
                  className={`${EVENT_COLORS[event.type]} p-2 rounded cursor-pointer hover:opacity-90 transition-opacity`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`${event.isMajor ? 'text-lg font-bold' : ''}`}>
                      {new Date(event.date).getDate()}: {event.title}
                    </span>
                    <div className="flex items-center gap-1">
                      {event.needsSponsors && <DollarSign className="w-4 h-4" />}
                      {event.sponsors?.length > 0 && <Building2 className="w-4 h-4" />}
                      {event.newsWorthy && <Star className="w-4 h-4" />}
                      {event.isMajor && <Zap className="w-5 h-5 text-yellow-500" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedEvent && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedEvent.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>{selectedEvent.description}</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(selectedEvent.date)}</span>
              </div>
              {selectedEvent.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}
              {selectedEvent.organizer && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Organizer: {selectedEvent.organizer}</span>
                </div>
              )}
              {selectedEvent.organizers && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Organizers: {selectedEvent.organizers.join(', ')}</span>
                </div>
              )}
              {selectedEvent.sponsors?.length > 0 && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>Sponsors: {selectedEvent.sponsors.join(', ')}</span>
                </div>
              )}
              {selectedEvent.needsSponsors && (
                <div className="flex items-center gap-2 text-amber-600">
                  <DollarSign className="w-4 h-4" />
                  <span>Seeking Sponsors</span>
                </div>
              )}
              {selectedEvent.isMajor && (
                <div className="flex items-center gap-2 text-yellow-500">
                  <Zap className="w-4 h-4" />
                  <span>Major Event</span>
                </div>
              )}
              {selectedEvent.newsWorthy && (
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span>News Worthy Event</span>
                </div>
              )}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Implement calendar download
                }}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <Download className="w-4 h-4" />
                Add to Calendar
              </a>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default TechCalendar;
