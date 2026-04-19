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
          html, body, #root { height: 100%; margin: 0; padding: 0; background-color: #fcfcfc; }
          @media (min-width: 480px) {
            body { display: flex; justify-content: center; background-color: #e9e9eb; }
            #root { width: 390px; max-height: 100vh; overflow: hidden; box-shadow: 0 0 0 1px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.12); border-radius: 40px; position: relative; }
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
