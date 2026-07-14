from flask import Blueprint, request, jsonify
from app.extensions import db  # Matches your import[cite: 6]
from app.models.favorite import Favorite  # Matches your import[cite: 6]
from app.models.country import Country  # Matches your import[cite: 6]
from app.routes.auth_routes import token_required  # Import our decorator[cite: 2]

# Keep your original Blueprint definition[cite: 6]
favorite_bp = Blueprint("favorites", __name__)


# 1. GET ALL FAVORITES (Strictly filtered by the logged-in user)[cite: 2]
@favorite_bp.route("/", methods=["GET"])
@token_required
def get_favorites(current_user):
    # Only fetch favorites belonging to this user[cite: 2]
    favorites = Favorite.query.filter_by(user_id=current_user.id).all()
    return jsonify([fav.to_dict() for fav in favorites]), 200


# 2. CREATE A FAVORITE (With ownership & validation)[cite: 2, 6]
@favorite_bp.route("/", methods=["POST"])
@token_required
def create_favorite(current_user):
    data = request.get_json() or {}
    
    # Validation: Ensure country_id is provided[cite: 6]
    if "country_id" not in data:
        return jsonify({"error": "Bad Request", "message": "'country_id' is required"}), 400
        
    # Validation: Check if target country actually exists in database[cite: 6]
    target_country = Country.query.get(data["country_id"])
    if not target_country:
        return jsonify({"error": "Not Found", "message": f"Country with ID {data['country_id']} does not exist"}), 404

    # Extra Validation: Avoid duplicates for this specific user[cite: 2]
    existing = Favorite.query.filter_by(user_id=current_user.id, country_id=data["country_id"]).first()
    if existing:
        return jsonify({"error": "Conflict", "message": "This country is already in your favorites"}), 409

    try:
        new_fav = Favorite(
            country_id=data["country_id"],
            user_id=current_user.id,  # Tied safely to the logged-in user![cite: 2]
            notes=data.get("notes", "").strip() or None
        )
        db.session.add(new_fav)
        db.session.commit()
        return jsonify(new_fav.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500


# 3. UPDATE A FAVORITE (Strict ownership check)[cite: 2]
@favorite_bp.route("/<int:id>", methods=["PUT"])
@token_required
def update_favorite(current_user, id):
    # Fetch favorite only if it belongs to current_user[cite: 2]
    favorite = Favorite.query.filter_by(id=id, user_id=current_user.id).first()
    if not favorite:
        return jsonify({"error": "Not Found", "message": "Favorite record not found or access denied"}), 404

    data = request.get_json() or {}

    if "notes" in data:
        favorite.notes = data["notes"].strip() or None

    if "country_id" in data:
        target_country = Country.query.get(data["country_id"])
        if not target_country:
            return jsonify({"error": "Not Found", "message": f"Country with ID {data['country_id']} does not exist"}), 404
        favorite.country_id = data["country_id"]

    try:
        db.session.commit()
        return jsonify(favorite.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500


# 4. DELETE A FAVORITE (Strict ownership check)[cite: 2]
@favorite_bp.route("/<int:id>", methods=["DELETE"])
@token_required
def delete_favorite(current_user, id):
    # Fetch favorite only if it belongs to current_user[cite: 2]
    favorite = Favorite.query.filter_by(id=id, user_id=current_user.id).first()
    if not favorite:
        return jsonify({"error": "Not Found", "message": "Favorite record not found or access denied"}), 404

    try:
        db.session.delete(favorite)
        db.session.commit()
        return jsonify({"message": f"Favorite item {id} deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500