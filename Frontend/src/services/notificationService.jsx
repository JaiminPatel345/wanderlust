import toast from 'react-hot-toast';
import { notificationConfig } from '../utils/notificationConfig';

export const showNotificationToast = (notification, onClick) => {
    const type = notificationConfig[notification.type] || notificationConfig.DEFAULT;
    
    toast(
        <div 
            className="flex items-start gap-3 w-full cursor-pointer" 
            onClick={() => {
                toast.dismiss();
                onClick?.(notification);
            }}
        >
            <span className="text-xl">{type.emoji}</span>
            <div className="flex-1">
                <p className="font-medium">{notification.title}</p>
                <p className="text-sm text-gray-600">{notification.message}</p>
            </div>
        </div>,
        {
            duration: 5000,
            style: {
                ...type.style,
                cursor: 'pointer'
            }
        }
    );
}; 