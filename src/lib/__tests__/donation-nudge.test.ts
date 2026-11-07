import { describe, it, expect } from 'vitest';
import {
  EMPTY_NUDGE_STATE,
  NUDGE_DISMISS_MS,
  NUDGE_MIN_DAYS,
  NUDGE_MIN_USES,
  parseNudgeState,
  recordUse,
  shouldShowNudge,
  toDayKey,
  type NudgeState,
} from '../donation-nudge';

const DAY = 24 * 60 * 60 * 1000;
const START = new Date(2026, 10, 1, 12, 0, 0).getTime();

/** Records `uses` tool uses spread evenly over `days` local days. */
function useOver(uses: number, days: number): NudgeState {
  let state = EMPTY_NUDGE_STATE;
  for (let i = 0; i < uses; i++) {
    state = recordUse(state, START + (i % days) * DAY);
  }
  return state;
}

describe('recordUse', () => {
  it('사용 횟수와 서로 다른 날짜를 기록해야 함', () => {
    const state = useOver(4, 2);
    expect(state.uses).toBe(4);
    expect(state.days).toEqual([toDayKey(START), toDayKey(START + DAY)]);
  });

  it('날짜 목록은 필요한 일수까지만 저장해야 함', () => {
    expect(useOver(20, 10).days).toHaveLength(NUDGE_MIN_DAYS);
  });
});

describe('shouldShowNudge', () => {
  it('처음 온 사용자에게는 보여주지 않아야 함', () => {
    expect(shouldShowNudge(EMPTY_NUDGE_STATE, START)).toBe(false);
  });

  it('하루에 많이 써도 여러 날에 걸쳐 쓰지 않았으면 보여주지 않아야 함', () => {
    expect(shouldShowNudge(useOver(50, 1), START)).toBe(false);
  });

  it('여러 날에 걸쳐 썼어도 횟수가 적으면 보여주지 않아야 함', () => {
    expect(shouldShowNudge(useOver(NUDGE_MIN_USES - 1, NUDGE_MIN_DAYS), START)).toBe(false);
  });

  it('충분히 자주 쓴 사용자에게는 보여줘야 함', () => {
    expect(shouldShowNudge(useOver(NUDGE_MIN_USES, NUDGE_MIN_DAYS), START)).toBe(true);
  });

  it('닫은 뒤 일정 기간 동안은 보여주지 않아야 함', () => {
    const state = { ...useOver(NUDGE_MIN_USES, NUDGE_MIN_DAYS), dismissedAt: START };
    expect(shouldShowNudge(state, START + NUDGE_DISMISS_MS - 1)).toBe(false);
    expect(shouldShowNudge(state, START + NUDGE_DISMISS_MS)).toBe(true);
  });

  it('후원 링크를 누른 사용자에게는 다시 보여주지 않아야 함', () => {
    const state = { ...useOver(NUDGE_MIN_USES, NUDGE_MIN_DAYS), clickedAt: START };
    expect(shouldShowNudge(state, START + 365 * DAY)).toBe(false);
  });
});

describe('parseNudgeState', () => {
  it('저장된 값을 그대로 복원해야 함', () => {
    const state: NudgeState = { uses: 3, days: ['2026-11-01'], dismissedAt: 5 };
    expect(parseNudgeState(JSON.stringify(state))).toEqual({ ...state, clickedAt: undefined });
  });

  it('비어 있거나 깨진 값은 빈 상태로 처리해야 함', () => {
    expect(parseNudgeState(null)).toEqual(EMPTY_NUDGE_STATE);
    expect(parseNudgeState('not json')).toEqual(EMPTY_NUDGE_STATE);
    expect(parseNudgeState('null')).toEqual(EMPTY_NUDGE_STATE);
    expect(parseNudgeState('[1,2]').uses).toBe(0);
  });

  it('미래 시각으로 저장된 닫은 시각은 현재 시각으로 보정해야 함', () => {
    const raw = JSON.stringify({ uses: 1, days: [], dismissedAt: START + 365 * DAY });
    expect(parseNudgeState(raw, START).dismissedAt).toBe(START);
  });

  it('잘못된 필드는 무시해야 함', () => {
    expect(
      parseNudgeState(JSON.stringify({ uses: -4, days: ['a', 1, 'b'], dismissedAt: 'x' }))
    ).toEqual({ uses: 0, days: ['a', 'b'], dismissedAt: undefined, clickedAt: undefined });
  });
});
