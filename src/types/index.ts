export interface License {
  id: string
  license_key: string
  name: string
  authorized_ips: string[]
  is_active: boolean
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface LicenseFilters {
  license_id: string
  access_type: 'authorized' | 'unauthorized'
  date_from: Date | undefined
  date_to: Date | undefined
}


export interface AuthRequest {
  license: string
  ip: string
  script_name?: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data?: {
    license_id: string
    expires_at: string | null
    script_name: string | ""
  }
}
