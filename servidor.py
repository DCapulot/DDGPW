import http.server
import socketserver
import webbrowser
import os

PORT = 3000

os.chdir(os.path.dirname(os.path.abspath(__file__)))

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # silencia o log

print(f"✅ DDGPW IDE rodando em: http://localhost:{PORT}")
print("   Pressione Ctrl+C para parar.\n")

webbrowser.open(f"http://localhost:{PORT}/index.html")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()
