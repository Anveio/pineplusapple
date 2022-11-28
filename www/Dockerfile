# base node image
FROM bitnami/node:18 as base

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl

# Build the production image with minimal footprint
FROM base as build

WORKDIR /myapp
ADD package.json package-lock.json .npmrc ./

## We need dev dependencies to run the build command. We'll prune them later.
RUN npm install --production=false

ADD prisma .
RUN npx prisma generate

ADD . .
RUN npm run build

RUN npm prune --omit=dev

ADD . .

CMD ["npm", "start"]
