from flask import Flask
from flask_cors import CORS

from .config import Config
from .extensions import db, migrate, ma


def create_app():

    app = Flask(__name__)

    app.config.from_object(Config)

    CORS(app)

    db.init_app(app)

    with app.app_context():
        from app.models.country import Country
        from app.models.favorite import Favorite
        db.create_all()
        
    migrate.init_app(app, db)
    ma.init_app(app)

    from .routes.country_routes import country_bp
    from .routes.favorite_routes import favorite_bp

    app.register_blueprint(country_bp)

    app.register_blueprint(favorite_bp)

    return app