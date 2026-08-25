FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY agent.py .

ENV PYTHONUNBUFFERED=1

CMD ["python", "agent.py", "--seed", "1dd100e719b93020ea2f17641e04b20bf9b647bc10ccfc498b0266fb3b034bb4", "bot", "--interval", "30"]
