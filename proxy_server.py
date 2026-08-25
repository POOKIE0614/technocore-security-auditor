import http.server
import socketserver
import urllib.request

PORT = 8000

class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/api/feed"):
            try:
                url = "https://technocore.chat/r/d-techno-hub?limit=25"
                req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=10) as resp:
                    content = resp.read()
                    self.send_response(200)
                    self.send_header("Content-Type", "text/plain; charset=utf-8")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(content)
            except Exception as e:
                err_msg = f"Error: {e}"
                self.send_response(500)
                self.send_header("Content-Type", "text/plain; charset=utf-8")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(err_msg.encode())
        else:
            super().do_GET()

if __name__ == "__main__":
    server = ThreadedHTTPServer(("", PORT), ProxyHandler)
    print(f"Serving at http://localhost:{PORT}")
    server.serve_forever()
