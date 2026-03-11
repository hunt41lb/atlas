// @/lib/api-client.ts
// Typed client for the Atlas backend API

import type { ParsedConfig } from "@/lib/panw-parser/types"

const API_URL  = process.env.NEXT_PUBLIC_API_URL  ?? "http://localhost:3001"
const API_KEY  = process.env.NEXT_PUBLIC_API_KEY  ?? ""

function headers(extra?: Record<string, string>): HeadersInit {
  return {
    "X-API-Key": API_KEY,
    ...extra,
  }
}

// ─── Response shapes (mirror what the backend returns) ────────────────────────

export interface ApiDevice {
  id:             string
  hostname:       string | null
  serial_number:  string | null
  ip_address:     string | null
  device_type:    "firewall" | "panorama"
  platform_model: string | null
  pan_os_version: string | null
  created_at:     string
  updated_at:     string
}

export interface ApiConfiguration {
  id:              string
  device_id:       string
  file_name:       string
  file_size_bytes: number
  pan_os_version:  string | null
  backed_up_at:    string
  created_at:      string
  parsed:          ParsedConfig
  device:          ApiDevice
}

export interface ApiConfigSummary {
  id:              string
  device_id:       string
  file_name:       string
  file_size_bytes: number
  pan_os_version:  string | null
  backed_up_at:    string
  device:          ApiDevice
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
  return res.json()
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
