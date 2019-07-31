# telemetry-data
 coding exercise

# Installing and Running the Coding Exercise

## Step 1: Prerequisites

* [Open MCT Integration Tutorials
](https://github.com/nasa/openmct-tutorial.git)
    ```
    git clone https://github.com/nasa/openmct-tutorial.git
    cd openmct-tutorial
    npm install
    npm start
    ```
* A note on Cross-origin Resource Sharing (CORS)
By default your browser will not allow requests to a server hosted on another port unless the server explicitly allows it. In order to enable cross-origin requests from the Open MCT tutorial server, you will need to add the following to ​example-server/server.js
    ```
    app.use(function(req, res, next) { 
        res.header("Access-Control-Allow-Origin", "http://localhost:8081");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); 
        next();
    });
    ```


## Step 2
```
git clone https://github.com/
cd telemetry-data
npm install
npm start
```