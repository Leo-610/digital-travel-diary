<<<<<<< HEAD
-- 第二部分：启用RLS和创建安全策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_likes ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "用户只能插入自己的日记" ON diary_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的日记" ON diary_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的日记" ON diary_entries
    FOR DELETE USING (auth.uid() = user_id);
=======
-- 第二部分：启用RLS和创建安全策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_likes ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "用户只能插入自己的日记" ON diary_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的日记" ON diary_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的日记" ON diary_entries
    FOR DELETE USING (auth.uid() = user_id);
>>>>>>> 75131430882a627904defc03312c42e7e3d4ade4
