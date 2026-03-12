// @/lib/api-client.ts

import type { ParsedConfig } from "@/lib/panw-parser/types"

const API_URL  = process.env.NEXT_PUBLIC_API_URL  ?? "http://localhost:3001"
const API_KEY  = process.env.NEXT_PUBLIC_API_KEY  ?? ""

function headers(extra?: Record<string, string>): HeadersInit {
  return {
    "X-API-Key": API_KEY,
    ...extra,
  }
}

// ─── Response shapes (mirror what the backend actually returns) ───────────────

// Shape returned by GET /api/configurations (list) — flat joined fields
export interface ApiConfigSummary {
  id:              string
  device_id:       string
  file_name:       string
  file_size_bytes: string | number
  pan_os_version:  string | null
  backed_up_at:    string
  created_at:      string
  device_hostname: string | null
  device_type:     "firewall" | "panorama"
  device_serial:   string | null
}

// Shape returned by GET /api/configurations/:id
export interface ApiConfiguration {
  id:              string
  device_id:       string
  file_name:       string
  file_size_bytes: string | number
  pan_os_version:  string | null
  backed_up_at:    string
  created_at:      string
  parsed:          ParsedConfig
  device_hostname: string | null
  device_type:     "firewall" | "panorama"
  device_serial:   string | null
}

export interface UploadResult {
  configId:   string
  deviceId:   string
  deviceType: "firewall" | "panorama"
  hostname:   string | null
  durationMs: number
}

// ─── API calls ────────────────────────────────────────────────────────────────

/** Fetch the most recent configuration for every device */
export async function fetchConfigurations(): Promise<ApiConfigSummary[]> {
  const res = await fetch(`${API_URL}/api/configurations`, {
    headers: headers(),
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Failed to fetch configurations: ${res.status}`)
  const data = await res.json()
  // Backend returns { configurations: [...] } or just an array
  return Array.isArray(data) ? data : (data.configurations ?? [])
}

/** Fetch a single configuration including full parsed JSONB */
export async function fetchConfiguration(id: string): Promise<ApiConfiguration> {
  const res = await fetch(`${API_URL}/api/configurations/${id}`, {
    headers: headers(),
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Failed to fetch configuration ${id}: ${res.status}`)
  const data = await res.json()
  // Backend wraps in { configuration: {...} }
  return data.configuration ?? data
}

/** Archive a configuration — backend will purge it after retentionDays */
export async function archiveConfiguration(
  id: string,
  retentionDays: number,
): Promise<void> {
  const res = await fetch(`${API_URL}/api/configurations/${id}/archive`, {
    method:  "PATCH",
    headers: headers({ "Content-Type": "application/json" }),
    body:    JSON.stringify({ retention_days: retentionDays }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Archive failed: ${res.status}`)
  }
}

/** Permanently delete a configuration and its device record */
export async function deleteConfiguration(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/configurations/${id}`, {
    method:  "DELETE",
    headers: headers(),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Delete failed: ${res.status}`)
  }
}

/** Upload a raw XML file and return the ingest result */
export async function uploadConfiguration(file: File): Promise<UploadResult> {
  const form = new FormData()
  form.append("config", file)

  const res = await fetch(`${API_URL}/api/upload/upload`, {
    method:  "POST",
    headers: headers(),   // no Content-Type — browser sets multipart boundary
    body:    form,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Upload failed: ${res.status}`)
  }
  return res.json()
}
