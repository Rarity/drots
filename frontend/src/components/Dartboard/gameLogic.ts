import { getDartboardConfig } from './DartboardConfig';
import { Modifier } from '../../constants';

type ScoreResult = {
    score: number;
    modifier: Modifier;
    coords: { x: number; y: number };
};


export const getScore = (x: number, y: number, width: number, height: number): ScoreResult => {
    const { sectors, centerX, centerY, radius, bullseyeRadius, outerBullRadius, tripleRadius, tripleWidth, doubleRadius, doubleWidth, anglePerSector, rotationOffset } = getDartboardConfig(width, height);

    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    let baseScore = 0;

    if (distance <= bullseyeRadius) return { score: 50, modifier: '50', coords: { x, y } };
    if (distance <= outerBullRadius) return { score: 25, modifier: '25', coords: { x, y } };
    if (distance > radius) return { score: 0, modifier: '', coords: { x, y } };

    const angle = Math.atan2(dy, dx);
    const normalizedAngle = (angle + Math.PI * 2 - rotationOffset) % (Math.PI * 2);
    const sectorIndex = Math.floor(normalizedAngle / anglePerSector);
    baseScore = sectors[sectorIndex];

    if (distance >= tripleRadius - tripleWidth && distance <= tripleRadius) {
        return { score: baseScore, modifier: 'x3', coords: { x, y } };
    }
    if (distance >= doubleRadius - doubleWidth && distance <= doubleRadius) {
        return { score: baseScore, modifier: 'x2', coords: { x, y } };
    }

    return { score: baseScore, modifier: '', coords: { x, y} };
};