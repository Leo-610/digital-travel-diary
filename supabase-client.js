// Supabase 客户端配置
class SupabaseClient {
    constructor() {
        // 这些配置需要从Supabase项目中获取
        this.supabaseUrl = 'https://muawpgjdzoxhkpxghuvt.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11YXdwZ2pkem94aGtweGdodXZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMjMzMDIsImV4cCI6MjA2OTU5OTMwMn0.lfZkqfjNS7aE1SZMelabuayNz0niOsqTzszBBl9Pfzk';
        this.supabase = null;
        this.currentUser = null;
        this.session = null;
        
        this.init();
    }
    
    async init() {
        // 动态加载Supabase
        if (typeof window !== 'undefined') {
            try {
                const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
                this.supabase = createClient(this.supabaseUrl, this.supabaseKey, {
                    auth: {
                        autoRefreshToken: true,
                        persistSession: true,
                        detectSessionInUrl: false
                    }
                });
                
                // 监听认证状态变化
                this.supabase.auth.onAuthStateChange((event, session) => {
                    console.log('认证状态变化:', event, session?.user?.email);
                    this.session = session;
                    this.currentUser = session?.user || null;
                    this.onAuthStateChange(event, session);
                });
                
                // 检查现有会话
                const { data: { session }, error } = await this.supabase.auth.getSession();
                if (error) {
                    console.error('获取会话时出错:', error);
                    // 清理可能损坏的会话数据
                    localStorage.removeItem('sb-muawpgjdzoxhkpxghuvt-auth-token');
                }
                this.session = session;
                this.currentUser = session?.user || null;
                
            } catch (error) {
                console.error('Supabase初始化失败:', error);
            }
        }
    }
    
    onAuthStateChange(event, session) {
        // 认证状态变化时的回调
        if (event === 'SIGNED_IN') {
            console.log('用户已登录');
            this.updateUIForLoggedInUser();
        } else if (event === 'SIGNED_OUT') {
            console.log('用户已登出');
            this.updateUIForLoggedOutUser();
        }
    }
    
    // 用户注册
    async signUp(email, password, nickname) {
        try {
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        nickname: nickname
                    }
                }
            });
            
            if (error) throw error;
            
            // 创建用户档案
            if (data.user) {
                await this.createUserProfile(data.user.id, nickname);
            }
            
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // 用户登录
    async signIn(email, password) {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // 用户登出
    async signOut() {
        try {
            // 使用 local 作用域而不是 global，避免 403 错误
            const { error } = await this.supabase.auth.signOut({ scope: 'local' });
            if (error) {
                console.warn('Supabase 登出错误:', error);
                // 即使 Supabase 返回错误，也清理本地状态
            }
            
            // 清理本地会话数据
            this.clearLocalSession();
            
            return { success: true };
        } catch (error) {
            // 即使出错也要清理本地状态
            this.clearLocalSession();
            
            console.error('登出过程中出错:', error);
            return { success: false, error: error.message };
        }
    }

    // 清理本地会话数据
    clearLocalSession() {
        try {
            this.currentUser = null;
            this.session = null;
            
            if (typeof window !== 'undefined') {
                // 清理 Supabase 相关的本地存储
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith('sb-muawpgjdzoxhkpxghuvt-auth')) {
                        localStorage.removeItem(key);
                    }
                });
                
                // 清理会话存储
                sessionStorage.clear();
            }
            
            console.log('本地会话数据已清理');
        } catch (error) {
            console.error('清理本地会话时出错:', error);
        }
    }
    
    // 创建用户档案
    async createUserProfile(userId, nickname) {
        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .insert([{
                    id: userId,
                    nickname: nickname,
                    created_at: new Date().toISOString()
                }]);
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // 更新用户档案
    async updateProfile(profileData) {
        try {
            if (!this.currentUser) {
                throw new Error('用户未登录');
            }
            
            const { data, error } = await this.supabase
                .from('profiles')
                .upsert({
                    id: this.currentUser.id,
                    ...profileData,
                    updated_at: new Date().toISOString()
                })
                .select();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // 上传头像
    async uploadAvatar(file) {
        try {
            if (!this.currentUser) {
                throw new Error('用户未登录');
            }
            
            const fileExt = file.name.split('.').pop();
            const fileName = `${this.currentUser.id}/${Date.now()}.${fileExt}`;
            
            const { data, error } = await this.supabase.storage
                .from('avatars')
                .upload(fileName, file, {
                    upsert: false
                });
            
            if (error) throw error;
            
            // 获取公共URL
            const { data: { publicUrl } } = this.supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);
            
            return { success: true, url: publicUrl };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // 保存日记
    async saveDiary(diaryData) {
        try {
            if (!this.currentUser) {
                throw new Error('用户未登录');
            }
            
            const { data, error } = await this.supabase
                .from('diary_entries')
                .insert([{
                    ...diaryData,
                    user_id: this.currentUser.id,
                    is_public: true,  // 显式设置为公开
                    created_at: new Date().toISOString()
                }])
                .select();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // 获取所有日记（临时方案：分别查询后合并）
    async getAllDiaries() {
        try {
            // 先获取所有日记
            const { data: diaries, error: diaryError } = await this.supabase
                .from('diary_entries')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (diaryError) throw diaryError;
            
            // 获取所有用户资料
            const { data: profiles, error: profileError } = await this.supabase
                .from('profiles')
                .select('id, nickname, avatar_url');
            
            if (profileError) throw profileError;
            
            // 创建用户ID到资料的映射
            const profileMap = profiles.reduce((acc, profile) => {
                acc[profile.id] = profile;
                return acc;
            }, {});
            
            // 按用户分组并添加用户资料
            const groupedByUser = diaries.reduce((acc, entry) => {
                const userId = entry.user_id;
                if (!acc[userId]) {
                    acc[userId] = {
                        user: profileMap[userId] || { nickname: '未知用户', avatar_url: null },
                        entries: []
                    };
                }
                acc[userId].entries.push(entry);
                return acc;
            }, {});
            
            return { success: true, data: groupedByUser };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // 获取单个日记
    async getDiary(diaryId) {
        try {
            const { data, error } = await this.supabase
                .from('diary_entries')
                .select('*')
                .eq('id', diaryId)
                .single();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // 获取当前用户的日记
    async getUserDiaries() {
        try {
            if (!this.currentUser) {
                throw new Error('用户未登录');
            }

            const { data: diaries, error } = await this.supabase
                .from('diary_entries')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            return { success: true, data: diaries || [] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // 更新日记
    async updateDiary(diaryId, diaryData) {
        try {
            if (!this.currentUser) {
                throw new Error('用户未登录');
            }

            const { data, error } = await this.supabase
                .from('diary_entries')
                .update({
                    ...diaryData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', diaryId)
                .eq('user_id', this.currentUser.id) // 确保只能编辑自己的日记
                .select();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // 删除日记
    async deleteDiary(diaryId) {
        try {
            if (!this.currentUser) {
                throw new Error('用户未登录');
            }

            const { error } = await this.supabase
                .from('diary_entries')
                .delete()
                .eq('id', diaryId)
                .eq('user_id', this.currentUser.id); // 确保只能删除自己的日记
            
            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // 获取用户档案
    async getUserProfile(userId) {
        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // 检查是否已登录
    isLoggedIn() {
        return !!this.currentUser;
    }
    
    // 获取当前用户
    getCurrentUser() {
        return this.currentUser;
    }
    
    // 更新UI为已登录状态
    updateUIForLoggedInUser() {
        // 显示用户信息和登出按钮
        const loginSection = document.getElementById('login-section');
        const userSection = document.getElementById('user-section');
        
        if (loginSection) loginSection.style.display = 'none';
        if (userSection) userSection.style.display = 'block';
        
        // 更新用户信息显示
        this.updateUserDisplay();
        
        // 启用云端模式
        this.enableCloudMode();
    }
    
    // 更新UI为未登录状态
    updateUIForLoggedOutUser() {
        const loginSection = document.getElementById('login-section');
        const userSection = document.getElementById('user-section');
        
        if (loginSection) loginSection.style.display = 'block';
        if (userSection) userSection.style.display = 'none';
        
        // 禁用云端模式
        this.disableCloudMode();
    }
    
    // 更新用户信息显示
    async updateUserDisplay() {
        if (!this.currentUser) return;
        
        try {
            const profileResult = await this.getUserProfile(this.currentUser.id);
            if (profileResult.success) {
                const profile = profileResult.data;
                
                // 更新头像
                const avatarImg = document.getElementById('user-avatar');
                if (avatarImg && profile.avatar_url) {
                    avatarImg.src = profile.avatar_url;
                }
                
                // 更新昵称
                const nicknameSpan = document.getElementById('user-nickname');
                if (nicknameSpan) {
                    nicknameSpan.textContent = profile.nickname || this.currentUser.email;
                }
            }
        } catch (error) {
            console.error('更新用户显示失败:', error);
        }
    }
    
    // 启用云端模式
    enableCloudMode() {
        // 显示云端功能按钮
        const cloudButtons = document.querySelectorAll('.cloud-feature');
        cloudButtons.forEach(btn => btn.style.display = 'inline-block');
        
        // 加载云端日记
        this.loadCloudDiaries();
    }
    
    // 禁用云端模式
    disableCloudMode() {
        const cloudButtons = document.querySelectorAll('.cloud-feature');
        cloudButtons.forEach(btn => btn.style.display = 'none');
    }
    
    // 加载云端日记
    async loadCloudDiaries() {
        try {
            const result = await this.getAllDiaries();
            if (result.success) {
                this.displaySharedDiaries(result.data);
            }
        } catch (error) {
            console.error('加载云端日记失败:', error);
        }
    }
    
    // 显示共享日记
    displaySharedDiaries(groupedDiaries) {
        const container = document.getElementById('shared-diaries-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        Object.entries(groupedDiaries).forEach(([userId, userData]) => {
            const userSection = document.createElement('div');
            userSection.className = 'user-diary-section';
            
            const userHeader = document.createElement('div');
            userHeader.className = 'user-header';
            userHeader.innerHTML = `
                <img src="${userData.user.avatar_url || './default-avatar.svg'}" alt="头像" class="user-avatar-small">
                <h3>${userData.user.nickname}</h3>
                <span class="diary-count">${userData.entries.length} 篇日记</span>
            `;
            
            const entriesContainer = document.createElement('div');
            entriesContainer.className = 'user-entries';
            
            userData.entries.forEach(entry => {
                const entryElement = this.createDiaryEntryElement(entry);
                entriesContainer.appendChild(entryElement);
            });
            
            userSection.appendChild(userHeader);
            userSection.appendChild(entriesContainer);
            container.appendChild(userSection);
        });
    }
    
    // 创建日记条目元素
    createDiaryEntryElement(entry) {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'shared-diary-entry';
        
        entryDiv.innerHTML = `
            <div class="entry-header">
                <h4>${entry.title || '无标题'}</h4>
                <span class="entry-date">${new Date(entry.created_at).toLocaleDateString()}</span>
            </div>
            <div class="entry-content">
                <p>${entry.content}</p>
                ${entry.images ? `<div class="entry-images">
                    ${this.parseImages(entry.images).map(img => `<img src="${img}" alt="图片" class="entry-image-thumb">`).join('')}
                </div>` : ''}
            </div>
            <div class="entry-location">
                <i class="location-icon">📍</i>
                <span>${entry.location || '未知位置'}</span>
            </div>
        `;
        
        return entryDiv;
    }
    
    // 安全解析图片数据
    parseImages(images) {
        try {
            if (!images) return [];
            if (typeof images === 'string') {
                // 如果是空字符串或只有空白字符
                if (!images.trim()) return [];
                return JSON.parse(images);
            }
            if (Array.isArray(images)) {
                return images;
            }
            return [];
        } catch (error) {
            console.warn('解析图片数据失败:', error, '原始数据:', images);
            return [];
        }
    }
}

// 全局Supabase客户端实例
window.supabaseClient = new SupabaseClient();
