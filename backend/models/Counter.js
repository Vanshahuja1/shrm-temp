const mongoose = require("mongoose")

const counterSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      unique: true,
      enum: ["admin", "manager", "employee", "intern", "hr"],
    },
    count: {
      type: Number,
      default: 100,
    },
  },
  {
    timestamps: true,
  },
)

// Static method to get next count for a role
counterSchema.statics.getNextCount = async function (role) {
  const counter = await this.findOneAndUpdate(
    { role: role.toLowerCase() },
    { $inc: { count: 1 } },
    { new: true, upsert: true },
  )
  return counter.count
}

module.exports = mongoose.model("Counter", counterSchema)
