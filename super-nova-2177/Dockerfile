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

COPY supernova_2177_ui_weighted /app/supernova_2177_ui_weighted
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --upgrade pip && pip install -r /app/backend/requirements.txt

COPY backend /app/backend

ENV PYTHONPATH="${PYTHONPATH}:/app/backend:/app/supernova_2177_ui_weighted"

EXPOSE 8000

CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
