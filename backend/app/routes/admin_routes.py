from flask import Blueprint, g, request, jsonify

from app.extensions import db
from app.models.favorite import Favorite
from app.models.user import User
from app.routes.auth_routes import EMAIL_RE
from app.utils.decorators import admin_required

admin_bp = Blueprint("admin", __name__)

ALLOWED_ROLES = {"user", "admin"}


@admin_bp.route("/users", methods=["GET"])
@admin_required
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users]), 200


@admin_bp.route("/users", methods=["POST"])
@admin_required
def create_user():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    role = data.get("role", "user")

    if not email or not EMAIL_RE.match(email):
        return jsonify({"error": "Bad Request", "message": "A valid email is required"}), 400

    if len(password) < 8:
        return jsonify({"error": "Bad Request", "message": "Password must be at least 8 characters"}), 400

    if role not in ALLOWED_ROLES:
        return jsonify({"error": "Bad Request", "message": f"Role must be one of {sorted(ALLOWED_ROLES)}"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Conflict", "message": "An account with this email already exists"}), 409

    try:
        user = User(
            email=email,
            role=role,
            name=(data.get("name") or "").strip() or None,
            phone=(data.get("phone") or "").strip() or None,
            address=(data.get("address") or "").strip() or None,
        )
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return jsonify(user.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500


@admin_bp.route("/users/<int:id>", methods=["PUT"])
@admin_required
def update_user(id):
    user = User.query.get(id)
    if not user:
        return jsonify({"error": "Not Found", "message": "User not found"}), 404

    data = request.get_json() or {}

    if "email" in data:
        email = data["email"].strip().lower()
        if not email or not EMAIL_RE.match(email):
            return jsonify({"error": "Bad Request", "message": "A valid email is required"}), 400
        existing = User.query.filter(User.email == email, User.id != user.id).first()
        if existing:
            return jsonify({"error": "Conflict", "message": "An account with this email already exists"}), 409
        user.email = email

    if "name" in data:
        user.name = (data["name"] or "").strip() or None

    if "phone" in data:
        user.phone = (data["phone"] or "").strip() or None

    if "address" in data:
        user.address = (data["address"] or "").strip() or None

    if "role" in data:
        new_role = data["role"]
        if new_role not in ALLOWED_ROLES:
            return jsonify({"error": "Bad Request", "message": f"Role must be one of {sorted(ALLOWED_ROLES)}"}), 400

        if user.role == "admin" and new_role != "admin":
            if User.query.filter_by(role="admin").count() <= 1:
                return jsonify(
                    {"error": "Conflict", "message": "Cannot remove the last remaining admin"}
                ), 409

        user.role = new_role

    try:
        db.session.commit()
        return jsonify(user.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500


@admin_bp.route("/users/<int:id>", methods=["DELETE"])
@admin_required
def delete_user(id):
    user = User.query.get(id)
    if not user:
        return jsonify({"error": "Not Found", "message": "User not found"}), 404

    if user.id == g.current_user.id:
        return jsonify({"error": "Forbidden", "message": "Cannot delete your own account"}), 403

    if user.role == "admin" and User.query.filter_by(role="admin").count() <= 1:
        return jsonify({"error": "Conflict", "message": "Cannot delete the last remaining admin"}), 409

    try:
        Favorite.query.filter_by(user_id=user.id).delete()
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": f"User '{user.email}' deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500
