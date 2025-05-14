import { useState } from "react";
import { getSavedPlayers, SavedPlayer } from "../../utils/playerStorage";
import styles from "./styles.module.css";
import { toast } from "react-toastify";

type Props = {
  onAddPlayers: (names: string[]) => void;
};

export default function SavedPlayersMultiSelect({ onAddPlayers }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const saved: SavedPlayer[] = getSavedPlayers();

  const toggle = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleAdd = () => {
    if (selected.length === 0) {
      toast.error("Выбери хоть одного, дебил!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    onAddPlayers(selected);
    toast.success(`${selected.length} игроков добавлено, лох!`, {
      position: "top-right",
      autoClose: 3000,
    });
    setSelected([]);
  };

  return (
    <div className={styles.multiSelect}>
      <h3 className={styles.title}>Сохранённые игроки, дебил</h3>
      {saved.length === 0 ? (
        <p className={styles.empty}>Нет сохранённых игроков, лох!</p>
      ) : (
        <div className={styles.list}>
          {saved
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((p) => (
              <label key={p.name} className={styles.item}>
                <input
                  type="checkbox"
                  checked={selected.includes(p.name)}
                  onChange={() => toggle(p.name)}
                  className={styles.checkbox}
                />
                <span className={styles.name}>{p.name}</span>
                <span className={styles.medals}>
                  🥇{p.medals.gold} 🥈{p.medals.silver} 🥉{p.medals.bronze}
                </span>
              </label>
            ))}
        </div>
      )}
      <button onClick={handleAdd} className={styles.addButton}>
        ➕ Добавить выбранных, дебил
      </button>
    </div>
  );
}