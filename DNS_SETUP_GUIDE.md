# DNS解析配置指南

## 当前状态
域名：`www.digital-travel-diary-leo.top`
检测时间：2025年8月2日 14:24:47
状态：**DNS解析未生效**

## 问题分析
根据DNS检测结果，大部分地区显示解析结果为空（"-"），表明：
1. DNS记录未正确配置
2. DNS传播尚未完成
3. 部分地区出现错误解析（192.168.0.0, 127.0.0.2）

## 解决步骤

### 1. 确认部署状态
首先确认你的应用已经成功部署到托管平台：

**如果部署在Vercel：**
- 登录 [Vercel Dashboard](https://vercel.com/dashboard)
- 确认项目部署成功
- 获取分配的域名（如：`your-app-name.vercel.app`）

**如果部署在Netlify：**
- 登录 [Netlify](https://app.netlify.com/)
- 确认项目部署成功
- 获取分配的域名（如：`your-app-name.netlify.app`）

### 2. 配置自定义域名

#### 在Vercel中配置：
1. 进入项目设置 → Domains
2. 添加自定义域名：`digital-travel-diary-leo.top`
3. 添加www子域名：`www.digital-travel-diary-leo.top`
4. Vercel会提供DNS配置信息

#### 在Netlify中配置：
1. 进入Site settings → Domain management
2. 添加自定义域名
3. 获取DNS配置信息

### 3. 配置域名DNS记录

登录你的域名注册商管理后台（如阿里云、腾讯云等），添加以下DNS记录：

**方案A：直接解析到IP地址**
```
记录类型: A
主机记录: @
记录值: [部署服务器的IP地址]
TTL: 600

记录类型: A
主机记录: www
记录值: [部署服务器的IP地址]
TTL: 600
```

**方案B：使用CNAME（推荐用于Vercel/Netlify）**
```
记录类型: CNAME
主机记录: www
记录值: [Vercel/Netlify提供的域名]
TTL: 600

记录类型: A
主机记录: @
记录值: [平台提供的IP地址]
TTL: 600
```

### 4. 等待DNS传播
- DNS记录生效通常需要 **10分钟到48小时**
- 可以使用以下工具检查传播状态：
  - [DNS Checker](https://dnschecker.org/)
  - [阿里云DNS检测](https://boce.aliyun.com/detect/dns)

## 验证步骤

### 1. 本地验证
```bash
# Windows命令行
nslookup www.digital-travel-diary-leo.top

# 或者
ping www.digital-travel-diary-leo.top
```

### 2. 在线验证
- 访问 `http://www.digital-travel-diary-leo.top`
- 检查是否能正常访问应用

### 3. HTTPS配置
域名解析成功后，托管平台通常会自动配置SSL证书：
- Vercel：自动配置Let's Encrypt证书
- Netlify：自动配置SSL证书

## 常见问题

**Q: 为什么有些地区显示192.168.0.0或127.0.0.2？**
A: 这表明DNS配置有问题，这些是内网IP，需要检查DNS记录配置。

**Q: 配置后还是无法访问？**
A: 
1. 检查DNS记录是否正确保存
2. 等待更长时间让DNS传播完成
3. 清除浏览器DNS缓存（Chrome: chrome://net-internals/#dns）

**Q: 部分地区能访问，部分地区不能？**
A: 这是DNS传播过程中的正常现象，耐心等待全球传播完成。

## 紧急访问方案

在DNS完全生效前，可以使用以下方式访问：
1. 直接使用托管平台分配的域名（如：`your-app.vercel.app`）
2. 临时修改本地hosts文件进行测试

## 下一步
DNS解析生效后，记得：
1. 更新Supabase配置中的Site URL为正确域名
2. 测试用户注册邮件验证功能
3. 确认所有功能在新域名下正常工作
