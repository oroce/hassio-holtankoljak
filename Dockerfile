ARG BUILD_FROM

FROM $BUILD_FROM



ENV LANG C.UTF-8
ENV NODE_ENV production

RUN apk add --no-cache jq nodejs nodejs-npm

ADD package.json /

RUN ["npm", "install", "--unsafe-perm", "-g", "pm2"]
RUN ["npm", "install", "--unsafe-perm"]

# Copy data for add-on
COPY index.js /
COPY cli.js /
COPY run.sh /
RUN ["chmod", "a+x", "./run.sh"]
CMD ["/run.sh"]