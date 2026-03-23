# ── MLOps Note ────────────────────────────────────────────────────────────────
# We use python:3.11-slim (not full python:3.11) to keep the base image small.
# The model file is NOT baked in here — it's mounted via docker-compose volume.
# This means you can swap models without rebuilding the image.
# ──────────────────────────────────────────────────────────────────────────────

FROM python:3.11-slim

WORKDIR /app

# System libs required by Pillow / OpenCV
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first → Docker caches this layer separately
# Changing server.py won't re-run pip install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY server.py model_helper.py ./

EXPOSE 8000

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
