# 道痕日记 — 部署指南

> 预计完成时间：20-30 分钟

---

## 第一步：注册 Supabase（数据库 + 登录）

1. 访问 https://supabase.com → 点击 **Start your project**（免费注册）
2. 创建一个新 Project，记下：
   - **Project URL**（形如 `https://xxxx.supabase.co`）
   - **anon public key**（在 Settings → API 里）
   - **service_role key**（在 Settings → API 里，**保密！**）

3. 进入 **SQL Editor**，把 `supabase-schema.sql` 的内容全选复制，粘贴后点 **Run** 建表

4. 进入 **Authentication → Email Templates**，把登录邮件的语言改成中文（可选）

---

## 第二步：注册 Resend（发邮件）

1. 访问 https://resend.com → 免费注册
2. 进入 **API Keys** → 点 **Create API Key** → 复制保存
3. 进入 **Domains** → 点 **Add Domain**：
   - 如果你有自己的域名，按提示添加 DNS 记录（约5分钟生效）
   - **如果没有域名**，Resend 提供一个默认发件地址，可用于测试

---

## 第三步：上传代码到 GitHub

```bash
# 在项目目录执行
cd daoheng-journal-v2
git init
git add .
git commit -m "init daoheng journal"
# 在 github.com 新建仓库后执行：
git remote add origin https://github.com/你的用户名/daoheng-journal.git
git push -u origin main
```

---

## 第四步：部署到 Vercel

1. 访问 https://vercel.com → 免费注册（可用 GitHub 账号直接登录）
2. 点 **Add New Project** → 选刚才的 GitHub 仓库
3. Framework Preset 选 **Next.js**（自动识别）
4. 展开 **Environment Variables**，填入以下变量：

| 变量名 | 值 |
|--------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key |
| `RESEND_API_KEY` | Resend API Key |
| `RESEND_FROM_EMAIL` | 你的发件邮箱（需在Resend验证） |
| `REMINDER_EMAIL` | 你想接收提醒的邮箱 |
| `CRON_SECRET` | 随便填一个复杂字符串，如 `abc123xyz987` |
| `NEXT_PUBLIC_APP_URL` | 部署完成后 Vercel 给你的网址 |

5. 点 **Deploy** → 等待约2分钟 → 完成！

---

## 第五步：在 Supabase 配置回调地址

1. 进入 Supabase → **Authentication → URL Configuration**
2. **Site URL** 填：`https://你的-vercel域名.vercel.app`
3. **Redirect URLs** 添加：`https://你的-vercel域名.vercel.app/auth/callback`

---

## 提醒时间说明

`vercel.json` 中的 cron 调度时间是 UTC 时间：
```
"0 13 * * *"  →  UTC 13:00 = 北京时间 21:00
```

如需修改，只需改数字（UTC时间），重新推送代码即可。

---

## 手机使用（PWA）

在手机浏览器打开你的网址后：
- **iPhone Safari**：点击分享按钮 → "添加到主屏幕"
- **Android Chrome**：点击菜单 → "添加到主屏幕"

安装后像 App 一样使用，全屏体验。

---

## 遇到问题？

- Supabase 中文文档：https://supabase.com/docs
- Resend 文档：https://resend.com/docs
- Vercel 文档：https://vercel.com/docs
