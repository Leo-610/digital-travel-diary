<<<<<<< HEAD
# 🚀 Vercel部署指南

## 快速部署到Vercel

### 第一步：准备工作
确保项目结构正确：
```
数字旅行记忆馆/
├── public/
│   ├── index.html
│   └── supabase-client.js
├── server.js
├── package.json
├── vercel.json
└── README.md
```

### 第二步：安装Vercel CLI
```bash
npm install -g vercel
```

### 第三步：登录Vercel
```bash
vercel login
```

### 第四步：部署
在项目根目录运行：
```bash
vercel --prod
```

### 第五步：配置环境变量
在Vercel控制台中添加：
- `SUPABASE_URL`: https://muawpgjdzoxhkpxghuvt.supabase.co
- `SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

### 预期域名
部署成功后，您将获得类似以下的域名：
- `digital-travel-diary.vercel.app`
- `travel-diary-xxx.vercel.app`

## 手动部署选项

如果CLI部署有问题，您也可以：

1. 将项目上传到GitHub
2. 在Vercel网站连接GitHub仓库
3. 自动部署

部署成功！🎉
=======
# 🚀 Vercel部署指南

## 快速部署到Vercel

### 第一步：准备工作
确保项目结构正确：
```
数字旅行记忆馆/
├── public/
│   ├── index.html
│   └── supabase-client.js
├── server.js
├── package.json
├── vercel.json
└── README.md
```

### 第二步：安装Vercel CLI
```bash
npm install -g vercel
```

### 第三步：登录Vercel
```bash
vercel login
```

### 第四步：部署
在项目根目录运行：
```bash
vercel --prod
```

### 第五步：配置环境变量
在Vercel控制台中添加：
- `SUPABASE_URL`: https://muawpgjdzoxhkpxghuvt.supabase.co
- `SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

### 预期域名
部署成功后，您将获得类似以下的域名：
- `digital-travel-diary.vercel.app`
- `travel-diary-xxx.vercel.app`

## 手动部署选项

如果CLI部署有问题，您也可以：

1. 将项目上传到GitHub
2. 在Vercel网站连接GitHub仓库
3. 自动部署

部署成功！🎉
>>>>>>> 75131430882a627904defc03312c42e7e3d4ade4
