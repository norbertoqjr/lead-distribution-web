import { ImageResponse } from 'next/og';

export const alt =
  'Lead Distribution Platform: route every lead to the right broker';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Social card, rendered at build time by next/og rather than shipped as a
 * binary asset. Colours come from docs/dashboard-design.json.
 *
 * satori (which powers ImageResponse) supports a subset of CSS: flexbox only,
 * no CSS variables, no shorthand gaps on grid. Hence the literal hex values.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(145deg, #062D1D 0%, #0B4A2E 55%, #176B45 100%)',
          padding: 80,
          color: '#FFFFFF',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <svg width="56" height="56" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="rgba(255,255,255,0.14)" />
            <g
              stroke="#FFFFFF"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            >
              <circle cx="10" cy="23" r="3" />
              <circle cx="22" cy="9" r="3" />
              <path d="M13 23h4a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h4" />
            </g>
          </svg>
          <span
            style={{
              marginLeft: 20,
              fontSize: 30,
              fontWeight: 600,
              letterSpacing: -0.5,
            }}
          >
            Lead Distribution Platform
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: 74,
              fontWeight: 600,
              letterSpacing: -2.5,
              lineHeight: 1.05,
            }}
          >
            Route every lead to
          </span>
          <span
            style={{
              fontSize: 74,
              fontWeight: 600,
              letterSpacing: -2.5,
              lineHeight: 1.05,
            }}
          >
            the right broker.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          {['Percentage share', 'Timezone aware', 'No duplicates'].map(
            (label) => (
              <span
                key={label}
                style={{
                  display: 'flex',
                  marginRight: 14,
                  padding: '10px 22px',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  fontSize: 24,
                  color: '#D7E8DE',
                }}
              >
                {label}
              </span>
            ),
          )}
        </div>
      </div>
    ),
    size,
  );
}
