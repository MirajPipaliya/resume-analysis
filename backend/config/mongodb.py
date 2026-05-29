import os
from pymongo import MongoClient
from django.conf import settings

def get_db():
    uri = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/')
    db_name = os.environ.get('MONGODB_DB_NAME', 'hr_resume_db')
    client = MongoClient(uri)
    return client[db_name]

db = get_db()

# Collections
users_collection = db['users']
jobs_collection = db['jobs']
candidates_collection = db['candidates']
resumes_collection = db['resumes']
analyses_collection = db['analyses']
pipeline_stages_collection = db['pipeline_stages']
notifications_collection = db['notifications']
otps_collection = db['otps']
