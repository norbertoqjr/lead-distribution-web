# Lead Distribution Platform — Web

Next.js + TypeScript frontend for the lead distribution platform. Provides the admin area (dashboard, brokers, form, distribution, leads) and the public lead form page.

Backend repository: [lead-distribution-api](https://github.com/norbertoqjr/lead-distribution-api)

## Stack

| Concern         | Choice                                                                   |
| --------------- | ------------------------------------------------------------------------ |
| Framework       | Next.js (App Router)                                                     |
| Language        | TypeScript                                                               |
| Styling         | Tailwind CSS v4 with shadcn/ui components                                |
| Forms           | react-hook-form with Zod resolvers                                       |
| HTTP            | axios, through a same-origin proxy                                       |
| Data            | Server components read the API directly; client components go via `/api` |
| Auth            | Session cookie issued by the API, enforced in middleware                 |
| Process manager | PM2                                                                      |

Theme tokens are transcribed from `docs/dashboard-design.json` in the
[platform repo](https://github.com/norbertoqjr/lead-distribution-platform);
change the JSON first, then mirror it into `src/app/globals.css`.

This is the only publicly exposed process. It serves the UI and proxies browser requests to the backend over localhost, so the API's private port is never reachable from a browser.

## Quick start

```bash
git clone https://github.com/norbertoqjr/lead-distribution-web.git
cd lead-distribution-web
npm install
cp .env.example .env.local  # then fill in real values
npm run dev                 # http://localhost:8192
```

The API must be running first — see the backend README.

## Environment variables

Copy `.env.example` to `.env.local` for development, or `.env` on the server.
Both are gitignored and must never be committed.

| Variable               | Description                                                                                           | Example                 |
| ---------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------- |
| `NODE_ENV`             | `development` or `production`                                                                         | `development`           |
| `PORT`                 | Port the app listens on                                                                               | `8192`                  |
| `BACKEND_URL`          | Internal API base URL. **Server-side only**                                                           | `http://127.0.0.1:8193` |
| `SESSION_COOKIE_NAME`  | Must match the API                                                                                    | `lds_session`           |
| `NEXT_PUBLIC_SITE_URL` | Public origin, used for canonical URLs, Open Graph tags, `robots.txt` and the sitemap. Safe to expose | `http://localhost:8192` |

`BACKEND_URL` deliberately has no `NEXT_PUBLIC_` prefix. Anything prefixed that
way is inlined into the JavaScript bundle and visible to any visitor, which
would leak the private backend port.

### How the browser reaches the API

The browser cannot call the backend directly: it listens on a private port and
its address is never sent to the client. Client-side requests go to `/api/...`
on this origin, and the route handler at `src/app/api/[...path]/route.ts`
forwards them to `BACKEND_URL` with the session cookie attached. Server
components skip the hop and call the API directly.

Set `NEXT_PUBLIC_SITE_URL` to the deployed origin before going live, or
canonical tags, the sitemap and the social card will all advertise localhost.

## Database and migrations

This app owns no database. Schema and seed data live in the
[API repo](https://github.com/norbertoqjr/lead-distribution-api); run its
migrations before starting the frontend:

```bash
npm --prefix ../api run db:migrate   # create tables
npm --prefix ../api run db:seed      # create the admin account
```

## Routes

### Public

| Path                 | Purpose                                                            |
| -------------------- | ------------------------------------------------------------------ |
| `/`                  | Marketing page and entry point                                     |
| `/login`             | Admin sign-in                                                      |
| `/{slug}`            | The public lead form, e.g. `/lead-registration`. No login required |
| `/health`            | Live API and database status                                       |
| `/privacy`, `/terms` | Policy pages                                                       |

### Admin — session required

| Path            | Purpose                                                       |
| --------------- | ------------------------------------------------------------- |
| `/dashboard`    | Overview and counts by lead status                            |
| `/brokers`      | List and create brokers                                       |
| `/brokers/[id]` | One broker's details and every lead it received               |
| `/form`         | Create or view the single lead form                           |
| `/distribution` | Broker shares and full lead history, as two tabs              |
| `/leads`        | All leads, filterable, with manual assignment for unsent ones |
| `/account`      | Own profile: display name and password. Email is read-only    |

Every admin route is marked `noindex` and disallowed in `robots.txt`. Middleware
guards them, redirecting to `/login?next=…` without a valid session and
returning the admin to the requested page after signing in.

Listings are paginated through `?page` and `?perPage`, and the distribution
page keeps its active tab in `?tab`, so any view is linkable and survives a
refresh.

## Behavior the UI must enforce

- Once a form exists, the create-form control is disabled or hidden.
- Once a distribution exists, the create-distribution control is disabled or hidden.
- Attempting to create a distribution with no form shows exactly: **`Oops, please create a form first.`**
- Broker forms capture name, active status, daily cap, timezone, opening time, closing time, and working days.
- Distribution setup assigns a percentage and an active-in-distribution flag per broker.
- Lead tables show name, email, phone, **IP address**, form name, assigned broker, status, and date.
- Unsent leads offer a manual assign action.

These are mirrored server-side in the API. The UI makes invalid states unreachable; the API makes them impossible.

Every data view handles four states explicitly: loading, empty, success, and error.

## Scripts

| Command              | Effect                      |
| -------------------- | --------------------------- |
| `npm run dev`        | Development server          |
| `npm run build`      | Production build            |
| `npm start`          | Serve the build on `$PORT`  |
| `npm run lint`       | Lint                        |
| `npm run typecheck`  | Type check without emitting |
| `npm test`           | Unit tests                  |
| `npm run test:watch` | Unit tests in watch mode    |
| `npm run lint:fix`   | Lint and autofix            |

## Deployment

```bash
ssh <user>@<host>
git clone https://github.com/norbertoqjr/lead-distribution-web.git ~/apps/lds-web
cd ~/apps/lds-web
npm ci
cp .env.example .env && $EDITOR .env      # PORT=<public port>, BACKEND_URL=http://127.0.0.1:<private port>
npm run build
pm2 start npm --name lds-web -- start
pm2 save
```

Bind only the assigned public port. The backend stays on its private port, unexposed.

### Restart and redeploy

```bash
cd ~/apps/lds-web && git pull && npm ci && npm run build && pm2 restart lds-web
```

### Logs and status

```bash
pm2 list
pm2 logs lds-web
pm2 logs lds-web --err --lines 100
pm2 monit
```

`pm2 save` persists the process list across a server reboot. Verify with `pm2 kill && pm2 resurrect`.

## Accessing the deployed app

The app is served at `http://<host>:<public port>`. Sign in at `/login`; the public form is at `/{slug}` and requires no account.

## Testing notes

- Visiting an admin route signed out redirects to `/login`.
- The public form loads with no session and no cookie.
- Submitting the form shows a clear success or error state.
- The submitted lead appears on `/leads` with its IP address populated.
- A sent lead appears under its assigned broker at `/brokers/[id]`.
- Resubmitting the same email shows the lead as `duplicate`.
- The distribution detail page lists sent, duplicate, failed, and unsent leads.
- An unsent lead can be manually assigned and moves to `sent`.
- Creating a distribution before a form shows `Oops, please create a form first.`
- No page source or JS bundle contains the backend URL, database credentials, or the session secret.

## Security

- Secrets are server-side only; nothing sensitive is prefixed `NEXT_PUBLIC_`.
- The session cookie is httpOnly, so client JavaScript cannot read it.
- Only `.env.example`, with placeholders, is committed.
