from flask import  jsonify, request
from flask_restful import Api, Resource, reqparse
from werkzeug.security import check_password_hash, generate_password_hash
from flask_security import auth_required, roles_required, current_user
from werkzeug.utils import secure_filename

from datetime import datetime, timedelta,date
from sqlalchemy import or_
from .models import Section, Book, BookRequest, Feedback, User, db, DailyVisits
import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt



def log_user_visits():
    if current_user is not None and "student" in current_user.roles:
        visited = DailyVisits.query.filter_by(user_id=current_user.id,
                                             date=datetime.today().strftime('%Y-%m-%d')).count()
        if visited == 0:
            vs = DailyVisits(user_id=current_user.id, date=datetime.today())
            db.session.add(vs)
            db.session.commit()


# Configuration
UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'gif'}

# Ensure the upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

api = Api(prefix='/api')

# #################Librarian resources####################
######################################################################

class StatisticsResource(Resource):
    @auth_required('token')
    @roles_required('librarian')
    def get(self):
        try:
            # Example statistics calculation
            book_count = Book.query.count()
            user_count = User.query.count()
            request_count = BookRequest.query.count()
            feedback_count = Feedback.query.count()

            # Example data for plotting
            labels = ['Books', 'Users', 'Requests', 'Feedbacks']
            sizes = [book_count, user_count, request_count, feedback_count]

            # Create a pie chart
            plt.figure(figsize=(8, 8))
            plt.pie(sizes, labels=labels, autopct='%1.1f%%', startangle=140)
            plt.axis('equal')  # Equal aspect ratio ensures that pie is drawn as a circle.
            plt.title('Library Statistics')
            plt.savefig('static/statistics_chart.png')  # Save the chart as an image file
            plt.close()

            # Return data for Vue.js component
            return {
                'bookCount': book_count,
                'userCount': user_count,
                'requestCount': request_count,
                'feedbackCount': feedback_count,
                'chartImage': '/static/statistics_chart.png'  # Path to the saved chart image
            }, 200

        except Exception as e:
            return {
                'error': 'Failed to fetch statistics'
            }, 500

api.add_resource(StatisticsResource, '/statistics')






############## Section resources#################

class SectionResource(Resource):
    @auth_required('token')
    @roles_required('librarian')
    def put(self, section_id):
        data = request.get_json()
        section = Section.query.get_or_404(section_id)

        if 'name' in data:
            section.name = data['name']
        if 'description' in data:
            section.description = data['description']

        db.session.commit()

        return {'message': 'Section updated successfully', 'section': {'id': section.section_id, 'name': section.name, 'description': section.description}}, 200

    @auth_required('token')
    @roles_required('librarian')
    def delete(self, section_id):
        section = Section.query.get_or_404(section_id)
        db.session.delete(section)
        db.session.commit()

        return {'message': 'Section deleted successfully'}, 200

    @auth_required('token')
    @roles_required('librarian')
    def get(self, section_id):
        section = Section.query.get_or_404(section_id)
        return {'section':{'id': section.section_id, 'name': section.name, 'description': section.description}}, 200

class SectionListResource(Resource):
    @auth_required('token')
    @roles_required('librarian')
    def post(self):
        data = request.get_json()
        name = data.get('name')
        description = data.get('description', '')
        created_date_str = data.get('created_date')  # Get date string from JSON

        if not name:
            return {'error': 'Section name is required'}, 400

        try:
            created_date = datetime.strptime(created_date_str, '%Y-%m-%d').date()
        except ValueError:
            return {'error': 'Invalid date format, should be yyyy-mm-dd'}, 400

        new_section = Section(name=name, description=description, created_date=created_date)
        db.session.add(new_section)
        db.session.commit()

        return {
            'message': 'Section created successfully',
            'section': {
                'id': new_section.section_id,
                'name': new_section.name,
                'description': new_section.description,
                'created_date': new_section.created_date.strftime('%Y-%m-%d')  # Return date in yyyy-mm-dd format
            }
        }, 201

    @auth_required('token')
    @roles_required('librarian')
    def get(self):
        sections = Section.query.all()
        section_list = [{'id': section.section_id, 'name': section.name, 'description': section.description} for section in sections]
        return {'sections': section_list}, 200

################ Book resources################

class BookResource(Resource):
    @auth_required('token')
    @roles_required('librarian')
    def get(self, section_id, book_id):
        book = Book.query.filter_by(section_id=section_id, book_id=book_id).first_or_404()
        return jsonify({
            'book': {
                'id': book.book_id,
                'name': book.name,
                'author': book.author,
                'thumbnail': book.thumbnail_path,
                'content': book.content_path,
                'date_issued': book.date_issued.strftime('%Y-%m-%d')
            }
        })

    @auth_required('token')
    @roles_required('librarian')
    def put(self, section_id, book_id):
        book = Book.query.filter_by(section_id=section_id, book_id=book_id).first_or_404()
        data = request.form.to_dict()
        book.name = data.get('name', book.name)
        book.author = data.get('author', book.author)
        book.date_issued = datetime.strptime(data.get('date_issued'), '%Y-%m-%d').date() if data.get('date_issued') else book.date_issued
        
        if 'thumbnail' in request.files:
            thumbnail = request.files['thumbnail']
            if allowed_file(thumbnail.filename):
                filename = secure_filename(thumbnail.filename)
                thumbnail.save(os.path.join(UPLOAD_FOLDER, filename))
                book.thumbnail_path = os.path.join(UPLOAD_FOLDER, filename)
        
        if 'content' in request.files:
            content = request.files['content']
            if allowed_file(content.filename):
                filename = secure_filename(content.filename)
                content.save(os.path.join(UPLOAD_FOLDER, filename))
                book.content_path = os.path.join(UPLOAD_FOLDER, filename)

        db.session.commit()
        return jsonify({'message': 'Book updated successfully'})

    @auth_required('token')
    @roles_required('librarian')
    def delete(self, section_id, book_id):
        book = Book.query.filter_by(section_id=section_id, book_id=book_id).first_or_404()
        db.session.delete(book)
        db.session.commit()
        return jsonify({'message': 'Book deleted successfully'})
class BookListResource(Resource):
    @auth_required('token')
    @roles_required('librarian')
    def get(self, section_id):
        books = Book.query.filter_by(section_id=section_id).all()
        return jsonify({
            'books': [{
                'id': book.book_id,
                'name': book.name,
                'author': book.author,
                'thumbnail': book.thumbnail_path,
                'content': book.content_path,
                'date_issued': book.date_issued.strftime('%Y-%m-%d')
            } for book in books]
        })

    @auth_required('token')
    @roles_required('librarian')
    def post(self, section_id):
        data = request.form.to_dict()
        name = data.get('name')
        author = data.get('author')
        date_issued = datetime.strptime(data.get('date_issued'), '%Y-%m-%d').date()
        if not name or not author:
            return {'error': 'Book name and author are required'}, 400

        if not date_issued:
            return {'error': 'Date issued is required'}, 400

        if not isinstance(date_issued, date):
            return {'error': 'Invalid date format, should be yyyy-mm-dd'}, 400
        
        thumbnail = None
        content = None
        if 'thumbnail' in request.files:
            thumbnail_file = request.files['thumbnail']
            if allowed_file(thumbnail_file.filename):
                filename = secure_filename(thumbnail_file.filename)
                thumbnail_file.save(os.path.join(UPLOAD_FOLDER, filename))
                thumbnail = os.path.join(UPLOAD_FOLDER, filename)
        
        if 'content' in request.files:
            content_file = request.files['content']
            if allowed_file(content_file.filename):
                filename = secure_filename(content_file.filename)
                content_file.save(os.path.join(UPLOAD_FOLDER, filename))
                content = os.path.join(UPLOAD_FOLDER, filename)

        new_book = Book(section_id=section_id, name=name, author=author, thumbnail_path=thumbnail, content_path=content, date_issued=date_issued)
        db.session.add(new_book)
        db.session.commit()
        return jsonify({'message': 'Book created successfully'})


########################################################################################
######################################## Book Request resources######################

class BookRequestResource(Resource):
    
    @auth_required('token')
    def post(self):
        user_id = current_user.id
        book_id = request.json.get('book_id')
        print(f"Received book_id: {book_id}")  # Debugging linez

        if book_id in [req.book_id for req in BookRequest.query.filter_by(user_id=user_id, status='accepted').all()]:
            return {'error': 'You already have an active request for this book'}, 400


        requested = BookRequest.query.filter_by(user_id=user_id, book_id=book_id, status='pending').first()
        if requested:
            return {'error': 'You already have a pending request for this book'}, 400
        requests_limit = BookRequest.query.filter_by(user_id=user_id, status='pending').count()
        if requests_limit >= 5:
            return {'error': 'You have already requested the maximum number of books'}, 400      


        new_request = BookRequest(user_id=user_id, book_id=book_id)
        db.session.add(new_request)
        db.session.commit()
        return {'message': 'Book request submitted successfully'}


    @auth_required('token')
    def get(self):
        user_id = current_user.id
        requests = BookRequest.query.filter_by(user_id=user_id).all()
        return {'requests': [{
            'id': req.id,
            'book_id': req.book_id,
            'book_name': req.book.name if req.book else 'Unknown',
            'status': req.status,
            'book_content': req.book.content_path if req.book else None,
            'request_date': req.request_date.strftime('%Y-%m-%d'),
            'accepted_date': req.accepted_date.strftime('%Y-%m-%d') if req.accepted_date else None,
            'access_expiry_date': req.access_expiry_date.strftime('%Y-%m-%d') if req.access_expiry_date else None
        } for req in requests]}
    

class BookReturnResource(Resource):
    @auth_required('token')
    def post(self):
        user_id = current_user.id
        book_id = request.json.get('book_id')

        # Ensure book_id is provided in the request
        if not book_id:
            return {'error': 'book_id is required'}, 400
        #find the rejected request for this book by the current user
        rejected_request = BookRequest.query.filter_by(user_id=user_id, book_id=book_id, status='rejected').first()
        if rejected_request:
            try:
                # Delete the rejected request
                db.session.delete(rejected_request)
                db.session.commit()
                return {'message': 'Book returned successfully'}
            except Exception as e:
                db.session.rollback()  # Rollback the transaction in case of error
                return {'error': f'An error occurred while returning the book: {str(e)}'}, 500

        # Find the accepted request for this book by the current user
        accepted_request = BookRequest.query.filter_by(user_id=user_id, book_id=book_id, status='accepted').first()

        if not accepted_request:
            return {'error': 'No accepted request found for this book'}, 400
        
        try:
            # Delete the accepted request
            db.session.delete(accepted_request)
            db.session.commit()
            return {'message': 'Book returned successfully'}
        except Exception as e:
            db.session.rollback()  # Rollback the transaction in case of error
            return {'error': f'An error occurred while returning the book: {str(e)}'}, 500

########################################################################################
######################################### Handling Requests ###########################
class LibrarianManageRequestsResource(Resource):
    @auth_required('token')
    @roles_required('librarian')
    def get(self):
        requests = BookRequest.query.filter_by(status='pending').all()
        return {'requests': [{
            'id': req.id,
            'user_id': req.user_id,
            'user_name': req.user.name if req.user else 'Unknown User',
            'book_id': req.book_id,
            'book_name': req.book.name if req.book else 'Unknown Book',
            'status': req.status,
            'request_date': req.request_date.strftime('%Y-%m-%d')
        } for req in requests if req.user and req.book]}

    @auth_required('token')
    @roles_required('librarian')
    def post(self):
        request_id = request.json.get('request_id')
        action = request.json.get('action')
        book_request = BookRequest.query.get_or_404(request_id)

        if action == 'accept':
            book_request.status = 'accepted'
            book_request.accepted_date = datetime.utcnow()
            book_request.access_expiry_date = datetime.utcnow() + timedelta(days=3)
        elif action == 'reject':
            book_request.status = 'rejected'
        else:
            return {'error': 'Invalid action'}, 400

        db.session.commit()
        return {'message': f'Book request has been {action}ed'}
##############################################################################
#################################### Handling Feedback ############################
class FeedbackResource(Resource):
    @auth_required('token')
    def post(self):
        try:
            user_id = current_user.id
            book_id = request.json.get('book_id')
            feedback_text = request.json.get('feedback')
            rating = request.json.get('rating')

            new_feedback = Feedback(
                user_id=user_id, 
                book_id=book_id, 
                feedback_text=feedback_text,
                rating=rating,
                created_date=datetime.utcnow()
                
            )
            db.session.add(new_feedback)
            db.session.commit()
            return {'message': 'Feedback submitted successfully'}, 200
        except Exception as e:
            return {'error': str(e)}, 500

    @auth_required('token')
    def get(self, book_id):
        try:
            feedbacks = Feedback.query.filter_by(book_id=book_id).order_by(Feedback.created_date.desc()).all()
            return {
                'feedbacks': [{
                    'user_id': fb.user_id,
                    'user_name': fb.user.name,
                    'feedback': fb.feedback_text,
                    'rating': fb.rating,
                    'created_date': fb.created_date.strftime('%Y-%m-%d')
                } for fb in feedbacks]
            }, 200
        except Exception as e:
            return {'error': str(e)}, 500



api.add_resource(SectionResource, '/sections/<int:section_id>')
api.add_resource(SectionListResource, '/sections')
api.add_resource(BookResource, '/sections/<int:section_id>/books/<int:book_id>')
api.add_resource(BookListResource, '/sections/<int:section_id>/books')
api.add_resource(BookRequestResource, '/requests')
api.add_resource(BookReturnResource, '/return')
api.add_resource(LibrarianManageRequestsResource, '/manage_requests')
api.add_resource(FeedbackResource, '/feedback', '/feedback/<int:book_id>')


########################################################################
###################STUDENT RESOURCES###############################




class StudentSectionListResource(Resource):
    @auth_required('token')
    @roles_required('student')
    def get(self):
        sections = Section.query.all()
        return jsonify({'sections': [{
            'id': section.section_id,
            'name': section.name,
            'description': section.description
        } for section in sections]})

class StudentBookListResource(Resource):
    @auth_required('token')
    @roles_required('student')
    def get(self, section_id):
        books = Book.query.filter_by(section_id=section_id).all()
        return jsonify({'books': [{
            'id': book.book_id,
            'name': book.name,
            'author': book.author,
            'thumbnail': book.thumbnail_path,
            'content': book.content_path,
            'date_issued': book.date_issued.strftime('%Y-%m-%d') if book.date_issued else None
        } for book in books]})

api.add_resource(StudentSectionListResource, '/student/sections')
api.add_resource(StudentBookListResource, '/student/sections/<int:section_id>/books')




########################## profile##############################
#################################################################
class ProfileResource(Resource):
    @auth_required('token')
    def get(self):
        user_id = current_user.id
        user = User.query.get(user_id)
        return {
            'name': user.name,
            'email': user.email
        }

    @auth_required('token')
    def put(self):
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, help='Name of the user')
        parser.add_argument('email', type=str, help='Email of the user')
        parser.add_argument('password', type=str, help='New password of the user')
        args = parser.parse_args()

        user_id = current_user.id
        user = User.query.get(user_id)
        
        if args['name']:
            user.name = args['name']
        if args['email']:
            user.email = args['email']
        if args['password']:
            user.password = generate_password_hash(args['password'])
        
        try:
            db.session.commit()
            return {'message': 'Profile updated successfully'}
        except Exception as e:
            db.session.rollback()
            return {'message': 'Failed to update profile', 'error': str(e)}, 500


api.add_resource(ProfileResource, '/profile')

############################ search ############################
#################################################################
class SearchResource(Resource):
    @auth_required('token')
    def get(self):
        query = request.args.get('q')
        if not query:
            return {'error': 'Query parameter is required'}, 400

        books = Book.query.filter(or_(Book.name.contains(query), Book.author.contains(query))).all()
        sections = Section.query.filter(or_(Section.name.contains(query), Section.description.contains(query))).all()

        section_list = []
        for section in sections:
            section_books = [{'id': book.book_id, 'name': book.name, 'author': book.author, 'thumbnail': book.thumbnail_path} for book in section.books]
            section_list.append({
                'id': section.section_id,
                'name': section.name,
                'description': section.description,
                'books': section_books
            })

        book_list = [{'id': book.book_id, 'name': book.name, 'author': book.author, 'thumbnail': book.thumbnail_path} for book in books]

        return {'books': book_list, 'sections': section_list}, 200

api.add_resource(SearchResource, '/search')



#######################################################################################################
