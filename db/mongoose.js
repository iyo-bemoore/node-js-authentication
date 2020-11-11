const mongoose = require('mongoose');
require('dotenv').config();

const URI = 
`mongodb+srv://${DB_USER_NAME}:${DB_USER_PASSWORD}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`;

mongoose.connect(URI,{useNewUrlParser: true });
mongoose.connection.on('connected',()=>{
    console.log('Connected to MongoDb')
});
mongoose.connection.on('error',(e)=>{
    console.error('Error connecting to MongoDb', e.message);
})