from datetime import datetime, timezone

from app.extensions import db


class Favorite(db.Model):
    __tablename__ = "favorites"
    __table_args__ = (
        db.UniqueConstraint("user_id", "country_id", "indicator_id", name="uq_favorite_user_country_indicator"),
    )

    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    country_id = db.Column(db.Integer, db.ForeignKey("countries.id"), nullable=False)
    indicator_id = db.Column(db.Integer, db.ForeignKey("indicators.id"), nullable=False)

    user = db.relationship("User", backref=db.backref("favorites", lazy=True))
    country = db.relationship("Country", backref=db.backref("favorites", lazy=True))
    indicator = db.relationship("Indicator", backref=db.backref("favorites", lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "country_id": self.country_id,
            "indicator_id": self.indicator_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
