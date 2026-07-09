FROM chromadb/chroma:latest

# Use shell form of CMD to allow environment variable expansion of $PORT
CMD uvicorn chromadb.app:app --host 0.0.0.0 --port ${PORT:-8000}
