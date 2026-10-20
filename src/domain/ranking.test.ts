import { buildRanking, computeIndex, contributions } from './ranking';
import { OTHER_STUDENTS, USERS } from './constants';
import type { Student } from './types';

const demoStudents = (): Student[] => [
  ...OTHER_STUDENTS,
  { name: USERS.val.name, points: 30, grade: 4.2, hours: 12, userId: 'val' },
  { name: USERS.lau.name, points: 0, grade: null, hours: 6, userId: 'lau' },
];

describe('computeIndex', () => {
  it('matches the example from the spec: 50/60 pts, 4.2, 13/22 h → 75.1', () => {
    const index = computeIndex(50 / 60, 4.2 / 5, 13 / 22);
    expect(Math.round(index * 10) / 10).toBe(75.1);
  });

  it('goes from 0 to 100', () => {
    expect(computeIndex(0, 0, 0)).toBe(0);
    expect(computeIndex(1, 1, 1)).toBeCloseTo(100);
  });
});

describe('buildRanking', () => {
  it('excludes students without grade from the top but keeps them in `all`', () => {
    const ranking = buildRanking(demoStudents());
    expect(ranking.all).toHaveLength(10);
    expect(ranking.ranked).toHaveLength(9);
    const laura = ranking.all.find((s) => s.userId === 'lau')!;
    expect(laura.position).toBeNull();
    expect(ranking.ranked.some((s) => s.userId === 'lau')).toBe(false);
  });

  it('normalises by the highest points and hours, including students outside the top', () => {
    const ranking = buildRanking(demoStudents());
    expect(ranking.maxPoints).toBe(60);
    expect(ranking.maxHours).toBe(22);
  });

  it('orders by index, descending, with consecutive positions', () => {
    const { ranked } = buildRanking(demoStudents());
    ranked.forEach((s, i) => expect(s.position).toBe(i + 1));
    for (let i = 1; i < ranked.length; i += 1) {
      expect(ranked[i - 1]!.index).toBeGreaterThanOrEqual(ranked[i]!.index);
    }
  });

  it('puts Valentina in the top with a plausible index', () => {
    const val = buildRanking(demoStudents()).ranked.find((s) => s.userId === 'val')!;
    // 30·(30/60) + 35·(4.2/5) + 35·(12/22) = 15 + 29.4 + 19.09
    expect(val.index).toBeCloseTo(63.49, 1);
  });

  it('moves Laura into the top once she registers a grade', () => {
    const students = demoStudents().map((s) => (s.userId === 'lau' ? { ...s, grade: 4.5 } : s));
    const laura = buildRanking(students).ranked.find((s) => s.userId === 'lau');
    expect(laura).toBeDefined();
  });

  it('does not divide by zero when nobody has points or hours', () => {
    const ranking = buildRanking([{ name: 'A', points: 0, grade: 3, hours: 0, userId: null }]);
    expect(ranking.ranked[0]?.index).toBeCloseTo(21);
  });
});

describe('contributions', () => {
  it('adds up to the index', () => {
    const val = buildRanking(demoStudents()).ranked.find((s) => s.userId === 'val')!;
    const total = contributions(val).reduce((sum, c) => sum + c.value, 0);
    expect(total).toBeCloseTo(val.index);
  });
});
