# How to Add MongoDB Atlas to your Django Project

This project currently uses **Django** with **SQLite** (default) or **PostgreSQL** (configured in `settings.py` via `DATABASE_URL`). To use **MongoDB Atlas**, you have a few options, but the most common way to keep using Django's ORM is with a connector like `djongo`.

## Step 1: Create a MongoDB Atlas Account & Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Sign up and creating a new Cluster (the free tier is sufficient).
3. **Network Access**: whitelist your IP address (or currently allow all IPs `0.0.0.0/0` for development).
4. **Database Access**: Create a database user (username/password).
5. **Get Connection String**:
   - Click "Connect".
   - Choose "Connect your application".
   - Select "Python" as the driver.
   - Copy the connection string. It will look like:
     `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`

## Step 2: Install Required Packages
You need to install `djongo` and `pymongo`. Add them to your `backend/requirements.txt` or install manually:

```bash
pip install djongo pymongo==3.12.3
```
*Note: Djongo often requires a specific older version of `pymongo` (like 3.12.3) to work correctly depending on your Django version.*

## Step 3: Update `settings.py`
Open `backend/backend_project/settings.py` and modify the `DATABASES` configuration.

Replace the existing `DATABASES` block with:

```python
DATABASES = {
    'default': {
        'ENGINE': 'djongo',
        'NAME': 'your_db_name',
        'ENFORCE_SCHEMA': False,
        'CLIENT': {
            'host': 'mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority',
        }
    }
}
```

## Step 4: Apply Migrations
Run the migrations to create collections in MongoDB:
```bash
python manage.py makemigrations
python manage.py migrate
```

## Important Considerations
- **Django ORM & NoSQL**: Django is built for Relational Databases (SQL). Using it with MongoDB (NoSQL) via Djongo works for basic things but advanced queries or many-to-many relationships can sometimes be buggy.
- **Alternative**: If you want a "pure" MERN stack experience (MongoDB, Express, React, Node), you should replace the **Django** backend with a **Node.js/Express** backend.

## Summary for Your Project
Since your project is configured with `dj-database-url` for PostgreSQL, you would typically need to comment that out or adjust the logic to use the Djongo configuration instead when you want to use Mongo.
