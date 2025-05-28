import React, { useState } from 'react';
import Dartboard from '../Dartboard';
import ThrowInputRow from '../ThrowInputRow';
import { getScore } from '../Dartboard/gameLogic';
import { useGameStore } from '../../store/gameStore';
import styles from './styles.module.css';

const ThrowTabs: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'inputs' | 'dartboard'>('dartboard');
    const { throwInputs, handleThrowInput, calculateThrowScore, calculateTotalScore, submitThrows, resetThrows } = useGameStore();

    const canvasWidth = 452; // Можно сделать динамично через useResize
    const canvasHeight = 452;

    const handleDartboardThrow = (x: number, y: number) => {
        const { score, modifier, coords } = getScore(x, y, canvasWidth, canvasHeight);
        const rowIndex = throwInputs.findIndex(([s]) => s === undefined);
        if (rowIndex !== -1) {
          handleThrowInput(rowIndex, score, modifier, coords);
        }
    };

    // const hits = throwInputs.map((row) => row[2]).filter((hit): hit is { x: number; y: number } => !!hit);
      const throwIndicators = throwInputs.map((row, i) => (
        <span
            key={i}
            className={`${styles.throwIndicator} ${
                row[0] === undefined ? styles.throwIndicatorRocket : styles.throwIndicatorExplosion
            }`}
        >
            {row[0] === undefined ? '🚀' : '💥'}
        </span>
    ));

    return (
        <div className={styles.throwSection}>
          <h3 className={styles.subtitle}>Броски</h3>
            <div className={styles.tabWrapper}>
              <button
                className={`${styles.tabButton} ${activeTab === 'dartboard' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('dartboard')}
              >
                Мишень
              </button>
              <button
                className={`${styles.tabButton} ${activeTab === 'inputs' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('inputs')}
              >
                Ввод
              </button>
            </div>

            {activeTab === 'inputs' ? (
                <div className={styles.inputRows}>
                  {throwInputs.map((row, rowIndex) => (
                    <ThrowInputRow
                      key={rowIndex}
                      rowIndex={rowIndex}
                      score={row[0]}
                      modifier={row[1] || ''}
                      onThrowInput={handleThrowInput}
                      calculateThrowScore={calculateThrowScore}
                    />
                  ))}
                </div>
            ) : (
                <Dartboard
                    onThrow={handleDartboardThrow}
                    hits={throwInputs.map((row) => row[2]).filter((hit): hit is { x: number; y: number } => !!hit)}
                    width={canvasWidth}
                    height={canvasHeight}
                />
            )}
            <div className={styles.throwIndicators}>
              {throwIndicators}
            </div>
            <div className={styles.totalScore}>
                Итого: {calculateTotalScore()}
            </div>
            <div className={styles.controlButtons}>
              <button onClick={submitThrows} className={styles.button}>
                  Зачесть, дебил! ✍️
              </button>
              <button onClick={resetThrows} className={styles.resetButton} title="Сбросить броски">
                🔄
              </button>
            </div>
        </div>
    );
};

export default ThrowTabs;