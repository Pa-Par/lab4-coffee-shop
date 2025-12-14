let express = require('express')
let bodyParser = require('body-parser')

const app = express()

// เพิ่ม 2 บรรทัดนี้เพื่อใช้งาน body-parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// --- Mock Data: จำลองฐานข้อมูลเมนูกาแฟ ---
let coffees = [
    { id: 1, name: 'Americano', price: 60, size: 'M' },
    { id: 2, name: 'Latte', price: 75, size: 'L' },
    { id: 3, name: 'Espresso', price: 50, size: 'S' }
]
let nextId = 4 // สำหรับกำหนด ID ถัดไป

app.get('/', function (req, res) {
    res.send('wellcome to Coffee Shop API')
})

// --- API Routes สำหรับ Coffee Shop API ---

// 1. GET: ดูสถานะเซิร์ฟเวอร์
app.get('/status', function (req, res) {
    res.send('✅ Coffee Shop API Server is running!')
})

// 2. GET: เรียกดูรายการกาแฟทั้งหมด (Read All)
app.get('/coffees', function (req, res) {
    console.log('GET /coffees - เรียกรายการทั้งหมด')
    res.send(coffees)
})

// 3. GET by ID: เรียกดูข้อมูลกาแฟตาม ID (Read Single)
app.get('/coffees/:coffeeId', function (req, res) {
    const id = parseInt(req.params.coffeeId)
    const coffee = coffees.find(c => c.id === id)

    if (coffee) {
        console.log(`GET /coffees/${id} - พบรายการ`)
        res.send(coffee)
    } else {
        console.log(`GET /coffees/${id} - ไม่พบรายการ`)
        res.status(404).send({ message: `ไม่พบเมนูกาแฟ ID: ${id}` })
    }
})

// 4. POST: สร้างเมนูกาแฟใหม่ (Create)
app.post('/coffees', function (req, res) {
    const newCoffee = {
        id: nextId++,
        name: req.body.name || 'Unknown Coffee',
        price: req.body.price ? parseFloat(req.body.price) : 0,
        size: req.body.size || 'M'
    }
    
    coffees.push(newCoffee)
    console.log('POST /coffees - สร้างรายการใหม่: ' + JSON.stringify(newCoffee))
    // ตอบกลับด้วยสถานะ 201 Created
    res.status(201).send(newCoffee) 
})

// 5. PUT: แก้ไขข้อมูลกาแฟตาม ID (Update)
app.put('/coffees/:coffeeId', function (req, res) {
    const id = parseInt(req.params.coffeeId)
    const index = coffees.findIndex(c => c.id === id)

    if (index !== -1) {
        // อัปเดตข้อมูล: เก็บ ID เดิมไว้, ใช้ข้อมูลใหม่จาก body และใช้ข้อมูลเดิมหากไม่มีการส่งมา
        coffees[index] = {
            id: id,
            name: req.body.name || coffees[index].name,
            price: req.body.price ? parseFloat(req.body.price) : coffees[index].price,
            size: req.body.size || coffees[index].size
        }
        console.log(`PUT /coffees/${id} - แก้ไขรายการ: ` + JSON.stringify(coffees[index]))
        res.send(coffees[index])
    } else {
        console.log(`PUT /coffees/${id} - ไม่พบรายการที่จะแก้ไข`)
        res.status(404).send({ message: `ไม่พบเมนูกาแฟ ID: ${id} ที่จะแก้ไข` })
    }
})

// 6. DELETE: ลบเมนูกาแฟตาม ID (Delete)
app.delete('/coffees/:coffeeId', function (req, res) {
    const id = parseInt(req.params.coffeeId)
    const initialLength = coffees.length
    
    // กรองเอาเมนูที่ ID ไม่ตรงออกไป (เป็นการลบ)
    coffees = coffees.filter(c => c.id !== id)

    if (coffees.length < initialLength) {
        console.log(`DELETE /coffees/${id} - ลบรายการเรียบร้อย`)
        // ตอบกลับด้วยสถานะ 204 No Content สำหรับการลบสำเร็จ
        res.status(204).send() 
    } else {
        console.log(`DELETE /coffees/${id} - ไม่พบรายการที่จะลบ`)
        res.status(404).send({ message: `ไม่พบเมนูกาแฟ ID: ${id} ที่จะลบ` })
    }
})

// --- Start Server ---
let port = 8081
app.listen(port, function () {
    console.log(`Server running on http://localhost:${port}`)
})