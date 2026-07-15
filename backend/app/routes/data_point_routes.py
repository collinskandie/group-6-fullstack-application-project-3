from flask import Blueprint, request, jsonify
from app.extensions import db
from app.utils.decorators import admin_required
from app.models.data_point import DataPoint
from app.models.country import Country
from app.models.indicator import Indicator

data_point_bp = Blueprint("data_point", __name__)

# 1. GET DATA POINTS (optionally filtered by country_code/indicator_code)
@data_point_bp.route("/", methods=["GET"])
def get_data_points():
    query = DataPoint.query

    country_code = request.args.get("country_code")
    if country_code:
        query = query.join(Country).filter(Country.iso_code == country_code.upper())

    indicator_code = request.args.get("indicator_code")
    if indicator_code:
        query = query.join(Indicator).filter(Indicator.code == indicator_code.upper())

    data_points = query.order_by(DataPoint.year).all()
    return jsonify([dp.to_dict() for dp in data_points]), 200

# 2. CREATE A DATA POINT (With Validation & Error Handling)
@data_point_bp.route("/", methods=["POST"])
@admin_required
def create_data_point():
    data = request.get_json() or {}

    for field in ("country_id", "indicator_id", "year", "value"):
        if field not in data or data[field] in (None, ""):
            return jsonify({"error": "Bad Request", "message": f"'{field}' is required"}), 400

    country = Country.query.get(data["country_id"])
    if not country:
        return jsonify({"error": "Not Found", "message": f"Country with ID {data['country_id']} does not exist"}), 404

    indicator = Indicator.query.get(data["indicator_id"])
    if not indicator:
        return jsonify({"error": "Not Found", "message": f"Indicator with ID {data['indicator_id']} does not exist"}), 404

    try:
        year = int(data["year"])
        value = float(data["value"])
    except (TypeError, ValueError):
        return jsonify({"error": "Bad Request", "message": "'year' must be an integer and 'value' must be numeric"}), 400

    existing = DataPoint.query.filter_by(country_id=country.id, indicator_id=indicator.id, year=year).first()
    if existing:
        return jsonify({"error": "Conflict", "message": f"A data point already exists for {country.iso_code}/{indicator.code}/{year}"}), 409

    try:
        new_data_point = DataPoint(country_id=country.id, indicator_id=indicator.id, year=year, value=value)
        db.session.add(new_data_point)
        db.session.commit()

        return jsonify(new_data_point.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500

# 3. UPDATE A DATA POINT (PUT)
@data_point_bp.route("/<int:id>", methods=["PUT"])
@admin_required
def update_data_point(id):
    data_point = DataPoint.query.get(id)
    if not data_point:
        return jsonify({"error": "Not Found", "message": "Data point not found"}), 404

    data = request.get_json() or {}

    country_id = data.get("country_id", data_point.country_id)
    indicator_id = data.get("indicator_id", data_point.indicator_id)

    if "country_id" in data:
        country = Country.query.get(data["country_id"])
        if not country:
            return jsonify({"error": "Not Found", "message": f"Country with ID {data['country_id']} does not exist"}), 404

    if "indicator_id" in data:
        indicator = Indicator.query.get(data["indicator_id"])
        if not indicator:
            return jsonify({"error": "Not Found", "message": f"Indicator with ID {data['indicator_id']} does not exist"}), 404

    if "year" in data:
        try:
            data_point.year = int(data["year"])
        except (TypeError, ValueError):
            return jsonify({"error": "Bad Request", "message": "'year' must be an integer"}), 400

    if "value" in data:
        try:
            data_point.value = float(data["value"])
        except (TypeError, ValueError):
            return jsonify({"error": "Bad Request", "message": "'value' must be numeric"}), 400

    data_point.country_id = country_id
    data_point.indicator_id = indicator_id

    existing = DataPoint.query.filter(
        DataPoint.country_id == data_point.country_id,
        DataPoint.indicator_id == data_point.indicator_id,
        DataPoint.year == data_point.year,
        DataPoint.id != id,
    ).first()
    if existing:
        return jsonify({"error": "Conflict", "message": "A data point already exists for this country/indicator/year"}), 409

    try:
        db.session.commit()
        return jsonify(data_point.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500


# 4. DELETE A DATA POINT (DELETE)
@data_point_bp.route("/<int:id>", methods=["DELETE"])
@admin_required
def delete_data_point(id):
    data_point = DataPoint.query.get(id)
    if not data_point:
        return jsonify({"error": "Not Found", "message": "Data point not found"}), 404

    try:
        db.session.delete(data_point)
        db.session.commit()
        return jsonify({"message": f"Data point {id} deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500
