import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

// Notification context
const NotificationContext = createContext();

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
};

// Action types
const NOTIFICATION_ACTIONS = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_FAILURE: 'FETCH_FAILURE',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  MARK_AS_READ: 'MARK_AS_READ',
  MARK_ALL_AS_READ: 'MARK_ALL_AS_READ',
  DELETE_NOTIFICATION: 'DELETE_NOTIFICATION',
  UPDATE_UNREAD_COUNT: 'UPDATE_UNREAD_COUNT',
};

// Reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case NOTIFICATION_ACTIONS.FETCH_START:
      return {
        ...state,
        isLoading: true,
      };
    case NOTIFICATION_ACTIONS.FETCH_SUCCESS:
      return {
        ...state,
        notifications: action.payload.notifications,
        unreadCount: action.payload.unreadCount,
        isLoading: false,
      };
    case NOTIFICATION_ACTIONS.FETCH_FAILURE:
      return {
        ...state,
        isLoading: false,
      };
    case NOTIFICATION_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    case NOTIFICATION_ACTIONS.MARK_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification._id === action.payload
            ? { ...notification, isRead: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case NOTIFICATION_ACTIONS.MARK_ALL_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map((notification) => ({
          ...notification,
          isRead: true,
        })),
        unreadCount: 0,
      };
    case NOTIFICATION_ACTIONS.DELETE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          (notification) => notification._id !== action.payload
        ),
        unreadCount: Math.max(
          0,
          state.unreadCount -
            (state.notifications.find((n) => n._id === action.payload)?.isRead
              ? 0
              : 1)
        ),
      };
    case NOTIFICATION_ACTIONS.UPDATE_UNREAD_COUNT:
      return {
        ...state,
        unreadCount: action.payload,
      };
    default:
      return state;
  }
};

// Notification Provider
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { api, isAuthenticated } = useAuth();

  // Fetch notifications
  const fetchNotifications = async (page = 1, limit = 10) => {
    if (!isAuthenticated) return;
    
    try {
      dispatch({ type: NOTIFICATION_ACTIONS.FETCH_START });
      const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
      
      dispatch({
        type: NOTIFICATION_ACTIONS.FETCH_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      dispatch({ type: NOTIFICATION_ACTIONS.FETCH_FAILURE });
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      dispatch({
        type: NOTIFICATION_ACTIONS.MARK_AS_READ,
        payload: notificationId,
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      dispatch({ type: NOTIFICATION_ACTIONS.MARK_ALL_AS_READ });
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      dispatch({
        type: NOTIFICATION_ACTIONS.DELETE_NOTIFICATION,
        payload: notificationId,
      });
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  // Create notification (for admin use)
  const createNotification = async (notificationData) => {
    try {
      const response = await api.post('/notifications', notificationData);
      dispatch({
        type: NOTIFICATION_ACTIONS.ADD_NOTIFICATION,
        payload: response.data,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create notification:', error);
      toast.error('Failed to create notification');
      throw error;
    }
  };

  // Broadcast notification (for admin use)
  const broadcastNotification = async (broadcastData) => {
    try {
      const response = await api.post('/notifications/broadcast', broadcastData);
      toast.success(`Notification sent to ${response.data.sentCount} users`);
      return response.data;
    } catch (error) {
      console.error('Failed to broadcast notification:', error);
      toast.error('Failed to broadcast notification');
      throw error;
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await api.get('/notifications?limit=1');
      dispatch({
        type: NOTIFICATION_ACTIONS.UPDATE_UNREAD_COUNT,
        payload: response.data.unreadCount,
      });
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // Auto-refresh notifications
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
      
      // Set up periodic refresh for unread count
      const interval = setInterval(fetchUnreadCount, 30000); // 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const value = {
    ...state,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    broadcastNotification,
    fetchUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook to use notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
