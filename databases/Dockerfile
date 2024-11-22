FROM alpine:latest

RUN apk update && apk add sqlite

RUN mkdir -p /app/databases

WORKDIR /app/databases

RUN ls -la /app/databases

EXPOSE 5005

# Initialize the database and keep the container running
CMD ["sh", "-c", "sqlite3 /app/databases/weather_database.db 'CREATE TABLE IF NOT EXISTS weather_data(id INTEGER PRIMARY KEY, data TEXT);' && tail -f /dev/null"]
