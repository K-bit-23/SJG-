import dns.resolver

r = dns.resolver.Resolver()
r.nameservers = ['8.8.8.8']

hosts = [
    'ac-govzsgg-shard-00-00.cdlgflc.mongodb.net',
    'ac-govzsgg-shard-00-01.cdlgflc.mongodb.net',
    'ac-govzsgg-shard-00-02.cdlgflc.mongodb.net',
]

for h in hosts:
    try:
        answers = r.resolve(h, 'A')
        ip = str(list(answers)[0])
        print(f"{h} = {ip}")
    except Exception as e:
        print(f"{h} = ERROR: {e}")
