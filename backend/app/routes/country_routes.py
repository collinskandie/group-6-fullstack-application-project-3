from flask import Blueprint

country_bp = Blueprint("country", __name__)


@country_bp.route("/")
def home():
    return {
        "message": "Health Dashboard API Running"
    }