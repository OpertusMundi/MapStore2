# vim: set syntax=dockerfile:

FROM node:12.13.1-buster AS npm-build

ENV NPM_CONFIG_PROGRESS="false" \
    NPM_CONFIG_SPIN="false" \
    NODE_OPTIONS="--max-old-space-size=3072"

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

ARG VERSION
RUN mvn package -DskipTests -Dmapstore2.version=${VERSION} -Prelease -B


FROM tomcat:9-jdk11-openjdk

RUN apt-get update \
  && apt-get install --yes postgresql-client jq \
  && apt-get clean && apt-get autoclean && apt-get autoremove -y \
  && rm -rf /var/cache/apt/* /var/lib/apt/lists/* /usr/share/man/* /usr/share/doc/*

ENV CATALINA_BASE "$CATALINA_HOME"

ENV TERM=xterm \
  DATA_DIR="${CATALINA_BASE}/datadir" \
  LOGS_DIR="${CATALINA_BASE}/logs"

VOLUME [ "${DATA_DIR}", "${LOGS_DIR}" ]

ENV JAVA_OPTS="${JAVA_OPTS} -Dgeostore-ovr=file://${CATALINA_BASE}/conf/geostore-ovr.properties -Ddatadir.location=${DATA_DIR}"

COPY --from=maven-build /app/release/bin-war/target/mapstore.war ${CATALINA_BASE}/webapps/mapstore.war

RUN mkdir -p ${DATA_DIR}

# https://github.com/docker-library/tomcat/issues/68#issuecomment-311745802
RUN addgroup --gid 1000 tomcat \
  && adduser --no-create-home --disabled-login --ingroup tomcat --home ${CATALINA_BASE} --gecos "" --uid 1000 tomcat

RUN chown tomcat:tomcat -R ${CATALINA_BASE}

COPY --chown=1000:1000 ./docker/generate-conf-and-run-tomcat.sh /docker-command.sh
RUN chmod ug+x /docker-command.sh

USER tomcat
WORKDIR ${CATALINA_BASE}

ENV MAPSTORE_BASE_URL="http://localhost:8080/mapstore" \
  GEOSTORE_DATASOURCE_URL="jdbc:postgresql://localhost:5432/mapstore" \
  GEOSTORE_DATASOURCE_USERNAME="mapstore" \
  GEOSTORE_DATASOURCE_PASSWORD_FILE="/secrets/datasource-password" \
  KEYCLOAK_OIDC_JSON_FILE="/secrets/keycloak-oidc.json"

CMD [ "/docker-command.sh" ]

EXPOSE 8080
