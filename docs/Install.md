# Installation Docs
This project is an AngularJS app which is served by a small Express application.

## Dependencies
- [Node.js](https://nodejs.org/en/)
- [NPM](https://www.npmjs.com/) (normally comes packaged with Node.js)
- [Bower](http://bower.io/) (install with `npm install -g bower`)

## Install
Run the following commands to get the project up and running:

```bash
git clone https://github.com/SRARAD/epa-digital-services-rfi.git
cd epa-digital-services-rfi
npm install
bower install
cp config.json.example config.json
nano config.json // Add appropriate config items
node index.js
```

Then navigate to [http://localhost:8080](http://localhost:8080) to view the application.

## Docker
Docker can also be used to build and run the project. To build the container run:

```bash
docker build -t csra/epa-digital-services-rfi .
```

Then to run the container run:

```bash
docker run -d --name epa-digital-services-rfi -p 8080:8080 csra/epa-digital-services-rfi
```

The app will then be running at http://[docker-ip]:8080.

## Testing
Run the tests with `npm test`.
