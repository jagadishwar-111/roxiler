
const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const sqlite3 = require("sqlite3").verbose()
const cors = require("cors")

const port = 5000;
app.use(cors())

app.use(express.json());
app.use(bodyParser.json());

const db = new sqlite3.Database("roxiler.db",(err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database');
    }
});

db.run(`
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    price REAL,
    description TEXT,
    category TEXT,
    image TEXT,
    sold BOOLEAN,
    dateOfSale DATE
)
`)

const getAllProductDetails = async () => {
    const url="https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    const options = {
        method: "GET",
        'content-type': "application/json"
    };


const response = await fetch(url,options)
const data = await response.json()

for (let eachItem of data){
    const {id,title,price,description,category,image,sold,dateOfSale} = eachItem
  
    db.run(`
    INSERT OR IGNORE INTO products (id,title,price,description,category,image,sold,dateOfSale)
    VALUES (?,?,?,?,?,?,?,?)
`,[id,title,price,description,category,image,sold,dateOfSale],(err) => {
    if (err) {
        console.log("not added")
    }
    
}) 

}

}

app.get("/products",(req,res) => {
    
    db.all(`SELECT * FROM products`,(err,rows) => {
        if (rows){
            res.send(rows)
        }
    })
        
})


app.post("/addproduct",(req,res) => {
    
    const {title, price, description, category, image, sold, dateOfSale} = req.body
    


    db.run(`INSERT OR IGNORE INTO products(title, price, description, category, image, sold, dateOfSale) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`, 
            [title, price, description, category, image, sold, dateOfSale], 
            (err) => {
                if (err) {
                    res.json({ error: err.message });
                }
                
                res.json("Product added successfully");
            });
})



app.delete('/products/:id', (req, res) => {
   const {id} = req.params
    db.run(`DELETE FROM products WHERE id = ?`,[id],(err) => {
        if (!err){
            res.json('Product deleted successfully')
        }
    })




  });
  
getAllProductDetails()


















app.listen(port, () => {
console.log(`Server is running on port ${port}`);
});