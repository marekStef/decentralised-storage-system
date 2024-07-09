FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 3004

ENV FLASK_APP=run.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=3004  
# 0.0.0.0 makes this server accept connections from any network interface, including external ones. ( 127.0.0.1 would only accept connections originating from within the container)

CMD ["python", "run.py"]
