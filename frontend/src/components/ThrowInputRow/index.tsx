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
  const [localScore, setLocalScore] = useState<string>(score?.toString() ?? '');
  const [localModifier, setLocalModifier] = useState<Modifier>(modifier);

  useEffect(() => {
    setLocalScore(score?.toString() ?? '');
    setLocalModifier(modifier);
  }, [score, modifier]);

  const updateThrow = (
    newScoreStr: string = localScore,
    newModifier: Modifier = localModifier,
  ) => {
    setLocalScore(newScoreStr);
    setLocalModifier(newModifier);
    const parsedScore = newScoreStr === '' ? undefined : Number(newScoreStr);
    onThrowInput(rowIndex, parsedScore, newModifier);
  };

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      updateThrow(value);
    }
  };

  const handleCheckboxChange = (selectedModifier: Modifier) => {
    const newModifier = localModifier === selectedModifier ? '' : selectedModifier;
    updateThrow(localScore, newModifier);
  };

  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
  };

  return (
    <div className={styles.throwRow}>
      <input
        type="text"
        value={localScore}
        onChange={handleScoreChange}
        onWheel={handleWheel}
        placeholder="Счет"
        className={styles.scoreInput}
        inputMode="numeric"
        pattern="[0-9]*"
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
