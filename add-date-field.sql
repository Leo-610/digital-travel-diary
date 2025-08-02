-- 添加 date 字段到 diary_entries 表
-- 这个字段用于存储用户选择的日记日期（区别于系统创建时间）

ALTER TABLE diary_entries 
ADD COLUMN IF NOT EXISTS date DATE;

-- 为现有记录设置默认日期值（使用 created_at 的日期部分）
UPDATE diary_entries 
SET date = created_at::date 
WHERE date IS NULL;

-- 添加注释
COMMENT ON COLUMN diary_entries.date IS '用户选择的日记日期';
COMMENT ON COLUMN diary_entries.created_at IS '系统创建时间';
