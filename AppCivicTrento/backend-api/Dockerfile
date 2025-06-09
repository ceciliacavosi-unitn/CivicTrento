FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install --save-dev jest-html-reporter
RUN npm install --save-dev jest-json-reporter

COPY . .

CMD ["node", "server.js"]