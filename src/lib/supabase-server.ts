import { createClient } from '@supabase/supabase-js'

// 服务端使用 service_role key 的 Supabase 客户端
export function createSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
