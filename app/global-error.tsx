'use client';
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <html>
      <body>
        <div>500 Internal Server Error</div>
      </body>
    </html>
  );
}
