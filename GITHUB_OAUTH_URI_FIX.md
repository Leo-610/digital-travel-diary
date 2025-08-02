# 🚨 GitHub OAuth 重定向URI 错误修复指南

## 错误信息
```
Be careful!
The redirect_uri is not associated with this application.
The application might be misconfigured or could be trying to redirect you to a website you weren't expecting.
```

## 问题原因
GitHub OAuth应用中配置的Authorization callback URL与实际请求的URL不完全匹配。

## 🎯 精确修复步骤

### 第1步：访问GitHub OAuth设置
1. 打开：https://github.com/settings/applications
2. 找到你的OAuth应用（通常名为 "digital-travel-diary" 或类似）
3. 点击应用名称进入设置页面

### 第2步：检查当前配置
查看 "Authorization callback URL" 字段中的当前值。

### 第3步：更新为精确URL
将 "Authorization callback URL" 更改为：
```
https://leo-610.github.io/digital-travel-diary
```

**关键要求：**
- ✅ 必须是 `https://`
- ✅ 必须是 `leo-610.github.io`
- ✅ 必须包含 `/digital-travel-diary`
- ✅ **不要**包含尾部斜杠 `/`
- ✅ **不要**包含 `www.`

### 第4步：保存设置
1. 点击 "Update application" 按钮
2. 确认看到成功保存的提示

## 🔍 验证步骤

### 步骤1：等待生效
配置更新后等待2-5分钟让GitHub处理变更。

### 步骤2：清除浏览器缓存
1. 按 `Ctrl+Shift+Delete` (Windows) 或 `Cmd+Shift+Delete` (Mac)
2. 清除缓存和Cookie
3. 或者使用无痕/隐私浏览模式

### 步骤3：测试登录
1. 访问：https://leo-610.github.io/digital-travel-diary
2. 点击 "GitHub登录" 按钮
3. 应该正常跳转到GitHub授权页面
4. 授权后应该能正常返回你的网站

## 🛠️ 备用方案

如果问题持续，尝试以下方案：

### 方案A：添加多个回调URL
一些GitHub OAuth应用支持多个URL，尝试添加：
```
https://leo-610.github.io/digital-travel-diary
https://leo-610.github.io/digital-travel-diary/
```

### 方案B：重建OAuth应用
如果配置仍有问题，可以：
1. 删除现有OAuth应用
2. 创建新的OAuth应用
3. 使用正确的回调URL：`https://leo-610.github.io/digital-travel-diary`
4. 更新Supabase中的GitHub OAuth客户端ID和密钥

## 📋 检查清单

完成修复后验证：
- [ ] GitHub OAuth应用的回调URL已更新
- [ ] 浏览器缓存已清除
- [ ] 能访问 https://leo-610.github.io/digital-travel-diary
- [ ] GitHub登录按钮可点击
- [ ] 点击后跳转到GitHub授权页面
- [ ] 授权后能成功返回网站
- [ ] 登录状态正常显示

## 🆘 仍有问题？

如果按照上述步骤操作后仍有问题：
1. 截图GitHub OAuth应用的设置页面
2. 截图错误消息
3. 检查浏览器开发者工具的控制台错误
4. 确认你有GitHub OAuth应用的管理权限

---
修复时间：2025年8月2日 22:10
