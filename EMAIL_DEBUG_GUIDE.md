# 🔧 邮件验证问题排查指南

## 问题症状
- 用户注册后没有收到验证邮件
- 出现 401 Unauthorized 错误
- 数据库查询失败

## 🎯 立即行动步骤

### 步骤1: 打开调试工具
1. 在浏览器中打开 `debug-supabase.html`
2. 按顺序点击每个检查按钮
3. 记录所有错误信息

### 步骤2: 检查Supabase邮件配置 ⭐ 最重要
1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目 `muawpgjdzoxhkpxghuvt`
3. 进入 **Authentication** → **Settings**
4. 检查以下配置：

#### Site URL 设置
```
当前可能的错误配置: http://localhost:3000
正确配置应该是: https://leo-610.github.io/digital-travel-diary
```

#### Redirect URLs 设置
应该包含以下URL：
```
https://leo-610.github.io/digital-travel-diary
https://leo-610.github.io/digital-travel-diary/
```

### 步骤3: 检查邮件服务状态
1. 在Supabase控制台，进入 **Authentication** → **Settings**
2. 向下滚动到 **SMTP Settings** 部分
3. 检查是否启用了自定义SMTP（如果没有配置，使用默认的Supabase邮件服务）

### 步骤4: 检查用户确认设置
1. 在 **Authentication** → **Settings** 中
2. 找到 **User Management** 部分
3. 确保 **Enable email confirmations** 已启用
4. 检查 **Email confirmation grace period** 设置

## 🔍 详细诊断

### 检查1: 邮件服务是否正常
```bash
# 在调试工具中运行注册测试
# 查看控制台输出的详细错误信息
```

### 检查2: 域名配置
你的项目当前部署在GitHub Pages上：
- URL: `https://leo-610.github.io/digital-travel-diary`
- 确保Supabase配置中的Site URL和Redirect URLs都指向这个地址

### 检查3: 用户权限
401错误通常表示：
1. 未认证用户尝试访问需要认证的资源
2. Token过期或无效
3. RLS (Row Level Security) 策略配置错误

## 🛠️ 修复方案

### 方案1: 重新配置邮件设置
1. 登录Supabase Dashboard
2. 更新Site URL和Redirect URLs
3. 保存设置（⚠️ 重要：确保点击保存）
4. 等待5-10分钟让配置生效
5. 重新测试注册

### 方案2: 检查数据库策略
如果401错误持续，可能是RLS策略问题：

```sql
-- 在Supabase SQL编辑器中检查策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 方案3: 临时禁用邮件确认进行测试
⚠️ 仅用于调试，不建议在生产环境使用：

1. 在Supabase控制台
2. **Authentication** → **Settings**
3. 暂时禁用 **Enable email confirmations**
4. 测试注册是否能正常创建用户
5. 测试完成后重新启用邮件确认

## 📧 常见邮件问题

### 邮件进入垃圾箱
- 检查垃圾邮件文件夹
- 检查"促销"或"社交"标签页（Gmail）
- 将`noreply@mail.supabase.co`添加到白名单

### 邮件发送延迟
- Supabase免费版有邮件发送限制
- 可能需要等待几分钟到几小时

### 邮件服务受限
- 检查你的Supabase项目是否在免费计划限制内
- 考虑升级到付费计划获得更好的邮件服务

## 🆘 紧急联系方式

如果问题持续：
1. 在GitHub Issues中报告问题
2. 提供调试工具的完整输出
3. 包含Supabase项目配置截图
4. 说明具体的错误步骤

## ✅ 成功验证清单

完成修复后，验证以下项目：
- [ ] 调试工具显示连接正常
- [ ] 注册新用户成功
- [ ] 收到验证邮件
- [ ] 邮件链接可以正常访问
- [ ] 邮件验证后用户状态更新
- [ ] 可以正常登录和访问数据

---
*最后更新: 2025年8月2日*
