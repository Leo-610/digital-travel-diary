const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase配置
const supabaseUrl = process.env.SUPABASE_URL || 'https://muawpgjdzoxhkpxghuvt.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11YXdwZ2pkem94aGtweGdodXZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMjMzMDIsImV4cCI6MjA2OTU5OTMwMn0.lfZkqfjNS7aE1SZMelabuayNz0niOsqTzszBBl9Pfzk';
const supabase = createClient(supabaseUrl, supabaseKey);

// 中间件
app.use(helmet({
    contentSecurityPolicy: false, // 暂时禁用CSP以便开发
}));

app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 限制请求频率
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100 // 限制每个IP最多100个请求
});
app.use('/api/', limiter);

// 静态文件服务
app.use(express.static(path.join(__dirname)));

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API路由

// 用户注册
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, nickname } = req.body;
        
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    nickname: nickname
                }
            }
        });
        
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        
        res.json({ message: '注册成功，请检查邮箱验证', user: data.user });
    } catch (error) {
        res.status(500).json({ error: '服务器错误' });
    }
});

// 用户登录
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            return res.status(401).json({ error: error.message });
        }
        
        res.json({ user: data.user, session: data.session });
    } catch (error) {
        res.status(500).json({ error: '服务器错误' });
    }
});

// 用户登出
app.post('/api/auth/logout', async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        
        res.json({ message: '登出成功' });
    } catch (error) {
        res.status(500).json({ error: '服务器错误' });
    }
});

// 获取当前用户信息
app.get('/api/auth/user', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: '未提供访问令牌' });
        }
        
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error) {
            return res.status(401).json({ error: error.message });
        }
        
        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: '服务器错误' });
    }
});

// 保存日记
app.post('/api/diary', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError || !user) {
            return res.status(401).json({ error: '请先登录' });
        }
        
        const diaryData = {
            ...req.body,
            user_id: user.id,
            created_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
            .from('diary_entries')
            .insert([diaryData])
            .select();
        
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        
        res.json({ message: '日记保存成功', data: data[0] });
    } catch (error) {
        res.status(500).json({ error: '服务器错误' });
    }
});

// 获取所有日记（按用户分组）
app.get('/api/diary', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('diary_entries')
            .select(`
                *,
                profiles:user_id (
                    nickname,
                    avatar_url
                )
            `)
            .order('created_at', { ascending: false });
        
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        
        // 按用户分组
        const groupedByUser = data.reduce((acc, entry) => {
            const userId = entry.user_id;
            if (!acc[userId]) {
                acc[userId] = {
                    user: entry.profiles,
                    entries: []
                };
            }
            acc[userId].entries.push(entry);
            return acc;
        }, {});
        
        res.json({ data: groupedByUser });
    } catch (error) {
        res.status(500).json({ error: '服务器错误' });
    }
});

// 更新用户资料（包括头像）
app.put('/api/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError || !user) {
            return res.status(401).json({ error: '请先登录' });
        }
        
        const { nickname, avatar_url } = req.body;
        
        const { data, error } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                nickname,
                avatar_url,
                updated_at: new Date().toISOString()
            })
            .select();
        
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        
        res.json({ message: '资料更新成功', data: data[0] });
    } catch (error) {
        res.status(500).json({ error: '服务器错误' });
    }
});

// 上传头像
app.post('/api/upload/avatar', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError || !user) {
            return res.status(401).json({ error: '请先登录' });
        }
        
        const { file_data, file_name } = req.body;
        
        // 将base64转换为文件
        const base64Data = file_data.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        const fileName = `${user.id}/${Date.now()}_${file_name}`;
        
        const { data, error } = await supabase.storage
            .from('avatars')
            .upload(fileName, buffer, {
                contentType: 'image/jpeg',
                upsert: false
            });
        
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        
        // 获取公共URL
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
        
        res.json({ 
            message: '头像上传成功', 
            avatar_url: publicUrl 
        });
    } catch (error) {
        res.status(500).json({ error: '服务器错误' });
    }
});

// 服务前端页面
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});

module.exports = app;
