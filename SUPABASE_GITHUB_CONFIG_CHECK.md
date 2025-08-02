# 🔧 Supabase GitHub OAuth 配置检查

## 重要：检查Supabase中的GitHub OAuth设置

### 1. 访问Supabase项目设置
访问：https://supabase.com/dashboard/project/muawpgjdzoxhkpxghuvt/auth/providers

### 2. 找到GitHub Provider配置
在Authentication → Providers页面中找到GitHub设置

### 3. 确认以下配置：

**GitHub OAuth Client ID:**
```
Ov23litdrUDT1zpx6uRj
```

**GitHub OAuth Client Secret:**
```
[你的GitHub应用的Client Secret]
```

**Redirect URL (这个很重要!):**
应该自动显示为：
```
https://muawpgjdzoxhkpxghuvt.supabase.co/auth/v1/callback
```

### 4. Site URL配置
在Authentication → Settings → Site URL中确认：
```
https://leo-610.github.io/digital-travel-diary
```

### 5. Redirect URLs配置
在Authentication → Settings → Redirect URLs中添加：
```
https://leo-610.github.io/digital-travel-diary/**
```

## ⭐ 关键点
GitHub OAuth应用的Authorization callback URL应该指向Supabase的回调地址，而不是你的网站！

### 正确的GitHub OAuth配置应该是：
**Authorization callback URL:**
```
https://muawpgjdzoxhkpxghuvt.supabase.co/auth/v1/callback
```

**不是:**
```
https://leo-610.github.io/digital-travel-diary
```

---
检查时间：2025年8月2日 22:20
