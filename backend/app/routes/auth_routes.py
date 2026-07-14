import re

from flask import Blueprint, g, request, jsonify

from app.auth import generate_token
from app.extensions import db
from app.models.user import User
from app.utils.decorators import login_required

auth_bp = Blueprint("auth", __name__)

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not EMAIL_RE.match(email):
        return jsonify({"error": "Bad Request", "message": "A valid email is required"}), 400

    if len(password) < 8:
        return jsonify({"error": "Bad Request", "message": "Password must be at least 8 characters"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Conflict", "message": "An account with this email already exists"}), 409

    user = User(email=email, role="user")
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify({"token": generate_token(user), "user": user.to_dict()}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Unauthorized", "message": "Invalid email or password"}), 401

    return jsonify({"token": generate_token(user), "user": user.to_dict()}), 200


@auth_bp.route("/logout", methods=["POST"])
def logout():
    # Tokens are stateless (no server-side session/blocklist), so there's nothing to
    # invalidate here — the client drops the token. Endpoint exists for symmetry with
    # the frontend's auth flow.
    return jsonify({"message": "Logged out"}), 200


@auth_bp.route("/me", methods=["GET"])
@login_required
def me():
    return jsonify(g.current_user.to_dict()), 200
