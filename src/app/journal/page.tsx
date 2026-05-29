'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter, useSearchParams } from 'next/navigation'
import { QUESTIONS, type JournalEntry } from '@/lib/constants'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import Link from 'next/link'

export default function JournalPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const dateParam = searchParams.get('date')
  const today = format(new Date(), 'yyyy-MM-dd')
  const currentDate = dateParam || today
  const isToday = currentDate === today
  const isReadOnly = !isToday

  const [answers, setAnswers] = useState<Record<string, string>>({
    q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [entryId, setEntryId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null)

  // 获取用户和当天记录
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', currentDate)
        .single()

      if (data) {
        setAnswers({ q1: data.q1, q2: data.q2, q3: data.q3, q4: data.q4, q5: data.q5, q6: data.q6, q7: data.q7 })
        setEntryId(data.id)
        setSaved(true)
      }
      setLoading(false)
    }
    init()
  }, [currentDate])

  // 自动保存（仅今日可编辑）
  function handleChange(id: string, value: string) {
    if (isReadOnly) return
    setAnswers(prev => ({ ...prev, [id]: value }))
    setSaved(false)
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => saveEntry(), 1500)
  }

  async function saveEntry() {
    if (!userId || isReadOnly) return
    setSaving(true)
    const payload = {
      user_id: userId,
      date: currentDate,
      ...answers,
      updated_at: new Date().toISOString(),
    }
    if (entryId) {
      await supabase.from('journal_entries').update(payload).eq('id', entryId)
    } else {
      const { data } = await supabase.from('journal_entries').insert(payload).select().single()
      if (data) setEntryId(data.id)
    }
    setSaving(false)
    setSaved(true)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const dateLabel = format(new Date(currentDate + 'T00:00:00'), 'yyyy年M月d日 EEEE', { locale: zhCN })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-50">
        <div className="text-violet-400 text-lg animate-pulse">加载中…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-violet-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🪨</span>
            <span className="font-bold text-gray-800">道痕日记</span>
          </div>
          <div className="flex items-center gap-3">
            {!isReadOnly && (
              <span className="text-xs text-gray-400">
                {saving ? '保存中…' : saved ? '✓ 已保存' : '未保存'}
              </span>
            )}
            <Link
              href="/archive"
              className="text-sm text-violet-600 hover:text-violet-800 font-medium px-3 py-1 rounded-lg hover:bg-violet-50 transition"
            >
              历史档案
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-50 transition"
            >
              退出
            </button>
          </div>
        </div>
      </header>

      {/* Date Banner */}
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-2">
          {isReadOnly && (
            <Link href="/journal" className="text-violet-500 hover:text-violet-700 text-sm">
              ← 返回今日
            </Link>
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{dateLabel}</h2>
        {isToday && (
          <p className="text-gray-500 text-sm mt-1">今天，你愿意诚实地看看自己吗？</p>
        )}
        {isReadOnly && (
          <div className="mt-2 inline-flex items-center gap-1 text-xs text-violet-500 bg-violet-50 px-3 py-1 rounded-full">
            📖 阅读模式
          </div>
        )}
        {saved && isToday && (
          <div className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            ✅ 今日已完成记录
          </div>
        )}
      </div>

      {/* Questions */}
      <main className="max-w-2xl mx-auto px-4 pb-16 space-y-5">
        {QUESTIONS.map((q, i) => (
          <div
            key={q.id}
            className={`rounded-2xl border ${q.border} ${q.bg} p-5 fade-in`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className={`flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br ${q.color} flex items-center justify-center text-white text-xs font-bold shadow`}>
                {q.number}
              </div>
              <h3 className="text-base font-semibold text-gray-800 leading-snug pt-0.5">{q.title}</h3>
            </div>
            {isReadOnly ? (
              <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap min-h-[3rem] pl-10">
                {answers[q.id] || <span className="text-gray-300 italic">（未填写）</span>}
              </div>
            ) : (
              <textarea
                value={answers[q.id]}
                onChange={e => handleChange(q.id, e.target.value)}
                placeholder={q.placeholder}
                rows={3}
                className={`w-full mt-1 ml-10 pl-0 pr-0 bg-transparent border-0 border-b-2 ${q.border} focus:border-violet-400 text-gray-700 text-sm placeholder-gray-300 leading-relaxed focus:ring-0 transition-colors w-[calc(100%-2.5rem)]`}
                style={{ width: 'calc(100% - 2.5rem)', marginLeft: '2.5rem', background: 'transparent', outline: 'none', borderLeft: 'none', borderRight: 'none', borderTop: 'none', padding: '4px 0', resize: 'none' }}
              />
            )}
          </div>
        ))}

        {/* Save Button */}
        {!isReadOnly && (
          <button
            onClick={saveEntry}
            disabled={saving}
            className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 transition-all text-base"
          >
            {saving ? '保存中…' : '💾 保存今日记录'}
          </button>
        )}
      </main>
    </div>
  )
}
