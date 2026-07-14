from functools import wraps

from flask import g, jsonify, request
from itsdangerous import BadSignature, SignatureExpired

from app.auth import TOKEN_MAX_AGE, _serializer
from app.models.user import User


def _current_user_from_request():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None

    token = auth_header.removeprefix("Bearer ").strip()
    try:
        payload = _serializer().loads(token, max_age=TOKEN_MAX_AGE)
    except (BadSignature, SignatureExpired):
        return None

    return User.query.get(payload.get("user_id"))


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        user = _current_user_from_request()
        if not user:
            return jsonify({"error": "Unauthorized", "message": "Missing or invalid Authorization header"}), 401

        g.current_user = user
        return view(*args, **kwargs)

    return wrapped


def admin_required(view):
    @wraps(view)
    def guarded(*args, **kwargs):
        if not g.current_user.is_admin:
            return jsonify({"error": "Forbidden", "message": "Admin privileges required"}), 403

        return view(*args, **kwargs)

    return login_required(guarded)
