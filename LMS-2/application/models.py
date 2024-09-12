from flask_security import RoleMixin, UserMixin
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import datetime

db = SQLAlchemy()

class RolesUsers(db.Model):
    __tablename__ = 'roles_users'
    id = db.Column(db.Integer(), primary_key=True)
    user_id = db.Column('user_id', db.Integer(), db.ForeignKey('users.id'))
    role_id = db.Column('role_id', db.Integer(), db.ForeignKey('role.id'))

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))

class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=False)
    email = db.Column(db.String(), unique=True, nullable=False)
    password = db.Column(db.String(255))
    active = db.Column(db.Boolean())
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    roles = db.relationship('Role', secondary='roles_users', backref=db.backref('users', lazy='dynamic'))
    books_access = db.relationship('Book', secondary='bookuser', back_populates='users_access')
    feedbacks = db.relationship('Feedback', back_populates='user')  # Add this line
    def set_password(self, password):
        self.password = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password)

class Section(db.Model):
    __tablename__ = 'section'
    section_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)
    created_date = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    description = db.Column(db.Text)


    def __init__(self, name, description=None, created_date=datetime.datetime.utcnow()):
        self.name = name
        self.description = description
        self.created_date = created_date

    # Relationship
    books = db.relationship('Book', backref='section', lazy=True, cascade='all, delete-orphan')

class Book(db.Model):
    __tablename__ = 'book'
    book_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), nullable=False)
    thumbnail_path = db.Column(db.String(512))
    content_path = db.Column(db.String(512))
    author = db.Column(db.String(64))
    date_issued = db.Column(db.Date)
    section_id = db.Column(db.Integer, db.ForeignKey('section.section_id', ondelete='CASCADE'), nullable=True)
    feedbacks = db.relationship('Feedback', back_populates='book')  # Add this line
    def __init__(self, section_id, name, author, thumbnail_path, content_path, date_issued):
        self.section_id = section_id
        self.name = name
        self.author = author
        self.thumbnail_path = thumbnail_path
        self.content_path = content_path
        self.date_issued = date_issued

    # Relationship
    users_access = db.relationship('User', secondary='bookuser', back_populates='books_access')

class BookUser(db.Model):
    __tablename__ = 'bookuser'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    book_id = db.Column(db.Integer, db.ForeignKey('book.book_id'))


class BookRequest(db.Model):
    __tablename__ = 'book_requests'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    book_id = db.Column(db.Integer, db.ForeignKey('book.book_id'))
    request_date = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    accepted_date = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(20), default='pending')
    access_expiry_date = db.Column(db.DateTime, nullable=True)

    user = db.relationship('User', backref='book_requests')
    book = db.relationship('Book', backref='book_requests')

class Feedback(db.Model):
    __tablename__ = 'feedback'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    book_id = db.Column(db.Integer, db.ForeignKey('book.book_id'))
    feedback_text = db.Column(db.Text, nullable=False)
    created_date = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    rating = db.Column(db.Integer)


    user = db.relationship('User', back_populates='feedbacks')
    book = db.relationship('Book', back_populates='feedbacks')




class DailyVisits(db.Model):
    __tablename__ = 'daily_visits'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    date = db.Column(db.Date)
    user = db.relationship('User', backref='visits')


