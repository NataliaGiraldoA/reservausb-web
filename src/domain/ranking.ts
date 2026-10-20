import { INDEX_WEIGHTS, MAX_GRADE } from './constants';
import type { Ranking, RankedStudent, Student } from './types';

export interface Contribution {
  readonly key: 'points' | 'grade' | 'hours';
  readonly label: string;
  /** Peso de la métrica en el índice (0 a 1). */
  readonly weight: number;
  /** Valor relativo de la métrica (0 a 1). */
  readonly ratio: number;
  /** Puntos del índice que aporta (0 a 100 × peso). */
  readonly value: number;
}

/**
 * Índice = 30 × (puntos ÷ puntos del que más tiene) + 35 × (promedio ÷ 5,0) + 35 × (horas ÷ horas del que más tiene).
 * Va de 0 a 100.
 */
export function computeIndex(pointsRatio: number, gradeRatio: number, hoursRatio: number): number {
  return (
    100 *
    (INDEX_WEIGHTS.points * pointsRatio +
      INDEX_WEIGHTS.grade * gradeRatio +
      INDEX_WEIGHTS.hours * hoursRatio)
  );
}

/** Calcula el índice de cada estudiante. Solo quienes registraron promedio entran al top. */
export function buildRanking(students: readonly Student[]): Ranking {
  const maxPoints = Math.max(1, ...students.map((s) => s.points));
  const maxHours = Math.max(1, ...students.map((s) => s.hours));

  const scored = students.map((s) => {
    const pointsRatio = s.points / maxPoints;
    const hoursRatio = s.hours / maxHours;
    const gradeRatio = s.grade === null ? 0 : s.grade / MAX_GRADE;
    return {
      ...s,
      pointsRatio,
      gradeRatio,
      hoursRatio,
      index: computeIndex(pointsRatio, gradeRatio, hoursRatio),
    };
  });

  const ordered = scored
    .filter((s) => s.grade !== null)
    .sort((a, b) => b.index - a.index || a.name.localeCompare(b.name, 'es'));

  const positions = new Map<string, number>(ordered.map((s, i) => [s.name, i + 1]));
  const all: RankedStudent[] = scored.map((s) => ({
    ...s,
    position: positions.get(s.name) ?? null,
  }));
  const ranked = all
    .filter((s): s is RankedStudent & { position: number } => s.position !== null)
    .sort((a, b) => a.position - b.position);

  return { all, ranked, maxPoints, maxHours };
}

/** Cuánto aporta cada métrica al índice del estudiante. */
export function contributions(student: RankedStudent): Contribution[] {
  const part = (
    key: Contribution['key'],
    label: string,
    weight: number,
    ratio: number,
  ): Contribution => ({ key, label, weight, ratio, value: ratio * weight * 100 });
  return [
    part('points', 'Puntos', INDEX_WEIGHTS.points, student.pointsRatio),
    part('grade', 'Promedio', INDEX_WEIGHTS.grade, student.gradeRatio),
    part('hours', 'Horas de uso', INDEX_WEIGHTS.hours, student.hoursRatio),
  ];
}
