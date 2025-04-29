import React, { useState } from 'react';
import styles from './ThrowInputRow.module.css';

import { Modifier, MODIFIERS } from '../../constants';

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
    <div className={styles.throwInputs}>
      <input
        type="number"
        value={localScore ?? ''}
        onChange={handleScoreChange}
        placeholder="Счет"
        className={styles.throwInput}
      />
      {MODIFIERS.map((mod) => (
        <label key={mod} style={{ marginLeft: '10px' }}>
          <input
            type="checkbox"
            checked={localModifier === mod}
            onChange={() => handleCheckboxChange(mod)}
          />
          {mod}
        </label>
      ))}
      <span className={styles.throwScore}>= {calculateThrowScore(rowIndex)}</span>
    </div>
  );
};

export default ThrowInputRow;