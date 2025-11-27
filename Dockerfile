FROM python:3.11-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    apt-utils \
    ca-certificates \
    build-essential \
    g++ \
    gcc \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

COPY super-nova-2177/backend/requirements.txt ./requirements.txt
RUN pip install --upgrade pip && pip install -r requirements.txt

# Include the lightweight app.py shim so platforms expecting ``app:app`` can
# still import the FastAPI instance from ``backend.app``.
COPY super-nova-2177/app.py /app/app.py

COPY super-nova-2177/backend /app/backend

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000}"]
