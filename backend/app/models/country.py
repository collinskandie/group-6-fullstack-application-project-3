from app.extensions import db


class Country(db.Model):

    __tablename__ = "countries"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100), nullable=False)

    iso_code = db.Column(db.String(3), unique=True)