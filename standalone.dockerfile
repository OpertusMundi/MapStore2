# vim: set syntax=dockerfile:

FROM node:12.13.1-buster AS npm-build

ENV NPM_CONFIG_PROGRESS="false" \
    NPM_CONFIG_SPIN="false" \
    NODE_OPTIONS="--max-old-space-size=2560"

WORKDIR /app

COPY ./package.json /app/
RUN npm install

COPY ./.git /app/.git
COPY ./web/ /app/web/
COPY ./build/ /app/build/
RUN npm run compile


FROM maven:3.6.3-openjdk-11 AS maven-build

WORKDIR /app

COPY --from=npm-build /app/web ./web
COPY ./pom.xml ./pom.xml
COPY ./product ./product
COPY ./java ./java
COPY ./release ./release

ARG VERSION=""
RUN mvn package -Prelease -B -Dmapstore2.version=${VERSION}


FROM tomcat:9-jdk11-openjdk

RUN apt-get update \
    && apt-get install --yes postgresql-client \
    && apt-get clean \
    && apt-get autoclean \
    && apt-get autoremove -y \
    && rm -rf /var/cache/apt/* /var/lib/apt/lists/* /usr/share/man/* /usr/share/doc/*

ENV CATALINA_BASE "$CATALINA_HOME"

#ENV INITIAL_MEMORY="512m"
#ENV MAXIMUM_MEMORY="512m"
#ENV JAVA_OPTS="${JAVA_OPTS} -Xms${INITIAL_MEMORY} -Xmx${MAXIMUM_MEMORY}"


ENV TERM=xterm \
    DATA_DIR="${CATALINA_BASE}/datadir" \
    LOGS_DIR="${CATALINA_BASE}/logs"

ENV JAVA_OPTS="${JAVA_OPTS} -Dgeostore-ovr=file://${CATALINA_BASE}/conf/geostore-ovr.properties -Ddatadir.location=${DATA_DIR}"

COPY --from=maven-build /app/release/bin-war/target/mapstore.war ${CATALINA_BASE}/webapps/mapstore.war
COPY ./docker/* ${CATALINA_BASE}/docker/

RUN mkdir -p ${DATA_DIR}
RUN cp ${CATALINA_BASE}/docker/wait-for-postgres.sh /usr/bin/wait-for-postgres

WORKDIR ${CATALINA_BASE}
VOLUME [ "${DATA_DIR}", "${LOGS_DIR}" ]
EXPOSE 8080
