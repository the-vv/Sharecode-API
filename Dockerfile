FROM node:16-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm i
COPY . .
RUN npm run build
ENV NODE_ENV=production
CMD [ "npm", "start" ]
