from flask import current_app
from itsdangerous import URLSafeTimedSerializer

TOKEN_MAX_AGE = 8 * 60 * 60  # 8 hours


def _serializer():
    return URLSafeTimedSerializer(current_app.config["SECRET_KEY"])


def generate_token(user):
    return _serializer().dumps({"user_id": user.id})
