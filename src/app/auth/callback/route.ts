// Auth callback - 魔法链接登录后，从 URL hash 提取 tokens
// 由于使用 localStorage 方案，这个路由主要用于重定向
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error)}`)
  }

  // 由于使用 supabase-js 的 pkce flow，认证在客户端完成
  // 这里只做重定向
  if (code) {
    return NextResponse.redirect(`${origin}/journal`)
  }

  return NextResponse.redirect(`${origin}/login`)
}
