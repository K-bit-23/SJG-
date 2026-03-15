import socket

def check():
    hosts = [
        "cluster0-shard-00-00.i6g3upp.mongodb.net",
        "cluster0-shard-00-01.i6g3upp.mongodb.net",
        "cluster0-shard-00-02.i6g3upp.mongodb.net"
    ]
    for h in hosts:
        try:
            ip = socket.gethostbyname(h)
            print(f"{h} -> {ip}")
        except Exception as e:
            print(f"{h} -> FAILED: {e}")

if __name__ == "__main__":
    check()
