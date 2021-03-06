# SSSF-Project

SSSF-Project is a minimalistic standalone chat application with channel and image support.

![dfpvnf](https://user-images.githubusercontent.com/12167913/81092284-0df72600-8f09-11ea-943e-9c27d47cca56.png)

## Description

As this is a school project, a loosely predefined set of tools were used. The author was familiar with none on them and had zero experience in web-development. Therefore, proceed with caution.

### Features

- Real time messaging powered by [socket.io](https://socket.io/)
- A persistent [MongoDB](https://www.mongodb.com/) database with overly complicated [Mongoose](https://mongoosejs.com/) connections and schemas
- an overdone [GraphQL](https://graphql.org/) API and schemas for the front-end connectivity to the database, can also be used separately as an API
- Basic [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) and [Helmet](https://helmetjs.github.io/) security implementations
- Adaptive and responsive, yet simple [Bootstrap](https://getbootstrap.com/) front-end

### Missing features and current set of problems

- There are no [service workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- Due to the missing service workers, there are no desktop-notifications nor other form of push-notifications.
- Due to the missing service workers and push-notifications, PWA is only theoretically implemented, as in without a service worker.
- There currently is no way to change username / register / authenticate

## Requirements
- [MongoDB](https://www.mongodb.com/download-center/community) v4.2.6 or higher (for the database)
- [Node.js](https://nodejs.org/en/download/) v12.16 or higher (for running the project)
- NPM v6.14 or higher (for the installation of dependencies) (should be included with Node.js)
- NPM-packages listed in the [package.json](package.json) (instructions below)

## Installation

Clone this repository and install the requirements listed in [package.json](package.json).
The requirements can be installed by running the command below in the project directory.

```bash
npm install
```

Also, create a file `.env` in the project directory with a MongoDB address and project database, you can also make and include an user if you wish to do so. Example `.env` below:

```bash
DB_URL=mongodb://localhost:27017/sssf
```

## Usage

Run the server with Node. Use the command below in the project folder:

```bash
node server.js
```

Verify that there were no errors in the console. A working server should print something along these lines:

```bash
$ node server.js
< DB_URL from .env >
listening on port 3000
Database connected successfully.
```
If the system prints something else, fix accordingly. The front-end can be accessed at [localhost:3000](http://localhost:3000) in a generic environment. GraphQL API can be accessed at [localhost:3000/graphql](http://localhost:3000/graphql) and it contains its own documentation there.

## License

[GPL-3.0](https://choosealicense.com/licenses/gpl-3.0/)
