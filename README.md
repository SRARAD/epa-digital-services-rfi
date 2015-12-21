#SRA EPA Digital Services RFI

###URL: http://epa-digital-services-rfi-dev.srarad.com/

###Installation Instructions: [Install Instructions](#Install Instructions)

SRA International, Inc., a CSRA Company, is a large organization with  the unique ability to stay agile by operating with an integrator mindset where the best idea wins.  Our teams are lean and efficient, but our size means we have  deep reach-back to Communities of Practice that house experts in user experience design, agile software development, cyber security, cloud technologies, and organizational change management, among others. Our evolving culture is an incubator for self-organizing, self-managing teams to come together quickly to create amazing things, as was the case with our team for this effort.

We empowered a technical and agile expert, Justin Kent, to be our Product Manager. His responsibility was to drive priorities and ensure quality. With just two experts from SRA's Rapid Application Development team and User Experience Practice, our team built a scalable lightweight application that displays data from three different environmental data sets in under a week. 

But it wasn't enough just to build a great product; we needed to ensure it was both useful and usable. We wanted to build something that met a need for our users, made use of EPA data and resources without being redundant, and was immediately usable with little supporting documentation or assistance. Our user-centered design and development approaches followed the U.S. Digital Services Playbook by putting user needs first, focusing on iterative delivery, empowering a single leader and an all-star team, and choosing technologies that are modern and flexible. Read more about our <a href="user_centered_design_process/">User Centered Design approach</a>.

Once we defined the problem and had a vision for our product, we vetted the idea with our user group and began to build our backlog. Initially, the backlog represented only the most basic functionality. Our goal was to get a working prototype in front of users as soon as possible. We held daily interviews with groups and individual users to inform expanding and refining features and generating new backlog items. We used GitHub Issues and Labels along with Waffle.io to create a Kanban board that reflected our process. The columns included Backlog, In Design, Ready for Development, In Development, Ready for Test, In Test, Ready for Deployment, and Closed to create a pull-system where team members could pull top priority work at any time. We created a Minimum Viable Product (MVP) milestone to timebox our work.

We established our development environment to accommodate releasing early, iteratively, and often. We built our application using Amazon Web Services (AWS) as the Infrastructure as a Service (Iaas) platform. We set up a development server on which we and our users could test our work and a production server to which we would release major milestones. We used an entirely open-source tool stack to build our MIT-licensed product. We used Semantic UI as a design and theme framework for frontend development, NodeJS and AngularJS for our web framework, Mocha, Karma, and PhantomJS for our testing framework, and Jenkins for continuous integration.

To support efficient delivery, we built in quality and security from the start. Our Definition of Done included unit test coverage, responsive design standards, accessibility testing and required that each component followed the design style guide. The Product Manager and User Experience Designer were always available for final quality validation and acceptance. Using AWS ensured that the product will be secure, available, scalable, and reliable. We used Docker containers to allow for stand-alone configuration of the prototype.

Our work was always done in the open. We kept phone lines and WebEx open to support constant co-design and co-development among team members and users that were not always co-located. We scribbled on white boards, texted, shared screens and messaged each other constantly. And where there was an opportunity to converse over document, we always chose the former. This team was committed to the leanest, fastest delivery possible.

The SRA Team is proud to present XXXXX.

# Install Instructions
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
Docker can also be used to build and run the project. Then to run the container execute:

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
