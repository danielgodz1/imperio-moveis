import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await vite.transformIndexHtml(url, `
          <!doctype html>
          <html lang="pt-BR">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <link rel="icon" type="image/jpeg" href="https://instagram.fbau1-1.fna.fbcdn.net/v/t51.82787-19/881676383_18027770813870048_1008026097534673996_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=111&_nc_map=urlgen_bucketless&ig_cache_key=GF9QjTTg73N7KQxAAEyk4BtlOv0NbmNDAQAB1501500j-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=bYmoz-fD-60Q7kNvwHzGbxo&_nc_oc=Adp7wtGW7XFZEoX3MiRK6WIk1iMJl57gSivbvXCo5dipQuMb_JwFeW93tTLo-HQn14AcfMlh2pVmxaO40rjQ1qrL&_nc_zt=24&_nc_ht=instagram.fbau1-1.fna&_nc_gid=vbgtSlQvxHdbkAfyRDHUlg&_nc_ss=7b6a8&oh=00_AQTKbfEuZzYYl6BEyJOLw8m93xZc9td-yOU_Mt6_EL6hfQ&oe=6AF1CE87" />
              <link rel="apple-touch-icon" href="https://instagram.fbau1-1.fna.fbcdn.net/v/t51.82787-19/881676383_18027770813870048_1008026097534673996_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=111&_nc_map=urlgen_bucketless&ig_cache_key=GF9QjTTg73N7KQxAAEyk4BtlOv0NbmNDAQAB1501500j-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=bYmoz-fD-60Q7kNvwHzGbxo&_nc_oc=Adp7wtGW7XFZEoX3MiRK6WIk1iMJl57gSivbvXCo5dipQuMb_JwFeW93tTLo-HQn14AcfMlh2pVmxaO40rjQ1qrL&_nc_zt=24&_nc_ht=instagram.fbau1-1.fna&_nc_gid=vbgtSlQvxHdbkAfyRDHUlg&_nc_ss=7b6a8&oh=00_AQTKbfEuZzYYl6BEyJOLw8m93xZc9td-yOU_Mt6_EL6hfQ&oe=6AF1CE87" />
              <title>Império Móveis Planejados | Jaú - SP</title>
              <link rel="preconnect" href="https://fonts.googleapis.com" />
              <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
              <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet" />
            </head>
            <body class="bg-[#fef8f4] text-[#1d1b19] antialiased">
              <div id="root"></div>
              <script type="module" src="/src/main.tsx"></script>
            </body>
          </html>
        `);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Império Móveis Planejados Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
