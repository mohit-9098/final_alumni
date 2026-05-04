import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Calendar, Search, Filter, MapPin, Clock, Users, ExternalLink } from 'lucide-react';

const EventsPage = () => {
  const { api } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState({
    type: '',
    mode: '',
    status: 'upcoming'
  });

  useEffect(() => {
    fetchEvents();
  }, [filter, searchTerm]);

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams({ status: filter.status, limit: 20 });
      if (filter.type) params.append('type', filter.type);
      if (filter.mode) params.append('mode', filter.mode);
      if (searchTerm) params.append('search', searchTerm);
      const response = await api.get(`/events?${params.toString()}`);
      setEvents(response.data.events);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Events</h1>
        <p className="page-description">Upcoming events and networking opportunities</p>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events by title, location, or tags..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <select
            className="input"
            value={filter.type}
            onChange={(e) => setFilter({...filter, type: e.target.value})}
          >
            <option value="">All Types</option>
            <option value="seminar">Seminar</option>
            <option value="workshop">Workshop</option>
            <option value="webinar">Webinar</option>
            <option value="meetup">Meetup</option>
            <option value="meeting">Meeting</option>
            <option value="conference">Conference</option>
            <option value="networking">Networking</option>
          </select>
          <select
            className="input"
            value={filter.mode}
            onChange={(e) => setFilter({...filter, mode: e.target.value})}
          >
            <option value="">All Modes</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event._id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Link to={`/events/${event._id}`}>
                  <h3 className="text-lg font-medium text-gray-900 hover:text-primary-600 mb-2">
                    {event.title}
                  </h3>
                </Link>
                <p className="text-gray-600 mb-3">{event.description}</p>
                
                <div className="flex flex-wrap gap-4 mb-3">
                  <span className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {event.time}
                  </span>
                  <span className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-1" />
                    {event.location}
                  </span>
                  <span className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-1" />
                    {event.currentParticipants}/{event.maxParticipants} registered
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className={`badge ${
                      event.type === 'seminar' ? 'badge-primary' :
                      event.type === 'workshop' ? 'badge-success' :
                      event.type === 'webinar' ? 'badge-warning' :
                      event.type === 'conference' ? 'badge-error' :
                      'badge-secondary'
                    }`}>
                      {event.type}
                    </span>
                    <span className={`badge ${
                      event.mode === 'online' ? 'badge-primary' :
                      event.mode === 'offline' ? 'badge-success' :
                      event.mode === 'hybrid' ? 'badge-warning' :
                      'badge-secondary'
                    }`}>
                      {event.mode}
                    </span>
                  </div>
                  <Link
                    to={`/events/${event._id}`}
                    className="btn btn-primary btn-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
