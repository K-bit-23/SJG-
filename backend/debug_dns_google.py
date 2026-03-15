import dns.resolver

def check_dns():
    my_resolver = dns.resolver.Resolver()
    my_resolver.nameservers = ['8.8.8.8', '8.8.4.4']
    try:
        print("Looking up SRV records via Google DNS (8.8.8.8)...")
        answers = my_resolver.resolve('_mongodb._tcp.cluster0.i6g3upp.mongodb.net', 'SRV')
        for rdata in answers:
            print(f'Host: {rdata.target} Port: {rdata.port}')
    except Exception as e:
        print(f"DNS Error via Google: {e}")

if __name__ == "__main__":
    check_dns()
