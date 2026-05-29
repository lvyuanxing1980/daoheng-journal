'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setDebugInfo('')

    // 调试信息
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '未设置'
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '未设置'
    setDebugInfo(`URL: ${url}, Key前缀: ${key.slice(0, 20)}...`)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg mb-4">
            <span className="text-3xl">🪨</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">道痕日记</h1>
          <p className="mt-2 text-gray-500 text-sm">每日内心觉察，捞起自己的石头</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-violet-100">
          {!sent ? (
            <>
              <h2 className="text-xl font-semibold text-gray-700 mb-6">登录 / 注册</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    邮箱地址
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 text-gray-800 transition"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                {debugInfo && (
                  <p className="text-gray-400 text-xs bg-gray-50 rounded-lg px-3 py-2 font-mono">
                    调试: {debugInfo}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 transition-all"
                >
                  {loading ? '发送中…' : '发送登录链接'}
                </button>
              </form>

              <p className="mt-6 text-xs text-gray-400 text-center leading-relaxed">
                输入邮箱后，我们会发送一封免密登录邮件。
                <br />首次使用即自动完成注册。
              </p>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">📬</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">登录链接已发送</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                请检查 <strong className="text-violet-600">{email}</strong> 的收件箱，
                <br />点击邮件中的链接完成登录。
              </p>
              <p className="mt-4 text-xs text-gray-400">没收到？检查一下垃圾邮件文件夹</p>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                className="mt-6 text-sm text-violet-500 hover:text-violet-700 underline"
              >
                重新发送
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
