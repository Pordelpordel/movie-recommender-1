from flask import Flask, jsonify, render_template, session, request
import os
import secrets
from datetime import timedelta

app = Flask(__name__)
# تنظیم کلید مخفی (از متغیر محیطی یا تصادفی)
app.secret_key = os.environ.get("SECRET_KEY", secrets.token_hex(16))
# تنظیم ماندگاری سشن به ۳۰ روز
app.permanent_session_lifetime = timedelta(days=30)

@app.route('/')
def home():
    """صفحه اصلی - نمایش سایت و مدیریت سشن کاربر"""
    # ایجاد سشن دائمی
    session.permanent = True
    
    # اگر کاربر در سشن نباشد، از کاربر مهمان استفاده کن
    if 'user_name' not in session:
        session['user_name'] = "کاربر مهمان"
        session['user_email'] = "guest@cinemachi.local"
    
    user_name = session.get("user_name", "کاربر مهمان")
    user_email = session.get("user_email", "")
    
    return render_template("index.html", 
                         user_name=user_name,
                         user_email=user_email)

@app.route('/logout')
def logout():
    """خروج از حساب کاربری و پاک کردن سشن"""
    # پاک کردن سشن
    session.clear()
    
    # صفحه خروج با طراحی زیبا
    return """
    <!DOCTYPE html>
    <html lang="fa" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>خروج از حساب</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Tahoma', 'Vazir', sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
                color: white;
                text-align: center;
                padding: 20px;
            }
            .logout-box {
                background: rgba(255,255,255,0.05);
                backdrop-filter: blur(20px);
                padding: 50px 40px;
                border-radius: 30px;
                max-width: 450px;
                width: 100%;
                border: 1px solid rgba(255,255,255,0.1);
                box-shadow: 0 25px 60px rgba(0,0,0,0.5);
                animation: fadeIn 0.5s ease;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-30px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .emoji { 
                font-size: 4rem; 
                display: block; 
                margin-bottom: 15px;
                animation: bounce 1s ease infinite;
            }
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            h2 { 
                color: #ffd700; 
                font-size: 2rem; 
                margin-bottom: 10px;
                font-weight: bold;
            }
            p { 
                color: rgba(255,255,255,0.6); 
                font-size: 1rem;
                margin-bottom: 25px;
                line-height: 1.6;
            }
            a { 
                color: #ffd700; 
                text-decoration: none;
                display: inline-block;
                padding: 12px 30px;
                background: rgba(255,215,0,0.15);
                border-radius: 50px;
                border: 2px solid rgba(255,215,0,0.3);
                transition: all 0.3s;
                font-weight: bold;
                font-size: 1rem;
            }
            a:hover {
                background: rgba(255,215,0,0.3);
                transform: scale(1.05);
                box-shadow: 0 0 30px rgba(255,215,0,0.2);
            }
            .timer {
                color: rgba(255,255,255,0.3);
                font-size: 0.85rem;
                margin-top: 15px;
            }
        </style>
    </head>
    <body>
        <div class="logout-box">
            <span class="emoji">🚪</span>
            <h2>شما خارج شدید</h2>
            <p>✅ با موفقیت از حساب کاربری خود خارج شدید.<br>برای ورود مجدد، روی دکمه زیر کلیک کنید.</p>
            <a href="/">🔙 بازگشت به صفحه اصلی</a>
            <div class="timer">⏳ هدایت خودکار در <span id="countdown">3</span> ثانیه...</div>
        </div>
        <script>
            // شمارش معکوس برای هدایت خودکار
            let seconds = 3;
            const countdownEl = document.getElementById('countdown');
            const interval = setInterval(function() {
                seconds--;
                countdownEl.textContent = seconds;
                if (seconds <= 0) {
                    clearInterval(interval);
                    window.location.href = '/';
                }
            }, 1000);
        </script>
    </body>
    </html>
    """

@app.route('/api/user')
def get_user():
    """دریافت اطلاعات کاربر جاری"""
    return jsonify({
        "name": session.get("user_name", "کاربر مهمان"),
        "email": session.get("user_email", ""),
        "is_authenticated": "user_email" in session and session.get("user_email") != "guest@cinemachi.local"
    })

@app.route('/api/health')
def health():
    """بررسی سلامت سرویس"""
    return jsonify({
        "status": "healthy",
        "message": "سرویس با موفقیت در حال اجراست"
    })

@app.route('/api/session')
def get_session():
    """بررسی وضعیت سشن (برای دیباگ)"""
    return jsonify({
        "session_data": dict(session),
        "is_logged_in": "user_email" in session and session.get("user_email") != "guest@cinemachi.local"
    })

@app.route('/docs')
def docs():
    """مستندات API"""
    return """
    <!DOCTYPE html>
    <html lang="fa" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>📚 مستندات API</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Tahoma', 'Vazir', sans-serif;
                background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
            }
            .docs-box {
                background: rgba(255,255,255,0.05);
                backdrop-filter: blur(20px);
                padding: 40px 35px;
                border-radius: 30px;
                max-width: 600px;
                width: 100%;
                border: 1px solid rgba(255,255,255,0.1);
                box-shadow: 0 25px 60px rgba(0,0,0,0.5);
                color: white;
            }
            h1 {
                color: #ffd700;
                font-size: 2rem;
                text-align: center;
                margin-bottom: 8px;
            }
            .subtitle {
                color: rgba(255,255,255,0.5);
                text-align: center;
                margin-bottom: 25px;
                font-size: 0.9rem;
            }
            .endpoint {
                background: rgba(255,255,255,0.04);
                padding: 12px 16px;
                border-radius: 12px;
                margin: 8px 0;
                border-right: 3px solid #ffd700;
                transition: all 0.3s;
            }
            .endpoint:hover {
                background: rgba(255,255,255,0.08);
                transform: translateX(-5px);
            }
            .method {
                display: inline-block;
                padding: 2px 10px;
                border-radius: 6px;
                font-size: 0.7rem;
                font-weight: bold;
                margin-left: 8px;
            }
            .method.get { background: #4caf50; color: white; }
            .method.post { background: #2196f3; color: white; }
            .method.put { background: #ff9800; color: white; }
            .method.delete { background: #f44336; color: white; }
            .endpoint .path {
                color: #ffd700;
                font-weight: bold;
                font-size: 0.95rem;
            }
            .endpoint .desc {
                color: rgba(255,255,255,0.5);
                font-size: 0.8rem;
                margin-top: 4px;
            }
            .home-link {
                display: block;
                text-align: center;
                margin-top: 25px;
                color: #ffd700;
                text-decoration: none;
                padding: 10px;
                border: 1px solid rgba(255,215,0,0.2);
                border-radius: 50px;
                transition: all 0.3s;
            }
            .home-link:hover {
                background: rgba(255,215,0,0.1);
                transform: scale(1.02);
            }
        </style>
    </head>
    <body>
        <div class="docs-box">
            <h1>📚 مستندات API</h1>
            <p class="subtitle">لیست اندپوینت‌های قابل دسترس</p>
            
            <div class="endpoint">
                <span class="method get">GET</span>
                <span class="path">/</span>
                <div class="desc">صفحه اصلی سایت</div>
            </div>
            
            <div class="endpoint">
                <span class="method get">GET</span>
                <span class="path">/api/user</span>
                <div class="desc">دریافت اطلاعات کاربر جاری</div>
            </div>
            
            <div class="endpoint">
                <span class="method get">GET</span>
                <span class="path">/api/health</span>
                <div class="desc">بررسی سلامت سرویس</div>
            </div>
            
            <div class="endpoint">
                <span class="method get">GET</span>
                <span class="path">/api/session</span>
                <div class="desc">بررسی وضعیت سشن (دیباگ)</div>
            </div>
            
            <div class="endpoint">
                <span class="method get">GET</span>
                <span class="path">/logout</span>
                <div class="desc">خروج از حساب کاربری</div>
            </div>
            
            <div class="endpoint">
                <span class="method get">GET</span>
                <span class="path">/docs</span>
                <div class="desc">این صفحه - مستندات API</div>
            </div>
            
            <a href="/" class="home-link">🏠 بازگشت به صفحه اصلی</a>
        </div>
    </body>
    </html>
    """

@app.errorhandler(404)
def not_found(error):
    """مدیریت خطای 404 - صفحه پیدا نشد"""
    return jsonify({
        "error": "صفحه مورد نظر یافت نشد",
        "status": 404,
        "message": "لطفاً آدرس را بررسی کنید"
    }), 404

@app.errorhandler(500)
def server_error(error):
    """مدیریت خطای 500 - خطای سرور"""
    return jsonify({
        "error": "خطای داخلی سرور",
        "status": 500,
        "message": "مشکلی در سرور رخ داده است. لطفاً بعداً تلاش کنید."
    }), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port, debug=False)