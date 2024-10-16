// routes/kot.js

const express = require('express');
const router = express.Router();
const KOT = require('../models/KOT');
const BOT = require('../models/BOT');
const Order = require('../models/Order');
const LiquorBrand = require('../models/LiquorBrand');
const LiquorCategory = require('../models/LiquorCategory');


router.post('/kotOrder/:tableId', async (req, res) => {
  try {
    const { tableId } = req.params;
    const { itemsWithoutBarCategory = [], waiterName, } = req.body;

    const modifiedItems = itemsWithoutBarCategory.map(item => ({
      name: item.name,
      quantity: item.quantity,
      taste: item.taste || '', // Set the taste information, or default to an empty string
    }));

    const currentDate = new Date();


    // If the current time is before 6 AM, set the order date to yesterday
    if (currentDate.getHours() >= 3) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Set the date to yesterday
    const previousDate = new Date(currentDate);
    previousDate.setDate(previousDate.getDate() - 1);

    // Adjust the time to be 5.5 hours ahead
    previousDate.setHours(previousDate.getHours() + 5); // Add 5 hours
    previousDate.setMinutes(previousDate.getMinutes() + 30); // Add 30 minutes


    const newKOT = new KOT({
      tableId,
      itemsWithoutBarCategory: modifiedItems,
      waiterName,
      createdAt: previousDate,
      KOTDate: previousDate
    });

    const savedKOT = await newKOT.save();

    res.json(savedKOT);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.get('/items/quantity', async (req, res) => {
  try {
    // Get the current date
    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split('T')[0]; // Get date in YYYY-MM-DD format

    // Aggregate to find top 4 items with the highest total quantity for the current date
    const result = await KOT.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentDateString), // Start of the current date
            $lt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000) // End of the current date
          }


        }
      },
      {
        $unwind: '$itemsWithoutBarCategory'
      },
      {
        $group: {
          _id: '$itemsWithoutBarCategory.name',
          totalQuantity: { $sum: '$itemsWithoutBarCategory.quantity' }
        }
      },
      {
        $sort: { totalQuantity: -1 } // Sort by total quantity in descending order
      },
      {
        $limit: 4 // Get the top 4 items
      }
    ]);

    res.json({ items: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.get('/items', async (req, res) => {
  try {
    const result = await KOT.aggregate([
      {
        $unwind: '$itemsWithoutBarCategory'
      },
      {
        $match: { 'itemsWithoutBarCategory.isCanceled': false } // Filter out only items where isCanceled is false
      },
      {
        $group: {
          _id: {
            name: '$itemsWithoutBarCategory.name',
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          },
          totalQuantity: { $sum: '$itemsWithoutBarCategory.quantity' }
        }
      },
      {
        $project: {
          _id: 0,
          itemName: '$_id.name',
          date: '$_id.date',
          totalQuantity: 1
        }
      }
    ]);
    res.json({ items: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// cancel kot report
router.get('/cancel-items', async (req, res) => {
  try {
    const result = await KOT.aggregate([
      {
        $unwind: '$itemsWithoutBarCategory'
      },
      {
        $match: { 'itemsWithoutBarCategory.isCanceled': true } // Filter out only canceled items
      },
      {
        $group: {
          _id: {
            name: '$itemsWithoutBarCategory.name',
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          },
          totalQuantity: { $sum: '$itemsWithoutBarCategory.quantity' }
        }
      },
      {
        $project: {
          _id: 0,
          itemName: '$_id.name',
          date: '$_id.date',
          totalQuantity: 1
        }
      }
    ]);
    res.json({ canceledItems: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/kot/:tableId', async (req, res) => {
  try {
    const { tableId } = req.params;

    // Find the latest KOT for the specified table
    const kot = await KOT.findOne({ tableId, setteled: false }).sort({ createdAt: -1 });

    if (!kot) {
      return res.status(404).json({ message: "KOT not found" });
    }

    // Filter out canceled items
    const itemsNotCanceled = kot.itemsWithoutBarCategory.filter(item => !item.isCanceled);

    // Construct a new KOT object with only non-canceled items
    const kotFiltered = {
      ...kot.toObject(),
      itemsWithoutBarCategory: itemsNotCanceled
    };

    res.status(200).json(kotFiltered);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.patch('/kot/settle/:tableId', async (req, res) => {
  try {
    const { tableId } = req.params;

    // Find all KOTs for the specified table
    const kots = await KOT.find({ tableId });

    // if (!kots || kots.length === 0) {
    //   return res.status(404).json({ message: "KOTs not found for the table" });
    // }

    // Update the settled field to true for all found KOTs
    for (const kot of kots) {
      kot.setteled = true;
      await kot.save();
    }

    res.json({ message: "KOTs settled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




// router.patch('/:tableId', async (req, res) => {
//   try {
//     const { tableId } = req.params;
//     const { menuName, quantityToCancel } = req.body;

//     // Find the order for the specified tableId
//     const order = await Order.findOne({ tableId, isTemporary: true });

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     // Find the item with the same name where isCanceled is false
//     const item = order.items.find(i => i.name === menuName && i.isCanceled === false);

//     if (!item) {
//       return res.status(400).json({ message: "Item not found or already canceled" });
//     }

//     // If the quantity to cancel is greater than available quantity
//     if (quantityToCancel > item.quantity) {
//       return res.status(400).json({ message: "Cancel quantity exceeds item quantity" });
//     }

//     // Decrease the quantity of the existing item
//     item.quantity -= quantityToCancel;

//     // If the quantity reaches zero, remove the item from the list
//     if (item.quantity === 0) {
//       order.items = order.items.filter(i => i._id !== item._id);
//     }

//     // Add the canceled item with isCanceled set to true
//     order.items.push({
//       name: menuName,
//       price: item.price,
//       quantity: quantityToCancel,
//       taste: item.taste,
//       isCanceled: true,
//       barCategory: item.barCategory,
//       selectedParentId: item.selectedParentId,
//       createdAt: new Date()
//     });


    
//     // bot code //
//     const bot = await BOT.findOne({ tableId }).sort({ BOTDate: -1 });

//     if (!bot) {
//       return res.status(404).json({ message: "BOT not found" });
//     }

//     // Find the item in the BOT collection and update the quantity
//     const botItem = bot.itemsWithBarCategory.find(i => i.name === menuName);

//     if (botItem) {
//       botItem.quantity -= quantityToCancel;

//       // If the quantity reaches zero, remove the item from the BOT collection
//       if (botItem.quantity === 0) {
//         bot.itemsWithBarCategory = bot.itemsWithBarCategory.filter(i => i._id !== botItem._id);
//       }

//       // Save the updated BOT document
//       await bot.save();
//     } else {
//       return res.status(400).json({ message: "Item not found in BOT" });
//     }

//     // bot end //



//     const { selectedParentId, barCategory } = item;

//     // Check if this is a liquor menu with a selectedParentId
//     if (selectedParentId) {
//       // Find the liquor brand that contains the selectedParentId in childMenus
//       const liquorBrand = await LiquorBrand.findOne({
//         "childMenus.name": selectedParentId
//       });

//       if (liquorBrand) {
//         const childMenu = liquorBrand.childMenus.find(menu => menu.name === selectedParentId);

//         if (childMenu) {
//           // Calculate the milliliters to add back to the stock
//           const mlQuantity = parseInt(barCategory) * quantityToCancel;

//           // Update LiquorBrand stock quantities using the provided formula
//           childMenu.stockQtyMl += mlQuantity;

//           const barCategoryCategory = parseFloat(childMenu.barCategory.replace('ml', ''));
//           if (barCategoryCategory > 0) {
//             childMenu.stockQty = Math.floor(childMenu.stockQtyMl / barCategoryCategory);
//             const remainingMlCategory = childMenu.stockQtyMl % barCategoryCategory;
//             childMenu.stockQtyStr = remainingMlCategory > 0
//               ? `${childMenu.stockQty}.${remainingMlCategory}`
//               : `${childMenu.stockQty}`;
//           } else {
//             childMenu.stockQty = 0;
//             childMenu.stockQtyStr = '0';
//           }

//           // Save the updated LiquorBrand document
//           await liquorBrand.save();
//         }
//       }

//       // Update LiquorCategory stock
//       const liquorCategory = await LiquorCategory.findOne({
//         "brands.prices.name": selectedParentId
//       });

//       if (liquorCategory) {
//         // Find the specific brand and price inside the liquorCategory
//         const brand = liquorCategory.brands.find(b => b.prices.some(p => p.name === selectedParentId));
//         const priceMenu = brand.prices.find(p => p.name === selectedParentId);

//         if (priceMenu) {
//           // Update the LiquorCategory stock quantities
//           priceMenu.stockQtyMl += parseInt(barCategory) * quantityToCancel;

//           const barCategoryCategory = parseFloat(priceMenu.barCategory.replace('ml', ''));
//           if (barCategoryCategory > 0) {
//             priceMenu.stockQty = Math.floor(priceMenu.stockQtyMl / barCategoryCategory);
//             const remainingMlCategory = priceMenu.stockQtyMl % barCategoryCategory;
//             priceMenu.stockQtyStr = remainingMlCategory > 0
//               ? `${priceMenu.stockQty}.${remainingMlCategory}`
//               : `${priceMenu.stockQty}`;
//           } else {
//             priceMenu.stockQty = 0;
//             priceMenu.stockQtyStr = '0';
//           }

//           // Save the updated LiquorCategory document
//           await liquorCategory.save();
//         }
//       }
//     }
//     // Save the updated order (for both liquor and restaurant menus)
//     await order.save();

//     res.json({ message: "Menu item updated, canceled successfully, and stock updated", order });
//   } catch (error) {
//     console.error("Error updating order and stock:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });


router.patch('/:tableId', async (req, res) => {
  try {
    const { tableId } = req.params;
    const { menuName, quantityToCancel } = req.body;

    // Find the order for the specified tableId
    const order = await Order.findOne({ tableId, isTemporary: true });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Find the item with the same name where isCanceled is false
    const item = order.items.find(i => i.name === menuName && i.isCanceled === false);

    if (!item) {
      return res.status(400).json({ message: "Item not found or already canceled" });
    }

    // If the quantity to cancel is greater than available quantity
    if (quantityToCancel > item.quantity) {
      return res.status(400).json({ message: "Cancel quantity exceeds item quantity" });
    }

    // Decrease the quantity of the existing item
    item.quantity -= quantityToCancel;

    // If the quantity reaches zero, remove the item from the list
    if (item.quantity === 0) {
      order.items = order.items.filter(i => i._id !== item._id);
    }

    // Add the canceled item with isCanceled set to true
    order.items.push({
      name: menuName,
      price: item.price,
      quantity: quantityToCancel,
      taste: item.taste,
      isCanceled: true,
      barCategory: item.barCategory,
      selectedParentId: item.selectedParentId,
      createdAt: new Date()
    });

    let canceledItemAdded = false;

    // ----- BOT logic -----
    const bot = await BOT.findOne({ tableId }).sort({ BOTDate: -1 });

    if (bot) {
      const botItem = bot.itemsWithBarCategory.find(i => i.name === menuName);

      if (botItem) {
        botItem.quantity -= quantityToCancel;

        // If the quantity reaches zero, remove the item from the BOT collection
        if (botItem.quantity === 0) {
          bot.itemsWithBarCategory = bot.itemsWithBarCategory.filter(i => i._id !== botItem._id);
        }

        // Push the canceled item into BOT
        bot.itemsWithBarCategory.push({
          name: menuName,
          price: botItem.price,
          quantity: quantityToCancel,
          isCanceled: true,
          createdAt: new Date(),
          barCategory: botItem.barCategory
        });

        // Save the updated BOT document
        await bot.save();
        canceledItemAdded = true;
      }
    }

    // ----- KOT logic if item not found in BOT -----
    if (!canceledItemAdded) {
      const kot = await KOT.findOne({ tableId }).sort({ KOTDate: -1 });
      
      if (!kot) {
        return res.status(404).json({ message: "KOT not found" });
      }

      const kotItem = kot.itemsWithoutBarCategory.find(i => i.name === menuName);

      if (kotItem) {
        kotItem.quantity -= quantityToCancel;

        // If the quantity reaches zero, remove the item from the KOT collection
        if (kotItem.quantity === 0) {
          kot.itemsWithoutBarCategory = kot.itemsWithoutBarCategory.filter(i => i._id !== kotItem._id);
        }

        // Push the canceled item into KOT
        kot.itemsWithoutBarCategory.push({
          name: menuName,
          price: kotItem.price,
          quantity: quantityToCancel,
          isCanceled: true,
          createdAt: new Date(),
          barCategory: kotItem.barCategory
        });

        // Save the updated KOT document
        await kot.save();
      } else {
        return res.status(400).json({ message: "Item not found in both BOT and KOT" });
      }
    }
    // bot end //



    const { selectedParentId, barCategory } = item;

    // Check if this is a liquor menu with a selectedParentId
    if (selectedParentId) {
      // Find the liquor brand that contains the selectedParentId in childMenus
      const liquorBrand = await LiquorBrand.findOne({
        "childMenus.name": selectedParentId
      });

      if (liquorBrand) {
        const childMenu = liquorBrand.childMenus.find(menu => menu.name === selectedParentId);

        if (childMenu) {
          // Calculate the milliliters to add back to the stock
          const mlQuantity = parseInt(barCategory) * quantityToCancel;

          // Update LiquorBrand stock quantities using the provided formula
          childMenu.stockQtyMl += mlQuantity;

          const barCategoryCategory = parseFloat(childMenu.barCategory.replace('ml', ''));
          if (barCategoryCategory > 0) {
            childMenu.stockQty = Math.floor(childMenu.stockQtyMl / barCategoryCategory);
            const remainingMlCategory = childMenu.stockQtyMl % barCategoryCategory;
            childMenu.stockQtyStr = remainingMlCategory > 0
              ? `${childMenu.stockQty}.${remainingMlCategory}`
              : `${childMenu.stockQty}`;
          } else {
            childMenu.stockQty = 0;
            childMenu.stockQtyStr = '0';
          }

          // Save the updated LiquorBrand document
          await liquorBrand.save();
        }
      }

      // Update LiquorCategory stock
      const liquorCategory = await LiquorCategory.findOne({
        "brands.prices.name": selectedParentId
      });

      if (liquorCategory) {
        // Find the specific brand and price inside the liquorCategory
        const brand = liquorCategory.brands.find(b => b.prices.some(p => p.name === selectedParentId));
        const priceMenu = brand.prices.find(p => p.name === selectedParentId);

        if (priceMenu) {
          // Update the LiquorCategory stock quantities
          priceMenu.stockQtyMl += parseInt(barCategory) * quantityToCancel;

          const barCategoryCategory = parseFloat(priceMenu.barCategory.replace('ml', ''));
          if (barCategoryCategory > 0) {
            priceMenu.stockQty = Math.floor(priceMenu.stockQtyMl / barCategoryCategory);
            const remainingMlCategory = priceMenu.stockQtyMl % barCategoryCategory;
            priceMenu.stockQtyStr = remainingMlCategory > 0
              ? `${priceMenu.stockQty}.${remainingMlCategory}`
              : `${priceMenu.stockQty}`;
          } else {
            priceMenu.stockQty = 0;
            priceMenu.stockQtyStr = '0';
          }

          // Save the updated LiquorCategory document
          await liquorCategory.save();
        }
      }
    }

    // Save the updated order (for both liquor and restaurant menus)
    await order.save();

    res.json({ message: "Menu item updated, canceled successfully, and stock updated", order });
  } catch (error) {
    console.error("Error updating order and stock:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});






module.exports = router;