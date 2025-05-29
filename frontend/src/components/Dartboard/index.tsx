import React, { useRef, useEffect } from 'react';
// import styles from './styles.module.css';
import { getDartboardConfig } from './DartboardConfig';

interface DartboardProps {
    onThrow: (x: number, y: number) => void;
    hits: Array<{ x: number; y: number } | undefined>;
    width?: number; // Опционально для кастомного размера
    height?: number;
}

const Dartboard: React.FC<DartboardProps> = ({ onThrow, hits, width = 452, height = 452 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const config = getDartboardConfig(width, height);
    const { sectors, centerX, centerY, radius, bullseyeRadius, outerBullRadius, doubleRadius, tripleRadius, tripleWidth, doubleWidth, anglePerSector, rotationOffset } = config;
    const green = '#59f391';
    const red = '#ff6d4a';
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const drawDartboard = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius + radius * 0.15, 0, Math.PI * 2); // Рамка 15% от радиуса
            ctx.fillStyle = '#333';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fillStyle = '#000';
            ctx.fill();

            for (let i = 0; i < 20; i++) {
                const startAngle = i * anglePerSector + rotationOffset;
                const endAngle = (i + 1) * anglePerSector + rotationOffset;

                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, startAngle, endAngle);
                ctx.fillStyle = i % 2 === 0 ? '#000' : '#fff';
                ctx.fill();

                ctx.beginPath();
                ctx.arc(centerX, centerY, tripleRadius, startAngle, endAngle);
                ctx.arc(centerX, centerY, tripleRadius - tripleWidth, endAngle, startAngle, true);
                ctx.fillStyle = i % 2 === 0 ? red : green;
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, tripleRadius - tripleWidth, startAngle, endAngle);
                ctx.fillStyle = i % 2 === 0 ? '#000' : '#fff';
                ctx.fill();

                ctx.beginPath();
                ctx.arc(centerX, centerY, doubleRadius, startAngle, endAngle);
                ctx.arc(centerX, centerY, doubleRadius - doubleWidth, endAngle, startAngle, true);
                ctx.fillStyle = i % 2 === 0 ? red : green;
                ctx.fill();
            }

            ctx.beginPath();
            ctx.arc(centerX, centerY, outerBullRadius, 0, Math.PI * 2);
            ctx.fillStyle = green;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(centerX, centerY, bullseyeRadius, 0, Math.PI * 2);
            ctx.fillStyle = red;
            ctx.fill();

            // ctx.strokeStyle = '#666';
            // ctx.lineWidth = radius * 0.01; // Линии масштабируются
            // for (let i = 0; i < 20; i++) {
            //     const angle = i * anglePerSector + rotationOffset;
            //     ctx.beginPath();
            //     ctx.moveTo(centerX, centerY);
            //     ctx.lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
            //     ctx.stroke();
            // }

            ctx.font = `lighter ${radius * 0.09}px SF Pro`; // Шрифт 9% от радиуса
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (let i = 0; i < 20; i++) {
                const angle = i * anglePerSector + rotationOffset + (anglePerSector / 2);
                const x = centerX + (radius + radius * 0.075) * Math.cos(angle); // Цифры на 7.5% дальше радиуса
                const y = centerY + (radius + radius * 0.075) * Math.sin(angle);
                ctx.fillText(sectors[i].toString(), x, y);
            }

            for (const hit of hits) {
              
                if (hit) {
                    ctx.beginPath();
                    ctx.arc(hit.x, hit.y, radius * 0.025, 0, Math.PI * 2); // Точки масштабируются
                    ctx.fillStyle = '#ff4444';
                    ctx.fill();
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = radius * 0.005;
                    ctx.stroke();
                }
            }
        };

        drawDartboard();
    }, [hits, width, height]);

    const handleCanvasClick = (event: React.PointerEvent<HTMLCanvasElement>) => {
        const x = event.nativeEvent.offsetX;
        const y = event.nativeEvent.offsetY;
        console.log('Canvas click:', { x, y })
        onThrow(x, y);

    };

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            // className={styles.dartboard}
            onPointerDown={handleCanvasClick}
        />
    );
};

export default Dartboard;