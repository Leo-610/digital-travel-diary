# 🔧 OAuth登录错误修复指南

## 问题分析

### 1. OAuth回调错误 (主要问题)
```
error=server_error&error_code=unexpected_failure&error_description=Unable+to+exchange+external+code
```

**根本原因：** GitHub OAuth应用的Authorization callback URL配置错误

### 2. 图片路径错误 (次要问题)
```
GET https://leo-610.github.io/digital-travel-diary/${entry.imageData} 404 (Not Found)
GET https://leo-610.github.io/digital-travel-diary/${imageSrc} 404 (Not Found)
```

**原因：** 代码中有未正确处理的模板字符串

## 🚨 立即修复步骤

### Step 1: 修复GitHub OAuth配置
1. 访问GitHub应用设置：https://github.com/settings/applications/2803708
2. 找到 "Authorization callback URL" 字段
3. **当前错误配置：** `https://leo-610.github.io/digital-travel-diary`
4. **修改为正确配置：** `https://muawpgjdzoxhkpxghuvt.supabase.co/auth/v1/callback`
5. 点击 "Update application" 保存

### Step 2: 验证Supabase配置
访问：https://supabase.com/dashboard/project/muawpgjdzoxhkpxghuvt/auth/providers
确认：
- GitHub Provider已启用
- Client ID: `Ov23litdrUDT1zpx6uRj`
- Client Secret: 已正确填写
- Site URL: `https://leo-610.github.io/digital-travel-diary`

### Step 3: 修复图片路径问题
需要修复index.html中的模板变量问题（我会在下一步自动修复）

## 🔄 OAuth流程说明
```
用户点击GitHub登录
    ↓
重定向到GitHub授权页面
    ↓
用户授权后，GitHub重定向到Supabase回调地址
https://muawpgjdzoxhkpxghuvt.supabase.co/auth/v1/callback
    ↓
Supabase处理授权码，创建会话
    ↓
Supabase重定向用户回到网站
https://leo-610.github.io/digital-travel-diary
```

## ⚠️ 关键点
- GitHub OAuth回调URL必须指向Supabase，不是你的网站
- 网站URL在Supabase的Site URL中配置
- 这两个URL的作用不同，不能混淆

---
修复时间：2025年8月2日 22:25
