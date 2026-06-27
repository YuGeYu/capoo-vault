#!/usr/bin/env python
# DEBUG-ONLY local download server for verifying the WebView DownloadListener path.
# Serves a file with Content-Disposition: attachment so WebView fires onDownloadStart.
import http.server, socketserver

PORT = 8731

class H(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        body = b"MAOMAOCHONG-DOWNLOAD-TEST\n" * 2048  # ~52 KB
        self.send_response(200)
        self.send_header("Content-Type", "application/octet-stream")
        self.send_header("Content-Disposition", 'attachment; filename="maomao_dl_test.bin"')
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
    def log_message(self, *a):
        print("REQ", self.path)

with socketserver.TCPServer(("0.0.0.0", PORT), H) as httpd:
    print("serving on", PORT)
    httpd.serve_forever()
