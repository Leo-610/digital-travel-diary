# GitHub Pages 部署指南

## 🚀 为什么选择 GitHub Pages？

### 优势
- ✅ **完全免费**：无需付费，无流量限制
- ✅ **中国可访问**：在中国境内可以正常访问
- ✅ **自动HTTPS**：免费SSL证书
- ✅ **简单易用**：几分钟即可部署
- ✅ **版本控制**：与Git无缝集成
- ✅ **自定义域名**：支持绑定自己的域名

### 你的项目访问地址
```
https://leo-610.github.io/digital-travel-diary
```

## 📋 详细部署步骤

### 步骤1：确保代码已上传
确认你的项目代码已经推送到GitHub仓库：
- 仓库名：`digital-travel-diary`
- 用户名：`Leo-610`
- 分支：`main`

### 步骤2：启用GitHub Pages
1. 访问 https://github.com/Leo-610/digital-travel-diary
2. 点击 **Settings** 选项卡
3. 在左侧菜单中找到 **Pages**
4. 在 **Source** 部分：
   - 选择 **Deploy from a branch**
   - 分支选择：**main**
   - 文件夹选择：**/ (root)**
5. 点击 **Save** 保存

### 步骤3：等待部署完成
- 部署过程通常需要1-5分钟
- 页面会显示部署状态
- 完成后会显示访问链接

### 步骤4：验证部署
访问 `https://leo-610.github.io/digital-travel-diary` 确认：
- 页面正常加载
- 所有功能可用
- 样式正确显示

## 🔧 配置Supabase

部署成功后，需要更新Supabase配置：

### 1. 更新Site URL
登录 [Supabase Dashboard](https://supabase.com/dashboard)：
1. 选择你的项目
2. 进入 **Authentication** > **Settings**
3. 将 **Site URL** 设置为：
   ```
   https://leo-610.github.io/digital-travel-diary
   ```

### 2. 添加重定向URL
在 **Redirect URLs** 中添加：
```
https://leo-610.github.io/digital-travel-diary
http://localhost:3000  (用于本地开发)
```

## 📱 在中国的使用体验

### 访问速度
- **GitHub Pages**：中等速度，偶尔可能较慢
- **建议**：如果需要更快速度，可以考虑：
  - **Gitee Pages**（码云）：国内服务，速度更快
  - **Vercel**：有中国CDN节点
  - **Netlify**：全球CDN

### 稳定性
- GitHub Pages 在中国相对稳定
- 偶尔可能有网络波动
- 99%的时间都可以正常访问

## 🔧 自定义域名（可选）

如果你有自己的域名，可以绑定到GitHub Pages：

### 1. 在GitHub设置自定义域名
1. 在仓库的 **Settings** > **Pages**
2. 在 **Custom domain** 填入你的域名
3. 点击 **Save**

### 2. 配置DNS记录
在你的域名服务商处添加：
```
记录类型: CNAME
主机记录: www
记录值: leo-610.github.io
TTL: 600
```

### 3. 等待生效
- DNS传播需要24-48小时
- GitHub会自动配置SSL证书

## 🚀 部署后的测试清单

### 基本功能测试
- [ ] 页面正常加载
- [ ] 图片和样式显示正确
- [ ] 本地存储功能工作
- [ ] IndexedDB大容量存储正常

### 用户系统测试
- [ ] 用户注册功能
- [ ] 邮件验证链接正确
- [ ] 登录功能正常
- [ ] 云端数据同步

### 日记功能测试
- [ ] 创建日记
- [ ] 上传图片
- [ ] 地图定位
- [ ] 收藏功能

## 🔄 更新和维护

### 更新网站
1. 修改本地代码
2. 推送到GitHub：
   ```bash
   git add .
   git commit -m "更新说明"
   git push origin main
   ```
3. GitHub Pages会自动重新部署

### 监控部署状态
- 在仓库的 **Actions** 选项卡查看部署日志
- 部署失败时会有邮件通知

## 🆚 其他部署方案对比

| 方案 | 费用 | 中国访问 | 配置难度 | 自定义域名 |
|------|------|----------|----------|------------|
| GitHub Pages | 免费 | ✅ 良好 | ⭐ 简单 | ✅ 支持 |
| Vercel | 免费 | ✅ 优秀 | ⭐⭐ 中等 | ✅ 支持 |
| Netlify | 免费 | ✅ 良好 | ⭐⭐ 中等 | ✅ 支持 |
| Gitee Pages | 免费 | ✅ 优秀 | ⭐ 简单 | ❌ 收费 |

## 🎯 推荐方案

对于你的项目，建议：

1. **首选**：GitHub Pages - 简单、免费、稳定
2. **备选**：Vercel - 如果需要更好的中国访问体验
3. **国内**：Gitee Pages - 如果主要面向中国用户

立即开始部署吧！整个过程只需要几分钟。
