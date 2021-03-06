from fastapi import FastAPI
from routes.auth import auth_route
from routes.form import form_route
from routes.data import data_route
from routes.device import device_route

app = FastAPI(
    root_path="/api",
    title="API Documentation",
    description="Approval Dashboard API",
    version="1.0.0",
    contact={
        "name": "Akvo",
        "url": "https://akvo.org",
        "email": "tech.consultancy@akvo.org",
    },
    license_info={
        "name": "AGPL3",
        "url": "https://www.gnu.org/licenses/agpl-3.0.en.html",
    },
)

app.include_router(auth_route)
app.include_router(form_route)
app.include_router(data_route)
app.include_router(device_route)


@app.get("/", tags=["Dev"])
def read_main():
    return "OK"


@app.get("/health-check", tags=["Dev"])
def health_check():
    return "OK"
