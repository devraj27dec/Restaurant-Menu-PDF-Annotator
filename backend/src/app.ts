import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
const app = express()
const port = process.env.PORT || 3000
import MenuRouter from './routes/menu.route.js'

app.use(express.json())
app.use(express.urlencoded({ extended: true }));


app.use('/api/menus' , MenuRouter)

app.listen(port , () =>{
    console.log(`server running at http://localhost:${port}`)
})
