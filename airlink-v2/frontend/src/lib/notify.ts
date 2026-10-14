export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  time: string;
}

export function notify(
  title: string, 
  message: string = '', 
  type: 'success' | 'error' | 'info' | 'warning' = 'info'
) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('app-notify', {
        detail: {
          id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          title,
          message,
          type,
          time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        },
      })
    );
  }
}

export const notifySuccess = (title: string, message?: string) => notify(title, message, 'success');
export const notifyError = (title: string, message?: string) => notify(title, message, 'error');
export const notifyInfo = (title: string, message?: string) => notify(title, message, 'info');
export const notifyWarning = (title: string, message?: string) => notify(title, message, 'warning');
