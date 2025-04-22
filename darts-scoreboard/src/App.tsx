import React, { useState, useRef, useEffect } from "react";
import PlayerHistory from "./PlayerHistory";
import PlayerScoreGraph from "./PlayerScoreGraph";
import styles from "./App.module.css";

interface Player {
  name: string;
  score: number;
  throws: number[];
  place?: number;
}

const App: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [inputName, setInputName] = useState("");
  const [throwInputs, setThrowInputs] = useState<number[][]>([
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]);
  const [historyPlayer, setHistoryPlayer] = useState<Player | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const throwInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!gameStarted && !gameEnded) {
      nameInputRef.current?.focus();
    } else if (gameStarted && !gameEnded) {
      throwInputRef.current?.focus();
    }
  }, [players, gameStarted, gameEnded, currentPlayerIndex]);

  const addPlayer = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputName.trim()) {
      setPlayers([
        ...players,
        { name: inputName.trim(), score: 501, throws: [] },
      ]);
      setInputName("");
    }
  };

  const startGame = () => {
    if (players.length < 2) {
      alert("Добавь хотя бы двух игроков, дебил!");
      return;
    }
    setGameStarted(true);
  };

  const handleThrowInput = (row: number, col: number, value: string) => {
    const newThrows = [...throwInputs];
    newThrows[row][col] = parseInt(value) || 0;
    setThrowInputs(newThrows);
  };

  const calculateThrowScore = (row: number) => {
    const [x1, x2, x3] = throwInputs[row];
    return x1 + x2 * 2 + x3 * 3;
  };

  const calculateTotalScore = () => {
    return throwInputs.reduce(
      (sum, _, row) => sum + calculateThrowScore(row),
      0,
    );
  };

  const getNextActivePlayerIndex = (currentIndex: number) => {
    let nextIndex = (currentIndex + 1) % players.length;
    let attempts = 0;

    while (attempts < players.length) {
      const player = players[nextIndex];
      if (player.score > 0 && !player.place) {
        return nextIndex;
      }
      nextIndex = (nextIndex + 1) % players.length;
      attempts++;
    }

    return currentIndex;
  };

  const submitThrows = () => {
    const totalThrow = calculateTotalScore();
    const currentPlayer = players[currentPlayerIndex];
    const newScore = currentPlayer.score - totalThrow;

    if (newScore < 0) {
      alert("Перебор, дебил! Кидай нормально!");
      setThrowInputs([
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ]);
      throwInputRef.current?.focus();
      setCurrentPlayerIndex(getNextActivePlayerIndex(currentPlayerIndex));
      return;
    }

    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex] = {
      ...currentPlayer,
      score: newScore,
      throws: [...currentPlayer.throws, totalThrow],
    };

    if (newScore === 0) {
      const place = players.filter((p) => p.place).length + 1;
      updatedPlayers[currentPlayerIndex].place = place;
      if (updatedPlayers.every((p) => p.score === 0 || p.place)) {
        setGameEnded(true);
      }
    }

    setPlayers(updatedPlayers);
    setThrowInputs([
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]);
    setCurrentPlayerIndex(getNextActivePlayerIndex(currentPlayerIndex));
  };

  const resetGame = () => {
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setGameStarted(false);
    setGameEnded(false);
    setInputName("");
    setThrowInputs([
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]);
    setHistoryPlayer(null);
  };

  const getMedal = (place?: number) => {
    switch (place) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return "🎀";
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
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            onKeyPress={addPlayer}
            placeholder="Имя игрока, дебил"
            className={styles.input}
          />
          <div className={styles.playerList}>
            {players.map((player, index) => (
              <div key={index} className={styles.playerTag}>
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
            Сейчас кидает: {players[currentPlayerIndex].name}
          </h2>
          <div className={styles.players}>
            {players.map((player, index) => (
              <div
                key={player.name}
                className={`${styles.player} ${index === currentPlayerIndex ? styles.activePlayer : ""}`}
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
              <div key={rowIndex} className={styles.throwInputs}>
                <input
                  ref={rowIndex === 0 ? throwInputRef : null}
                  type="number"
                  value={row[0] || ""}
                  onChange={(e) =>
                    handleThrowInput(rowIndex, 0, e.target.value)
                  }
                  placeholder="x1"
                  className={styles.throwInput}
                />
                <input
                  type="number"
                  value={row[1] || ""}
                  onChange={(e) =>
                    handleThrowInput(rowIndex, 1, e.target.value)
                  }
                  placeholder="x2"
                  className={styles.throwInput}
                />
                <input
                  type="number"
                  value={row[2] || ""}
                  onChange={(e) =>
                    handleThrowInput(rowIndex, 2, e.target.value)
                  }
                  placeholder="x3"
                  className={styles.throwInput}
                />
                <span className={styles.throwScore}>
                  = {calculateThrowScore(rowIndex)}
                </span>
              </div>
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
                  <tr key={index}>
                    <td>{player.place}</td>
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
