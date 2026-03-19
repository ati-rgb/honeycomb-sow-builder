import http.server
import os

os.chdir("/Users/atienookelo/honeycomb-sow-builder")
handler = http.server.SimpleHTTPRequestHandler
server = http.server.HTTPServer(("", 8090), handler)
print(f"Serving on http://localhost:8090")
server.serve_forever()
