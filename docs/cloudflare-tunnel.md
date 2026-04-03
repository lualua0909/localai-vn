# Cloudflare Tunnel for LocalAI

This project includes an automation script to expose LocalAI through Cloudflare Tunnel.

## Quick Start

Run:

```bash
./expose.sh
```

If your LocalAI process runs on a non-default port, pass the port explicitly:

```bash
./expose.sh 9000
```

The public URL is:

```text
https://ai.duyna.online
```

## What the Script Does

The script performs these steps idempotently:

1. Ensures `cloudflared` is installed (macOS or Linux).
2. Ensures Cloudflare login exists (`~/.cloudflared/cert.pem`), otherwise runs `cloudflared tunnel login`.
3. Ensures tunnel `localai-tunnel` exists, otherwise creates it.
4. Ensures DNS route `ai.duyna.online -> localai-tunnel` exists.
5. Writes `~/.cloudflared/config.yml` with ingress to LocalAI.
6. Runs `cloudflared tunnel run localai-tunnel`.

## Port Detection

Port priority used by `expose.sh`:

1. First CLI argument (example: `./expose.sh 8080`)
2. `LOCALAI_PORT` env var
3. `PORT` env var
4. Auto-detect listening port `8080`, then `3000`
5. Fallback to `8080`

## Tunnel Config File

Generated at:

```text
~/.cloudflared/config.yml
```

Example:

```yaml
tunnel: <TUNNEL_ID>
credentials-file: ~/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: ai.duyna.online
    service: http://localhost:8080
  - service: http_status:404
```

## Restart Tunnel

Start again at any time:

```bash
./expose.sh
```

Or directly with Cloudflare:

```bash
cloudflared tunnel run localai-tunnel
```

## Change Domain

Edit `PUBLIC_HOSTNAME` in `expose.sh`, then run:

```bash
./expose.sh
```

If the old hostname already has DNS records, remove/update them in Cloudflare DNS dashboard.

## Notes

- Login step opens browser auth flow and should be completed using account `mtv.duyna@gmail.com`.
- Script is idempotent and reuses existing tunnel and DNS route when already created.
