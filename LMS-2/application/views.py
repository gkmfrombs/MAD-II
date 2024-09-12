from flask import current_app as app,jsonify,request,render_template
from werkzeug.security import check_password_hash, generate_password_hash
from .models import User, db
from .sec import datastore



@app.route('/')
def index():
    return render_template('index.html')


@app.route('/user_login', methods=['POST'])
def user_login():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({'message': 'Email is Required'}), 400
    user = datastore.find_user(email=email)
    if "student" not in user.roles:
        return jsonify({'message': 'User is not a Student'}), 400
    if not user:
        return jsonify({'message': 'User Not Found'}), 404
    if  check_password_hash(user.password, data.get('password')):
        return jsonify({"token": user.get_auth_token(),"email":user.email,"role":user.roles[0].name})
    return jsonify({'message': 'Wrong Password'}), 400


@app.route('/librarian_login', methods=['POST'])
def lib_login():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({'message': 'Email is Required'}), 400
    user = datastore.find_user(email=email)
    if "librarian" not in user.roles:
        return jsonify({'message': 'User is not a Librarian'}), 400
    if not user:
        return jsonify({'message': 'User Not Found'}), 404
    if  check_password_hash(user.password, data.get('password')):
        return jsonify({"token": user.get_auth_token(),"email":user.email,"role":user.roles[0].name})
    return jsonify({'message': 'Wrong Password'}), 400


@app.route('/register', methods=['POST'])
def user_register():
    data = request.get_json()
    email = data.get('email')
    name = data.get('name')
    password = data.get('password')
    if not email:
        return jsonify({'message': 'Email is Required'}), 400
    if not name:
        return jsonify({'message': 'Name is Required'}), 400
    if not password:
        return jsonify({'message': 'Password is Required'}), 400
    user = User.query.filter_by(email=email).first()
    if user:
        return jsonify({'message': 'User already exists'}), 400
    user = datastore.create_user(name=name, email=email, password=generate_password_hash(password),active=True, roles=["student"])

    db.session.add(user)
    db.session.commit()
    return jsonify({"token": user.get_auth_token(),"email":user.email,"role":user.roles[0].name}), 201

