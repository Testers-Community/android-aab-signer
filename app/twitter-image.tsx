import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'AAB Signer - Sign Android App Bundles Online Free';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #09090b 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        {/* Grid pattern overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 1px 1px, #27272a 1px, transparent 0)',
            backgroundSize: '32px 32px',
            opacity: 0.4,
          }}
        />

        {/* Radial glow effect */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 800,
            height: 800,
            background: 'radial-gradient(circle, rgba(132, 204, 22, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            padding: '0 60px',
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              background: 'rgba(132, 204, 22, 0.1)',
              border: '1px solid rgba(132, 204, 22, 0.3)',
              borderRadius: 9999,
              marginBottom: 32,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                background: '#84cc16',
                borderRadius: '50%',
              }}
            />
            <span style={{ color: '#84cc16', fontSize: 18, fontWeight: 500 }}>
              100% Free & Open Source
            </span>
          </div>

          {/* Main headline */}
          <h1
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: 'white',
              textAlign: 'center',
              margin: 0,
              marginBottom: 8,
              lineHeight: 1.1,
            }}
          >
            Sign Your Android App Bundle
          </h1>

          {/* Gradient text */}
          <span
            style={{
              fontSize: 64,
              fontWeight: 700,
              background: 'linear-gradient(90deg, #84cc16, #a3e635)',
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: 40,
            }}
          >
            in Seconds
          </span>

          {/* Feature badges */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              marginBottom: 48,
            }}
          >
            {['No Sign-up', 'Keys Stay Private', 'GitHub Powered'].map((text) => (
              <div
                key={text}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 20px',
                  background: 'rgba(39, 39, 42, 0.8)',
                  border: '1px solid rgba(63, 63, 70, 0.8)',
                  borderRadius: 9999,
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#84cc16"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                <span style={{ color: '#d4d4d8', fontSize: 16 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <span style={{ color: '#52525b', fontSize: 20 }}>
            aab.testerscommunity.com
          </span>
          <span style={{ color: '#3f3f46', fontSize: 20 }}>|</span>
          <span style={{ color: '#52525b', fontSize: 20 }}>
            by Testers Community
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
