import React from 'react';
import { Notification } from '@/services/notificationService';

export const getNotificationText = (notification: Notification): string => {
  const senderName = notification.sender?.name || 'Someone';
  
  switch (notification.type) {
    case 'like':
      return `${senderName} liked your post: ${notification.post?.title || 'a post'}`;
    case 'comment':
      return `${senderName} commented on your post: ${notification.post?.title || 'a post'}`;
    case 'editor_added':
      return `${senderName} added you as an editor to: ${notification.post?.title || 'a post'}`;
    case 'post_mention':
      return `${senderName} mentioned you in a post: ${notification.post?.title || 'a post'}`;
    case 'system':
      return notification.message;
    default:
      return notification.message;
  }
};

export const getNotificationLink = (notification: Notification): string | null => {
  if (notification.post) {
    return `/posts/${notification.post._id}`;
  }
  return null;
};

// Fix for "Cannot find name 'svg'" and related errors - using a string type instead of React elements
export const getNotificationIconClass = (type: string): string => {
  switch (type) {
    case 'like':
      return 'M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z';
    case 'comment':
      return 'M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z';
    case 'editor_added':
      return 'M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z';
    case 'post_mention':
      return 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z';
    case 'system':
    default:
      return 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z';
  }
};

// Determine if a path should use evenodd fill rule
export const isEvenOddFillRule = (type: string): boolean => {
  return ['like', 'comment', 'post_mention', 'system'].includes(type);
};

// Create a component that renders the icon
const NotificationIconComponent = ({ type }: { type: string }): React.ReactElement => {
  const iconPath = getNotificationIconClass(type);
  const useEvenOdd = isEvenOddFillRule(type);
  
  return React.createElement('svg', {
    xmlns: "http://www.w3.org/2000/svg",
    className: "h-5 w-5",
    viewBox: "0 0 20 20",
    fill: "currentColor"
  }, React.createElement('path', {
    d: iconPath,
    fillRule: useEvenOdd ? 'evenodd' : undefined,
    clipRule: useEvenOdd ? 'evenodd' : undefined
  }));
};

// Export the component
export const NotificationIcon = NotificationIconComponent;

export const getNotificationColor = (type: string): string => {
  switch (type) {
    case 'like':
      return 'bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400';
    case 'comment':
      return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
    case 'editor_added':
      return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400';
    case 'post_mention':
      return 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400';
    case 'system':
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
  }
};

export const formatNotificationDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
};

export const getNotificationActions = (notification: Notification): { label: string; link: string }[] => {
  const actions: { label: string; link: string }[] = [];
  
  if (notification.post) {
    actions.push({
      label: 'View Post',
      link: `/posts/${notification.post._id}`
    });
  }
  
  if (notification.type === 'editor_added' && notification.post) {
    actions.push({
      label: 'Edit Post',
      link: `/posts/${notification.post._id}/edit`
    });
  }
  
  return actions;
};