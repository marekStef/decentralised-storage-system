FROM python:3.11-slim

WORKDIR /usr/src/app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create directory for storage of the source code with proper write access
RUN mkdir -p ./source_codes && chown -R nobody:nogroup ./source_codes

EXPOSE 3004

ENV PROJECT_ROOT=/usr/src/app

ENV FLASK_APP=run.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=3004  
# 0.0.0.0 makes this server accept connections from any network interface, including external ones. ( 127.0.0.1 would only accept connections originating from within the container)

USER nobody

CMD ["python", "run.py"]
