from flask import Flask, jsonify, render_template, session
import os

app = Flask(__name__)
app.secret_key = "your-secret-key-here"

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
    session.clear()
    return """
    <h2>🚪 شما خارج شدید</h2>
    <p>برای ورود مجدد، <a href='/'>اینجا کلیک کنید</a></p>
    <script>setTimeout(function(){ window.location.href = '/'; }, 2000);</script>
    """

@app.route('/api/user')
def get_user():
    return jsonify({
        "name": session.get("user_name", "کاربر مهمان"),
        "email": session.get("user_email", "")
    })

@app.route('/api/health')
def health():
    return jsonify({"status": "healthy"})

@app.route('/docs')
def docs():
    return """
    <h1>📚 مستندات API</h1>
    <ul>
        <li><b>GET /</b> - صفحه اصلی</li>
        <li><b>GET /api/user</b> - اطلاعات کاربر</li>
        <li><b>GET /api/health</b> - سلامت سرویس</li>
        <li><b>GET /docs</b> - این صفحه</li>
    </ul>
    """

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=10000, threaded=True)