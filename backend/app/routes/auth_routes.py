from functools import wraps
from flask import Blueprint, request, jsonify, current_app
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from app import db
from app.auth import generate_token, TOKEN_MAX_AGE, _serializer  # Reusing Collins' helpers
from app.models.user import User

auth_bp = Blueprint("auth", __name__)

# --- Custom Token Authentication Decorator ---
def token_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Unauthorized", "message": "Missing or invalid Authorization header"}), 401

        token = auth_header.removeprefix("Bearer ").strip()
        try:
            payload = _serializer().loads(token, max_age=TOKEN_MAX_AGE)
        except (BadSignature, SignatureExpired):
            return jsonify({"error": "Unauthorized", "message": "Invalid or expired token"}), 401

        current_user = User.query.get(payload.get("user_id"))
        if not current_user:
            return jsonify({"error": "Unauthorized", "message": "User not found"}), 401

        # Inject current_user into the view function arguments
        return view(current_user, *args, **kwargs)

    return wrapped


# --- Routes ---

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    username = data.get("username", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({"error": "Bad Request", "message": "Username and password are required"}), 400

    # Prevent duplicate usernames
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Conflict", "message": "Username is already taken"}), 409

    try:
        # Create user (role defaults to 'user' in Phase 3)
        new_user = User(username=username, email=email, role='user')
        new_user.set_password(password)
        
        db.session.add(new_user)
        db.session.commit()
        
        # Automatically generate a token upon registration
        token = generate_token(new_user)
        
        return jsonify({
            "message": "User registered successfully",
            "token": token,
            "user": new_user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    username = data.get("username", "").strip()
    password = data.get("password", "")

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Unauthorized", "message": "Invalid username or password"}), 401

    return jsonify({"token": generate_token(user), "user": user.to_dict()}), 200


@auth_bp.route("/me", methods=["GET"])
@token_required
def me(current_user):
    """Returns details of the currently authenticated user"""
    return jsonify({"user": current_user.to_dict()}), 200