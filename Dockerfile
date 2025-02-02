FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Create uploads directory
RUN mkdir -p /app/uploads && \
    mkdir -p /app/uploads/news && \
    mkdir -p /app/uploads/events && \
    mkdir -p /app/uploads/gallery

EXPOSE 5000

CMD ["npm", "start"]
