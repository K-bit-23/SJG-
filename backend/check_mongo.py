from api.mongodb import mongo_client

db = mongo_client.get_database()
print('products', db['products'].count_documents({}))
print('orders', db['orders'].count_documents({}))
print('users', db['users'].count_documents({}))
print('messages', db['messages'].count_documents({}))
