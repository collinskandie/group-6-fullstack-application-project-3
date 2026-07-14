import os

from app import create_app
from app.extensions import db
from app.models.country import Country
from app.models.data_point import DataPoint
from app.models.indicator import Indicator
from app.models.user import User

COUNTRIES = [
    ("Kenya", "KEN"),
    ("United States of America", "USA"),
    ("Canada", "CAN"),
    ("United Kingdom", "GBR"),
    ("India", "IND"),
    ("Australia", "AUS"),
]

INDICATORS = [
    ("WHOSIS_000001", "Life Expectancy at Birth", "years", None),
    ("WHOSIS_000002", "Healthy Life Expectancy (HALE) at Birth", "years", None),
    ("MDG_0000000001", "Under-5 Mortality Rate", "per 1,000 live births", None),
    ("MDG_0000000025", "Infant Mortality Rate", "per 1,000 live births", None),
    ("WHS6_102", "Universal Health Coverage Index", "score", None),
    ("NCDMORT3070", "Premature NCD Mortality (30-70 yrs)", "%", None),
    ("NCD_BMI_30C", "Obesity Prevalence", "%", None),
    ("SA_0000001688", "Total Alcohol Consumption", "litres per capita", None),
    ("MDG_0000000003", "Maternal Mortality Ratio", "per 100,000 live births", None),
    ("SDGPM25", "PM2.5 Air Pollution", "µg/m³", None),
    ("WHOSIS_000015", "Suicide Mortality Rate", "per 100,000", None),
]

# Hand-written illustrative demo data (2016-2021) — not fetched from WHO or
# any external source. Covers 3 indicators so Dashboard/Trends have real
# multi-year series out of the box; admin can add more via the UI.
DATA_YEARS = [2016, 2017, 2018, 2019, 2020, 2021]

DATA_POINTS_SERIES = {
    "WHOSIS_000001": {  # Life Expectancy at Birth (years)
        "KEN": [65.0, 65.5, 66.0, 66.3, 66.6, 66.7],
        "USA": [78.7, 78.6, 78.7, 78.8, 77.0, 76.4],
        "CAN": [82.0, 82.1, 82.2, 82.3, 81.7, 81.6],
        "GBR": [81.2, 81.3, 81.4, 81.3, 80.9, 80.7],
        "IND": [68.6, 69.0, 69.2, 69.4, 67.2, 67.0],
        "AUS": [82.5, 82.7, 82.9, 83.0, 83.2, 83.3],
    },
    "MDG_0000000001": {  # Under-5 Mortality Rate (per 1,000 live births)
        "KEN": [47.0, 44.5, 42.0, 40.0, 38.5, 37.0],
        "USA": [6.9, 6.8, 6.7, 6.5, 6.3, 6.1],
        "CAN": [5.2, 5.1, 5.0, 4.9, 4.8, 4.7],
        "GBR": [4.4, 4.3, 4.2, 4.1, 4.0, 3.9],
        "IND": [43.0, 40.0, 37.5, 35.0, 33.0, 31.0],
        "AUS": [3.9, 3.8, 3.7, 3.6, 3.5, 3.4],
    },
    "MDG_0000000003": {  # Maternal Mortality Ratio (per 100,000 live births)
        "KEN": [510, 500, 490, 480, 470, 460],
        "USA": [17, 18, 19, 20, 21, 22],
        "CAN": [10, 10, 9, 9, 8, 8],
        "GBR": [7, 7, 7, 6, 6, 6],
        "IND": [130, 122, 113, 103, 97, 93],
        "AUS": [6, 6, 5, 5, 5, 5],
    },
}


def seed():
    app = create_app()
    with app.app_context():
        admin_email = os.getenv("ADMIN_EMAIL", "admin@ghdashboard.local")
        admin_password = os.getenv("ADMIN_PASSWORD", "admin123")

        if not User.query.filter_by(email=admin_email).first():
            admin = User(email=admin_email, role="admin")
            admin.set_password(admin_password)
            db.session.add(admin)
            print(f"Created admin user '{admin_email}' — change the default password before deploying.")
        else:
            print(f"Admin user '{admin_email}' already exists, skipping.")

        for name, iso_code in COUNTRIES:
            if not Country.query.filter_by(iso_code=iso_code).first():
                db.session.add(Country(name=name, iso_code=iso_code))
                print(f"Seeded country {name} ({iso_code})")

        for code, name, unit, description in INDICATORS:
            if not Indicator.query.filter_by(code=code).first():
                db.session.add(Indicator(code=code, name=name, unit=unit, description=description))
                print(f"Seeded indicator {code} ({name})")

        db.session.commit()

        for indicator_code, countries in DATA_POINTS_SERIES.items():
            indicator = Indicator.query.filter_by(code=indicator_code).first()
            if not indicator:
                continue

            for iso_code, values in countries.items():
                country = Country.query.filter_by(iso_code=iso_code).first()
                if not country:
                    continue

                for year, value in zip(DATA_YEARS, values):
                    exists = DataPoint.query.filter_by(
                        country_id=country.id, indicator_id=indicator.id, year=year
                    ).first()
                    if not exists:
                        db.session.add(DataPoint(country_id=country.id, indicator_id=indicator.id, year=year, value=value))

        db.session.commit()
        print("Seeding complete.")


if __name__ == "__main__":
    seed()
