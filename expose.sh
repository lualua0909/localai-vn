#!/usr/bin/env bash
set -euo pipefail

CF_EMAIL="mtv.duyna@gmail.com"
TUNNEL_NAME="localai-tunnel"
PUBLIC_HOSTNAME="ai.duyna.online"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLOUDFLARED_DIR="${HOME}/.cloudflared"
CERT_FILE="${CLOUDFLARED_DIR}/cert.pem"
CONFIG_FILE="${CLOUDFLARED_DIR}/config.yml"

log() {
  printf "[expose] %s\n" "$*" >&2
}

detect_arch() {
  local arch
  arch="$(uname -m)"
  case "${arch}" in
    x86_64|amd64) echo "amd64" ;;
    aarch64|arm64) echo "arm64" ;;
    *)
      log "Unsupported architecture: ${arch}"
      exit 1
      ;;
  esac
}

install_cloudflared_macos() {
  if command -v brew >/dev/null 2>&1; then
    log "Installing cloudflared via Homebrew..."
    brew install cloudflare/cloudflare/cloudflared
    return
  fi

  local arch tmp_bin
  arch="$(detect_arch)"
  tmp_bin="$(mktemp /tmp/cloudflared.XXXXXX)"

  log "Installing cloudflared binary for macOS (${arch})..."
  curl -fsSL "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-${arch}.tgz" -o "${tmp_bin}.tgz"
  tar -xzf "${tmp_bin}.tgz" -C /tmp

  if [[ -w /usr/local/bin ]]; then
    mv /tmp/cloudflared /usr/local/bin/cloudflared
  else
    sudo mv /tmp/cloudflared /usr/local/bin/cloudflared
  fi
  chmod +x /usr/local/bin/cloudflared
}

install_cloudflared_linux() {
  local arch tmp_bin
  arch="$(detect_arch)"
  tmp_bin="$(mktemp /tmp/cloudflared.XXXXXX)"

  log "Installing cloudflared binary for Linux (${arch})..."
  curl -fsSL "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-${arch}" -o "${tmp_bin}"
  chmod +x "${tmp_bin}"

  if [[ -w /usr/local/bin ]]; then
    mv "${tmp_bin}" /usr/local/bin/cloudflared
  else
    sudo mv "${tmp_bin}" /usr/local/bin/cloudflared
  fi
}

ensure_cloudflared() {
  if command -v cloudflared >/dev/null 2>&1; then
    return
  fi

  case "$(uname -s)" in
    Darwin)
      install_cloudflared_macos
      ;;
    Linux)
      install_cloudflared_linux
      ;;
    *)
      log "Unsupported OS: $(uname -s)"
      exit 1
      ;;
  esac

  command -v cloudflared >/dev/null 2>&1 || {
    log "cloudflared installation failed"
    exit 1
  }
}

detect_localai_port() {
  if [[ $# -gt 0 && -n "${1:-}" ]]; then
    echo "$1"
    return
  fi

  if [[ -n "${LOCALAI_PORT:-}" ]]; then
    echo "${LOCALAI_PORT}"
    return
  fi

  if [[ -n "${PORT:-}" ]]; then
    echo "${PORT}"
    return
  fi

  if command -v lsof >/dev/null 2>&1; then
    if lsof -nP -iTCP:8080 -sTCP:LISTEN >/dev/null 2>&1; then
      echo "8080"
      return
    fi
    if lsof -nP -iTCP:3000 -sTCP:LISTEN >/dev/null 2>&1; then
      echo "3000"
      return
    fi
  fi

  echo "8080"
}

ensure_login() {
  mkdir -p "${CLOUDFLARED_DIR}"

  if [[ -f "${CERT_FILE}" ]]; then
    return
  fi

  log "Cloudflare login required. Please complete browser login with account: ${CF_EMAIL}"
  cloudflared tunnel login

  if [[ ! -f "${CERT_FILE}" ]]; then
    log "Cloudflare login did not produce ${CERT_FILE}"
    exit 1
  fi
}

get_tunnel_id() {
  cloudflared tunnel list 2>/dev/null | awk -v name="${TUNNEL_NAME}" '$2 == name { print $1; exit }'
}

ensure_tunnel() {
  local tunnel_id
  tunnel_id="$(get_tunnel_id || true)"

  if [[ -z "${tunnel_id}" ]]; then
    log "Creating tunnel: ${TUNNEL_NAME}"
    cloudflared tunnel create "${TUNNEL_NAME}" >&2
    tunnel_id="$(get_tunnel_id || true)"
  else
    log "Reusing existing tunnel: ${TUNNEL_NAME} (${tunnel_id})"
  fi

  if [[ -z "${tunnel_id}" ]]; then
    log "Failed to determine tunnel ID for ${TUNNEL_NAME}"
    exit 1
  fi

  if [[ ! -f "${CLOUDFLARED_DIR}/${tunnel_id}.json" ]]; then
    log "Missing credentials file: ${CLOUDFLARED_DIR}/${tunnel_id}.json"
    log "Re-run: cloudflared tunnel create ${TUNNEL_NAME}"
    exit 1
  fi

  printf "%s" "${tunnel_id}"
}

ensure_dns_route() {
  local output status
  set +e
  output="$(cloudflared tunnel route dns "${TUNNEL_NAME}" "${PUBLIC_HOSTNAME}" 2>&1)"
  status=$?
  set -e

  if [[ ${status} -eq 0 ]]; then
    log "DNS route ensured: ${PUBLIC_HOSTNAME} -> ${TUNNEL_NAME}"
    return
  fi

  if echo "${output}" | grep -qi "already exists\|record with that host already exists\|code: 1003"; then
    log "DNS route already exists: ${PUBLIC_HOSTNAME}"
    return
  fi

  printf "%s\n" "${output}" >&2
  log "Failed to create/verify DNS route"
  exit 1
}

write_config() {
  local tunnel_id="$1"
  local local_port="$2"

  cat >"${CONFIG_FILE}" <<EOF
tunnel: ${tunnel_id}
credentials-file: ${CLOUDFLARED_DIR}/${tunnel_id}.json

ingress:
  - hostname: ${PUBLIC_HOSTNAME}
    service: http://localhost:${local_port}
  - service: http_status:404
EOF

  log "Config written: ${CONFIG_FILE}"
}

ensure_deps() {
  if [[ ! -d "${PROJECT_DIR}/node_modules" ]]; then
    log "Installing dependencies..."
    (cd "${PROJECT_DIR}" && npm install) >&2
  fi
}

start_nextjs() {
  local local_port="$1"

  # Check if something is already listening on the port
  if lsof -nP -iTCP:"${local_port}" -sTCP:LISTEN >/dev/null 2>&1; then
    log "Port ${local_port} already in use, skipping Next.js start"
    return
  fi

  log "Building Next.js app..."
  (cd "${PROJECT_DIR}" && npm run build) >&2

  log "Starting Next.js on port ${local_port}..."
  (cd "${PROJECT_DIR}" && PORT="${local_port}" npm run start &) 2>&1 >&2

  # Wait for the server to be ready
  local retries=0
  while ! lsof -nP -iTCP:"${local_port}" -sTCP:LISTEN >/dev/null 2>&1; do
    retries=$((retries + 1))
    if [[ ${retries} -ge 30 ]]; then
      log "Next.js failed to start within 30s"
      exit 1
    fi
    sleep 1
  done
  log "Next.js is ready on port ${local_port}"
}

cleanup() {
  log "Shutting down..."
  # Kill background Next.js process if we started it
  jobs -p | xargs -r kill 2>/dev/null || true
}

main() {
  trap cleanup EXIT INT TERM

  ensure_cloudflared
  ensure_login
  ensure_deps

  local local_port tunnel_id
  local_port="$(detect_localai_port "${1:-}")"
  tunnel_id="$(ensure_tunnel)"

  write_config "${tunnel_id}" "${local_port}"
  ensure_dns_route

  start_nextjs "${local_port}"

  log "LocalAI public endpoint: https://${PUBLIC_HOSTNAME}"
  log "Forwarding to: http://localhost:${local_port}"
  log "Starting Cloudflare Tunnel... (Ctrl+C to stop)"

  cloudflared tunnel run "${TUNNEL_NAME}"
}

main "$@"