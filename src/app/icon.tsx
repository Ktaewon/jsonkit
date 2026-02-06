import { ImageResponse } from 'next/og';

export const contentType = 'image/png';
export const sizes = [16, 32, 48, 64, 128, 192, 256, 512];

export default function Icon({ size = 32 }: { size?: number }) {
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
        fontSize: Math.round(size * 0.68),
        fontWeight: 800,
        lineHeight: 1,
        letterSpacing: '-0.04em',
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
      }}
    >
      {'{}'}
    </div>,
    {
      width: size,
      height: size,
    }
  );
}
