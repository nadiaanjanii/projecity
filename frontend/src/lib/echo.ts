import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import api from './api';

let echo: Echo<any> | null = null;

if (typeof window !== 'undefined') {
    // @ts-ignore
    window.Pusher = Pusher;

    echo = new Echo({
        broadcaster: 'reverb',
        key: 'projecity-key',
        wsHost: '127.0.0.1',
        wsPort: 8080,
        forceTLS: false,
        enabledTransports: ['ws', 'wss'],
        // Use our existing axios instance for authentication
        authorizer: (channel: any) => {
            return {
                authorize: (socketId: string, callback: Function) => {
                    api.post('/broadcasting/auth', {
                        socket_id: socketId,
                        channel_name: channel.name
                    })
                    .then(response => {
                        callback(false, response.data);
                    })
                    .catch(error => {
                        callback(true, error);
                    });
                }
            };
        },
    });
}

export default echo;
