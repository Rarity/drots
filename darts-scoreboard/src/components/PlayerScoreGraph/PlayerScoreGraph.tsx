import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import styles from './styles.module.css';

interface PlayerScoreGraphProps {
  throws: number[] | Record<string, number[]>;
  isMultiPlayer?: boolean;
}

const PlayerScoreGraph: React.FC<PlayerScoreGraphProps> = ({ throws, isMultiPlayer = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const colors = ['#facc15', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6'];
    let datasets: any[];
    let labels: string[];

    if (isMultiPlayer) {
      const playersThrows = throws as Record<string, number[]>;
      const maxThrows = Math.max(...Object.values(playersThrows).map(t => t.length));
      labels = Array.from({ length: maxThrows }, (_, i) => `Бросок ${i + 1}`);
      datasets = Object.entries(playersThrows).map(([name, throws], index) => ({
        label: name,
        data: throws,
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + '33',
        fill: false,
        tension: 0.1,
      }));
    } else {
      const singleThrows = throws as number[];
      labels = singleThrows.map((_, index) => `Бросок ${index + 1}`);
      datasets = [{
        label: 'Очки',
        data: singleThrows,
        borderColor: '#facc15',
        backgroundColor: '#facc1533',
        fill: false,
        tension: 0.1,
      }];
    }

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Очки', color: '#ffffff' },
            ticks: { color: '#ffffff' },
            grid: { color: '#4b5563' },
          },
          x: {
            title: { display: true, text: 'Броски', color: '#ffffff' },
            ticks: { color: '#ffffff' },
            grid: { color: '#4b5563' },
          },
        },
        plugins: {
          legend: { labels: { color: '#ffffff' } },
          tooltip: { backgroundColor: '#374151', titleColor: '#ffffff', bodyColor: '#ffffff' },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [throws, isMultiPlayer]);

  return (
    <div className={styles.graphContainer}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default PlayerScoreGraph;