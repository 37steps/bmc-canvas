#!/usr/bin/env python3
"""
שרת מאובטח ל-BMC Canvas
מגיש אך ורק את bmc.html — כל שאר הבקשות מקבלות 404.
"""
import http.server
import socketserver
import socket
import os
import threading
import webbrowser

PORT = 8080
FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'bmc.html')


def get_local_ip():
    # שיטה 1: UDP socket (מהיר, לא שולח תעבורה)
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        if not ip.startswith('127.'):
            return ip
    except Exception:
        pass

    # שיטה 2: hostname
    try:
        ip = socket.gethostbyname(socket.gethostname())
        if not ip.startswith('127.'):
            return ip
    except Exception:
        pass

    # שיטה 3: ifconfig (macOS)
    try:
        import subprocess
        out = subprocess.run(['ifconfig'], capture_output=True, text=True).stdout
        for line in out.splitlines():
            line = line.strip()
            if line.startswith('inet ') and '127.0.0.1' not in line:
                ip = line.split()[1]
                if any(ip.startswith(p) for p in ('192.168.', '10.', '172.')):
                    return ip
    except Exception:
        pass

    return 'localhost'


class BMCHandler(http.server.BaseHTTPRequestHandler):

    def do_GET(self):
        if self.path in ('/', '/bmc.html'):
            try:
                with open(FILE, 'rb') as f:
                    content = f.read()
                # הזרקת ה-IP האמיתי לתוך הדף
                content = content.replace(
                    b'__SERVER_ORIGIN__',
                    f'{local_ip}:{PORT}'.encode()
                )
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.send_header('Content-Length', str(len(content)))
                self.send_header('X-Content-Type-Options', 'nosniff')
                self.send_header('X-Frame-Options', 'DENY')
                self.end_headers()
                self.wfile.write(content)
            except FileNotFoundError:
                self._not_found()
        else:
            self._not_found()

    def _not_found(self):
        self.send_response(404)
        self.send_header('Content-Type', 'text/plain; charset=utf-8')
        self.end_headers()
        self.wfile.write(b'404 Not Found')

    def log_message(self, fmt, *args):
        print(f"  [{self.address_string()}]  {fmt % args}")


if __name__ == '__main__':
    local_ip = get_local_ip()

    with socketserver.TCPServer(('', PORT), BMCHandler) as httpd:
        httpd.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        print()
        print('  ╔══════════════════════════════════════════╗')
        print('  ║       BMC Canvas — שרת פעיל              ║')
        print('  ╠══════════════════════════════════════════╣')
        print(f'  ║  קישור מקומי:  http://localhost:{PORT}      ║')
        print(f'  ║  לרשת הפנימית: http://{local_ip}:{PORT}  ║')
        print('  ╠══════════════════════════════════════════╣')
        print('  ║  רק bmc.html נגיש — שאר המחשב חסום      ║')
        print('  ║  Ctrl+C לעצירת השרת                      ║')
        print('  ╚══════════════════════════════════════════╝')
        print()
        threading.Timer(0.5, lambda: webbrowser.open(f'http://localhost:{PORT}')).start()
        httpd.serve_forever()
