# Prof. Tariq Mansoor — Official Portfolio & Dynamic CMS (Portainer Docker Stack)

## Complete Repository Structure Included in This ZIP
- `public/index.html` — Full production frontend with all 7 website themes (including the 3 exact screenshot themes: `tariqmansoor.com`, `nitingadkari.org.in`, and `jagatprakashnadda.in`), embedded high-resolution photos, Three.js 3D background, GSAP scroll animations, CV & Profile Multi-Design PDF Studio, and Admin Control Panel.
- `server.js` — Node.js + Express production server with:
  - **`GET /`** (`https://tariqmansoor.com/` or `https://test.tariqmansoor.com/`): Public visitor view. **All Admin buttons, Control Panel buttons, and Theme Switcher buttons are completely hidden from normal visitors.** Visitors only see the active theme published by the Admin.
  - **`GET /admin`** (`https://tariqmansoor.com/admin` or `https://test.tariqmansoor.com/admin`): Dedicated Admin route. Automatically opens the Admin Password Login screen (`ADMIN_PASSWORD`) and unlocks the Admin Control Panel & Theme Switcher Toolbar.
  - **`GET /api/state` & `POST /api/state`**: Server-side JSON persistence in Docker volume `tariq_cms_data:/app/data/site_state.json` so any theme or content change published by the Admin is immediately live for all visitors.
- `docker-compose.yml` — Ready for Portainer Stacks deployment from GitHub.
- `Dockerfile` — Production Node 20 Alpine container image.
- `package.json` — Dependencies (`express`).
- `.env.example` — Environment variables template (`HOST_PORT`, `ADMIN_PASSWORD`, `DOMAIN`).

## Deploying via Portainer Stack (GitHub Repository)
1. Push all files in this repository to your GitHub repository.
2. In Portainer -> **Stacks** -> **Add Stack** -> **Repository**, enter your GitHub repository URL and set Compose path to `docker-compose.yml`.
3. Add Environment Variables in Portainer:
   - `HOST_PORT=3080` (or any free port on host; default is 3080 to prevent port 3000 conflicts)
   - `DOMAIN=test.tariqmansoor.com` (or `tariqmansoor.com`)
   - `ADMIN_PASSWORD=YourStrongSecretPassword`
4. Deploy the stack:
   - Public Website: `https://test.tariqmansoor.com/`
   - Admin Control Panel: `https://test.tariqmansoor.com/admin`
