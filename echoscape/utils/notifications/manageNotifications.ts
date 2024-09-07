



import * as Notifications from 'expo-notifications';
import { NotificationContentInput } from 'expo-notifications';

// First, set the handler that will cause the notification
// to show the alert

export function setNotificationsHandler() {   
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
        }),
    });
}

/*
sends a notification with the specified content, after the specified number of seconds
*/
export function sendNotification(content: NotificationContentInput, seconds?: number | null) {
    let sendDate = seconds ? new Date(new Date().getTime() + seconds * 1000) : null
    Notifications.scheduleNotificationAsync({
        content: content,
        trigger: sendDate,
    });   
}