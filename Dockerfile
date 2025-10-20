FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
# RUN npm install --omit=dev
RUN npm install

COPY . .

RUN npx prisma migrate dev

# RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
