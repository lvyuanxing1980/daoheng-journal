-- 在 Supabase SQL Editor 中执行此脚本（一次性）

-- 日记条目表
CREATE TABLE IF NOT EXISTS journal_entries (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date        DATE NOT NULL,
  q1          TEXT DEFAULT '',
  q2          TEXT DEFAULT '',
  q3          TEXT DEFAULT '',
  q4          TEXT DEFAULT '',
  q5          TEXT DEFAULT '',
  q6          TEXT DEFAULT '',
  q7          TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, date)
);

-- 索引加速查询
CREATE INDEX idx_journal_entries_user_date ON journal_entries(user_id, date DESC);

-- 开启 Row Level Security（每个用户只能访问自己的数据）
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own entries"
  ON journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own entries"
  ON journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries"
  ON journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries"
  ON journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- 自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
