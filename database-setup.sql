<<<<<<< HEAD
-- 数字旅行记忆馆数据库初始化脚本
-- 请在Supabase SQL编辑器中执行此脚本

-- 1. 创建用户档案表
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    nickname VARCHAR(50) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建日记条目表
CREATE TABLE IF NOT EXISTS diary_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title VARCHAR(200),
    content TEXT NOT NULL,
    location VARCHAR(200),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    images JSONB,
    tags JSONB,
    weather VARCHAR(100),
    mood VARCHAR(50),
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建评论表（可选功能）
CREATE TABLE IF NOT EXISTS diary_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    diary_id UUID REFERENCES diary_entries(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建点赞表（可选功能）
CREATE TABLE IF NOT EXISTS diary_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    diary_id UUID REFERENCES diary_entries(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(diary_id, user_id)
);

-- 5. 启用行级安全策略 (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_likes ENABLE ROW LEVEL SECURITY;

-- 6. 创建安全策略

-- 用户档案策略
CREATE POLICY "用户可以查看所有档案" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "用户只能更新自己的档案" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "用户可以插入自己的档案" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 日记条目策略
CREATE POLICY "所有人可以查看公开日记" ON diary_entries
    FOR SELECT USING (is_public = true);

CREATE POLICY "用户可以查看自己的所有日记" ON diary_entries
    FOR SELECT USING (auth.uid() = user_id);

-- 为了调试：临时添加查看所有日记的策略（生产环境应该移除）
CREATE POLICY "登录用户可以查看所有日记" ON diary_entries
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "用户只能插入自己的日记" ON diary_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的日记" ON diary_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的日记" ON diary_entries
    FOR DELETE USING (auth.uid() = user_id);

-- 评论策略
CREATE POLICY "所有人可以查看公开日记的评论" ON diary_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM diary_entries 
            WHERE diary_entries.id = diary_comments.diary_id 
            AND diary_entries.is_public = true
        )
    );

CREATE POLICY "已登录用户可以添加评论" ON diary_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的评论" ON diary_comments
    FOR DELETE USING (auth.uid() = user_id);

-- 点赞策略
CREATE POLICY "所有人可以查看公开日记的点赞" ON diary_likes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM diary_entries 
            WHERE diary_entries.id = diary_likes.diary_id 
            AND diary_entries.is_public = true
        )
    );

CREATE POLICY "已登录用户可以点赞" ON diary_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以取消自己的点赞" ON diary_likes
    FOR DELETE USING (auth.uid() = user_id);

-- 7. 创建存储桶（Storage Buckets）
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('diary-images', 'diary-images', true);

-- 8. 创建存储策略
CREATE POLICY "用户可以上传头像" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "所有人可以查看头像" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "用户可以更新自己的头像" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "用户可以删除自己的头像" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "用户可以上传日记图片" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'diary-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "所有人可以查看日记图片" ON storage.objects
    FOR SELECT USING (bucket_id = 'diary-images');

-- 9. 创建触发器函数：自动创建用户档案
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, nickname)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1)));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. 创建触发器：用户注册时自动创建档案
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. 为相关表添加更新时间触发器
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_diary_entries_updated_at
    BEFORE UPDATE ON diary_entries
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 13. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_diary_entries_user_id ON diary_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_diary_entries_created_at ON diary_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diary_entries_location ON diary_entries(location);
CREATE INDEX IF NOT EXISTS idx_diary_comments_diary_id ON diary_comments(diary_id);
CREATE INDEX IF NOT EXISTS idx_diary_likes_diary_id ON diary_likes(diary_id);

-- 完成提示
SELECT 'Digital Travel Diary database setup completed!' AS status;
=======
-- 数字旅行记忆馆数据库初始化脚本
-- 请在Supabase SQL编辑器中执行此脚本

-- 1. 创建用户档案表
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    nickname VARCHAR(50) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建日记条目表
CREATE TABLE IF NOT EXISTS diary_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title VARCHAR(200),
    content TEXT NOT NULL,
    location VARCHAR(200),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    images JSONB,
    tags JSONB,
    weather VARCHAR(100),
    mood VARCHAR(50),
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建评论表（可选功能）
CREATE TABLE IF NOT EXISTS diary_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    diary_id UUID REFERENCES diary_entries(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建点赞表（可选功能）
CREATE TABLE IF NOT EXISTS diary_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    diary_id UUID REFERENCES diary_entries(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(diary_id, user_id)
);

-- 5. 启用行级安全策略 (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_likes ENABLE ROW LEVEL SECURITY;

-- 6. 创建安全策略

-- 用户档案策略
CREATE POLICY "用户可以查看所有档案" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "用户只能更新自己的档案" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "用户可以插入自己的档案" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 日记条目策略
CREATE POLICY "所有人可以查看公开日记" ON diary_entries
    FOR SELECT USING (is_public = true);

CREATE POLICY "用户可以查看自己的所有日记" ON diary_entries
    FOR SELECT USING (auth.uid() = user_id);

-- 为了调试：临时添加查看所有日记的策略（生产环境应该移除）
CREATE POLICY "登录用户可以查看所有日记" ON diary_entries
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "用户只能插入自己的日记" ON diary_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的日记" ON diary_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的日记" ON diary_entries
    FOR DELETE USING (auth.uid() = user_id);

-- 评论策略
CREATE POLICY "所有人可以查看公开日记的评论" ON diary_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM diary_entries 
            WHERE diary_entries.id = diary_comments.diary_id 
            AND diary_entries.is_public = true
        )
    );

CREATE POLICY "已登录用户可以添加评论" ON diary_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的评论" ON diary_comments
    FOR DELETE USING (auth.uid() = user_id);

-- 点赞策略
CREATE POLICY "所有人可以查看公开日记的点赞" ON diary_likes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM diary_entries 
            WHERE diary_entries.id = diary_likes.diary_id 
            AND diary_entries.is_public = true
        )
    );

CREATE POLICY "已登录用户可以点赞" ON diary_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以取消自己的点赞" ON diary_likes
    FOR DELETE USING (auth.uid() = user_id);

-- 7. 创建存储桶（Storage Buckets）
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('diary-images', 'diary-images', true);

-- 8. 创建存储策略
CREATE POLICY "用户可以上传头像" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "所有人可以查看头像" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "用户可以更新自己的头像" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "用户可以删除自己的头像" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "用户可以上传日记图片" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'diary-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "所有人可以查看日记图片" ON storage.objects
    FOR SELECT USING (bucket_id = 'diary-images');

-- 9. 创建触发器函数：自动创建用户档案
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, nickname)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1)));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. 创建触发器：用户注册时自动创建档案
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. 为相关表添加更新时间触发器
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_diary_entries_updated_at
    BEFORE UPDATE ON diary_entries
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 13. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_diary_entries_user_id ON diary_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_diary_entries_created_at ON diary_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diary_entries_location ON diary_entries(location);
CREATE INDEX IF NOT EXISTS idx_diary_comments_diary_id ON diary_comments(diary_id);
CREATE INDEX IF NOT EXISTS idx_diary_likes_diary_id ON diary_likes(diary_id);

-- 完成提示
SELECT 'Digital Travel Diary database setup completed!' AS status;
>>>>>>> 75131430882a627904defc03312c42e7e3d4ade4
