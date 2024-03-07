DELETE_AND_INITIALISE=$1

if [ "$DELETE_AND_INITIALISE" == "--delete_and_initialise" ]; then
  export DELETE_AND_INITIALISE_FLAG="true"
else
  export DELETE_AND_INITIALISE_FLAG="false"
fi

envsubst < docker-compose.template.yml > docker-compose.yml

# docker-compose up --build