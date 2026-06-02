export const qrPausedTemplate = () => {
    return  (
        `
        <html>
          <head>
            <title>Campaign Paused - QR Junction</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { background-color: #0b0f19; color: #f8f9fa; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              .card { background-color: #111827; border: 1px solid #1f2937; padding: 2.5rem; border-radius: 1rem; text-align: center; max-width: 400px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              h1 { color: #f72585; font-size: 1.5rem; margin-bottom: 1rem; }
              p { color: #9ca3af; font-size: 0.95rem; line-height: 1.5; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Campaign Paused</h1>
              <p>This QR code campaign is temporarily paused by the owner. Please try scanning again later.</p>
            </div>
          </body>
        </html>
        `
    )
}

export const qrTextTemplate = (text: string) => {
  return (
    `
    <html>
      <head>
        <title>Text Message - QR Junction</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { background-color: #0b0f19; color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 1rem; box-sizing: border-box; }
          .card { background-color: #111827; border: 1px solid #1f2937; padding: 2rem; border-radius: 1rem; width: 100%; max-width: 500px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3); box-sizing: border-box; }
          h1 { color: #4361ee; font-size: 1.25rem; margin-top: 0; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: bold; border-bottom: 1px solid #1f2937; padding-bottom: 0.75rem; }
          .content { color: #f3f4f6; font-size: 1.05rem; line-height: 1.6; white-space: pre-wrap; word-break: break-word; background: #070a13; padding: 1rem; border-radius: 0.5rem; border: 1px solid #1f2937; }
          .footer { text-align: center; margin-top: 1.5rem; font-size: 0.8rem; color: #4b5563; }
          .footer a { color: #4361ee; text-decoration: none; font-weight: 500; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>QR Scanned Message</h1>
          <div class="content">${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          <div class="footer">Powered by <a href="https://qrjunction.in">QR Junction</a></div>
        </div>
      </body>
    </html>
    `
  );
};