import { useEffect } from 'react';
import styles from './styles.module.css';

interface AlertProps {
  message: string;
  onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={styles.alert}>
      <span>{message}</span>
      <button className={styles.alertClose} onClick={onClose}>
        ×
      </button>
    </div>
  );
};

export default Alert;