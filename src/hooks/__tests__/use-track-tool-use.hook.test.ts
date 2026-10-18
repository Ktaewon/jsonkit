// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { ToolEventParams } from '@/lib/analytics';
import { clearToolSwitch, isToolSwitch, useTrackToolUse } from '../use-track-tool-use';

vi.mock('@/lib/analytics', () => ({ trackToolUse: vi.fn() }));
const { trackToolUse } = vi.mocked(await import('@/lib/analytics'));

const DEBOUNCE_MS = 1500;
const SWITCH_TTL_MS = 20_000;

type Props = { trigger: string; event: ToolEventParams | null; switchId?: string };

const yamlEvent: ToolEventParams = {
  tool: 'convert',
  action: 'convert',
  result: 'success',
  from_format: 'json',
  to_format: 'yaml',
  size_bucket: 'lt_1kb',
};
const xmlEvent: ToolEventParams = { ...yamlEvent, to_format: 'xml' };

function renderTracker(initialProps: Props) {
  return renderHook(
    ({ trigger, event, switchId }: Props) => useTrackToolUse(trigger, event, switchId),
    { initialProps }
  );
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

describe('useTrackToolUse', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    trackToolUse.mockClear();
    // Markers live in a module-level map, so don't let one test's leftovers leak into the next.
    clearToolSwitch('convert:json-to-yaml');
    clearToolSwitch('convert:json-to-xml');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('그냥 마운트만 하면 이벤트를 보내지 않아야 함', () => {
    renderTracker({ trigger: 'a|{}', event: yamlEvent, switchId: 'convert:json-to-yaml' });
    advance(DEBOUNCE_MS * 3);
    expect(trackToolUse).not.toHaveBeenCalled();
  });

  it('입력을 바꾸면 디바운스 후 한 번만 보내야 함', () => {
    const { rerender } = renderTracker({ trigger: 'a', event: yamlEvent });
    rerender({ trigger: 'ab', event: yamlEvent });
    advance(DEBOUNCE_MS - 1);
    expect(trackToolUse).not.toHaveBeenCalled();
    rerender({ trigger: 'abc', event: yamlEvent });
    advance(DEBOUNCE_MS);
    expect(trackToolUse).toHaveBeenCalledTimes(1);
    expect(trackToolUse).toHaveBeenCalledWith(yamlEvent);
  });

  it('사용자 전환으로 들어온 인스턴스는 정확히 한 번 보내고, 나간 인스턴스는 조용해야 함', () => {
    const outgoing = renderTracker({
      trigger: 'yaml|{}',
      event: yamlEvent,
      switchId: 'convert:json-to-yaml',
    });
    act(() => outgoing.result.current('convert:json-to-xml'));
    // The outgoing page's own state change before it unmounts must not be tracked.
    outgoing.rerender({ trigger: 'xml|{}', event: xmlEvent, switchId: 'convert:json-to-yaml' });

    const incoming = renderTracker({
      trigger: 'xml|{}',
      event: xmlEvent,
      switchId: 'convert:json-to-xml',
    });
    expect(isToolSwitch('convert:json-to-xml')).toBe(false);
    advance(DEBOUNCE_MS);
    outgoing.unmount();

    expect(trackToolUse).toHaveBeenCalledTimes(1);
    expect(trackToolUse).toHaveBeenCalledWith(xmlEvent);

    // A later remount of the same page (e.g. reload) is not a switch anymore.
    incoming.unmount();
    renderTracker({ trigger: 'xml|{}', event: xmlEvent, switchId: 'convert:json-to-xml' });
    advance(DEBOUNCE_MS * 3);
    expect(trackToolUse).toHaveBeenCalledTimes(1);
  });

  it('전환 후 같은 결과로 편집해도 이벤트는 하나만 남아야 함', () => {
    const outgoing = renderTracker({
      trigger: 'yaml|{}',
      event: yamlEvent,
      switchId: 'convert:json-to-yaml',
    });
    act(() => outgoing.result.current('convert:json-to-xml'));
    outgoing.unmount();

    const incoming = renderTracker({
      trigger: 'xml|{}',
      event: xmlEvent,
      switchId: 'convert:json-to-xml',
    });
    advance(DEBOUNCE_MS);
    incoming.rerender({ trigger: 'xml|{"a":1}', event: xmlEvent, switchId: 'convert:json-to-xml' });
    advance(DEBOUNCE_MS * 3);
    expect(trackToolUse).toHaveBeenCalledTimes(1);
  });

  it('전환이 커밋되지 않으면 TTL 이후 다시 추적해야 함', () => {
    const { result, rerender } = renderTracker({
      trigger: 'a',
      event: yamlEvent,
      switchId: 'convert:json-to-yaml',
    });
    act(() => result.current('convert:json-to-xml'));
    rerender({ trigger: 'ab', event: yamlEvent, switchId: 'convert:json-to-yaml' });
    advance(DEBOUNCE_MS * 3);
    expect(trackToolUse).not.toHaveBeenCalled();

    advance(SWITCH_TTL_MS);
    rerender({ trigger: 'abc', event: yamlEvent, switchId: 'convert:json-to-yaml' });
    advance(DEBOUNCE_MS);
    expect(trackToolUse).toHaveBeenCalledTimes(1);
  });

  it('TTL이 지난 전환 표시로 마운트되면 전환으로 보지 않아야 함', () => {
    const outgoing = renderTracker({
      trigger: 'yaml',
      event: yamlEvent,
      switchId: 'convert:json-to-yaml',
    });
    act(() => outgoing.result.current('convert:json-to-xml'));
    advance(SWITCH_TTL_MS + 1);
    renderTracker({ trigger: 'xml', event: xmlEvent, switchId: 'convert:json-to-xml' });
    advance(DEBOUNCE_MS * 3);
    expect(trackToolUse).not.toHaveBeenCalled();
  });

  it('event가 null이면 보내지 않아야 함', () => {
    const { rerender } = renderTracker({ trigger: 'a', event: null });
    rerender({ trigger: 'ab', event: null });
    advance(DEBOUNCE_MS * 3);
    expect(trackToolUse).not.toHaveBeenCalled();
  });

  it('사용자 입력 내용은 이벤트 파라미터에 담기지 않아야 함', () => {
    const secret = '{"password":"hunter2-secret"}';
    const { rerender } = renderTracker({ trigger: 'yaml|', event: yamlEvent });
    rerender({ trigger: `yaml|${secret}`, event: yamlEvent });
    advance(DEBOUNCE_MS);
    expect(trackToolUse).toHaveBeenCalledTimes(1);
    const serialized = JSON.stringify(trackToolUse.mock.calls);
    expect(serialized).not.toContain('hunter2');
    expect(serialized).not.toContain('password');
  });
});
