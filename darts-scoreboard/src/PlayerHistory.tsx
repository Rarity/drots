import React from 'react';
import styles from './App.module.css';

interface PlayerHistoryProps {
  throws: number[];
}

const PlayerHistory: React.FC<PlayerHistoryProps> = ({ throws }) => {
  return (
    <div className={styles.history}>
      <h4 className={styles.subtitle}>История бросков</h4>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Раунд</th>
            <th>Очки</th>
          </tr>
        </thead>
        <tbody>
          {throws.length === 0 ? (
            <tr>
              <td colSpan={2}>Пока нет бросков, дебил!</td>
            </tr>
          ) : (
            throws.map((score, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{score}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerHistory;