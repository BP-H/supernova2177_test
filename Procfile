release: cd super-nova-2177/backend && pip install -r requirements.txt
web: cd super-nova-2177 && uvicorn backend.app:app --host 0.0.0.0 --port ${PORT:-8000}
