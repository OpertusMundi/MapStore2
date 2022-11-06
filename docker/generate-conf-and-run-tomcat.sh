#!/bin/bash
set -u -e -o pipefail
#set -x

geostore_datasource_url=${GEOSTORE_DATASOURCE_URL}
geostore_datasource_username=${GEOSTORE_DATASOURCE_USERNAME}
geostore_datasource_password=$(cat ${GEOSTORE_DATASOURCE_PASSWORD_FILE} | tr -d '\n')

keycloak_oidc_json=$(cat ${KEYCLOAK_OIDC_JSON_FILE} | jq . -c -r)
mapstore_base_url=${MAPSTORE_BASE_URL%/}


# Generate configuration
# See also: 
#   https://docs.mapstore.geosolutionsgroup.com/en/latest/developer-guide/database-setup/
#   https://docs.mapstore.geosolutionsgroup.com/en/latest/developer-guide/integrations/users/openId/#configure-mapstore-back-end-for-keycloak-openid
cat 1>${CATALINA_BASE}/conf/geostore-ovr.properties <<EOD
geostoreDataSource.driverClassName=org.postgresql.Driver
geostoreVendorAdapter.databasePlatform=org.hibernate.dialect.PostgreSQLDialect
geostoreDataSource.url=${geostore_datasource_url}
geostoreDataSource.username=${geostore_datasource_username}
geostoreDataSource.password=${geostore_datasource_password}
geostoreEntityManagerFactory.jpaPropertyMap[hibernate.default_schema]=geostore
geostoreEntityManagerFactory.jpaPropertyMap[hibernate.hbm2ddl.auto]=validate
geostoreVendorAdapter.generateDdl=true
geostoreVendorAdapter.showSql=false

keycloakOAuth2Config.enabled=true
keycloakOAuth2Config.jsonConfig=${keycloak_oidc_json}
keycloakOAuth2Config.redirectUri=${mapstore_base_url}/rest/geostore/openid/keycloak/callback
keycloakOAuth2Config.internalRedirectUri=${mapstore_base_url}
keycloakOAuth2Config.autoCreateUser=true
keycloakOAuth2Config.roleMappings=admin:ADMIN,user:USER
keycloakOAuth2Config.authenticatedDefaultRole=USER
EOD

# Run Tomcat ...
exec /usr/local/tomcat/bin/catalina.sh run
