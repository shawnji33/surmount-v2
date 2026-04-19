import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#fcfcfc" />
        <title>Surmount</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <ScrollViewStyleReset />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; }
          html, body { height: 100%; margin: 0; padding: 0; }
          * { letter-spacing: -0.5px; }

          /* ── Mobile: plain white canvas ── */
          html, body, #root { background-color: #fcfcfc; }
          #root { height: 100%; }

          /* ── Desktop: iPhone 17 Pro frame ── */
          @media (min-width: 500px) {
            body {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background: #e8e8ea;
              padding: 40px 0;
            }

            .iphone-frame {
              position: relative;
              width: 430px;
              height: 932px;
              border-radius: 54px;
              background: linear-gradient(160deg, #d0d0d2 0%, #b8b8ba 40%, #a8a8aa 100%);
              box-shadow:
                0 0 0 1px rgba(0,0,0,0.10),
                inset 0 0 0 1px rgba(255,255,255,0.40),
                0 32px 80px rgba(0,0,0,0.18),
                0 8px 24px rgba(0,0,0,0.10);
              flex-shrink: 0;
            }

            /* Titanium band highlight */
            .iphone-frame::before {
              content: '';
              position: absolute;
              inset: 0;
              border-radius: 54px;
              background: linear-gradient(
                135deg,
                rgba(255,255,255,0.55) 0%,
                rgba(255,255,255,0.10) 35%,
                transparent 60%,
                rgba(255,255,255,0.15) 100%
              );
              pointer-events: none;
              z-index: 10;
            }

            /* Screen inset */
            .iphone-screen {
              position: absolute;
              top: 12px;
              left: 12px;
              right: 12px;
              bottom: 12px;
              border-radius: 44px;
              overflow: hidden;
              background: #fcfcfc;
            }

            /* Dynamic Island */
            .dynamic-island {
              position: absolute;
              top: 14px;
              left: 50%;
              transform: translateX(-50%);
              width: 126px;
              height: 37px;
              background: #000;
              border-radius: 20px;
              z-index: 9999;
              box-shadow: 0 0 0 1px rgba(255,255,255,0.04);
            }

            /* #root fills the screen inset */
            #root {
              position: absolute;
              inset: 0;
              height: 100%;
              overflow: hidden;
            }

            /* Side buttons */
            .btn-action {
              position: absolute;
              left: -3px;
              top: 156px;
              width: 4px;
              height: 36px;
              background: linear-gradient(180deg, #c0c0c2 0%, #a8a8aa 100%);
              border-radius: 2px 0 0 2px;
              box-shadow: -2px 0 4px rgba(0,0,0,0.5);
            }
            .btn-vol-up {
              position: absolute;
              left: -3px;
              top: 218px;
              width: 4px;
              height: 64px;
              background: linear-gradient(180deg, #c0c0c2 0%, #a8a8aa 100%);
              border-radius: 2px 0 0 2px;
              box-shadow: -2px 0 4px rgba(0,0,0,0.5);
            }
            .btn-vol-down {
              position: absolute;
              left: -3px;
              top: 294px;
              width: 4px;
              height: 64px;
              background: linear-gradient(180deg, #c0c0c2 0%, #a8a8aa 100%);
              border-radius: 2px 0 0 2px;
              box-shadow: -2px 0 4px rgba(0,0,0,0.5);
            }
            .btn-side {
              position: absolute;
              right: -3px;
              top: 240px;
              width: 4px;
              height: 84px;
              background: linear-gradient(180deg, #c0c0c2 0%, #a8a8aa 100%);
              border-radius: 0 2px 2px 0;
              box-shadow: 2px 0 4px rgba(0,0,0,0.5);
            }
          }
        `}</style>
      </head>
      <body>
        <div className="iphone-frame">
          <div className="btn-action" />
          <div className="btn-vol-up" />
          <div className="btn-vol-down" />
          <div className="btn-side" />
          <div className="iphone-screen">
            <div className="dynamic-island" />
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
