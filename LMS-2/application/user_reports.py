import base64
import io
from datetime import datetime, timedelta

from matplotlib import pyplot as plt

from application.models import BookRequest, Section, db, User, Book, Feedback

def generate_book_request_report():
    # Query for book requests within the last month
    last_month = datetime.utcnow() - timedelta(days=30)
    book_requests = BookRequest.query.filter(BookRequest.request_date >= last_month).all()

    # Data preparation for the report
    data = {}
    for request in book_requests:
        book_name = request.book.name
        if book_name in data:
            data[book_name] += 1
        else:
            data[book_name] = 1

    # Generate the bar chart
    plt.figure(figsize=(10, 6))
    plt.bar(data.keys(), data.values(), color='skyblue')
    plt.xlabel('Books')
    plt.ylabel('Number of Requests')
    plt.title('Book Requests in the Last Month')
    plt.xticks(rotation=45, ha='right')

    # Save the plot to a BytesIO object
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plt.close()

    # Encode the image to base64
    img_base64 = base64.b64encode(img.getvalue()).decode('utf8')
    return img_base64

def generate_section_activity_report():
    # Query for sections and their associated books and requests
    sections = Section.query.all()

    data = {}
    for section in sections:
        section_name = section.name
        book_requests = BookRequest.query.join(Book).filter(Book.section_id == section.section_id).count()
        data[section_name] = book_requests

    # Generate the bar chart
    plt.figure(figsize=(10, 6))
    plt.bar(data.keys(), data.values(), color='lightgreen')
    plt.xlabel('Sections')
    plt.ylabel('Number of Requests')
    plt.title('Section Activity in the Last Month')
    plt.xticks(rotation=45, ha='right')

    # Save the plot to a BytesIO object
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plt.close()

    # Encode the image to base64
    img_base64 = base64.b64encode(img.getvalue()).decode('utf8')
    return img_base64

def generate_user_feedback_report():
    # Query for feedback within the last month
    last_month = datetime.utcnow() - timedelta(days=30)
    feedbacks = Feedback.query.filter(Feedback.created_date >= last_month).all()

    data = {}
    for feedback in feedbacks:
        book_name = feedback.book.name
        if book_name in data:
            data[book_name].append(feedback.rating)
        else:
            data[book_name] = [feedback.rating]

    # Calculate average ratings
    avg_ratings = {book: sum(ratings)/len(ratings) for book, ratings in data.items()}

    # Generate the bar chart
    plt.figure(figsize=(10, 6))
    plt.bar(avg_ratings.keys(), avg_ratings.values(), color='salmon')
    plt.xlabel('Books')
    plt.ylabel('Average Rating')
    plt.title('Average Book Ratings in the Last Month')
    plt.xticks(rotation=45, ha='right')

    # Save the plot to a BytesIO object
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plt.close()

    # Encode the image to base64
    img_base64 = base64.b64encode(img.getvalue()).decode('utf8')
    return img_base64
