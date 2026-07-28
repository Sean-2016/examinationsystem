// 登录表单提交
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    
    // 隐藏错误信息
    errorMessage.style.display = 'none';
    
    // 验证输入
    if (!username) {
        showError('请输入账号');
        return;
    }
    
    if (!password) {
        showError('请输入密码');
        return;
    }
    
    // 禁用登录按钮
    const loginBtn = document.querySelector('.btn-login');
    loginBtn.disabled = true;
    loginBtn.textContent = '登录中...';
    
    // 模拟登录验证（实际项目中应该调用后端API）
    setTimeout(() => {
        // 这里可以添加实际的登录验证逻辑
        // 例如：调用后端API验证账号密码
        
        // 模拟验证（实际项目中应该从后端获取）
        if (validateLogin(username, password)) {
            // 登录成功
            // 保存用户信息
            localStorage.setItem('currentUser', username);
            localStorage.setItem('isLoggedIn', 'true');
            
            // 跳转到管理后台
            window.location.href = '../ManagePanel/index.html';
        } else {
            // 登录失败
            showError('账号或密码错误');
            loginBtn.disabled = false;
            loginBtn.textContent = '登录';
        }
    }, 500); // 模拟网络延迟
});

// 显示错误信息
function showError(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// 验证登录（模拟验证，实际项目中应该调用后端API）
function validateLogin(username, password) {
    // 这里可以添加实际的验证逻辑
    // 例如：调用后端API
    
    // 模拟验证：允许任何非空账号密码登录（仅用于演示）
    // 实际项目中应该：
    // 1. 调用后端API验证
    // 2. 检查账号是否存在
    // 3. 验证密码是否正确
    // 4. 检查账号状态（是否被禁用等）
    
    if (username && password) {
        // 模拟验证成功
        return true;
    }
    
    return false;
}

// 如果已经登录，直接跳转到管理后台
window.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        // 可以选择直接跳转，或者让用户重新登录
        // window.location.href = '../ManagePanel/index.html';
    }
    
    // 自动聚焦到账号输入框
    document.getElementById('username').focus();
});

// 回车键快速登录
document.getElementById('password').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('login-form').dispatchEvent(new Event('submit'));
    }
});

