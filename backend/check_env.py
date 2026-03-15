import os
from dotenv import load_dotenv

load_dotenv()
u = os.getenv("EMAIL_HOST_USER")
p = os.getenv("EMAIL_HOST_PASSWORD")

with open('env_debug.txt', 'w') as f:
    f.write(f"USER: [{u}] (len: {len(u) if u else 0})\n")
    f.write(f"PASS: [{p}] (len: {len(p) if p else 0})\n")
    if u: f.write(f"USER HEX: {u.encode().hex()}\n")
    if p: f.write(f"PASS HEX: {p.encode().hex()}\n")
