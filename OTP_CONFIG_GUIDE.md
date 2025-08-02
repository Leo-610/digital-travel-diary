# 🔧 Supabase OTP 过期时间配置指南

## 问题说明
Supabase 显示警告：
> OTP expiry exceeds recommended threshold
> We have detected that you have enabled the email provider with the OTP expiry set to more than an hour. It is recommended to set this value to less than an hour.

这个警告表明你的邮件验证码（OTP）过期时间设置得太长，可能存在安全风险。

## 🎯 修复步骤

### 步骤1: 登录 Supabase Dashboard
1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目 `muawpgjdzoxhkpxghuvt`

### 步骤2: 进入认证设置
1. 在左侧菜单中点击 **Authentication**
2. 点击 **Settings** 标签

### 步骤3: 调整OTP设置
1. 在页面中找到 **Email** 部分
2. 查找 **OTP expiry** 或 **Email OTP expiry** 设置
3. 将过期时间设置为 **1小时（3600秒）** 或更短
4. 建议设置：
   - **30分钟（1800秒）** - 推荐
   - **15分钟（900秒）** - 更安全
   - **1小时（3600秒）** - 最大推荐值

### 步骤4: 保存设置
1. 点击 **Save** 按钮
2. 等待设置生效（通常是即时的）

## 📧 关于邮件验证的建议

### 当前解决方案
由于你已经启用了 **GitHub OAuth**，这是一个更好的解决方案：

1. **绕过邮件验证问题** - GitHub OAuth 不需要邮件验证
2. **更好的用户体验** - 一键登录，无需记住密码
3. **更高的安全性** - 利用GitHub的安全认证系统

### 双重保障策略
建议同时保留两种登录方式：
1. **GitHub OAuth** - 主要登录方式（推荐）
2. **邮箱+密码** - 备用登录方式

## 🔒 安全最佳实践

### OTP过期时间建议
- **15-30分钟**：最佳安全性，适合敏感应用
- **1小时**：平衡安全性和用户体验
- **超过1小时**：不推荐，存在安全风险

### 为什么要限制OTP过期时间？
1. **减少被截获风险**：时间越短，验证码被恶意使用的可能性越小
2. **防止暴力破解**：限制攻击者的尝试时间窗口
3. **符合安全标准**：遵循行业最佳实践

## ✅ 验证修复
修复后，你应该：
1. 在Supabase Dashboard中不再看到OTP警告
2. 邮件验证码在设置时间后自动过期
3. 用户体验保持良好（推荐使用GitHub登录）

## 🚀 下一步行动

### 优先使用GitHub登录
现在你已经配置了GitHub OAuth，建议：
1. 在应用中突出显示GitHub登录选项
2. 将其作为主要登录方式推广
3. 保留邮箱登录作为备选方案

### 测试建议
1. 测试GitHub登录流程
2. 确认OAuth用户能正常访问应用功能
3. 验证用户档案自动创建功能

---
*GitHub OAuth 登录现已配置完成，这将大大改善用户登录体验！* 🎉
