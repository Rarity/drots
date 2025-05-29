export const getDartboardConfig = (width: number, height: number) => {
  const minDimension = Math.min(width, height);
  const radius = minDimension * 0.4; // 40% от минимального размера
  return {
      sectors: [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5],
      centerX: width / 2,
      centerY: height / 2,
      radius,
      bullseyeRadius: radius * 0.06, // 6% от радиуса
      outerBullRadius: radius * 0.12, // 12% от радиуса
      doubleRadius: radius,
      tripleRadius: radius * 0.60, // 60% от радиуса
      tripleWidth: radius * 0.075, // 7.5% от радиуса
      doubleWidth: radius * 0.075, // 7.5% от радиуса
      anglePerSector: (Math.PI * 2) / 20,
      rotationOffset: -Math.PI / 2 - ((Math.PI * 2) / 20) / 2,
  };
};