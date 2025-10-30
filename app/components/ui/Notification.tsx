import { Alert, AlertDescription } from "./alert";
import { Button } from "./button";

interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
}

const typeStyles = {
  success: {
    variant: 'default' as const,
    className: 'border-green-200 bg-green-50 text-green-800',
    icon: '✅',
  },
  error: {
    variant: 'destructive' as const,
    className: 'border-red-200 bg-red-50 text-red-800',
    icon: '❌',
  },
  warning: {
    variant: 'default' as const,
    className: 'border-yellow-200 bg-yellow-50 text-yellow-800',
    icon: '⚠️',
  },
  info: {
    variant: 'default' as const,
    className: 'border-blue-200 bg-blue-50 text-blue-800',
    icon: 'ℹ️',
  },
};

export default function Notification({ type, message, onClose, autoClose = true }: NotificationProps) {
  const styles = typeStyles[type];

  return (
    <Alert className={`${styles.className} ${onClose ? 'pr-12' : ''}`}>
      <span className="text-lg mr-2">{styles.icon}</span>
      <AlertDescription className="font-medium">{message}</AlertDescription>
      {onClose && (
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="absolute right-2 top-2 h-8 w-8 p-0 text-current hover:bg-transparent"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="sr-only">닫기</span>
        </Button>
      )}
    </Alert>
  );
}