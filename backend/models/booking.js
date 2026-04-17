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
    
    // 🔥 FIX 1: Changed from String to Object to accept { startDate, endDate }
    travelDate: { type: Object, required: true },
    
    travelers: { type: Number, required: true },
    reference: { type: String, required: true, unique: true },
    
    // 🔥 FIX 2: Default to "Pending" so unpaid bookings aren't accidentally marked as Paid
    status: { type: String, default: "Pending" },
    
    // Optional: Keep these if you plan to use Stripe/Paymongo tokens
    checkoutToken: { type: String, unique: true, sparse: true },
    bookingDetails: { type: Object }, 
  },
  { timestamps: true, collection: "bookings" }
);

// This prevents errors during hot-reloads in development
const Booking = mongoose.models.bookings || mongoose.model("bookings", bookingSchema);

export default Booking;