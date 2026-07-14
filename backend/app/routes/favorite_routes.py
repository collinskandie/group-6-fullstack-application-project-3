from flask import Blueprint, g, request, jsonify

from app.extensions import db
from app.models.country import Country
from app.models.favorite import Favorite
from app.models.indicator import Indicator
from app.utils.decorators import login_required

favorite_bp = Blueprint("favorites", __name__)


# 1. GET ALL FAVORITES — scoped to the logged-in user
@favorite_bp.route("/", methods=["GET"])
@login_required
def get_favorites():
    favorites = Favorite.query.filter_by(user_id=g.current_user.id).all()
    return jsonify([fav.to_dict() for fav in favorites]), 200


# 2. CREATE A FAVORITE (With Foreign Key Validation)
@favorite_bp.route("/", methods=["POST"])
@login_required
def create_favorite():
    data = request.get_json() or {}

    for field in ("country_id", "indicator_id"):
        if field not in data:
            return jsonify({"error": "Bad Request", "message": f"'{field}' is required"}), 400

    target_country = Country.query.get(data["country_id"])
    if not target_country:
        return jsonify({"error": "Not Found", "message": f"Country with ID {data['country_id']} does not exist"}), 404

    target_indicator = Indicator.query.get(data["indicator_id"])
    if not target_indicator:
        return jsonify({"error": "Not Found", "message": f"Indicator with ID {data['indicator_id']} does not exist"}), 404

    existing = Favorite.query.filter_by(
        user_id=g.current_user.id,
        country_id=data["country_id"],
        indicator_id=data["indicator_id"],
    ).first()
    if existing:
        return jsonify({"error": "Conflict", "message": "This indicator/country pair is already in your favorites"}), 409

    try:
        new_fav = Favorite(
            user_id=g.current_user.id,
            country_id=data["country_id"],
            indicator_id=data["indicator_id"],
        )
        db.session.add(new_fav)
        db.session.commit()
        return jsonify(new_fav.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500


# 3. UPDATE A FAVORITE (PUT) — only your own
@favorite_bp.route("/<int:id>", methods=["PUT"])
@login_required
def update_favorite(id):
    favorite = Favorite.query.filter_by(id=id, user_id=g.current_user.id).first()
    if not favorite:
        return jsonify({"error": "Not Found", "message": "Favorite record not found"}), 404

    data = request.get_json() or {}

    if "country_id" in data:
        target_country = Country.query.get(data["country_id"])
        if not target_country:
            return jsonify({"error": "Not Found", "message": f"Country with ID {data['country_id']} does not exist"}), 404
        favorite.country_id = data["country_id"]

    if "indicator_id" in data:
        target_indicator = Indicator.query.get(data["indicator_id"])
        if not target_indicator:
            return jsonify({"error": "Not Found", "message": f"Indicator with ID {data['indicator_id']} does not exist"}), 404
        favorite.indicator_id = data["indicator_id"]

    existing = Favorite.query.filter(
        Favorite.user_id == g.current_user.id,
        Favorite.country_id == favorite.country_id,
        Favorite.indicator_id == favorite.indicator_id,
        Favorite.id != id,
    ).first()
    if existing:
        return jsonify({"error": "Conflict", "message": "This indicator/country pair is already in your favorites"}), 409

    try:
        db.session.commit()
        return jsonify(favorite.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500


# 4. DELETE A FAVORITE — only your own
@favorite_bp.route("/<int:id>", methods=["DELETE"])
@login_required
def delete_favorite(id):
    favorite = Favorite.query.filter_by(id=id, user_id=g.current_user.id).first()
    if not favorite:
        return jsonify({"error": "Not Found", "message": "Favorite record not found"}), 404

    try:
        db.session.delete(favorite)
        db.session.commit()
        return jsonify({"message": f"Favorite item {id} deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500
