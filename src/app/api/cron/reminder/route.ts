import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createSupabaseAdmin } from '@/lib/supabase-server'
import { format } from 'date-fns'

// Vercel Cron 每天 UTC 13:00（北京时间 21:00）触发
export const runtime = 'edge'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: Request) {
  // 验证 Cron 密钥（防止外部随意触发）
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = format(new Date(), 'yyyy-MM-dd')

  // 使用 Service Role Key 查询数据库（Supabase Admin）
  const supabase = createSupabaseAdmin()

  // 查今天是否已有记录
  const { data: existingEntry } = await supabase
    .from('journal_entries')
    .select('id')
    .eq('date', today)
    .single()

  if (existingEntry) {
    return NextResponse.json({ message: 'Already recorded today, no reminder needed.' })
  }

  // 发送提醒邮件
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: process.env.REMINDER_EMAIL!,
    subject: `🪨 今天的道痕日记还没写 — ${today}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #faf8ff; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 48px;">🪨</span>
          <h1 style="font-size: 22px; font-weight: 700; color: #3b0764; margin: 12px 0 4px;">道痕日记</h1>
          <p style="color: #7c3aed; font-size: 14px; margin: 0;">每日内心觉察，捞起自己的石头</p>
        </div>

        <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid #ede9fe; margin-bottom: 20px;">
          <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 12px;">
            今天的内心起伏，值得被记录下来。
          </p>
          <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0;">
            花几分钟，问问自己：今天让你内心波澜的那件事是什么？
          </p>
        </div>

        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.vercel.app'}/journal"
             style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(124,58,237,0.3);">
            ✏️ 开始今日记录
          </a>
        </div>

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          ${today} · 道痕日记 · <a href="${process.env.NEXT_PUBLIC_APP_URL || '#'}/settings" style="color: #a78bfa;">调整提醒时间</a>
        </p>
      </div>
    `,
  })

  if (error) {
    console.error('Resend error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  return NextResponse.json({ message: 'Reminder sent successfully' })
}
