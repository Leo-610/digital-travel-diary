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
                
                // 获取当前网站的URL（用于邮件验证重定向）
                const siteUrl = window.location.origin;
                console.log('🌐 当前网站URL:', siteUrl);
                
                this.supabase = createClient(this.supabaseUrl, this.supabaseKey, {
                    auth: {
                        autoRefreshToken: true,
                        persistSession: true,
                        detectSessionInUrl: true,
                        // 设置正确的重定向URL
                        redirectTo: siteUrl
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
                
                console.log('✅ Supabase客户端初始化成功');
                console.log('📧 当前用户:', this.currentUser?.email || '未登录');
                
                // 处理邮件确认链接
                this.handleEmailConfirmation();
                
            } catch (error) {
                console.error('❌ 无法加载Supabase客户端:', error);
                console.warn('⚠️ 将以本地模式运行');
            }
        }
    }
    
    // 处理邮件确认
    async handleEmailConfirmation() {
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        const type = urlParams.get('type');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        
        if (error) {
            console.error('邮件确认错误:', error, errorDescription);
            this.showMessage('邮件确认失败：' + (errorDescription || error), 'error');
            return;
        }
        
        if (type === 'signup' && accessToken && refreshToken) {
            try {
                console.log('🔑 处理邮件确认...');
                
                // 设置会话
                const { data, error } = await this.supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken
                });
                
                if (error) {
                    console.error('设置会话失败:', error);
                    this.showMessage('邮件确认失败，请重新尝试', 'error');
                    return;
                }
                
                console.log('✅ 邮件确认成功');
                this.showMessage('邮件验证成功！欢迎加入数字旅行记忆馆！', 'success');
                
                // 清理URL参数
                window.history.replaceState({}, document.title, window.location.pathname);
                
            } catch (error) {
                console.error('邮件确认处理错误:', error);
                this.showMessage('邮件确认出现错误，请重新尝试', 'error');
            }
        }
    }
    
    // 认证状态变化处理
    onAuthStateChange(event, session) {
        if (event === 'SIGNED_IN' && session) {
            console.log('用户已登录:', session.user.email);
            // 更新UI
            if (typeof updateAuthUI === 'function') {
                updateAuthUI();
            }
            // 重新加载数据
            if (typeof loadDiaries === 'function') {
                loadDiaries();
            }
        } else if (event === 'SIGNED_OUT') {
            console.log('用户已登出');
            // 更新UI
            if (typeof updateAuthUI === 'function') {
                updateAuthUI();
            }
            // 重新加载数据
            if (typeof loadDiaries === 'function') {
                loadDiaries();
            }
        }
    }
    
    // 用户注册
    async signUp(email, password, nickname) {
        if (!this.supabase) {
            throw new Error('Supabase 客户端未初始化');
        }
        
        try {
            console.log('📝 开始用户注册...');
            
            // 获取当前网站的URL
            const siteUrl = window.location.origin;
            
            const { data, error } = await this.supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        nickname: nickname
                    },
                    // 设置邮件重定向URL为当前网站
                    emailRedirectTo: siteUrl
                }
            });
            
            if (error) {
                console.error('注册错误:', error);
                throw error;
            }
            
            console.log('✅ 用户注册成功');
            return data;
            
        } catch (error) {
            console.error('注册失败:', error);
            throw error;
        }
    }
    
    // 用户登录
    async signIn(email, password) {
        if (!this.supabase) {
            throw new Error('Supabase 客户端未初始化');
        }
        
        try {
            console.log('🔐 开始用户登录...');
            
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (error) {
                console.error('登录错误:', error);
                throw error;
            }
            
            console.log('✅ 用户登录成功');
            return data;
            
        } catch (error) {
            console.error('登录失败:', error);
            throw error;
        }
    }
    
    // 用户登出
    async signOut() {
        if (!this.supabase) {
            throw new Error('Supabase 客户端未初始化');
        }
        
        try {
            console.log('👋 用户登出...');
            const { error } = await this.supabase.auth.signOut();
            
            if (error) {
                console.error('登出错误:', error);
                throw error;
            }
            
            console.log('✅ 用户登出成功');
            
        } catch (error) {
            console.error('登出失败:', error);
            throw error;
        }
    }
    
    // 获取当前用户
    getCurrentUser() {
        return this.currentUser;
    }
    
    // 检查是否已登录
    isAuthenticated() {
        return this.currentUser !== null;
    }
    
    // 获取用户资料
    async getUserProfile() {
        if (!this.supabase || !this.currentUser) {
            return null;
        }
        
        try {
            const { data, error } = await this.supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .single();
            
            if (error) {
                if (error.code === 'PGRST116') {
                    // 没有找到用户资料，返回默认数据
                    return {
                        user_id: this.currentUser.id,
                        email: this.currentUser.email,
                        nickname: this.currentUser.user_metadata.nickname || '旅行者',
                        bio: '',
                        avatar_url: null
                    };
                }
                console.error('获取用户资料失败:', error);
                return null;
            }
            
            return data;
            
        } catch (error) {
            console.error('获取用户资料失败:', error);
            return null;
        }
    }
    
    // 更新用户资料
    async updateUserProfile(profileData) {
        if (!this.supabase || !this.currentUser) {
            throw new Error('用户未登录');
        }
        
        try {
            console.log('📝 更新用户资料...');
            
            const { data, error } = await this.supabase
                .from('user_profiles')
                .upsert({
                    user_id: this.currentUser.id,
                    email: this.currentUser.email,
                    ...profileData,
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();
            
            if (error) {
                console.error('更新用户资料失败:', error);
                throw error;
            }
            
            console.log('✅ 用户资料更新成功');
            return data;
            
        } catch (error) {
            console.error('更新用户资料失败:', error);
            throw error;
        }
    }
    
    // 上传用户头像
    async uploadAvatar(file) {
        if (!this.supabase || !this.currentUser) {
            throw new Error('用户未登录');
        }
        
        try {
            console.log('📸 上传用户头像...');
            
            const fileExt = file.name.split('.').pop();
            const fileName = `${this.currentUser.id}/avatar.${fileExt}`;
            
            const { data, error } = await this.supabase.storage
                .from('avatars')
                .upload(fileName, file, {
                    upsert: true
                });
            
            if (error) {
                console.error('头像上传失败:', error);
                throw error;
            }
            
            console.log('✅ 头像上传成功');
            
            // 获取公共URL
            const { data: { publicUrl } } = this.supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);
            
            return publicUrl;
            
        } catch (error) {
            console.error('头像上传失败:', error);
            throw error;
        }
    }
    
    // 保存日记到云端
    async saveDiary(diaryData) {
        if (!this.supabase || !this.currentUser) {
            throw new Error('用户未登录');
        }
        
        try {
            console.log('☁️ 保存日记到云端...');
            
            // 准备日记数据
            const diaryToSave = {
                user_id: this.currentUser.id,
                title: diaryData.title,
                content: diaryData.content,
                location: diaryData.location,
                latitude: diaryData.latitude ? parseFloat(diaryData.latitude) : null,
                longitude: diaryData.longitude ? parseFloat(diaryData.longitude) : null,
                tags: Array.isArray(diaryData.tags) ? diaryData.tags : diaryData.tags.split(',').map(tag => tag.trim()),
                diary_date: diaryData.date,
                is_favorite: diaryData.isFavorite || false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            // 如果有ID，则更新；否则创建新记录
            let result;
            if (diaryData.id) {
                diaryToSave.updated_at = new Date().toISOString();
                const { data, error } = await this.supabase
                    .from('travel_diaries')
                    .update(diaryToSave)
                    .eq('id', diaryData.id)
                    .eq('user_id', this.currentUser.id)
                    .select()
                    .single();
                
                if (error) throw error;
                result = data;
            } else {
                const { data, error } = await this.supabase
                    .from('travel_diaries')
                    .insert(diaryToSave)
                    .select()
                    .single();
                
                if (error) throw error;
                result = data;
            }
            
            console.log('✅ 日记保存到云端成功');
            
            // 如果有图片，上传图片
            if (diaryData.images && diaryData.images.length > 0) {
                const imageUrls = await this.uploadDiaryImages(result.id, diaryData.images);
                
                // 更新日记的图片URL
                const { error: updateError } = await this.supabase
                    .from('travel_diaries')
                    .update({ image_urls: imageUrls })
                    .eq('id', result.id);
                
                if (updateError) {
                    console.error('更新图片URL失败:', updateError);
                } else {
                    result.image_urls = imageUrls;
                }
            }
            
            return result;
            
        } catch (error) {
            console.error('保存日记到云端失败:', error);
            throw error;
        }
    }
    
    // 上传日记图片
    async uploadDiaryImages(diaryId, images) {
        if (!this.supabase || !this.currentUser) {
            throw new Error('用户未登录');
        }
        
        try {
            console.log('📸 上传日记图片...');
            
            const imageUrls = [];
            
            for (let i = 0; i < images.length; i++) {
                const file = images[i];
                const fileExt = file.name.split('.').pop();
                const fileName = `${this.currentUser.id}/${diaryId}/image_${i + 1}.${fileExt}`;
                
                const { data, error } = await this.supabase.storage
                    .from('diary-images')
                    .upload(fileName, file, {
                        upsert: true
                    });
                
                if (error) {
                    console.error(`图片 ${i + 1} 上传失败:`, error);
                    continue;
                }
                
                // 获取公共URL
                const { data: { publicUrl } } = this.supabase.storage
                    .from('diary-images')
                    .getPublicUrl(fileName);
                
                imageUrls.push(publicUrl);
            }
            
            console.log('✅ 日记图片上传完成');
            return imageUrls;
            
        } catch (error) {
            console.error('上传日记图片失败:', error);
            throw error;
        }
    }
    
    // 获取用户的所有日记
    async getAllDiaries() {
        if (!this.supabase || !this.currentUser) {
            return [];
        }
        
        try {
            console.log('📖 从云端获取所有日记...');
            
            const { data, error } = await this.supabase
                .from('travel_diaries')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .order('diary_date', { ascending: false });
            
            if (error) {
                console.error('获取日记失败:', error);
                return [];
            }
            
            console.log(`✅ 从云端获取了 ${data.length} 条日记`);
            return data;
            
        } catch (error) {
            console.error('获取日记失败:', error);
            return [];
        }
    }
    
    // 删除日记
    async deleteDiary(diaryId) {
        if (!this.supabase || !this.currentUser) {
            throw new Error('用户未登录');
        }
        
        try {
            console.log('🗑️ 删除云端日记...');
            
            const { error } = await this.supabase
                .from('travel_diaries')
                .delete()
                .eq('id', diaryId)
                .eq('user_id', this.currentUser.id);
            
            if (error) {
                console.error('删除日记失败:', error);
                throw error;
            }
            
            console.log('✅ 云端日记删除成功');
            
        } catch (error) {
            console.error('删除日记失败:', error);
            throw error;
        }
    }
    
    // 切换收藏状态
    async toggleFavorite(diaryId, isFavorite) {
        if (!this.supabase || !this.currentUser) {
            throw new Error('用户未登录');
        }
        
        try {
            console.log('⭐ 更新收藏状态...');
            
            const { data, error } = await this.supabase
                .from('travel_diaries')
                .update({ 
                    is_favorite: isFavorite,
                    updated_at: new Date().toISOString()
                })
                .eq('id', diaryId)
                .eq('user_id', this.currentUser.id)
                .select()
                .single();
            
            if (error) {
                console.error('更新收藏状态失败:', error);
                throw error;
            }
            
            console.log('✅ 收藏状态更新成功');
            return data;
            
        } catch (error) {
            console.error('更新收藏状态失败:', error);
            throw error;
        }
    }
    
    // 显示消息
    showMessage(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // 如果页面有显示消息的函数，调用它
        if (typeof window.showMessage === 'function') {
            window.showMessage(message, type);
        } else {
            // 简单的alert显示
            if (type === 'error') {
                alert('错误: ' + message);
            } else if (type === 'success') {
                alert('成功: ' + message);
            } else {
                alert(message);
            }
        }
    }
}

// 全局Supabase客户端实例
window.supabaseClient = new SupabaseClient();
