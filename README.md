# QuickServe — Food Ordering Platform

A full-stack food delivery application with four user roles: buyers order from restaurants,
sellers manage their menus, delivery riders pick up orders, and admins oversee the platform.

| | |
|---|---|
| **Live site** | https://quick-serve-food-order-app.vercel.app |
| **API** | https://foodorder-api-690fd7.azurewebsites.net |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Zustand — hosted on Vercel |
| **Backend** | .NET 8 Web API, clean architecture, EF Core, MediatR, JWT — hosted on Azure App Service |
| **Database** | Azure SQL Database (serverless) |

---

## Running a live demo

The hosted app runs on free/serverless tiers, so it **goes to sleep when nobody is using it**.
It wakes automatically, but the first request takes about 18 seconds while the web app and the
database start up. There is nothing to switch on or off — the site is always available.

### Before the demo

Open this URL and wait until raw JSON appears (~18 seconds):

```
https://foodorder-api-690fd7.azurewebsites.net/restaurants
```

That wakes the API and the database together. Then open the site and sign in once to confirm
it works:

```
https://quick-serve-food-order-app.vercel.app
```

Everything stays warm while you are using it, and for roughly 20 minutes after you stop.

Do this the night before as well, so there is time to fix anything that looks wrong.

### After the demo

Nothing. Both services go back to sleep on their own and stop costing anything.

### If something looks wrong

| Symptom | Cause and fix |
|---|---|
| Restaurant list stays empty | The warm-up was skipped. Open the API URL above, wait for the JSON, reload the site. |
| First click is slow | Expected once per idle period, never twice in a row. |
| Page returns HTTP 403 | The free tier's daily CPU quota is exhausted; it resets at 00:00 UTC (05:30 Sri Lanka time). Normal demo use does not come close. |

---

## Demo accounts

Every account uses the password `password123`.

| Role | Email | What it shows |
|---|---|---|
| Admin | `admin@foodie.com` | Platform dashboard, all users, orders and restaurants |
| Seller | `seller@foodie.com` | 4 restaurants, 24 dishes, 35 orders |
| Buyer | `buyer@foodie.com` | 8 orders across every status, favourites, addresses, active cart |
| Delivery | `delivery@foodie.com` | 12 assigned deliveries plus an available pickup queue |

The database is seeded with 12 restaurants, 72 dishes, 40 users and 76 orders. Passwords are
stored in plain text — this is demo data and the scheme must be replaced with hashing before
any real use.

---

## Local development

**Prerequisites:** .NET 8 SDK, Node.js 20+, and SQL Server (LocalDB or Express).

### API

```bash
cd api
dotnet restore FoodOrder.sln
dotnet run --project FoodOrder.API
```

Runs on http://localhost:5182 with Swagger at `/swagger`. Update the `DefaultConnection`
string in `api/FoodOrder.API/appsettings.json` to point at your local SQL Server. Migrations
and seed data are applied automatically at startup.

### Client

```bash
cd client
npm install
npm run dev
```

Runs on http://localhost:5173. Create `client/.env` to point it at your local API:

```
VITE_API_URL=http://localhost:5182
```

This file is git-ignored so it cannot override the deployed configuration.

---

## Project structure

```
api/
  FoodOrder.API/             Controllers, DI wiring, JWT setup
  FoodOrder.Application/     CQRS handlers, contracts, validation
  FoodOrder.Domain/          Entities, enums, stock imagery
  FoodOrder.Infrastructure/  EF Core, repositories, migrations, seeding
client/
  src/features/              Feature modules (auth, cart, orders, ...)
  src/pages/                 Route-level pages by role
  src/routes/AppRoutes.tsx   Route table
```

Main API routes: `auth`, `restaurants`, `restaurants/{id}/menu-items`, `orders`, `cart`,
`users`, `addresses`, `favorites`, `reviews`, `payments`.

---

## Deployment

Both halves deploy automatically on every push to `main`.

**Backend** — `.github/workflows/backend-deploy.yml` builds the solution and deploys to Azure
App Service. It authenticates with OIDC federated credentials, so no passwords or publish
profiles are stored. Requires these repository variables:

| Variable | Purpose |
|---|---|
| `AZURE_WEBAPP_NAME` | Target web app |
| `AZURE_CLIENT_ID` / `AZURE_TENANT_ID` / `AZURE_SUBSCRIPTION_ID` | Federated identity |

**Frontend** — Vercel's Git integration builds `client/` on each push, with preview
deployments for pull requests. `VITE_API_URL` is set in the Vercel project settings and is
baked in at build time, so changing it requires a redeploy.

`.github/workflows/frontend-ci.yml` runs lint and build checks. Linting is currently
report-only because of pre-existing errors; `tsc` and the Vite build still gate the pipeline.

---

## Hosting costs

Configured to run at roughly **$0.30/month** so it can stay online indefinitely on an Azure
for Students credit:

| Resource | Configuration | Cost |
|---|---|---|
| App Service plan | F1 Free, Always On disabled | $0 |
| Azure SQL | Serverless, auto-pauses after 60 min idle | ~$0 when idle |
| SQL storage | 2 GB provisioned | ~$0.26/mo |
| Vercel | Hobby tier | $0 |

The sleep-and-wake behaviour described above is the direct trade-off for this. Scaling the
plan to B1 (~$13/month) would remove the 18-second wake-up, but measurements showed the free
tier's daily CPU quota is only ~1.4% consumed by an hour and a half of heavy use, so it is not
necessary for demos.
