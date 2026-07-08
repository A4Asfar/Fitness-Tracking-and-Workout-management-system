import { ReactNode } from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body, #root { height: 100%; margin: 0; }
              body { background-color: #F8FAFC; overflow: auto; }
              #root { display: flex; flex: 1; min-height: 100%; }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
