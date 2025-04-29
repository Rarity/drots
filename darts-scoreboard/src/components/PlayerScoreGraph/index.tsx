import React, { useEffect, useRef } from "react";
import styles from "./PlayerScoreGraph.module.css";

interface PlayerScoreGraphProps {
  throws: number[];
}

const PlayerScoreGraph: React.FC<PlayerScoreGraphProps> = ({ throws }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const maxScore = Math.max(...throws, 180) || 180;
    const barWidth = (width - padding * 2) / Math.max(throws.length, 1) - 10;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#374151";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#facc15";
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Раунд", width / 2, height - padding + 20);
    ctx.textAlign = "right";
    ctx.fillText("Очки", padding - 10, padding + 10);

    throws.forEach((score, index) => {
      const x = padding + index * (barWidth + 10);
      const barHeight = (score / maxScore) * (height - padding * 2) || 0;
      ctx.fillStyle = "#facc15";
      ctx.fillRect(x, height - padding - barHeight, barWidth, barHeight);

      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(`${index + 1}`, x + barWidth / 2, height - padding + 15);
    });

    for (let i = 0; i <= 5; i++) {
      const y = height - padding - (i / 5) * (height - padding * 2);
      ctx.fillText(`${Math.round((i / 5) * maxScore)}`, padding - 10, y + 5);
    }
  }, [throws]);

  return (
    <div className={styles.graph}>
      <h4 className={styles.subtitle}>График очков</h4>
      <canvas ref={canvasRef} width={400} height={200} />
    </div>
  );
};

export default PlayerScoreGraph;
