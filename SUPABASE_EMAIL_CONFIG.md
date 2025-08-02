# Supabase 邮件验证配置指南

## 问题说明
用户注册后收到的验证邮件链接指向 `http://localhost:3000`，这会导致邮件验证失败。

## DNS解析问题
如果域名DNS解析未生效，会导致邮件验证链接无法正常访问。

### DNS解析检查
- 使用工具检查域名解析状态：[阿里云DNS检测](https://boce.aliyun.com/detect/dns)
- 确保域名正确解析到部署服务器的IP地址
- DNS传播通常需要24-48小时完全生效

### 常见DNS配置
```
记录类型: A
主机记录: www
记录值: [你的服务器IP地址]
TTL: 600

记录类型: A  
主机记录: @
记录值: [你的服务器IP地址]
TTL: 600
```

## 解决方案

### 1. 在 Supabase 控制台配置网站 URL

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **Authentication** > **Settings**
4. 在 **General** 选项卡中找到 **Site URL**
5. 将 Site URL 设置为你的实际域名，例如：
   - 如果部署在 Vercel：`https://your-app-name.vercel.app`
   - 如果部署在 Netlify：`https://your-app-name.netlify.app`
   - 如果部署在 GitHub Pages：`https://leo-610.github.io/digital-travel-diary`
   - 如果是自定义域名：`https://your-domain.com`

### 2. 配置重定向 URLs

在同一个页面的 **Redirect URLs** 部分添加允许的重定向地址：
- 添加你的生产环境URL：`https://leo-610.github.io/digital-travel-diary`
- 如果有自定义域名：`https://your-domain.com`
- 如果需要本地开发，也可以添加：`http://localhost:3000`

### 3. 邮件模板配置（可选）

在 **Authentication** > **Email Templates** 中，你可以自定义邮件模板：
- **Confirm signup**：用户注册确认邮件
- **Magic Link**：魔法链接邮件
- **Change Email Address**：更改邮箱地址确认邮件

确保模板中的链接指向正确的域名。

## 代码修改说明

代码已经更新为自动获取当前网站的URL：

```javascript
// 自动获取当前网站URL
const siteUrl = window.location.origin;

// 在注册时设置正确的重定向URL
emailRedirectTo: siteUrl
```

## 测试验证

1. 修改Supabase配置后，清除浏览器缓存
2. 重新注册一个测试账户
3. 检查收到的验证邮件链接是否指向正确的域名
4. 点击链接测试验证流程是否正常

## 常见问题

**Q: 修改后还是显示localhost链接？**
A: 请确保Supabase控制台的配置已保存，并清除浏览器缓存重试。

**Q: 邮件验证后没有自动登录？**
A: 检查页面是否正确处理了URL hash中的认证参数。

**Q: 仍然出现 "access_denied" 错误？**
A: 确保Redirect URLs中包含了你的域名，并且邮件链接没有过期。
