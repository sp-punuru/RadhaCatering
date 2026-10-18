#!/usr/bin/env python3
"""
server.py - Local development server for Radha Catering
Simulates Hostinger PHP endpoints locally so Admin panel and image uploads work without installing PHP.
Run with: python server.py
"""

import http.server
import socketserver
import os
import json
import cgi
import time
import uuid

PORT = 8080
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class RadhaCateringHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        # Enable CORS and disable caching for API development
        if self.path.startswith('/api/') or self.path.startswith('/data/'):
            self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        clean_path = self.path.split('?')[0]
        if clean_path in ('/api/menu.php', '/api/menu'):
            menu_file = os.path.join(BASE_DIR, 'data', 'menu.json')
            if os.path.exists(menu_file):
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                with open(menu_file, 'rb') as f:
                    self.wfile.write(f.read())
            else:
                self.send_error(404, 'menu.json not found')
            return

        super().do_GET()

    def do_POST(self):
        clean_path = self.path.split('?')[0]

        # Handle menu update
        if clean_path in ('/api/menu.php', '/api/menu'):
            content_length = int(self.headers.get('Content-Length', 0))
            post_body = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_body.decode('utf-8'))
                menu_file = os.path.join(BASE_DIR, 'data', 'menu.json')
                backup_file = os.path.join(BASE_DIR, 'data', 'menu.backup.json')
                
                # Backup current
                if os.path.exists(menu_file):
                    with open(menu_file, 'r', encoding='utf-8') as f_old, open(backup_file, 'w', encoding='utf-8') as f_bak:
                        f_bak.write(f_old.read())

                with open(menu_file, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                resp = json.dumps({'success': True, 'message': 'Menu saved successfully locally!'})
                self.wfile.write(resp.encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                resp = json.dumps({'error': str(e)})
                self.wfile.write(resp.encode('utf-8'))
            return

        # Handle file upload
        if clean_path in ('/api/upload.php', '/api/upload'):
            try:
                content_type = self.headers.get('Content-Type', '')
                if not content_type.startswith('multipart/form-data'):
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': 'Expected multipart/form-data'}).encode('utf-8'))
                    return

                form = cgi.FieldStorage(
                    fp=self.rfile,
                    headers=self.headers,
                    environ={'REQUEST_METHOD': 'POST', 'CONTENT_TYPE': content_type}
                )

                if 'image' not in form:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': 'No file field named "image"'}).encode('utf-8'))
                    return

                file_item = form['image']
                if not file_item.filename:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': 'Empty filename uploaded'}).encode('utf-8'))
                    return

                ext = os.path.splitext(file_item.filename)[1].lower()
                if ext not in ('.jpg', '.jpeg', '.png', '.webp', '.gif'):
                    ext = '.jpg'

                filename = f"dish_{int(time.time())}_{uuid.uuid4().hex[:8]}{ext}"
                upload_dir = os.path.join(BASE_DIR, 'uploads')
                os.makedirs(upload_dir, exist_ok=True)
                dest_path = os.path.join(upload_dir, filename)

                with open(dest_path, 'wb') as f_out:
                    f_out.write(file_item.file.read())

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                resp = json.dumps({
                    'success': True,
                    'url': f"uploads/{filename}",
                    'filename': filename
                })
                self.wfile.write(resp.encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                resp = json.dumps({'error': f"Upload failed: {str(e)}"})
                self.wfile.write(resp.encode('utf-8'))
            return

        super().do_POST()

if __name__ == '__main__':
    os.chdir(BASE_DIR)
    os.makedirs('uploads', exist_ok=True)
    with socketserver.TCPServer(("", PORT), RadhaCateringHandler) as httpd:
        print(f"=====================================================")
        print(f"  Radha Catering Local Dev Server is Running!")
        print(f"  Web Address: http://localhost:{PORT}")
        print(f"  Admin Panel: http://localhost:{PORT}/admin.html")
        print(f"  Press Ctrl+C to stop.")
        print(f"=====================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
