from app.extensions import db

class Favorite(db.Model):
    __tablename__ = 'favorites'

    id = db.Column(db.Integer, primary_key=True)
    notes = db.Column(db.String(255), nullable=True)  # Matches your original String size
    
    # Foreign Key linking to the countries table
    country_id = db.Column(db.Integer, db.ForeignKey('countries.id'), nullable=False)

    #Foreign Key linking to the users table to make favorites user-owned
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)

    # Relationship helpers
    country = db.relationship('Country', backref=db.backref('favorites', lazy=True))
    user = db.relationship('User', backref=db.backref('favorites', lazy=True, cascade="all, delete-orphan"))

    def to_dict(self):
        return {
            "id": self.id,
            "notes": self.notes,
            "country_id": self.country_id,
            "user_id": self.user_id  # Added user_id to representation
        }