# 🔧 Supabase 配置指南

本指南将帮助你设置云端功能所需的 Supabase 后端服务。

## 📋 步骤1：创建 Supabase 项目

1. **访问 Supabase**
   - 打开浏览器，访问 [https://supabase.com](https://supabase.com)
   - 点击 "Start your project" 或 "Sign In"

2. **注册或登录**
   - 使用 GitHub、Google 或邮箱注册账号
   - 登录到 Supabase 控制台

3. **创建新项目**
   - 点击 "New Project" 按钮
   - 选择或创建一个组织（Organization）
   - 填写项目信息：
     - **Name**: `digital-travel-diary`（或你喜欢的名称）
     - **Database Password**: 设置一个强密码（记住它！）
     - **Region**: 选择离你最近的地区（如 Southeast Asia (Singapore)）
   - 点击 "Create new project"

4. **等待项目创建**
   - 项目创建需要1-2分钟
   - 创建完成后会自动跳转到项目控制台

## 📋 步骤2：配置数据库

1. **打开 SQL 编辑器**
   - 在左侧菜单中找到并点击 "SQL Editor"
   - 选择 "New query"

2. **执行数据库脚本**
   - 打开项目中的 `database-setup.sql` 文件
   - 复制所有内容
   - 粘贴到 Supabase 的 SQL 编辑器中
   - 点击 "Run" 按钮执行脚本

3. **验证表创建**
   - 在左侧菜单点击 "Table Editor"
   - 应该能看到以下表：
     - `profiles` (用户档案)
     - `diary_entries` (日记条目)
     - `diary_comments` (评论)
     - `diary_likes` (点赞)

## 📋 步骤3：获取项目配置

1. **获取项目URL和密钥**
   - 在左侧菜单点击 "Settings"
   - 选择 "API" 子菜单
   - 记录以下信息：
     - **Project URL**: `https://your-project.supabase.co`
     - **anon public key**: `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...`

2. **配置存储桶**
   - 在左侧菜单点击 "Storage"
   - 确认已创建以下存储桶（应该已自动创建）：
     - `avatars` (用户头像)
     - `diary-images` (日记图片)

## 📋 步骤4：更新应用配置

1. **方法一：修改 supabase-client.js 文件**
   ```javascript
   // 找到这两行并替换为你的实际配置
   this.supabaseUrl = 'https://your-project.supabase.co';
   this.supabaseKey = 'your-anon-public-key';
   ```

2. **方法二：使用环境变量（如果使用服务器）**
   - 复制 `.env.example` 为 `.env`
   - 填入配置信息：
     ```
     SUPABASE_URL=https://your-project.supabase.co
     SUPABASE_ANON_KEY=your-anon-public-key
     ```

## 📋 步骤5：测试配置

1. **打开应用**
   - 用浏览器打开 `index.html`
   - 或运行 `start.bat`

2. **测试云端模式**
   - 点击 "☁️ 云端模式" 按钮
   - 点击 "📝 注册" 创建测试账号
   - 填写邮箱、密码和昵称
   - 点击注册

3. **验证功能**
   - 检查邮箱是否收到验证邮件
   - 点击邮件中的验证链接
   - 返回应用尝试登录
   - 测试创建日记、上传头像等功能

## ⚠️ 常见问题

### 问题1：无法连接到Supabase
**解决方案**：
- 检查项目URL和密钥是否正确
- 确认项目已完全创建（等待状态显示为 "Active"）
- 检查网络连接

### 问题2：注册后无法登录
**解决方案**：
- 检查邮箱中的验证邮件
- 点击验证链接激活账号
- 确认密码至少6位字符

### 问题3：上传图片失败
**解决方案**：
- 确认存储桶已创建
- 检查存储策略是否正确设置
- 重新执行 `database-setup.sql` 脚本

### 问题4：看不到其他用户的日记
**解决方案**：
- 确认已登录云端模式
- 检查 RLS (行级安全) 策略是否正确
- 尝试刷新页面

## 🔒 安全设置

### 启用邮箱验证
1. 在 Supabase 控制台中，点击 "Authentication"
2. 点击 "Settings"
3. 确认 "Enable email confirmations" 已开启

### 配置域名白名单（可选）
1. 在 "Authentication" → "Settings" 中
2. 在 "Site URL" 中设置你的域名
3. 在 "Additional URLs" 中添加允许的域名

## 💰 费用说明

Supabase 提供慷慨的免费套餐：
- **数据库**: 500MB 存储空间
- **文件存储**: 1GB 空间
- **带宽**: 每月 2GB
- **API 请求**: 每月 50,000 次

对于个人使用完全够用！

## 🎉 完成！

配置完成后，你就可以：
- ✅ 注册和登录账号
- ✅ 上传和管理头像
- ✅ 创建云端日记
- ✅ 查看其他用户的共享日记
- ✅ 多设备同步数据

享受你的数字旅行记忆馆吧！ 🌟

---

**需要帮助？** 
- 查看 [Supabase 官方文档](https://supabase.com/docs)
- 或在项目中提交 Issue
