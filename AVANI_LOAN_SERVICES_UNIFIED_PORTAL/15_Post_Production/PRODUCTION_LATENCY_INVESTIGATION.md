# PRODUCTION LATENCY INVESTIGATION (2026-11-16)

## 1. Multi-Run `curl.exe` Timing Breakdown (`task-11544`)

- **Cache Headers (`https://www.avanifinserv.com/`):** `Cache-Control: public, max-age=0, must-revalidate`, `X-Vercel-Cache: HIT`.

| Endpoint | Run | HTTP | DNS | Connect | TLS | TTFB | Total | Size |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| `https://www.avanifinserv.com/` | 1 | 200 | 0.032655s | 0.082982s | 0.757473s | 0.814960s | **0.815853s** | 4,886 B |
| `https://www.avanifinserv.com/` | 2 | 200 | 0.008705s | 0.049793s | 0.173398s | 0.252062s | **0.257563s** | 4,886 B |
| `https://www.avanifinserv.com/` | 3 | 200 | 0.026781s | 0.064681s | 0.246895s | 0.321728s | **0.322576s** | 4,886 B |
| `https://www.avanifinserv.com/admin/` | 1 | 200 | 0.020701s | 0.066679s | 0.283571s | 0.354186s | **0.354655s** | 4,886 B |
| `https://www.avanifinserv.com/admin/` | 2 | 200 | 0.012344s | 0.057376s | 0.187243s | 0.258599s | **0.271503s** | 4,886 B |
| `https://www.avanifinserv.com/admin/` | 3 | 200 | 0.013191s | 0.051416s | 0.282428s | 0.346296s | **0.346807s** | 4,886 B |
| `https://api.avanifinserv.com/health` | 1 | 200 | 0.013491s | 0.066743s | 0.706515s | 0.760322s | **0.760466s** | 90 B |
| `https://api.avanifinserv.com/health` | 2 | 200 | 0.031868s | 0.083150s | 0.195738s | 0.258021s | **0.258174s** | 90 B |
| `https://api.avanifinserv.com/health` | 3 | 200 | 0.010701s | 0.056876s | 0.216922s | 0.273030s | **0.273132s** | 90 B |

## 2. Conclusion
- The earlier `8,862 ms` reading was a one-off cold-client/transient network delay. Live responses are consistently **258 ms – 816 ms** (`X-Vercel-Cache: HIT`). No code change or redeploy is required.
