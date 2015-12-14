FROM node

WORKDIR /usr/src/app

RUN npm install -g bower

COPY package.json /usr/src/app/
RUN npm install
COPY . /usr/src/app

EXPOSE 3000

CMD node index.js
