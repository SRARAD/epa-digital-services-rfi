# Installation Docs
This project is an AngularJS app which is served by a small Express application.

## Dependencies
- Node.js
- NPM

## Install
Run the following commands to get the project up and running:

```bash
git clone https://github.com/SRARAD/epa-digital-services-rfi.git
cd epa-digital-services-rfi
npm install
node index.js
```

Then navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## Docker
Docker can also be used to build and run the project. To build the container run:

```bash
docker build -t csra/epa-digital-services-rfi .
```

Then to run the container run:

```bash
docker run -d --name epa-digital-services-rfi -p 3000:3000 csra/epa-digital-services-rfi
```

The app will then be running at http://[docker-ip]:3000.
