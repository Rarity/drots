import styles from "/index.css";

interface EndedGameProps: {
  players: any,
};

// React.FC<ThrowInputRowProps>
const EndedGame = React.FC<EndedGameProps> = ({ players }) => {
  return (
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
  );
}


export default EndedGame;
