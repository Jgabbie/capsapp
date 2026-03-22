import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    // Changed to ObjectId so we can use .populate() to get package details
    packageId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "packages", 
        required: true 
    },
    // Matches the collection name 'users' from your database
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "users", 
        required: true 
    },
    // Explicit fields to keep mobile and web database entries identical
    bookingDate: { type: String, required: true },
    travelDate: { type: String, required: true },
    travelers: { type: Number, required: true },
    
    reference: { type: String, required: true, unique: true },
    status: { type: String, default: "Successful" },
    
    // Optional: Keep these if you plan to use Stripe/Paymongo tokens
    checkoutToken: { type: String, unique: true, sparse: true },
    bookingDetails: { type: Object }, 
  },
  { timestamps: true, collection: "bookings" }
);

// This prevent errors during hot-reloads in development
const Booking = mongoose.models.bookings || mongoose.model("bookings", bookingSchema);

export default Booking;