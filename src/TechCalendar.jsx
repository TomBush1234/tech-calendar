<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EmpoweredAI Tech Community Events</title>
    
    <!-- Favicon -->
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📅</text></svg>">
    
    <!-- React with Babel -->
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Include Feather Icons for better compatibility -->
    <script src="https://unpkg.com/feather-icons/dist/feather.min.js"></script>
    
    <style>
        body {
            background-color: #f5f5f5;
        }
        
        .modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 50;
        }
        
        .modal-content {
            background-color: white;
            border-radius: 0.5rem;
            padding: 1.5rem;
            max-width: 32rem;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
        }
        
        .rotate-icon {
            transform: rotate(90deg);
            transition: transform 0.2s;
        }
    </style>
</head>
<body>
    <div id="root"></div>

    <!-- Main App -->
    <script type="text/babel">
        const { useState, useEffect, useMemo, useRef } = React;
        
        // Simple icon component using Feather Icons
        const Icon = ({ name, className = "" }) => {
            const iconRef = useRef();
            
            useEffect(() => {
                if (iconRef.current && window.feather) {
                    feather.replace({
                        'width': 16,
                        'height': 16
                    });
                }
            }, []);
            
            return (
                <i ref={iconRef} data-feather={name} className={className}></i>
            );
        };
        
        // Simple Dialog component
        const Dialog = ({ open, onOpenChange, children }) => {
            if (!open) return null;
            
            return (
                <div className="modal-backdrop" onClick={() => onOpenChange(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        {children}
                    </div>
                </div>
            );
        };
        
        const DialogContent = ({ children, className }) => (
            <div className={`space-y-4 ${className || ''}`}>{children}</div>
        );
        
        const DialogHeader = ({ children }) => (
            <div className="mb-4">{children}</div>
        );
        
        const DialogTitle = ({ children }) => (
            <h3 className="text-xl font-semibold">{children}</h3>
        );
        
        // Sponsors View Component
        const SponsorsView = ({ eventData, recurringEvents, formatDate, onEventClick }) => {
            const [expandedSponsors, setExpandedSponsors] = useState({});
            
            // Function to toggle collapse/expand for a sponsor
            const toggleSponsor = (sponsor) => {
                setExpandedSponsors(prev => ({
                    ...prev,
                    [sponsor]: !prev[sponsor]
                }));
            };
            
            // Get all sponsors and their events
            const sponsorsWithEvents = useMemo(() => {
                const sponsors = new Map();
                
                // Helper function to process events for a sponsor
                const processEventForSponsor = (event, sponsorName) => {
                    if (!sponsors.has(sponsorName)) {
                        sponsors.set(sponsorName, []);
                    }
                    sponsors.get(sponsorName).push(event);
                };
                
                // Process one-time events
                eventData.oneTime.forEach(event => {
                    if (event.sponsors && event.sponsors.length > 0) {
                        event.sponsors.forEach(sponsor => {
                            processEventForSponsor(event, sponsor);
                        });
                    }
                });
                
                // Process recurring events
                recurringEvents.forEach(event => {
                    if (event.sponsors && event.sponsors.length > 0) {
                        event.sponsors.forEach(sponsor => {
                            processEventForSponsor(event, sponsor);
                        });
                    }
                });
                
                // Convert to array and sort by sponsor name
                return Array.from(sponsors.entries())
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([sponsor, events]) => ({
                        name: sponsor,
                        events: events.sort((a, b) => new Date(a.date) - new Date(b.date))
                    }));
            }, [eventData, recurringEvents]);
            
            // Initialize all sponsors to be expanded by default
            useEffect(() => {
                const initialExpandState = {};
                sponsorsWithEvents.forEach(sponsor => {
                    initialExpandState[sponsor.name] = true; // Start expanded
                });
                setExpandedSponsors(initialExpandState);
            }, [sponsorsWithEvents]);
            
            // The event card component
            const EventCard = ({ event }) => {
                const eventDate = new Date(event.date);
                const formattedDate = `${eventDate.getDate()} ${MONTHS[eventDate.getMonth()]}`;
                
                return (
                    <div 
                        className={`${EVENT_COLORS[event.type]} p-3 rounded mb-2 cursor-pointer hover:opacity-90`}
                        onClick={() => onEventClick(event)}
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <span className="font-semibold">{event.title}</span>
                                <div className="text-sm">
                                    <span className="flex items-center gap-1">
                                        <Icon name="calendar" />
                                        {formattedDate}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {event.needsSponsors && <Icon name="dollar-sign" />}
                                {event.newsWorthy && <Icon name="star" />}
                                {event.isMajor && <Icon name="zap" className="text-yellow-500" />}
                            </div>
                        </div>
                    </div>
                );
            };
            
            if (sponsorsWithEvents.length === 0) {
                return (
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-4">No sponsors found</h2>
                        <p>There are currently no events with sponsors in the calendar.</p>
                    </div>
                );
            }
            
            return (
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold">Event Sponsors</h1>
                    
                    {sponsorsWithEvents.map(sponsor => (
                        <div key={sponsor.name} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div 
                                className="p-4 bg-gray-50 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                                onClick={() => toggleSponsor(sponsor.name)}
                            >
                                <h2 className="text-xl font-semibold">{sponsor.name}</h2>
                                <div className={`transition-transform ${expandedSponsors[sponsor.name] ? 'rotate-90' : ''}`}>
                                    <Icon name="chevron-right" />
                                </div>
                            </div>
                            
                            {expandedSponsors[sponsor.name] && (
                                <div className="p-4">
                                    <p className="mb-3 text-gray-600">
                                        Sponsoring {sponsor.events.length} event{sponsor.events.length !== 1 ? 's' : ''}
                                    </p>
                                    <div className="space-y-2">
                                        {sponsor.events.map(event => (
                                            <EventCard key={event.id} event={event} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            );
        };
        
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
            const [loading, setLoading] = useState(true);

            useEffect(() => {
                // Try to fetch events.json from multiple possible locations
                const attemptFetch = async () => {
                    setLoading(true);
                    const possiblePaths = [
                        './public/data/events.json',  // First try the specific path you mentioned
                        './data/events.json',         // Then try a simpler path
                        './events.json'               // Finally try at the root
                    ];
                    
                    let fetched = false;
                    
                    for (const path of possiblePaths) {
                        try {
                            console.log(`Attempting to fetch from: ${path}`);
                            const response = await fetch(path);
                            
                            if (response.ok) {
                                const data = await response.json();
                                console.log('Data fetched successfully from:', path);
                                setEventData(data);
                                fetched = true;
                                break;
                            }
                        } catch (err) {
                            console.log(`Failed to fetch from ${path}:`, err);
                        }
                    }
                    
                    if (!fetched) {
                        setError("Couldn't load calendar data. Please check the events.json location.");
                    }
                    
                    setLoading(false);
                };
                
                attemptFetch();
            }, []);

            // Initialize feather icons after render
            useEffect(() => {
                if (window.feather) {
                    feather.replace();
                }
            });

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
            
            // Handle clicking on an event
            const handleEventClick = (event) => {
                setSelectedEvent(event);
                setIsDialogOpen(true);
            };

            if (loading) {
                return <div className="text-center p-4">Loading calendar data...</div>;
            }

            if (error) {
                return (
                    <div className="p-6 max-w-6xl mx-auto">
                        <div className="text-red-500 text-center p-4 bg-red-100 border-red-300 border rounded-lg">
                            <h2 className="text-xl font-bold mb-2">Error Loading Calendar</h2>
                            <p>{error}</p>
                            <div className="mt-4 p-4 bg-yellow-50 border-yellow-200 border rounded text-left">
                                <h3 className="font-semibold mb-2">Troubleshooting Help:</h3>
                                <p className="mb-2">It looks like we couldn't find your events.json file. Here's how to fix it:</p>
                                <ol className="list-decimal pl-5 space-y-1">
                                    <li>Make sure your events.json file exists in one of these locations:
                                        <ul className="list-disc pl-5 mt-1">
                                            <li>public/data/events.json</li>
                                            <li>data/events.json</li>
                                            <li>events.json (at root)</li>
                                        </ul>
                                    </li>
                                    <li>If you need to move the file, copy it to the root directory of your repository.</li>
                                    <li>Ensure the file has proper JSON format.</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                );
            }
            
            return (
                <div className="p-6 max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold">
                            {showSponsors ? 'Tech Community Sponsors' : '2025 Tech Community Calendar'}
                        </h1>
                        <button
                            onClick={() => setShowSponsors(!showSponsors)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            {showSponsors ? (
                                <>
                                    <span>Show Calendar</span>
                                    <Icon name="calendar" />
                                </>
                            ) : (
                                <>
                                    <span>See Sponsors</span>
                                    <Icon name="users" />
                                </>
                            )}
                        </button>
                    </div>

                    {!showSponsors ? (
                        <>
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
                                        <Icon name="zap" className="text-yellow-500" />
                                        <span>Major Event</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Icon name="star" />
                                        <span>News Worthy</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Icon name="home" />
                                        <span>Has Sponsors</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Icon name="dollar-sign" />
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
                                                    onClick={() => handleEventClick(event)}
                                                    className={`${EVENT_COLORS[event.type]} p-2 rounded cursor-pointer hover:opacity-90 transition-opacity`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className={`${event.isMajor ? 'text-lg font-bold' : ''}`}>
                                                            {new Date(event.date).getDate()}: {event.title}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            {event.needsSponsors && <Icon name="dollar-sign" />}
                                                            {event.sponsors?.length > 0 && <Icon name="home" />}
                                                            {event.newsWorthy && <Icon name="star" />}
                                                            {event.isMajor && <Icon name="zap" className="text-yellow-500" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <SponsorsView 
                            eventData={eventData} 
                            recurringEvents={recurringEvents} 
                            formatDate={formatDate}
                            onEventClick={handleEventClick}
                        />
                    )}

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        {selectedEvent && (
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>{selectedEvent.title}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <p>{selectedEvent.description}</p>
                                    <div className="flex items-center gap-2">
                                        <Icon name="calendar" />
                                        <span>{formatDate(selectedEvent.date)}</span>
                                    </div>
                                    {selectedEvent.location && (
                                        <div className="flex items-center gap-2">
                                            <Icon name="map-pin" />
                                            <span>{selectedEvent.location}</span>
                                        </div>
                                    )}
                                    {selectedEvent.organizer && (
                                        <div className="flex items-center gap-2">
                                            <Icon name="user" />
                                            <span>Organizer: {selectedEvent.organizer}</span>
                                        </div>
                                    )}
                                    {selectedEvent.organizers && (
                                        <div className="flex items-center gap-2">
                                            <Icon name="users" />
                                            <span>Organizers: {selectedEvent.organizers.join(', ')}</span>
                                        </div>
                                    )}
                                    {selectedEvent.sponsors?.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <Icon name="home" />
                                            <span>Sponsors: {selectedEvent.sponsors.join(', ')}</span>
                                        </div>
                                    )}
                                    {selectedEvent.needsSponsors && (
                                        <div className="flex items-center gap-2 text-amber-600">
                                            <Icon name="dollar-sign" />
                                            <span>Seeking Sponsors</span>
                                        </div>
                                    )}
                                    {selectedEvent.isMajor && (
                                        <div className="flex items-center gap-2 text-yellow-500">
                                            <Icon name="zap" />
                                            <span>Major Event</span>
                                        </div>
                                    )}
                                    {selectedEvent.newsWorthy && (
                                        <div className="flex items-center gap-2">
                                            <Icon name="star" />
                                            <span>News Worthy Event</span>
                                        </div>
                                    )}
                                    <a
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            // TODO: Implement calendar download
                                            alert('Calendar download feature coming soon!');
                                        }}
                                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                                    >
                                        <Icon name="download" />
                                        Add to Calendar
                                    </a>
                                </div>
                            </DialogContent>
                        )}
                    </Dialog>
                </div>
            );
        };

        // Simple EventCreator component
        const EventCreator = () => {
            return (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4">Create New Event</h2>
                    <p className="mb-4">Event creator functionality coming soon!</p>
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
                        <p className="text-yellow-700">
                            This feature is currently under development. Check back later!
                        </p>
                    </div>
                </div>
            );
        };

        const App = () => {
            return (
                <div className="container mx-auto px-4">
                    <nav className="py-4">
                        <ul className="flex space-x-4">
                            <li><a href="#calendar" className="text-blue-600 hover:text-blue-800">Calendar</a></li>
                            <li><a href="#create" className="text-blue-600 hover:text-blue-800">Create Event</a></li>
                        </ul>
                    </nav>
                    
                    <div id="calendar" className="py-4">
                        <TechCalendar />
                    </div>
                    
                    <div id="create" className="py-4">
                        <EventCreator />
                    </div>
                </div>
            );
        };

        // Make sure the DOM is loaded before rendering
        ReactDOM.createRoot(document.getElementById('root')).render(<App />);
    </script>
</body>
</html>
