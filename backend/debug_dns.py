import dns.resolver

def check_dns():
    try:
        print("Looking up SRV records for _mongodb._tcp.cluster0.i6g3upp.mongodb.net")
        answers = dns.resolver.resolve('_mongodb._tcp.cluster0.i6g3upp.mongodb.net', 'SRV')
        for rdata in answers:
            print(f'Host: {rdata.target} Port: {rdata.port}')
    except Exception as e:
        print(f"DNS Error: {e}")

if __name__ == "__main__":
    check_dns()
