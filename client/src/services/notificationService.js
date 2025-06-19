// src/services/notificationService.js
import axios from 'axios';

export const fetchRecentNotifications = async (baseURL, tenantId, userId, limit = 5) => {
    try {
        const response = await axios.post(`${baseURL}/${tenantId}/notifications/fetch-user-notifications`, {
            userId
        });

        if (response.status === 200) {
            // Returnér kun de seneste N
            return response.data
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Seneste først
                .slice(0, limit);
        }

        return [];
    } catch (error) {
        console.error("Error fetching recent notifications:", error);
        return [];
    }
};

export function formatNotificationTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;

    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
    if (days === 1) return "Yesterday";

    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];

    return `${day} ${month}`;
}

