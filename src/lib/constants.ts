export const QUESTIONS = [
  {
    id: 'q1',
    number: 1,
    title: '今天内心最起波澜的事情是什么？',
    placeholder: '描述那件让你心里有了涟漪的事情，哪怕只是一个瞬间……',
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
  },
  {
    id: 'q2',
    number: 2,
    title: '我的第一反应是什么？',
    placeholder: '当时脑海里第一个冒出来的念头、情绪或动作是什么？',
    color: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  {
    id: 'q3',
    number: 3,
    title: '我其实想得到什么？',
    placeholder: '在那个反应背后，你真正渴望的是什么？承认、安全感、连接、还是别的……',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  {
    id: 'q4',
    number: 4,
    title: '我其实在害怕什么？',
    placeholder: '如果诚实面对，藏在这件事下面的恐惧是什么？',
    color: 'from-orange-500 to-amber-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
  },
  {
    id: 'q5',
    number: 5,
    title: '我自己给自己找了一个什么样的理由？',
    placeholder: '为了让自己好受，你告诉自己什么故事？那个自洽的逻辑是什么？',
    color: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
  },
  {
    id: 'q6',
    number: 6,
    title: '今天捞起来的主石头是什么？',
    placeholder: '从这件事里，你看见了自己的哪块"石头"（模式/信念/习惯）？',
    color: 'from-stone-500 to-zinc-600',
    bg: 'bg-stone-50',
    border: 'border-stone-200',
  },
  {
    id: 'q7',
    number: 7,
    title: '如果明天遇见同样的事情，我准备怎么选择？',
    placeholder: '带着今天的觉察，明天的你会怎么做？给自己一个承诺……',
    color: 'from-indigo-500 to-violet-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
  },
]

export type JournalEntry = {
  id?: string
  user_id?: string
  date: string // YYYY-MM-DD
  q1: string
  q2: string
  q3: string
  q4: string
  q5: string
  q6: string
  q7: string
  created_at?: string
  updated_at?: string
}
