import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { format } from 'date-fns'

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 查今天是否有记录
  const today = format(new Date(), 'yyyy-MM-dd')
  const { data: todayEntry } = await supabase
    .from('journal_entries')
    .select('id')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  if (todayEntry) {
    redirect('/journal?date=' + today)
  } else {
    redirect('/journal')
  }
}
