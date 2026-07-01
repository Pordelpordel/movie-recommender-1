from flask import Flask, jsonify, render_template, session, redirect, url_for
import os
import secrets

app = Flask(__name__)
# استفاده از کلید تصادفی برای امنیت بیشتر
app.secret_key = os.environ.get("SECRET_KEY", secrets.token_hex(16))

@app.route('/')
def home():
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
    # پاک کردن سشن و هدایت به صفحه اصلی
    session.clear()
    return """
    <!DOCTYPE html>
    <html lang="fa" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>خروج از حساب</title>
        <style>
            body {
                font-family: 'Tahoma', sans-serif;
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
                padding: 40px 30px;
                border-radius: 30px;
                max-width: 400px;
                border: 1px solid rgba(255,255,255,0.1);
                box-shadow: 0 25px 60px rgba(0,0,0,0.5);
            }
            h2 { color: #ffd700; font-size: 2rem; margin-bottom: 10px; }
            a { 
                color: #ffd700; 
                text-decoration: none;
                display: inline-block;
                margin-top: 15px;
                padding: 10px 25px;
                background: rgba(255,215,0,0.15);
                border-radius: 50px;
                border: 1px solid rgba(255,215,0,0.3);
                transition: all 0.3s;
            }
            a:hover {
                background: rgba(255,215,0,0.3);
                transform: scale(1.05);
            }
            .emoji { font-size: 3rem; display: block; margin-bottom: 10px; }
        </style>
    </head>
    <body>
        <div class="logout-box">
            <span class="emoji">🚪</span>
            <h2>شما خارج شدید</h2>
            <p style="color: rgba(255,255,255,0.6);">برای ورود مجدد، روی دکمه زیر کلیک کنید</p>
            <a href="/">🔙 بازگشت به صفحه اصلی</a>
        </div>
        <script>
            // هدایت خودکار بعد از 3 ثانیه
            setTimeout(function() {
                window.location.href = '/';
            }, 3000);
        </script>
    </body>
    </html>
    """

@app.route('/api/user')
def get_user():
    return jsonify({
        "name": session.get("user_name", "کاربر مهمان"),
        "email": session.get("user_email", ""),
        "is_authenticated": "user_email" in session and session.get("user_email") != "guest@cinemachi.local"
    })

@app.route('/api/health')
def health():
    return jsonify({"status": "healthy"})

@app.route('/api/session')
def get_session():
    """اندپوینت برای بررسی وضعیت سشن (برای دیباگ)"""
    return jsonify({
        "session_data": dict(session),
        "is_logged_in": "user_email" in session and session.get("user_email") != "guest@cinemachi.local"
    })

@app.route('/docs')
def docs():
    return """
    <h1>📚 مستندات API</h1>
    <p>لیست اندپوینت‌های قابل دسترس:</p>
    <ul>
        <li><b>GET /</b> - صفحه اصلی</li>
        <li><b>GET /api/user</b> - دریافت اطلاعات کاربر جاری</li>
        <li><b>GET /api/health</b> - بررسی سلامت سرویس</li>
        <li><b>GET /api/session</b> - بررسی وضعیت سشن (دیباگ)</li>
        <li><b>GET /logout</b> - خروج از حساب کاربری</li>
        <li><b>GET /docs</b> - این صفحه</li>
    </ul>
    """

@app.errorhandler(404)
def not_found(error):
    """مدیریت خطای 404 - صفحه پیدا نشد"""
    return jsonify({"error": "صفحه مورد نظر یافت نشد"}), 404

@app.errorhandler(500)
def server_error(error):
    """مدیریت خطای 500 - خطای سرور"""
    return jsonify({"error": "خطای داخلی سرور"}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port, debug=False)