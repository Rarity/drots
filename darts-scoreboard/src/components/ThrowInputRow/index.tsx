import React, { useState, useEffect } from 'react';
import { Modifier, MODIFIERS } from '../../constants';
import styles from './styles.module.css';

interface ThrowInputRowProps {
  rowIndex: number;
  score: number | undefined;
  modifier: Modifier;
  onThrowInput: (rowIndex: number, score: number | undefined, modifier: Modifier) => void;
  calculateThrowScore: (rowIndex: number) => number;
}

const ThrowInputRow: React.FC<ThrowInputRowProps> = ({
  rowIndex,
  score,
  modifier,
  onThrowInput,
  calculateThrowScore,
}) => {
  const [localScore, setLocalScore] = useState<number | undefined>(score);
  const [localModifier, setLocalModifier] = useState<Modifier>(modifier);

  useEffect(() => {
    setLocalScore(score);
    setLocalModifier(modifier);
  }, [score, modifier]);

  const updateThrow = (
    newScore: number | undefined = localScore,
    newModifier: Modifier = localModifier,
  ) => {
    setLocalScore(newScore);
    setLocalModifier(newModifier);
    onThrowInput(rowIndex, newScore, newModifier);
  };

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? undefined : Number(e.target.value);
    updateThrow(value);
  };

  const handleCheckboxChange = (selectedModifier: Modifier) => {
    const newModifier = localModifier === selectedModifier ? '' : selectedModifier;
    updateThrow(localScore, newModifier);
  };

  return (
    <div className={styles.throwRow}>
      <input
        type="number"
        value={localScore ?? ''}
        onChange={handleScoreChange}
        placeholder="Счет"
        className={styles.scoreInput}
      />
      <div className={styles.modifierGroup}>
        {MODIFIERS.map((mod) => (
          <label key={mod} className={styles.modifierLabel}>
            <input
              type="checkbox"
              checked={localModifier === mod}
              onChange={() => handleCheckboxChange(mod)}
              className={styles.modifierCheckbox}
            />
            <span className={styles.modifierText}>{mod}</span>
          </label>
        ))}
      </div>
      <span className={styles.throwScore}>= {calculateThrowScore(rowIndex)}</span>
    </div>
  );
};

export default ThrowInputRow;