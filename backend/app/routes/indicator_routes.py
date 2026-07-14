from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.indicator import Indicator
from app.utils.decorators import admin_required

indicator_bp = Blueprint("indicator", __name__)

# 1. GET ALL INDICATORS
@indicator_bp.route("/", methods=["GET"])
def get_indicators():
    indicators = Indicator.query.all()
    return jsonify([indicator.to_dict() for indicator in indicators]), 200

# 2. CREATE A NEW INDICATOR (With Validation & Error Handling)
@indicator_bp.route("/", methods=["POST"])
@admin_required
def create_indicator():
    data = request.get_json() or {}

    if "code" not in data or not data["code"].strip():
        return jsonify({"error": "Bad Request", "message": "Indicator 'code' is required"}), 400

    if "name" not in data or not data["name"].strip():
        return jsonify({"error": "Bad Request", "message": "Indicator 'name' is required"}), 400

    normalized_code = data["code"].strip().upper()
    existing = Indicator.query.filter_by(code=normalized_code).first()
    if existing:
        return jsonify({"error": "Conflict", "message": f"Indicator code '{normalized_code}' already exists"}), 409

    try:
        new_indicator = Indicator(
            code=normalized_code,
            name=data["name"].strip(),
            unit=(data.get("unit") or "").strip() or None,
            description=(data.get("description") or "").strip() or None,
        )
        db.session.add(new_indicator)
        db.session.commit()

        return jsonify(new_indicator.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500

# 3. UPDATE AN INDICATOR (PUT)
@indicator_bp.route("/<int:id>", methods=["PUT"])
@admin_required
def update_indicator(id):
    indicator = Indicator.query.get(id)
    if not indicator:
        return jsonify({"error": "Not Found", "message": "Indicator not found"}), 404

    data = request.get_json() or {}

    if "code" in data:
        normalized_code = data["code"].strip().upper()
        if not normalized_code:
            return jsonify({"error": "Bad Request", "message": "Indicator 'code' cannot be empty"}), 400

        existing = Indicator.query.filter(Indicator.code == normalized_code, Indicator.id != id).first()
        if existing:
            return jsonify({"error": "Conflict", "message": f"Indicator code '{normalized_code}' already exists"}), 409
        indicator.code = normalized_code

    if "name" in data:
        if not data["name"].strip():
            return jsonify({"error": "Bad Request", "message": "Indicator 'name' cannot be empty"}), 400
        indicator.name = data["name"].strip()

    if "unit" in data:
        indicator.unit = (data["unit"] or "").strip() or None

    if "description" in data:
        indicator.description = (data["description"] or "").strip() or None

    try:
        db.session.commit()
        return jsonify(indicator.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500


# 4. DELETE AN INDICATOR (DELETE)
@indicator_bp.route("/<int:id>", methods=["DELETE"])
@admin_required
def delete_indicator(id):
    indicator = Indicator.query.get(id)
    if not indicator:
        return jsonify({"error": "Not Found", "message": "Indicator not found"}), 404

    if indicator.data_points:
        return jsonify({"error": "Conflict", "message": "Cannot delete an indicator referenced by existing data points"}), 409

    try:
        db.session.delete(indicator)
        db.session.commit()
        return jsonify({"message": f"Indicator '{indicator.name}' deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500
