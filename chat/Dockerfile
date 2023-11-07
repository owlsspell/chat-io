FROM node:18 as dev
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
EXPOSE 3002
CMD ["npm","run","dev"]