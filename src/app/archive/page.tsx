'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import { type JournalEntry } from '@/lib/constants'
import { format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import Link from 'next/link'

type GroupedEntries = Record<string, JournalEntry[]>

export default function ArchivePage() {
  const router = useRouter()
  const supabase = createClient()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, streak: 0 })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (data) {
        setEntries(data)
        // 计算连续打卡
        let streak = 0
        const today = format(new Date(), 'yyyy-MM-dd')
        const dates = data.map(e => e.date)
        let cursor = today
        while (dates.includes(cursor)) {
          streak++
          const d = new Date(cursor + 'T00:00:00')
          d.setDate(d.getDate() - 1)
          cursor = format(d, 'yyyy-MM-dd')
        }
        setStats({ total: data.length, streak })
      }
      setLoading(false)
    }
    load()
  }, [])

  // 按月份分组
  const grouped: GroupedEntries = entries.reduce((acc, entry) => {
    const month = entry.date.slice(0, 7)
    if (!acc[month]) acc[month] = []
    acc[month].push(entry)
    return acc
  }, {} as GroupedEntries)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-50">
        <div className="text-violet-400 animate-pulse">加载中…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-violet-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/journal" className="text-violet-500 hover:text-violet-700 text-sm">← 返回</Link>
          <span className="text-2xl">🪨</span>
          <span className="font-bold text-gray-800">历史档案</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-8 pb-16">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-violet-100 shadow-sm text-center">
            <div className="text-3xl font-bold text-violet-600">{stats.total}</div>
            <div className="text-sm text-gray-500 mt-1">累计记录</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-violet-100 shadow-sm text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.streak}</div>
            <div className="text-sm text-gray-500 mt-1">连续打卡天数</div>
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">📭</div>
            <p>还没有任何记录，去写第一篇吧</p>
            <Link href="/journal" className="mt-4 inline-block text-violet-500 underline text-sm">
              开始记录
            </Link>
          </div>
        ) : (
          Object.entries(grouped).map(([month, monthEntries]) => (
            <div key={month} className="mb-8">
              <h3 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-3 px-1">
                {format(parseISO(month + '-01'), 'yyyy年 M月', { locale: zhCN })}
                <span className="ml-2 text-gray-300">· {monthEntries.length} 篇</span>
              </h3>
              <div className="space-y-3">
                {monthEntries.map(entry => (
                  <Link
                    key={entry.id}
                    href={`/journal?date=${entry.date}`}
                    className="block bg-white rounded-2xl p-5 border border-violet-100 shadow-sm hover:shadow-md hover:border-violet-300 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-400 mb-1">
                          {format(parseISO(entry.date), 'M月d日 EEEE', { locale: zhCN })}
                        </div>
                        <p className="text-gray-700 text-sm line-clamp-2 leading-relaxed">
                          {entry.q1 || <span className="text-gray-300 italic">（今日起伏未记录）</span>}
                        </p>
                        {entry.q6 && (
                          <div className="mt-2 inline-flex items-center gap-1 text-xs text-stone-500 bg-stone-50 border border-stone-100 px-2 py-0.5 rounded-full">
                            🪨 {entry.q6.slice(0, 30)}{entry.q6.length > 30 ? '…' : ''}
                          </div>
                        )}
                      </div>
                      <span className="text-violet-300 group-hover:text-violet-500 transition text-lg flex-shrink-0">›</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
