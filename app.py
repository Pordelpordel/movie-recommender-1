from flask import Flask, jsonify, render_template, request, session
import os

app = Flask(__name__)
app.secret_key = "your-secret-key-here"  # برای سشن نیاز است

# ===== اطلاعات کاربر (از دیتابیس یا سشن) =====
# برای مثال، یک کاربر نمونه
USER_DATA = {
    "name": "پوردل پوردل",
    "email": "m.pordell1383@gmail.com"
}
# ===========================================

@app.route('/')
def home():
    # اگر کاربر وارد شده، اطلاعاتش را از سشن بگیرید
    # برای نمایش نمونه، از USER_DATA استفاده می‌کنیم
    user_name = session.get("user_name", USER_DATA["name"])
    user_email = session.get("user_email", USER_DATA["email"])
    
    return render_template("index.html", 
                         user_name=user_name,
                         user_email=user_email)

@app.route('/api/health')
def health():
    return jsonify({"status": "healthy"})

@app.route('/docs')
def docs():
    return """
    <h1>📚 مستندات API</h1>
    <p>به زودی مستندات کامل API در این آدرس قرار خواهد گرفت.</p>
    <ul>
        <li><b>GET /</b> - صفحه اصلی</li>
        <li><b>GET /api/health</b> - بررسی سلامت سرویس</li>
        <li><b>GET /docs</b> - این صفحه</li>
    </ul>
    """

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)