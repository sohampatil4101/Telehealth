const connectToMongo = require('./db');
const express = require('express')
connectToMongo();


const app = express()
var cors = require('cors')
const port = 5000



app.use(cors()) 
app.use(express.json()) 

app.get('/', (req, res) => {
  res.send('Hello World!')
})
 
// // Available routes
// app.use('/api/user', require('./routes/user'))



app.listen(port, () => {
  console.log(`Telehealth listening at: ${port}`)
})