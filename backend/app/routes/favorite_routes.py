from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.favorite import Favorite
from app.models.country import Country

# Match the blueprint registration variable from init.py
favorite_bp = Blueprint("favorites", __name__)

# 1. GET ALL FAVORITES
@favorite_bp.route("/", methods=["GET"])
def get_favorites():
    favorites = Favorite.query.all()
    return jsonify([fav.to_dict() for fav in favorites]), 200


# 2. CREATE A FAVORITE (With Foreign Key Validation)
@favorite_bp.route("/", methods=["POST"])
def create_favorite():
    data = request.get_json() or {}
    
    # Validation: Ensure country_id is provided
    if "country_id" not in data:
        return jsonify({"error": "Bad Request", "message": "'country_id' is required"}), 400
        
    # Validation: Check if target country actually exists in database
    target_country = Country.query.get(data["country_id"])
    if not target_country:
        return jsonify({"error": "Not Found", "message": f"Country with ID {data['country_id']} does not exist"}), 404

    try:
        new_fav = Favorite(
            country_id=data["country_id"],
            notes=data.get("notes", "").strip() or None
        )
        db.session.add(new_fav)
        db.session.commit()
        return jsonify(new_fav.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500


# 3. DELETE A FAVORITE
@favorite_bp.route("/<int:id>", methods=["DELETE"])
def delete_favorite(id):
    favorite = Favorite.query.get(id)
    if not favorite:
        return jsonify({"error": "Not Found", "message": "Favorite record not found"}), 404

    try:
        db.session.delete(favorite)
        db.session.commit()
        return jsonify({"message": f"Favorite item {id} deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500
