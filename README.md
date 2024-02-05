## What is Wormhole?

Wormhole is a quick and easy way to share files between devices. It can be used via the Web Application or the Desktop Widget, available for Windows, macOS, and Linux.
The user can upload 1GB of files per day, and the files are stored for 24 hours. The user can also share the files with a QR code or a link.

## Requirements

- Node.js
- npm or any other node package manager
- Docker
- Docker Compose
- Github

## Setup

Clone the repo and install the dependencies.

```bash
git clone https://github.com/gabscrobson/wormhole-backend.git
cd wormhole-backend
```

Start the docker container.

```bash
docker-compose up -d
```

Build and start the server.

```bash
npm run build
npm run start
```
