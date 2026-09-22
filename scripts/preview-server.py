"""Serve preview/ at / and original project assets/ at /assets/."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import unquote, urlsplit
ROOT=Path(__file__).resolve().parents[1]
class Handler(SimpleHTTPRequestHandler):
    def translate_path(self,path):
        path=unquote(urlsplit(path).path)
        base=ROOT/"assets" if path.startswith("/assets/") else ROOT/"preview"
        relative=path[len("/assets/"):] if path.startswith("/assets/") else path.lstrip("/")
        target=(base/relative).resolve()
        return str(target if target.is_relative_to(base.resolve()) else base/"__not_found__")
if __name__=="__main__":
    ThreadingHTTPServer(("127.0.0.1",8765),Handler).serve_forever()
