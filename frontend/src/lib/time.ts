export function getTimeZoneLabel(): string {
    if (typeof window === 'undefined') return 'WITA';
    const offset = -new Date().getTimezoneOffset() / 60;
    if (offset === 7) return 'WIB';
    if (offset === 9) return 'WIT';
    return 'WITA';
}

export function parseDate(dateString: string): Date {
    if (!dateString) return new Date();
    if (typeof dateString === 'string' && !dateString.includes('Z') && !dateString.includes('+')) {
        const normalized = dateString.replace(' ', 'T');
        return new Date(normalized);
    }
    return new Date(dateString);
}

export function getRelativeTimeMinutes(dateString: string): string {
    if (!dateString) return '1 mnt lalu';
    const date = parseDate(dateString);
    if (isNaN(date.getTime())) return '1 mnt lalu';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return '1 mnt lalu';
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} mnt lalu`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} jam lalu`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 hari lalu';
    if (diffInDays < 7) return `${diffInDays} hari lalu`;
    
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export function formatClockTime(dateString: string): string {
    if (!dateString) return 'Belum pernah';
    const date = parseDate(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const tz = getTimeZoneLabel();
    
    const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.') + ' ' + tz;
    
    if (isToday) {
        return timeStr;
    }
    
    const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    return `${dateStr}, ${timeStr}`;
}

export function getRelativeTime(dateString: string): string {
    return getRelativeTimeMinutes(dateString);
}

export function formatLiveTime(date: Date): { time: string; date: string } {
    const tz = getTimeZoneLabel();
    const time = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(':', '.');
    const formattedDate = date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    return { time, date: formattedDate };
}
