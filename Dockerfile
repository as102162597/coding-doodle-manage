FROM node:18.13.0

WORKDIR /usr/src/app
COPY index.html /usr/src/app
COPY package-lock.json /usr/src/app
COPY package.json /usr/src/app
COPY public /usr/src/app/public
COPY src /usr/src/app/src
COPY vite.config.js /usr/src/app

RUN npm install

EXPOSE 5173

CMD [ "npm", "run", "dev", "--", "--host" ]
