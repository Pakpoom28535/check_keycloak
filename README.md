# check_keycloak
docker stop <container id>
docker rm <container id>

docker build -t keycloak_service .
docker run -d -p 3000:3000 --name keycloak_service keycloak_service
