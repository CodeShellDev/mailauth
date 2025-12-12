FROM node:latest

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=80

COPY . .

RUN npm install

EXPOSE 80

CMD ["npm", "start", "-s"]
