// 修复日期显示问题的脚本
console.log('🔧 开始修复日期显示问题...');

// 在浏览器控制台中运行这段代码来测试日期格式化
function testFormatDate() {
    const testDates = [
        '2024-01-01',
        '2024-12-31T23:59:59.999Z',
        new Date().toISOString(),
        null,
        undefined,
        '',
        'invalid-date'
    ];
    
    console.log('📅 测试日期格式化:');
    testDates.forEach(date => {
        try {
            const result = formatDate(date);
            console.log(`输入: ${date} -> 输出: ${result}`);
        } catch (error) {
            console.error(`输入: ${date} -> 错误: ${error.message}`);
        }
    });
}

// 检查本地存储中的日记数据结构
function checkLocalEntries() {
    const entries = JSON.parse(localStorage.getItem('travelDiary') || '[]');
    console.log('📚 本地日记数据结构检查:');
    
    entries.slice(0, 3).forEach((entry, index) => {
        console.log(`条目 ${index + 1}:`, {
            id: entry.id,
            title: entry.title,
            date: entry.date,
            created_at: entry.created_at,
            created: entry.created
        });
    });
}

// 修复本地存储中的日期字段问题
function fixLocalEntries() {
    const entries = JSON.parse(localStorage.getItem('travelDiary') || '[]');
    let fixed = 0;
    
    entries.forEach(entry => {
        // 如果有 date 字段但没有 created_at，将 date 复制到 created_at
        if (entry.date && !entry.created_at) {
            entry.created_at = entry.date;
            fixed++;
        }
        // 如果有 created 字段但没有 created_at，将 created 复制到 created_at
        else if (entry.created && !entry.created_at) {
            entry.created_at = entry.created;
            fixed++;
        }
        // 如果都没有，设置当前时间
        else if (!entry.created_at && !entry.date && !entry.created) {
            entry.created_at = new Date().toISOString();
            fixed++;
        }
    });
    
    if (fixed > 0) {
        localStorage.setItem('travelDiary', JSON.stringify(entries));
        console.log(`✅ 修复了 ${fixed} 个日记条目的日期字段`);
    } else {
        console.log('✅ 所有日记条目的日期字段都正常');
    }
    
    return fixed;
}

console.log('🎯 修复脚本加载完成');
console.log('📝 可用命令:');
console.log('  testFormatDate() - 测试日期格式化功能');
console.log('  checkLocalEntries() - 检查本地日记数据结构');
console.log('  fixLocalEntries() - 修复本地日记的日期字段');
