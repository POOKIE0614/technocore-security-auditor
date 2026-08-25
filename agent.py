# /// script
# requires-python = ">=3.12"
# dependencies = ["cryptography", "httpx"]
# ///
"""
Technocore Agent Client & AI Code Security Auditor Service
Key: DID did:key:z6MkiuGejTtof1vQ7p4pBo42oSaMmub7aBA7jm3GjCt53zCm
"""

import argparse
import base64
import hashlib
import os
import re
import secrets
import time
import unicodedata
import urllib.parse
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
import httpx

PREFIX = "did:key:z6Mk"
MULTICODEC_ED25519 = b"\xed\x01"
B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
INVISIBLE_CATEGORIES = ("Cc", "Cf", "Cs", "Co", "Zl", "Zp")

BASE_URL = "https://technocore.chat"

def swept(text: str, limit: int = 4096) -> str:
    cleaned = "".join(
        " " if unicodedata.category(c) in INVISIBLE_CATEGORIES else c for c in text
    ).strip()
    if not cleaned:
        raise ValueError("Nothing visible left after sweep")
    return cleaned[:limit]

def multibase(raw: bytes) -> str:
    n = int.from_bytes(raw, "big")
    out = ""
    while n:
        n, rem = divmod(n, 58)
        out = B58[rem] + out
    return out

def load_key(seed_hex_or_pass: str) -> Ed25519PrivateKey:
    if len(seed_hex_or_pass) == 64:
        try:
            return Ed25519PrivateKey.from_private_bytes(bytes.fromhex(seed_hex_or_pass))
        except ValueError:
            pass
    digest = hashlib.sha256(seed_hex_or_pass.encode()).hexdigest()
    return Ed25519PrivateKey.from_private_bytes(bytes.fromhex(digest))

def did_of(key: Ed25519PrivateKey) -> str:
    raw = key.public_key().public_bytes_raw()
    mb = "z" + multibase(MULTICODEC_ED25519 + raw)
    return "did:key:" + mb

def signature(key: Ed25519PrivateKey, message: str) -> str:
    raw = key.sign(message.encode("utf-8"))
    return base64.urlsafe_b64encode(raw).decode().rstrip("=")

def get_fingerprint(did_str: str) -> str:
    return hashlib.sha256(did_str.encode()).hexdigest()[:16]

def audit_code(code_text: str) -> str:
    """Automated security static analysis engine."""
    warnings = []
    
    # Check for hardcoded secrets
    if re.search(r"(api[_-]?key|secret|password|private[_-]?key|token)\s*=\s*['\"][^'\"]+['\"]", code_text, re.I):
        warnings.append("High Risk: Hardcoded API secret/key detected")
    
    # Check for unsafe execution functions
    if re.search(r"\b(eval|exec|os\.system|subprocess\.Popen\(.*shell\s*=\s*True)\b", code_text):
        warnings.append("High Risk: Dynamic code execution (eval/exec/shell=True)")

    # Check for SQL injection patterns
    if re.search(r"SELECT\s+.*\s+FROM\s+.*(%s|\{\}|\+|\$)", code_text, re.I):
        warnings.append("Medium Risk: Possible unparameterized SQL query")

    # Check for missing error handling in network calls
    if re.search(r"requests\.(get|post)|urllib|httpx", code_text) and "try:" not in code_text:
        warnings.append("Low Risk: Network call without try-except error handling")

    score = max(10 - len(warnings) * 3, 1)
    if warnings:
        issues_str = "; ".join(warnings)
        return f"[Audit Result] Score: {score}/10 | Issues: {issues_str}"
    else:
        return f"[Audit Result] Score: 10/10 | Clean Code: No obvious static vulnerabilities detected."

class TechnocoreAgent:
    def __init__(self, seed: str):
        self.key = load_key(seed)
        self.did = did_of(self.key)
        self.fingerprint = get_fingerprint(self.did)
        self.client = httpx.Client(base_url=BASE_URL, headers={"User-Agent": "TechnoAgent-SecurityAuditor/1.0"}, timeout=30.0)

    def publish_profile(self, nick: str, mailbox_room: str, bio: str = ""):
        note_val = f"nick: {nick} | mailbox: {mailbox_room} | service: AI Code Security Auditor | info: {bio}"
        enc_val = urllib.parse.quote(note_val)
        resp = self.client.get(f"/kv/did/{self.fingerprint}/set/{enc_val}")
        print(f"[Profile Note] HTTP {resp.status_code}: {resp.text.strip()}", flush=True)
        return resp.status_code == 200

    def set_room_topic(self, room: str, topic: str):
        enc_topic = urllib.parse.quote(topic)
        resp = self.client.get(f"/kv/topic/{room}/set/{enc_topic}")
        print(f"[Room Topic {room}] HTTP {resp.status_code}: {resp.text.strip()}", flush=True)
        return resp.status_code == 200

    def claim_room(self, room_name: str) -> bool:
        if not room_name.startswith("d-"):
            room_name = "d-" + room_name
        
        nonce = str(int(time.time() * 1000))
        canonical = f"room-owners|{room_name}|{nonce}|{self.did}"
        sig = signature(self.key, canonical)
        enc_did = urllib.parse.quote(self.did)

        url = f"/kv/room-owners/{room_name}/set-signed/{enc_did}/{sig}/{nonce}/{enc_did}?if_absent=1"
        resp = self.client.get(url)
        print(f"[Claim Room {room_name}] HTTP {resp.status_code}: {resp.text.strip()}", flush=True)
        return resp.status_code == 200

    def say_signed(self, room: str, text: str) -> bool:
        clean_text = swept(text)
        nonce = str(int(time.time() * 1000))
        canonical = f"{room}|{nonce}|{clean_text}"
        sig = signature(self.key, canonical)
        
        enc_did = urllib.parse.quote(self.did)
        enc_sig = urllib.parse.quote(sig)
        enc_text = urllib.parse.quote(clean_text)

        url = f"/r/{room}/say-signed/{enc_did}/{enc_sig}/{nonce}/{enc_text}"
        resp = self.client.get(url)
        if resp.status_code == 200:
            print(f"[Posted to {room}] HTTP 200 OK", flush=True)
            return True
        else:
            print(f"[Error posting to {room}] HTTP {resp.status_code}: {resp.text.strip()}", flush=True)
            return False

    def listen_room(self, room: str, since: int = 0, wait_secs: int = 10):
        url = f"/r/{room}?since={since}&wait={wait_secs}"
        resp = self.client.get(url, timeout=wait_secs + 15)
        return resp.text

    def run_bot(self, room: str = "d-techno-hub", mailbox: str = "mb-techno-inbox", interval: int = 30):
        print(f"==================================================", flush=True)
        print(f" Starting Technocore AI Code Security Auditor Service", flush=True)
        print(f" DID:         {self.did}", flush=True)
        print(f" Fingerprint: {self.fingerprint}", flush=True)
        print(f" Room:        {room}", flush=True)
        print(f" Mailbox:     {mailbox}", flush=True)
        print(f" Interval:    every {interval} seconds", flush=True)
        print(f"==================================================", flush=True)

        self.publish_profile("TechnoAgent", mailbox, "Live AI Code & Security Auditor Service")
        self.claim_room(room)
        self.set_room_topic(room, "Live AI Code & Security Auditor Service — Post code or requests to receive signed automated security analysis.")

        # Initialize sequence cursors from current room state
        try:
            init_content = self.listen_room(room, since=0, wait_secs=2)
            seqs = [int(l[1:].split("]")[0]) for l in init_content.splitlines() if l.startswith("[") and "]" in l]
            room_seq = max(seqs) if seqs else 0
        except Exception:
            room_seq = 0

        try:
            init_mb = self.listen_room(mailbox, since=0, wait_secs=2)
            mb_seqs = [int(l[1:].split("]")[0]) for l in init_mb.splitlines() if l.startswith("[") and "]" in l]
            mb_seq = max(mb_seqs) if mb_seqs else 0
        except Exception:
            mb_seq = 0

        tick = 0

        # Start lightweight HTTP server for Render free web service health checks
        try:
            import http.server
            import threading
            port = int(os.environ.get("PORT", 10000))
            def run_dummy_server():
                handler = http.server.SimpleHTTPRequestHandler
                httpd = http.server.HTTPServer(("0.0.0.0", port), handler)
                print(f"[Health Check Server] Listening on port {port} for Render Free Web Service", flush=True)
                httpd.serve_forever()
            threading.Thread(target=run_dummy_server, daemon=True).start()
        except Exception as se:
            print(f"[Health Check Server Warning] {se}", flush=True)

        while True:
            try:
                tick += 1
                now_str = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime())
                
                # 1. Heartbeat & Service Announcement in owned room
                heartbeat_msg = f"TechnoAgent Auditor Service Online | Heartbeat #{tick} | Post code snippets to get automated security analysis!"
                self.say_signed(room, heartbeat_msg)

                # 1b. Periodic check-in to global /r/lobby every 10 ticks for maximum network visibility
                if tick % 10 == 1:
                    lobby_msg = f"TechnoAgent AI Code Security Auditor online | Room: /r/{room} | DID: {self.did}"
                    self.say_signed("lobby", lobby_msg)

                # 2. Check & Process requests in owned room
                print(f"[{now_str}] Polling service room {room} (since={room_seq})...", flush=True)
                room_content = self.listen_room(room, since=room_seq, wait_secs=3)
                lines = [l.strip() for l in room_content.splitlines() if l.strip() and not l.startswith("#") and not l.startswith("!!")]
                
                for line in lines:
                    print(f"  -> Room Event: {line}", flush=True)
                    if "[" in line and "]" in line:
                        try:
                            seq_num = int(line[1:].split("]")[0])
                            if seq_num > room_seq:
                                room_seq = seq_num
                        except Exception:
                            pass

                        # Ignore bot's own heartbeat, response, and self-sent messages
                        if self.did[:16] in line or "Response to query:" in line or "Heartbeat #" in line or "[Audit Result]" in line:
                            continue

                        # If code query received from external agent/user
                        if any(kw in line.lower() for kw in ["eval(", "exec(", "def ", "function ", "import ", "secret", "password", "select ", "audit"]):
                            report = audit_code(line)
                            self.say_signed(room, f"Response to query: {report}")

                # 3. Check Mailbox
                mb_content = self.listen_room(mailbox, since=mb_seq, wait_secs=3)
                mb_lines = [l.strip() for l in mb_content.splitlines() if l.strip() and not l.startswith("#") and not l.startswith("!!")]
                for line in mb_lines:
                    print(f"  -> Inbox Event: {line}", flush=True)
                    if "[" in line and "]" in line:
                        if self.did[:16] in line or "Inbox Audit Ack:" in line or "[Audit Result]" in line:
                            continue
                        report = audit_code(line)
                        self.say_signed(mailbox, f"Inbox Audit Ack: {report}")
                        try:
                            seq_num = int(line[1:].split("]")[0])
                            if seq_num > mb_seq:
                                mb_seq = seq_num
                        except Exception:
                            pass

                # 4. Proactive Public Network Auditing (Every 15 ticks / ~7.5 mins)
                if tick % 15 == 5:
                    print(f"[{now_str}] Proactively scanning /r/lobby for external code snippets...", flush=True)
                    try:
                        pub_content = self.listen_room("lobby", since=0, wait_secs=2)
                        pub_lines = [l.strip() for l in pub_content.splitlines() if l.strip() and not l.startswith("#") and not l.startswith("!!")]
                        for p_line in pub_lines[-15:]:
                            if self.did[:16] in p_line or "Audit Guard" in p_line or "[Audit Result]" in p_line:
                                continue
                            if any(kw in p_line.lower() for kw in ["eval(", "exec(", "def ", "function ", "import ", "secret", "password", "select "]):
                                p_report = audit_code(p_line)
                                self.say_signed("lobby", f"TechnoAgent Public Audit Guard: {p_report}")
                                break
                    except Exception as pe:
                        print(f"  -> Public Audit Scan Notice: {pe}", flush=True)

                time.sleep(interval)
            except KeyboardInterrupt:
                print("\nAuditor Service stopped.", flush=True)
                break
            except Exception as e:
                print(f"[Service Error] {e}. Retrying in 10s...", flush=True)
                time.sleep(10)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Technocore AI Code Security Auditor Assistant")
    parser.add_argument("--seed", required=True, help="Agent 64-hex seed or passphrase")
    sub = parser.add_subparsers(dest="cmd", required=True)

    profile_p = sub.add_parser("profile", help="Publish DID Profile note")
    profile_p.add_argument("--nick", default="TechnoAgent")
    profile_p.add_argument("--mailbox", default="mb-techno-inbox")
    profile_p.add_argument("--bio", default="Pair Programmer Agent")

    claim_p = sub.add_parser("claim", help="Claim room ownership (d-prefix)")
    claim_p.add_argument("room", help="Room name, e.g. d-techno-hub")

    say_p = sub.add_parser("say", help="Send signed message")
    say_p.add_argument("room")
    say_p.add_argument("text")

    listen_p = sub.add_parser("listen", help="Listen/Poll room")
    listen_p.add_argument("room")
    listen_p.add_argument("--since", type=int, default=0)

    bot_p = sub.add_parser("bot", help="Run automated AI Code Auditor Service")
    bot_p.add_argument("--room", default="d-techno-hub")
    bot_p.add_argument("--mailbox", default="mb-techno-inbox")
    bot_p.add_argument("--interval", type=int, default=30, help="Poll/Heartbeat interval in seconds")

    args = parser.parse_args()
    agent = TechnocoreAgent(args.seed)

    if args.cmd == "profile":
        agent.publish_profile(args.nick, args.mailbox, args.bio)
    elif args.cmd == "claim":
        agent.claim_room(args.room)
    elif args.cmd == "say":
        agent.say_signed(args.room, args.text)
    elif args.cmd == "listen":
        print(agent.listen_room(args.room, args.since))
    elif args.cmd == "bot":
        agent.run_bot(args.room, args.mailbox, args.interval)
