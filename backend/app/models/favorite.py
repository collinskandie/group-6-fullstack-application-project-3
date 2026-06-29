from app.extensions import db

class Favorite(db.Model):
    __tablename__ = 'favorites'

    id = db.Column(db.Integer, primary_key=True)
    # Example field: tracking a specific metric or note from the WHO API data
    notes = db.Column(db.String(255), nullable=True)

    # Foreign Key linking to the countries table
    country_id = db.Column(db.Integer, db.ForeignKey('countries.id'), nullable=False)

    # Relationship helper
    country = db.relationship('Country', backref=db.backref('favorites', lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "notes": self.notes,
            "country_id": self.country_id
        }
