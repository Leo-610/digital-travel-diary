-- 检查表结构和外键关系的查询脚本
-- 在Supabase SQL编辑器中执行以验证数据库状态

-- 1. 检查表是否存在
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'diary_entries', 'diary_comments', 'diary_likes');

-- 2. 检查profiles表结构
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. 检查diary_entries表结构
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'diary_entries'
ORDER BY ordinal_position;

-- 4. 检查外键约束
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
AND tc.table_name IN ('profiles', 'diary_entries', 'diary_comments', 'diary_likes');

-- 5. 检查RLS策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'diary_entries', 'diary_comments', 'diary_likes');

-- 6. 简单测试查询
SELECT COUNT(*) as profile_count FROM profiles;
SELECT COUNT(*) as diary_count FROM diary_entries;
