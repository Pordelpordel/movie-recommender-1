from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({
        "message": "Movie Recommender System",
        "status": "running"
    })

@app.route('/api/health')
def health():
    return jsonify({"status": "healthy"})

# ===== کد جدید برای مستندات =====
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
# ================================

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)