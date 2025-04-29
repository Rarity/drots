import React, { useRef, useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import PlayerHistory from './components/PlayerHistory';
import PlayerScoreGraph from './components/PlayerScoreGraph';
import ThrowInputRow from './components/ThrowInputRow';
import styles from './App.module.css';

const App: React.FC = () => {
  const {
    players,
    currentPlayerIndex,
    gameStarted,
    gameEnded,
    inputName,
    throwInputs,
    historyPlayer,
    addPlayer,
    startGame,
    handleThrowInput,
    submitThrows,
    resetGame,
    setHistoryPlayer,
    setInputName,
    calculateThrowScore,
    calculateTotalScore,
  } = useGameStore();

  const nameInputRef = useRef<HTMLInputElement>(null);
  const throwInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!gameStarted && !gameEnded && nameInputRef.current) {
      nameInputRef.current.focus();
    } else if (gameStarted && !gameEnded && throwInputRefs.current[0]) {
      throwInputRefs.current[0].focus();
    }
  }, [gameStarted, gameEnded, currentPlayerIndex]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputName.trim()) {
      addPlayer(inputName);
    }
  };

  const getMedal = (place?: number): string => {
    switch (place) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '🎀';
    }
  };

  const calculatePlayerTotalScore = (throws: number[]) => {
    return throws.reduce((sum, score) => sum + score, 0);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Берись за дрот! 🎯</h1>

      {!gameStarted && !gameEnded && (
        <div className={styles.setup}>
          <input
            ref={nameInputRef}
            type="text"
            value={inputName || ''}
            onChange={(e) => setInputName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Имя игрока, дебил"
            className={styles.input}
          />
          <div className={styles.playerList}>
            {players.map((player, index) => (
              <div key={player.name + index} className={styles.playerTag}>
                {player.name}
              </div>
            ))}
          </div>
          <button onClick={startGame} className={styles.button}>
            Начать игру, лохи!
          </button>
        </div>
      )}

      {gameStarted && !gameEnded && (
        <div className={styles.game}>
          <h2 className={styles.currentPlayer}>
            Сейчас кидает: {players[currentPlayerIndex]?.name || 'Никто, дебил!'}
          </h2>
          <div className={styles.players}>
            {players.map((player, index) => (
              <div
                key={player.name + index}
                className={`${styles.player} ${
                  index === currentPlayerIndex ? styles.activePlayer : ''
                }`}
              >
                <h3 className={styles.playerName}>
                  {player.name} {player.place && getMedal(player.place)}
                </h3>
                <p>Осталось: {player.score}</p>
                <p>Набрано: {calculatePlayerTotalScore(player.throws)}</p>
                <button
                  onClick={() => setHistoryPlayer(player)}
                  className={styles.historyButton}
                >
                  История
                </button>
              </div>
            ))}
          </div>
          <div className={styles.throwSection}>
            <h3 className={styles.subtitle}>Броски</h3>
            {throwInputs.map((row, rowIndex) => (
              <ThrowInputRow
                key={rowIndex}
                rowIndex={rowIndex}
                score={row[0]}
                modifier={row[1] || ''} // Прямо используем row[1] как Modifier
                onThrowInput={(index, score, modifier) =>
                  handleThrowInput(index, score, modifier)
                }
                calculateThrowScore={calculateThrowScore}
              />
            ))}
            <div className={styles.totalScore}>
              Итого: {calculateTotalScore()}
            </div>
            <button onClick={submitThrows} className={styles.button}>
              Зачесть, дебил!
            </button>
          </div>
        </div>
      )}

      {gameEnded && (
        <div className={styles.results}>
          <h2 className={styles.subtitle}>Игра окончена, лохи!</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Место</th>
                <th>Игрок</th>
                <th>Медаль</th>
              </tr>
            </thead>
            <tbody>
              {players
                .sort((a, b) => (a.place || Infinity) - (b.place || Infinity))
                .map((player, index) => (
                  <tr key={player.name + index}>
                    <td>{player.place || '-'}</td>
                    <td>{player.name}</td>
                    <td>{getMedal(player.place)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <button onClick={resetGame} className={styles.button}>
            Новая игра, дебилы!
          </button>
        </div>
      )}

      {historyPlayer && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>История: {historyPlayer.name}</h3>
            <PlayerHistory throws={historyPlayer.throws} />
            <PlayerScoreGraph throws={historyPlayer.throws} />
            <button
              onClick={() => setHistoryPlayer(null)}
              className={styles.button}
            >
              Закрыть, дебил!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;