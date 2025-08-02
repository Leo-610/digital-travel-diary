# 阿里云域名绑定 Vercel 配置指南

## 域名信息
- 购买域名：digital-travel-diary-leo.top
- 注册商：阿里云
- 目标：绑定到 Vercel 项目

## 第一步：阿里云 DNS 配置

### 1. 登录阿里云控制台
- 访问：https://dns.console.aliyun.com/
- 找到域名：digital-travel-diary-leo.top

### 2. 添加解析记录

**主域名记录**：
```
记录类型: A
主机记录: @
记录值: 216.198.79.1
TTL: 600秒
线路类型: 默认
```

**WWW子域名记录**：
```
记录类型: A  
主机记录: www
记录值: 216.198.79.1
TTL: 600秒
线路类型: 默认
```

**注意**：Vercel 2025年更新，现在推荐使用 A 记录而不是 CNAME 记录。

## 第二步：Vercel 域名绑定

### 1. 登录 Vercel 控制台
- 访问：https://vercel.com/dashboard
- 进入项目：digital-travel-diary

### 2. 配置域名
1. 点击项目名称进入项目详情
2. 点击顶部 "Settings" 选项卡
3. 在左侧菜单找到 "Domains" 
4. 点击 "Add Domain" 按钮

### 3. 添加域名
**主域名**：
```
输入：digital-travel-diary-leo.top
点击 "Add" 按钮
```

**WWW域名**（可选）：
```
输入：www.digital-travel-diary-leo.top  
点击 "Add" 按钮
```

## 第三步：验证配置

### DNS 传播检查
- 等待 10-30 分钟让 DNS 生效
- 使用工具检查：https://www.whatsmydns.net/
- 输入域名查看全球 DNS 传播状态

### 访问测试
生效后可以通过以下地址访问：
- https://digital-travel-diary-leo.top
- https://www.digital-travel-diary-leo.top

## 常见问题

### 1. DNS 未生效
- 等待时间：最多 24 小时
- 清除本地 DNS 缓存：`ipconfig /flushdns`

### 2. SSL 证书
- Vercel 会自动申请 Let's Encrypt 证书
- 通常在域名生效后 1-2 小时内完成

### 3. 访问跳转
- Vercel 会自动处理 HTTP 到 HTTPS 的跳转
- 可以设置 www 到非 www 的跳转（或相反）

## 预期结果

配置成功后：
- ✅ https://digital-travel-diary-leo.top → 你的网站
- ✅ 自动 HTTPS 加密
- ✅ 中国大陆访问速度提升
- ✅ 更专业的域名展示

## 备注
- 配置完成后建议测试所有功能
- 如有问题可以查看 Vercel 项目的 "Functions" 日志
- 域名配置成功后原 vercel.app 域名仍然可用
