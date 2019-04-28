const Ad = require('../models/Ad')
const User = require('../models/User')
const Purchase = require('../models/Purchase')
const PurchaseMail = require('../jobs/PurchaseMail')
const Queue = require('../services/Queue')

class PurchaseController {
  async store (req, res) {
    const { ad, content } = req.body

    const purchaseAd = await Ad.findById(ad).populate('author')
    const user = await User.findById(req.userId)

    if (purchaseAd.purchasedBy) {
      return res.status(400).json({ error: 'This ad already been sold' })
    }

    const purchase = await Purchase.create({ ...req.body, user: req.userId })

    Queue.create(PurchaseMail.key, {
      ad: purchaseAd,
      user,
      content
    }).save()

    return res.json(purchase)
  }

  async update (req, res) {
    const { id } = req.params

    const purchase = await Purchase.findById(id)
    const ad = await Ad.findById(purchase.ad)

    if (ad.purchasedBy) {
      return res.status(400).json({ error: 'This ad already been sold' })
    }

    const updatedAd = await Ad.findByIdAndUpdate(ad._id, {
      purchasedBy: purchase._id
    })

    return res.json(updatedAd)
  }
}

module.exports = new PurchaseController()
