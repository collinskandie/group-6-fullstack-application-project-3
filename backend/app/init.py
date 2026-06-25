from flask import Flask
from flask_cors import CORS

from .config import Config
from .extensions import db, migrate, ma


def create_app():

    app = Flask(__name__)

    app.config.from_object(Config)

    CORS(app)

    db.init_app(app)
    migrate.init_app(app, db)
    ma.init_app(app)

    from .routes.country_routes import country_bp
    from .routes.favorite_routes import favorite_bp

    app.register_blueprint(country_bp)

    app.register_blueprint(favorite_bp)

    return app