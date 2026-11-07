import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import {
  DEFAULT_EDITOR_FONT_SIZE,
  EDITOR_FONT_SIZE_KEY,
  MAX_EDITOR_FONT_SIZE,
  MIN_EDITOR_FONT_SIZE,
  changeEditorFontSize,
  clampFontSize,
  getEditorFontSize,
  parseFontSize,
  resetEditorFontSize,
  subscribeEditorFontSize,
} from '../editor-font-size';

describe('clampFontSize', () => {
  it('범위 안의 값은 반올림해서 그대로 써야 함', () => {
    expect(clampFontSize(16)).toBe(16);
    expect(clampFontSize(15.6)).toBe(16);
  });

  it('범위를 벗어난 값은 최소/최대로 맞춰야 함', () => {
    expect(clampFontSize(2)).toBe(MIN_EDITOR_FONT_SIZE);
    expect(clampFontSize(99)).toBe(MAX_EDITOR_FONT_SIZE);
  });

  it('숫자가 아니면 기본값이어야 함', () => {
    expect(clampFontSize(NaN)).toBe(DEFAULT_EDITOR_FONT_SIZE);
    expect(clampFontSize(Infinity)).toBe(DEFAULT_EDITOR_FONT_SIZE);
  });
});

describe('parseFontSize', () => {
  it('저장된 값을 복원해야 함', () => {
    expect(parseFontSize('18')).toBe(18);
  });

  it('비어 있거나 깨진 값은 기본값이어야 함', () => {
    expect(parseFontSize(null)).toBe(DEFAULT_EDITOR_FONT_SIZE);
    expect(parseFontSize('')).toBe(DEFAULT_EDITOR_FONT_SIZE);
    expect(parseFontSize('big')).toBe(DEFAULT_EDITOR_FONT_SIZE);
  });

  it('범위를 벗어난 저장값은 범위 안으로 맞춰야 함', () => {
    expect(parseFontSize('100')).toBe(MAX_EDITOR_FONT_SIZE);
  });
});

describe('글자 크기 변경', () => {
  let store: Map<string, string>;
  let events: string[];
  let listeners: Map<string, (event: Event) => void>;

  function stubWindow(storageThrows = false) {
    store = new Map();
    events = [];
    listeners = new Map();
    const fail = () => {
      throw new Error('blocked');
    };
    vi.stubGlobal('window', {
      localStorage: {
        getItem: storageThrows ? fail : (key: string) => store.get(key) ?? null,
        setItem: storageThrows ? fail : (key: string, value: string) => store.set(key, value),
        removeItem: storageThrows ? fail : (key: string) => store.delete(key),
      },
      dispatchEvent: (event: Event) => events.push(event.type),
      addEventListener: (type: string, fn: (event: Event) => void) => listeners.set(type, fn),
      removeEventListener: (type: string) => listeners.delete(type),
    });
  }

  beforeEach(() => {
    stubWindow();
    resetEditorFontSize();
    events = [];
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('키우고 줄인 값을 저장하고 변경 이벤트를 보내야 함', () => {
    changeEditorFontSize(2);
    expect(getEditorFontSize()).toBe(DEFAULT_EDITOR_FONT_SIZE + 2);
    expect(store.get(EDITOR_FONT_SIZE_KEY)).toBe(String(DEFAULT_EDITOR_FONT_SIZE + 2));
    expect(events).toHaveLength(1);

    changeEditorFontSize(-1);
    expect(getEditorFontSize()).toBe(DEFAULT_EDITOR_FONT_SIZE + 1);
  });

  it('최대값에서는 더 키우지 않고 바뀌지 않았다고 알려야 함', () => {
    expect(changeEditorFontSize(100)).toBe(true);
    expect(changeEditorFontSize(1)).toBe(false);
    expect(getEditorFontSize()).toBe(MAX_EDITOR_FONT_SIZE);
  });

  it('이미 기본값이면 초기화해도 바뀌지 않았다고 알려야 함', () => {
    expect(resetEditorFontSize()).toBe(false);
    expect(events).toHaveLength(0);
  });

  it('다른 탭에서 바꾼 값을 반영해야 함', () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeEditorFontSize(onChange);
    store.set(EDITOR_FONT_SIZE_KEY, '20');
    listeners.get('storage')!({ key: EDITOR_FONT_SIZE_KEY } as StorageEvent);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(getEditorFontSize()).toBe(20);
    unsubscribe();
    expect(listeners.size).toBe(0);
  });

  it('기본값으로 되돌리면 저장값을 지워야 함', () => {
    changeEditorFontSize(3);
    resetEditorFontSize();
    expect(store.has(EDITOR_FONT_SIZE_KEY)).toBe(false);
    expect(getEditorFontSize()).toBe(DEFAULT_EDITOR_FONT_SIZE);
  });

  it('저장소가 막혀 있어도 이번 페이지에서는 바뀐 값을 써야 함', () => {
    stubWindow(true);
    changeEditorFontSize(2);
    expect(getEditorFontSize()).toBe(DEFAULT_EDITOR_FONT_SIZE + 2);
    expect(events).toHaveLength(1);
  });
});
