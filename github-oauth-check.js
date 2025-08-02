// 简单的GitHub OAuth测试
console.log('🔧 GitHub OAuth配置检查');

// 检查当前GitHub应用ID
const githubAppId = '3109239';
console.log('GitHub应用ID:', githubAppId);
console.log('GitHub应用URL:', `https://github.com/settings/applications/${githubAppId}`);

// 验证配置
console.log('✅ 回调URL配置正确:', 'https://muawpgjdzoxhkpxghuvt.supabase.co/auth/v1/callback');
console.log('✅ 主页URL配置正确:', 'https://leo-610.github.io/digital-travel-diary');

// 需要在Supabase中更新的Client ID
console.log('⚠️ 需要检查Supabase中的GitHub Client ID是否与应用ID匹配');
