require('dotenv').config(); // Load environment variables from .env file

const ConnectToMongodb = require('./db');
const express = require('express');
const app = express();
const passport = require('passport'); // Import Passport
const path=require('path')
var cors = require('cors');
const dbHost = process.env.DB_HOST;
const port = process.env.PORT;


ConnectToMongodb();

app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(passport.initialize());

app.use(express.static('uploads')); // 'uploads' should be the directory where your images are stored

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/section', require('./routes/section'));
app.use('/api/table', require('./routes/table'));
app.use('/api/main', require('./routes/mainCategory'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/hotel', require('./routes/hotel'));
app.use('/api/order', require('./routes/order'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/supplier', require('./routes/supplier'));
app.use('/api/item', require('./routes/item'));
app.use('/api/gst', require('./routes/gst'));
app.use('/api/unit', require('./routes/unit'));
app.use('/api/purchase', require('./routes/purchase'));
app.use('/api/waiter', require('./routes/waiter'));
app.use('/api/stockOut', require('./routes/stockOut'));
app.use('/api/taste', require('./routes/taste'));
app.use('/api/greet', require('./routes/greet'));
app.use('/api/customer', require('./routes/customer'));
app.use('/api/logHistory', require('./routes/logHistory'));
app.use('/api/kot', require('./routes/kot'));
app.use('/api/expensesForm', require('./routes/expensesForm'));
app.use('/api/expense', require('./routes/expense'));
app.use('/api/bankName', require('./routes/bankName'));
app.use('/api/superAdmin', require('./routes/superAdmin'));
app.use('/api/liquorBrand', require('./routes/liquorBrand'));
app.use('/api/liquorCategory', require('./routes/liquorCategory'));
app.use('/api/bot', require('./routes/bot'));
app.use('/api/vat', require('./routes/vat'));
app.use('/api/barPurchase', require('./routes/barPurchase'));
app.use('/api/purchaseVAT', require('./routes/purchaseVAT'));
app.use('/api/barStockOut', require('./routes/barStockOut'));

app.use('/api/counter', require('./routes/counter'));
app.use('/api/coupon', require('./routes/coupon'));
app.use('/api/counterAdmin', require('./routes/counterAdmin'));
app.use('/api/counterLogin', require('./routes/counterLogin'));
app.use('/api/counterHotel', require('./routes/counterHotel'));
app.use('/api/counterGreet', require('./routes/counterGreet'));
app.use('/api/counterGst', require('./routes/counterGst'));


// Print functionality 

const escpos = require('escpos');
const net = require('net');
const jsdom = require('jsdom'); // For parsing HTML

const printerIP = '192.168.1.87'; // Printer IP address
const printerPort = 9100; // Default port for many network printers

app.post('/print-kot', async (req, res) => {
  const { kotContent } = req.body;

  if (!kotContent) {
    return res.status(400).send('KOT content is required');
  }

  const client = new net.Socket();

  // Connect to the printer and handle printing
  client.connect(printerPort, printerIP, () => {
    const printer = new escpos.Printer(client);

    // Extract the body content from HTML
    const bodyContent = extractBodyContent(kotContent);

    // Print the extracted body content
    printer
      .text(bodyContent)
      .cut()
      .close(() => {
        // Ensure client connection is closed
        client.end();
        res.status(200).send('KOT printed successfully');
      });
  });

  // Handle errors with the connection
  client.on('error', (err) => {
    console.error('Network error:', err);
    client.destroy(); // Close connection on error
    res.status(500).send('Failed to connect to printer');
  });

  // Handle disconnection or error events
  client.on('close', () => {
    console.log('Connection to printer closed');
    res.status(200).send('KOT printed successfully');


  });
  client.on('end', () => {
    console.log('Connection ended');
  });

  // Handle any unexpected errors
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    client.destroy(); // Ensure the connection is closed
  });
});

// Function to extract body content from HTML
const extractBodyContent = (htmlContent) => {
  const { JSDOM } = jsdom;
  const dom = new JSDOM(htmlContent);
  const bodyContent = dom.window.document.body.textContent || "";
  return bodyContent.trim();
};

// Print Functinality 




app.listen(port,'0.0.0.0',() => {
  console.log(`MyHotel listening at http://${dbHost}:${port}`);
});


