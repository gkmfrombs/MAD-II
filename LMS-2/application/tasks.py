from datetime import datetime, timedelta
from celery import shared_task
from .mail_service import send_message
from .models import User, db, DailyVisits,BookRequest,Role
from jinja2 import Template
from celery.utils.log import get_task_logger
from .user_reports import generate_book_request_report, generate_section_activity_report, generate_user_feedback_report


logger = get_task_logger(__name__)


@shared_task(ignore_result=True)
def daily_reminder():
    users = User.query.filter(User.roles.any(Role.name == 'student')).all()
    for user in users:
        daily_visit = DailyVisits.query.filter_by(user_id=user.id, date=datetime.today().strftime('%Y-%m-%d')).count()
        if daily_visit == 0:
            with open('daily_reminder.html', 'r') as f:
                template = Template(f.read())
                send_message(user.email, "WonderRush | Don't miss the daily streak - visit the app",
                             template.render(name=user.name))
        else:
            continue
    return "OK"



@shared_task(ignore_result=True)
def send_monthly_report():
    users = User.query.filter(User.roles.any(Role.name == 'student')).all()
    for user in users:
        # Generate the reports
        book_request_report = generate_book_request_report()
        section_activity_report = generate_section_activity_report()
        feedback_report = generate_user_feedback_report()

        # Render the email template
        with open('monthly_report.html', 'r') as f:
            template = Template(f.read())
            email_content = template.render(
                book_request_report=book_request_report,
                section_activity_report=section_activity_report,
                feedback_report=feedback_report,
                name=user.name
            )

        # Send the email
        send_message(user.email, "WonderRush | Monthly Report", email_content)

    return "OK"
