import React, { useRef, useEffect, useState } from 'react';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Confetti from 'react-confetti';

import { toast } from 'react-toastify';
import { sendToMattermost } from './api/mattermostHooks';
import { formatResultsTable } from './utils/formatResult';


import { useGameStore } from './store/gameStore';
import PlayerHistory from './components/PlayerHistory';
import PlayerScoreGraph from './components/PlayerScoreGraph';
import ThrowInputRow from './components/ThrowInputRow';
// import SavedPlayersMultiSelect from "./components//SavedPlayersMultiSelect";

import Alert from './components/Alert';
import { getMedal } from './utils';
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
    error,
    round,
    useNeuralCommentator,
    vibe,
    initialScore,
    addPlayer,
    removePlayer,
    startGame,
    handleThrowInput,
    submitThrows,
    resetGame,
    setHistoryPlayer,
    setInputName,
    calculateThrowScore,
    calculateTotalScore,
    clearError,
    setUseNeuralCommentator,
    setVibe,
    setInitialScore,
    shufflePlayers,
  } = useGameStore();

  const nameInputRef = useRef<HTMLInputElement>(null);
  const throwInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!gameStarted && !gameEnded && nameInputRef.current) {
      nameInputRef.current.focus();
    } else if (gameStarted && !gameEnded && throwInputRefs.current[0]) {
      throwInputRefs.current[0].focus();
    }
  }, [gameStarted, gameEnded, currentPlayerIndex]);

  useEffect(() => {
    console.log('useNeuralCommentator in UI:', useNeuralCommentator);
  }, [useNeuralCommentator]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputName.trim()) {
      addPlayer(inputName);
    }
  };

  const handleAddPlayer = () => {
    if (inputName.trim()) {
      addPlayer(inputName);
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
          <div className={styles.inputWrapper}>
            <input
              ref={nameInputRef}
              type="text"
              value={inputName || ''}
              onChange={(e) => setInputName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Имя игрока, дебил"
              className={styles.input}
            />
            <button
              onClick={handleAddPlayer}
              className={styles.addButton}
              disabled={!inputName.trim()}
            >
              ➕
            </button>
            {/* <SavedPlayersMultiSelect onAddPlayers={(names) => {
              names.forEach(addPlayer);
            }} /> */}
            <div className={styles.shuffleWrapper}>
              <button
                onClick={shufflePlayers}
                className={styles.addButton}
                disabled={players.length < 2}
                title="Перемешать игроков"
              >
                🎲
              </button>
            </div>
          </div>
          <div className={styles.playerList}>
            {players.map((player, index) => (
              <div key={player.name + index} className={styles.playerTag}>
                {player.name}
                <button
                  onClick={() => removePlayer(index)}
                  className={styles.removeButton}
                >
                  x
                </button>
              </div>
            ))}
          </div>
          <div className={styles.setupOptions}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={useNeuralCommentator}
                onChange={(e) => setUseNeuralCommentator(e.target.checked)}
              />
              Включить нейросетевого комментатора
            </label>
            <label className={styles.selectLabel}>
              Вайб комментатора:
              <select
                value={vibe}
                onChange={(e) => setVibe(e.target.value as 'angry' | 'friendly' | 'pity')}
                className={styles.select}
              >
                <option value="angry">🤬 Агрессивный</option>
                <option value="friendly">😇 Дружелюбный</option>
                <option value="pity">🥺 Жалостливый</option>
              </select>
            </label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="initialScore"
                  value={301}
                  checked={initialScore === 301}
                  onChange={() => setInitialScore(301)}
                />
                301 очков
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="initialScore"
                  value={501}
                  checked={initialScore === 501}
                  onChange={() => setInitialScore(501)}
                />
                501 очков
              </label>
            </div>
          </div>
          <button
            onClick={startGame}
            className={styles.button}
            disabled={players.length === 0}
          >
            Начать игру, лохи!
          </button>
        </div>
      )}

      {gameStarted && !gameEnded && (
        <div className={styles.game}>
          <h2 className={styles.currentPlayer}>
            Раунд {round} | Сейчас кидает: <span className={styles.currentPlayerName}>{players[currentPlayerIndex]?.name || 'Никто, дебил!'}</span>
          </h2>
          {error && <Alert message={error} onClose={clearError} />}
          <div className={styles.columns}>
            <div className={styles.playersColumn}>
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
                  <div className={styles.playerColumns}>
                    <div className={styles.playerLeft}>
                      <p>Осталось: <span>{player.score}</span></p>
                      <p>Набрано: <span>{calculatePlayerTotalScore(player.throws)}</span></p>
                    </div>
                    <div className={styles.playerRight}>
                      {player.lastThrow !== undefined && (
                        <p className={player.isBust ? styles.bust : styles.lastThrow}>
                          Последний: {player.lastThrow}
                          {player.isBust ? ' - ПЕРЕБОР!' : ''}
                        </p>
                      )}
                      {player.message && <p className={styles.message}>{player.message}</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => setHistoryPlayer(player)}
                    className={styles.historyButton}
                  >
                    📊 История
                  </button>
                </div>
              ))}
            </div>
            <div className={styles.controlsColumn}>
              <div className={styles.throwSection}>
                <h3 className={styles.subtitle}>Броски</h3>
                {throwInputs.map((row, rowIndex) => (
                  <ThrowInputRow
                    key={rowIndex}
                    rowIndex={rowIndex}
                    score={row[0]}
                    modifier={row[1] || ''}
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
                  Зачесть, дебил! ✍️
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {gameEnded && (
        <div className={styles.results}>
          <Confetti     
            width={windowSize.width}
            height={windowSize.height}
            numberOfPieces={75}
            recycle={true} 
          />
          <h2 className={styles.subtitle}>Игра окончена, лохи!</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Место</th>
                <th>Игрок</th>
                <th>Медаль</th>
                <th>Раунды</th> 
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
                    <td>{player.rounds}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <div className={styles.resultsGraph}>
            <h3 className={styles.subtitle}>Прогресс игроков</h3>
            <PlayerScoreGraph
              throws={players.reduce(
                (acc, player) => ({
                  ...acc,
                  [player.name]: player.throws,
                }),
                {} as Record<string, number[]>
              )}
              isMultiPlayer
            />
          </div>
          <div className={styles.resultsButtons}>
            <button onClick={resetGame} className={styles.button}>
              Новая игра, дебилы!
            </button>
            <button
              onClick={async () => {
                try {
                  const message = formatResultsTable(players, round); // Передаём round
                  console.log('Сообщение для Mattermost:', message);
                  await sendToMattermost(message);
                  toast.success('Результаты отправлены в Mattermost, молодец, не обосрался!');
                } catch (error) {
                  console.error('Ошибка отправки:', error);
                  toast.error('Пиздец, не смог отправить в Mattermost! Чекни консоль, дебил!');
                }
              }}
              className={styles.button}
            >
              Отправить в Mattermost, лохи!
            </button>
          </div>
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
      <ToastContainer />
    </div>
  );
};

export default App;