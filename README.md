# Load data into the DB
You can load data into the produits and enseignes collections from data file.
These files must be in the `data` folder.

To load the data, you need two files to be placed in the `data` folder:
 - A fiile for the enseignes collection. Let's say `enseignes.json`
 - A file for the produits collection. Let say `produits.json`

 Then you need to set the environment variables :
  - `LOAD_PRODUCT` to `TRUE` to enable the load endpoint
  - `PRODUCTS_FILE_NAME` to the file containing the data for the collection produits. In our example it will be : `produits.json`
  - `ENSEIGNES_FILE_NAME` to the file containing the data for the collection enseignes. In our example it will be : `enseignes.json`

  You can then install the dependencies and start application and call the endpoint `/load` using a http PUT verb. It delete all the data and load them from the specified files.

You can see the file `env.example` for expected variables.

# Authorizarion
For avery call to the API, you need to set an HTTP header named `authorization` with an API as value