# Usa l'immagine ufficiale Node.js con npm
FROM node:18

# Imposta la cartella di lavoro
WORKDIR /app

# Copia solo package.json e package-lock.json per ottimizzare cache Docker
COPY package*.json ./

# Installa le dipendenze (incluso npm!)
RUN npm install

# Copia il resto dei file (incluso main.js, mongodb.js, .env, ecc.)
COPY . .

# Avvia main.js (Express backend)
CMD ["npm", "start"]
