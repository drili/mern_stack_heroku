// utils/formatters.js

export function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;

    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);

    const hoursStr = String(date.getHours()).padStart(2, '0');
    const minutesStr = String(date.getMinutes()).padStart(2, '0');

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
    if (days === 1) return `Yesterday at ${hoursStr}:${minutesStr}`;

    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];

    const showYear = now.getFullYear() !== date.getFullYear();
    const yearSuffix = showYear ? `- ${date.getFullYear()}` : '';

    return `${day} ${month} ${yearSuffix} • ${hoursStr}:${minutesStr}`;
}

