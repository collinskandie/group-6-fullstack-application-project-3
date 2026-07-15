from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.country import Country
from app.utils.decorators import admin_required

country_bp = Blueprint("country", __name__)

# 1. GET ALL COUNTRIES
@country_bp.route("/", methods=["GET"])
def get_countries():
    countries = Country.query.all()
    return jsonify([country.to_dict() for country in countries]), 200

# 2. CREATE A NEW COUNTRY (With Validation & Error Handling)
@country_bp.route("/", methods=["POST"])
@admin_required
def create_country():
    data = request.get_json() or {}
    
    # Validation: Ensure required fields are sent
    if "name" not in data or not data["name"].strip():
        return jsonify({"error": "Bad Request", "message": "Country 'name' is required"}), 400
        
    if "iso_code" not in data or len(data["iso_code"].strip()) != 3:
        return jsonify({"error": "Bad Request", "message": "'iso_code' must be exactly 3 characters"}), 400

    # Validation: Avoid duplicate ISO codes
    normalized_iso = data["iso_code"].strip().upper()
    existing = Country.query.filter_by(iso_code=normalized_iso).first()
    if existing:
        return jsonify({"error": "Conflict", "message": f"ISO code '{normalized_iso}' already exists"}), 409

    try:
        new_country = Country(
            name=data["name"].strip(),
            iso_code=normalized_iso
        )
        db.session.add(new_country)
        db.session.commit()
        
        return jsonify(new_country.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500

# 3. UPDATE A COUNTRY (PUT)
@country_bp.route("/<int:id>", methods=["PUT"])
@admin_required
def update_country(id):
    country = Country.query.get(id)
    if not country:
        return jsonify({"error": "Not Found", "message": "Country not found"}), 404
        
    data = request.get_json() or {}
    
    # Validation: If name is provided, it cannot be empty
    if "name" in data:
        if not data["name"].strip():
            return jsonify({"error": "Bad Request", "message": "Country 'name' cannot be empty"}), 400
        country.name = data["name"].strip()
        
    # Validation: If iso_code is provided, validate length and uniqueness
    if "iso_code" in data:
        normalized_iso = data["iso_code"].strip().upper()
        if len(normalized_iso) != 3:
            return jsonify({"error": "Bad Request", "message": "'iso_code' must be exactly 3 characters"}), 400
            
        existing = Country.query.filter(Country.iso_code == normalized_iso, Country.id != id).first()
        if existing:
            return jsonify({"error": "Conflict", "message": f"ISO code '{normalized_iso}' already exists"}), 409
        country.iso_code = normalized_iso

    try:
        db.session.commit()
        return jsonify(country.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500


# 4. DELETE A COUNTRY (DELETE)
@country_bp.route("/<int:id>", methods=["DELETE"])
@admin_required
def delete_country(id):
    country = Country.query.get(id)
    if not country:
        return jsonify({"error": "Not Found", "message": "Country not found"}), 404

    if country.favorites:
        return jsonify({"error": "Conflict", "message": "Cannot delete a country referenced by existing favorites"}), 409

    if country.data_points:
        return jsonify({"error": "Conflict", "message": "Cannot delete a country referenced by existing data points"}), 409

    try:
        db.session.delete(country)
        db.session.commit()
        return jsonify({"message": f"Country '{country.name}' deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500
