import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Calendar, MapPin, Clock, Users, ArrowLeft, UserCheck, ExternalLink, User } from 'lucide-react';

const EventDetails = () => {
  const { id } = useParams();
  const { api, user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${id}`);
      setEvent(response.data);
    } catch (error) {
      console.error('Failed to fetch event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setRegistering(true);
    try {
      await api.post(`/events/${id}/register`);
      alert('Registration successful!');
      fetchEvent(); // Refresh to update registration status
    } catch (error) {
      console.error('Failed to register:', error);
      alert(error.response?.data?.message || 'Failed to register');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Event not found</h3>
        <Link to="/events" className="btn btn-primary">
          Back to Events
        </Link>
      </div>
    );
  }

  const isRegistered = event.attendees?.some(attendee => 
    attendee.user?._id === user?._id || attendee.user === user?._id
  );
  const isFull = event.currentParticipants >= event.maxParticipants;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/events" className="inline-flex items-center text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Events
      </Link>

      {/* Event Header */}
      <div className="card">
        <div className="border-b border-gray-200 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h1>
              <p className="text-lg text-gray-600 mb-4">{event.description}</p>
              
              <div className="flex flex-wrap gap-4 mb-4">
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

              <div className="flex items-center space-x-4">
                <span className={`badge ${
                  event.type === 'seminar' ? 'badge-primary' :
                  event.type === 'workshop' ? 'badge-success' :
                  event.type === 'webinar' ? 'badge-warning' :
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
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-2">Organized by</p>
              <p className="font-medium text-gray-900">{event.organizedBy.name}</p>
              <p className="text-sm text-gray-600">{event.organizedBy.profile.currentCompany}</p>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-3">Event Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Date:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Time:</span>
                  <span className="text-sm font-medium text-gray-900">{event.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Duration:</span>
                  <span className="text-sm font-medium text-gray-900">{event.duration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Location:</span>
                  <span className="text-sm font-medium text-gray-900">{event.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Mode:</span>
                  <span className="text-sm font-medium text-gray-900">{event.mode}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-3">Registration</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Capacity:</span>
                  <span className="text-sm font-medium text-gray-900">{event.maxParticipants}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Registered:</span>
                  <span className="text-sm font-medium text-gray-900">{event.currentParticipants}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Available:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {event.maxParticipants - event.currentParticipants}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Deadline:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(event.registrationDeadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {event.agenda && event.agenda.length > 0 && (
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-900 mb-3">Agenda</h3>
              <div className="space-y-2">
                {event.agenda.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 w-16">{item.time}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.activity}</p>
                      {item.speaker && (
                        <p className="text-xs text-gray-500">Speaker: {item.speaker}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {event.report && (
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-900 mb-3">Meeting Report</h3>
              <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                {event.report}
              </div>
            </div>
          )}

          {event.speakers && event.speakers.length > 0 && (
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-900 mb-3">Speakers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.speakers.map((speaker, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{speaker.name}</p>
                      <p className="text-xs text-gray-600">{speaker.title}</p>
                      <p className="text-xs text-gray-500">{speaker.organization}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Registration Section */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Registration Deadline: {new Date(event.registrationDeadline).toLocaleDateString()}
              </p>
              {isRegistered && (
                <p className="text-sm text-green-600 font-medium">
                  You are registered for this event
                </p>
              )}
              {isFull && !isRegistered && (
                <p className="text-sm text-red-600 font-medium">
                  This event is full
                </p>
              )}
            </div>
            
            <div className="flex space-x-3">
              {event.registrationLink && (
                <a
                  href={event.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  External Registration
                </a>
              )}
              
              {!isRegistered && !isFull && (
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="btn btn-primary"
                >
                  {registering ? (
                    <>
                      <LoadingSpinner size="small" className="mr-2" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Register Now
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
