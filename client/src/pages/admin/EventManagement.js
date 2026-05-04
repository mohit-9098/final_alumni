import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Calendar, Search, Filter, Edit, Trash2, Eye, Plus, Users, X } from 'lucide-react';
import toast from 'react-hot-toast';

const EventManagement = () => {
  const { api } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState({
    type: '',
    mode: '',
    status: ''
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    location: '',
    type: 'seminar',
    mode: 'offline',
    maxParticipants: 100,
    registrationDeadline: '',
    registrationLink: '',
    targetAudience: ['all'],
    agenda: [{ time: '', activity: '', speaker: '' }],
    report: ''
  });

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filter.type) params.append('type', filter.type);
      if (filter.mode) params.append('mode', filter.mode);
      if (filter.status) params.append('status', filter.status);
      
      const response = await api.get(`/events?${params.toString()}&limit=50`);
      setEvents(response.data.events);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'duration' || name === 'maxParticipants' ? parseInt(value) : value
    });
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.date || !formData.time || 
        !formData.location || !formData.registrationDeadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        targetAudience: formData.targetAudience.length ? formData.targetAudience : ['all']
      };
      await api.post('/events', payload);
      toast.success('Event created successfully!');
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        duration: 60,
        location: '',
        type: 'seminar',
        mode: 'offline',
        maxParticipants: 100,
        registrationDeadline: '',
        registrationLink: '',
        targetAudience: ['all'],
        agenda: [{ time: '', activity: '', speaker: '' }],
        report: ''
      });
      setShowModal(false);
      fetchEvents();
    } catch (error) {
      console.error('Failed to create event:', error);
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAgendaChange = (index, field, value) => {
    const updatedAgenda = formData.agenda.map((item, idx) => 
      idx === index ? { ...item, [field]: value } : item
    );
    setFormData({ ...formData, agenda: updatedAgenda });
  };

  const addAgendaItem = () => {
    setFormData({
      ...formData,
      agenda: [...formData.agenda, { time: '', activity: '', speaker: '' }]
    });
  };

  const removeAgendaItem = (index) => {
    setFormData({
      ...formData,
      agenda: formData.agenda.filter((_, idx) => idx !== index)
    });
  };

  const handleAudienceChange = (e) => {
    setFormData({
      ...formData,
      targetAudience: [e.target.value]
    });
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await api.delete(`/events/${eventId}`);
      setEvents(events.filter(event => event._id !== eventId));
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event');
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
        <h1 className="page-title">Event Management</h1>
        <p className="page-description">Manage all events in the system</p>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events by title, location, or description..."
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
          <select
            className="input"
            value={filter.status}
            onChange={(e) => setFilter({...filter, status: e.target.value})}
          >
            <option value="">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      {/* Add New Event Button */}
      <div className="flex justify-end">
        <button 
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Event
        </button>
      </div>

      {/* Events Table */}
      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attendees
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {events.map((event) => (
              <tr key={event._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{event.title}</div>
                    <div className="text-xs text-gray-500 line-clamp-1">{event.description}</div>
                    <div className="text-xs text-gray-400">{event.location}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">{event.time}</div>
                  <div className="text-xs text-gray-400">{event.duration} minutes</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {event.currentParticipants}/{event.maxParticipants}
                  </div>
                  <div className="text-xs text-gray-500">registered</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    event.isCompleted ? 'bg-gray-100 text-gray-800' :
                    new Date(event.date) > new Date() ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {event.isCompleted ? 'Completed' :
                     new Date(event.date) > new Date() ? 'Upcoming' :
                     'Past'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/events/${event._id}`}
                      className="btn btn-secondary btn-sm"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Link>
                    <button className="btn btn-secondary btn-sm">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="btn btn-error btn-sm"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Create Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Add New Event</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="e.g., Career Summit 2026"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Event Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="input"
                    required
                  >
                    <option value="seminar">Seminar</option>
                    <option value="workshop">Workshop</option>
                    <option value="webinar">Webinar</option>
                    <option value="meetup">Meetup</option>
                    <option value="meeting">Meeting</option>
                    <option value="conference">Conference</option>
                    <option value="networking">Networking</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Event Mode *
                  </label>
                  <select
                    name="mode"
                    value={formData.mode}
                    onChange={handleInputChange}
                    className="input"
                    required
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="e.g., Auditorium A, Building 1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Event Time *
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="input"
                    min="15"
                    max="480"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    className="input"
                    min="1"
                    max="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Registration Deadline *
                  </label>
                  <input
                    type="datetime-local"
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Registration Link
                  </label>
                  <input
                    type="url"
                    name="registrationLink"
                    value={formData.registrationLink}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Target Audience
                  </label>
                  <select
                    name="targetAudience"
                    value={formData.targetAudience[0]}
                    onChange={handleAudienceChange}
                    className="input"
                  >
                    <option value="all">All</option>
                    <option value="student">Students</option>
                    <option value="alumni">Alumni</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Agenda Items</h3>
                  <button
                    type="button"
                    onClick={addAgendaItem}
                    className="btn btn-secondary btn-sm"
                  >
                    Add Item
                  </button>
                </div>
                {formData.agenda.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 border rounded-lg bg-gray-50">
                    <div>
                      <label className="form-label">Time</label>
                      <input
                        type="time"
                        value={item.time}
                        onChange={(e) => handleAgendaChange(index, 'time', e.target.value)}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="form-label">Activity</label>
                      <input
                        type="text"
                        value={item.activity}
                        onChange={(e) => handleAgendaChange(index, 'activity', e.target.value)}
                        className="input"
                        placeholder="Activity name"
                      />
                    </div>
                    <div>
                      <label className="form-label">Speaker</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item.speaker}
                          onChange={(e) => handleAgendaChange(index, 'speaker', e.target.value)}
                          className="input"
                          placeholder="Speaker name"
                        />
                        <button
                          type="button"
                          onClick={() => removeAgendaItem(index)}
                          className="btn btn-error btn-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Meeting Report
                </label>
                <textarea
                  name="report"
                  value={formData.report}
                  onChange={handleInputChange}
                  className="input"
                  rows="4"
                  placeholder="Write summary or report for this meeting"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input"
                  rows="4"
                  placeholder="Event description..."
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;
