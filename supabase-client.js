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
            
            console.log('💾 更新用户档案:', profileData);
            
            // 先获取现有档案数据
            const existingProfile = await this.getUserProfile(this.currentUser.id);
            if (!existingProfile.success) {
                throw new Error('无法获取现有档案数据');
            }
            
            // 合并现有数据和新数据
            const updateData = {
                id: this.currentUser.id,
                ...existingProfile.data,  // 保留现有数据
                ...profileData,          // 覆盖新数据
                updated_at: new Date().toISOString()
            };
            console.log('📝 更新数据:', updateData);
            
            const { data, error } = await this.supabase
                .from('profiles')
                .upsert(updateData)
                .select();
            
            if (error) {
                console.error('❌ 更新档案失败:', error);
                throw error;
            }
            
            console.log('✅ 档案更新成功:', data);
            return { success: true, data };
        } catch (error) {
            console.error('❌ updateProfile 错误:', error);
            return { success: false, error: error.message };
        }
    }
    
    // 上传头像
    async uploadAvatar(file) {
        try {
            if (!this.currentUser) {
                throw new Error('用户未登录');
            }
            
            console.log('📤 开始上传头像:', file.name, file.size);
            const fileExt = file.name.split('.').pop();
            const fileName = `${this.currentUser.id}/avatar.${fileExt}`;
            console.log('📁 文件路径:', fileName);
            
            const { data, error } = await this.supabase.storage
                .from('avatars')
                .upload(fileName, file, {
                    upsert: true  // 允许覆盖现有文件
                });
            
            if (error) {
                console.error('❌ 头像上传失败:', error);
                throw error;
            }
            
            console.log('✅ 头像上传成功:', data);
            
            // 获取公共URL
            const { data: { publicUrl } } = this.supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);
            
            console.log('🔗 获取公共URL:', publicUrl);
            return { success: true, url: publicUrl };
        } catch (error) {
            console.error('❌ uploadAvatar 错误:', error);
            return { success: false, error: error.message };
        }
    }
    
    // 保存日记
    async saveDiary(diaryData) {
        try {
            if (!this.currentUser) {
                throw new Error('用户未登录');
            }
            
            console.log('💾 保存日记数据:', diaryData);
            
            // 处理数据格式，移除不存在的date字段
            const processedData = {
                title: diaryData.title,
                content: diaryData.content,
                location: diaryData.location || null,
                tags: Array.isArray(diaryData.tags) ? diaryData.tags : 
                      (typeof diaryData.tags === 'string' ? diaryData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []),
                latitude: diaryData.latitude ? parseFloat(diaryData.latitude) : null,
                longitude: diaryData.longitude ? parseFloat(diaryData.longitude) : null,
                images: diaryData.images || [],
                user_id: this.currentUser.id,
                is_public: true,  // 显式设置为公开
                created_at: new Date().toISOString()
            };
            
            console.log('🔄 处理后的保存数据:', processedData);
            
            const { data, error } = await this.supabase
                .from('diary_entries')
                .insert([processedData])
                .select();
            
            if (error) {
                console.error('❌ Supabase保存错误:', error);
                throw error;
            }
            
            console.log('✅ 日记保存成功:', data);
            return { success: true, data };
        } catch (error) {
            console.error('❌ saveDiary 详细错误:', error);
            return { success: false, error: error.message };
        }
    }
    
    // 获取所有日记（临时方案：分别查询后合并）
    async getAllDiaries() {
        try {
            console.log('🔍 开始获取所有日记...');
            // 先获取所有日记
            const { data: diaries, error: diaryError } = await this.supabase
                .from('diary_entries')
                .select('*')
                .order('created_at', { ascending: false });
            
            console.log('📊 数据库查询结果:', { diaries: diaries?.length || 0, error: diaryError });
            
            if (diaryError) throw diaryError;
            
            // 获取所有用户资料
            const { data: profiles, error: profileError } = await this.supabase
                .from('profiles')
                .select('id, nickname, avatar_url');
            
            console.log('👤 用户资料查询结果:', { profiles: profiles?.length || 0, error: profileError });
            
            if (profileError) throw profileError;
            
            // 获取当前用户的收藏状态
            let userLikes = [];
            if (this.currentUser) {
                const { data: likes, error: likesError } = await this.supabase
                    .from('diary_likes')
                    .select('diary_id')
                    .eq('user_id', this.currentUser.id);
                
                console.log('❤️ 用户收藏查询结果:', { likes: likes?.length || 0, error: likesError });
                
                if (!likesError) {
                    userLikes = likes.map(like => like.diary_id);
                }
            }
            
            // 创建用户ID到资料的映射
            const profileMap = profiles.reduce((acc, profile) => {
                acc[profile.id] = profile;
                return acc;
            }, {});
            
            // 按用户分组并添加用户资料和收藏状态
            const groupedByUser = diaries.reduce((acc, entry) => {
                const userId = entry.user_id;
                if (!acc[userId]) {
                    acc[userId] = {
                        user: profileMap[userId] || { nickname: '未知用户', avatar_url: null },
                        entries: []
                    };
                }
                
                // 添加收藏状态
                entry.favorited = userLikes.includes(entry.id);
                acc[userId].entries.push(entry);
                return acc;
            }, {});
            
            console.log('📊 最终分组结果:', { 
                totalUsers: Object.keys(groupedByUser).length,
                totalEntries: diaries.length,
                usersWithEntries: Object.entries(groupedByUser).map(([userId, data]) => ({
                    userId,
                    nickname: data.user.nickname,
                    entriesCount: data.entries.length
                }))
            });
            
            return { success: true, data: groupedByUser };
        } catch (error) {
            console.error('❌ getAllDiaries 错误:', error);
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

            console.log('📝 更新日记数据:', diaryData);
            
            // 数据格式处理和验证 - 移除不存在的date字段
            const processedData = {
                title: diaryData.title,
                content: diaryData.content,
                location: diaryData.location || null,
                tags: Array.isArray(diaryData.tags) ? diaryData.tags : 
                      (typeof diaryData.tags === 'string' ? diaryData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []),
                latitude: diaryData.latitude ? parseFloat(diaryData.latitude) : null,
                longitude: diaryData.longitude ? parseFloat(diaryData.longitude) : null,
                images: diaryData.images || [],
                updated_at: new Date().toISOString()
            };
            
            // 注意：数据库表中没有date字段，只有created_at字段
            // 如果需要用户自定义日期，需要先添加该字段到数据库
            console.log('⚠️ 注意：数据库表中没有date字段，跳过日期处理');
            
            console.log('🔄 处理后的数据:', processedData);

            const { data, error } = await this.supabase
                .from('diary_entries')
                .update(processedData)
                .eq('id', diaryId)
                .eq('user_id', this.currentUser.id) // 确保只能编辑自己的日记
                .select();
            
            if (error) {
                console.error('❌ Supabase更新错误:', error);
                throw error;
            }
            
            console.log('✅ 日记更新成功:', data);
            return { success: true, data };
        } catch (error) {
            console.error('❌ updateDiary 详细错误:', error);
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
    
    // 切换日记收藏状态
    async toggleDiaryLike(diaryId) {
        try {
            if (!this.currentUser) {
                throw new Error('用户未登录');
            }

            // 先检查是否已经收藏
            const { data: existingLike, error: checkError } = await this.supabase
                .from('diary_likes')
                .select('id')
                .eq('diary_id', diaryId)
                .eq('user_id', this.currentUser.id)
                .single();

            if (checkError && checkError.code !== 'PGRST116') {
                throw checkError;
            }

            if (existingLike) {
                // 已收藏，取消收藏
                const { error } = await this.supabase
                    .from('diary_likes')
                    .delete()
                    .eq('diary_id', diaryId)
                    .eq('user_id', this.currentUser.id);
                
                if (error) throw error;
                return { success: true, isLiked: false };
            } else {
                // 未收藏，添加收藏
                const { error } = await this.supabase
                    .from('diary_likes')
                    .insert([{
                        diary_id: diaryId,
                        user_id: this.currentUser.id,
                        created_at: new Date().toISOString()
                    }]);
                
                if (error) throw error;
                return { success: true, isLiked: true };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // 检查日记是否被当前用户收藏
    async isDiaryLiked(diaryId) {
        try {
            if (!this.currentUser) {
                return { success: true, isLiked: false };
            }

            const { data, error } = await this.supabase
                .from('diary_likes')
                .select('id')
                .eq('diary_id', diaryId)
                .eq('user_id', this.currentUser.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            return { success: true, isLiked: !!data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // 获取用户档案
    async getUserProfile(userId) {
        try {
            console.log('🔍 查询用户档案:', userId);
            const { data, error } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            
            if (error) {
                console.error('❌ 查询用户档案失败:', error);
                
                // 如果是因为记录不存在，尝试创建档案
                if (error.code === 'PGRST116') {
                    console.log('📝 档案不存在，尝试创建...');
                    const user = this.getCurrentUser();
                    if (user) {
                        const nickname = user.email.split('@')[0];
                        const createResult = await this.createUserProfile(userId, nickname);
                        if (createResult.success) {
                            // 重新查询档案
                            return await this.getUserProfile(userId);
                        }
                    }
                }
                throw error;
            }
            
            console.log('✅ 用户档案查询成功:', data);
            return { success: true, data };
        } catch (error) {
            console.error('❌ getUserProfile 错误:', error);
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
        
        // 同步全局认证状态
        if (typeof window.syncAuthState === 'function') {
            window.syncAuthState();
        }
        
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
        
        // 同步全局认证状态
        if (typeof window.syncAuthState === 'function') {
            window.syncAuthState();
        }
        
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
        
        // 不再自动加载云端日记，让用户手动切换到共享视图
        console.log('✅ 云端模式已启用');
    }
    
    // 禁用云端模式
    disableCloudMode() {
        const cloudButtons = document.querySelectorAll('.cloud-feature');
        cloudButtons.forEach(btn => btn.style.display = 'none');
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
