from app.extensions import db

class Country(db.Model):
    __tablename__ = "countries"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    iso_code = db.Column(db.String(3), unique=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "iso_code": self.iso_code
        }
