from main import app
from application.sec import datastore
from application.models import db
from flask_security import hash_password
from werkzeug.security import generate_password_hash


with app.app_context():
    db.drop_all()
    db.create_all()
    datastore.find_or_create_role(name="student", description="User is a Student")
    datastore.find_or_create_role(name="librarian", description="User is a Librarian")
    db.session.commit()
    if not datastore.find_user(email="lib@gmail.com"):
        datastore.create_user(name="Librarian",
                              email="lib@gmail.com", password=generate_password_hash("librarian"), roles=["librarian"],
                              active=True)
        
    if not datastore.find_user(email="gkm@gmail.com"):
        datastore.create_user(
            name="GKM",
            email="gkm@gmail.com", password=generate_password_hash("123"), roles=["student"])
    if not datastore.find_user(email="skm@gmail.com"):
        datastore.create_user(
            name="SKM",
            email="skm@gmail.com", password=generate_password_hash("123"), roles=["student"])

    db.session.commit()