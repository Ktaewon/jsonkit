import { ImageResponse } from 'next/og';

export const contentType = 'image/png';
export const size = { width: 180, height: 180 };

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        color: '#111827',
        fontSize: 120,
        fontWeight: 800,
        lineHeight: 1,
        letterSpacing: '-0.04em',
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
      }}
    >
      {'{}'}
    </div>,
    size
  );
}
