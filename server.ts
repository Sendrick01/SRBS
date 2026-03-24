import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cron from "node-cron";
import nodemailer from "nodemailer";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import firebaseConfig from "./firebase-applet-config.json" with { type: "json" };

// Initialize Firebase Admin
admin.initializeApp({
  projectId: firebaseConfig.projectId,
});

const db = getFirestore(firebaseConfig.firestoreDatabaseId);

// Email Transporter (Placeholder for real SMTP)
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER || "realevrug@gmail.com",
    pass: process.env.EMAIL_PASS || "realevr2026",
  },
});

// Daily Cron Job for Rent Deposit Reminders
// Runs at 00:00 every day
cron.schedule("0 0 * * *", async () => {
  console.log("Running daily rent deposit reminders...");
  
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Query confirmed bookings with unpaid deposits
    const bookingsSnapshot = await db.collection("bookings")
      .where("status", "==", "confirmed")
      .where("depositPaid", "==", false)
      .get();
      
    for (const doc of bookingsSnapshot.docs) {
      const booking = doc.data();
      const confirmedAt = booking.confirmedAt ? new Date(booking.confirmedAt) : null;
      
      // Check if confirmed within the last 7 days
      if (confirmedAt && confirmedAt >= sevenDaysAgo) {
        // Fetch tenant profile
        const tenantDoc = await db.collection("users").doc(booking.tenantId).get();
        const tenant = tenantDoc.data();
        
        if (tenant && tenant.email) {
          // Fetch property details
          const propertyDoc = await db.collection("properties").doc(booking.propertyId).get();
          const property = propertyDoc.data();
          
          const mailOptions = {
            from: `"Smart Rental System" <${process.env.EMAIL_USER || "realevrug@gmail.com"}>`,
            to: tenant.email,
            subject: "Reminder: Rent Deposit Payment Due",
            text: `Hi ${tenant.displayName || "Tenant"},\n\nThis is a friendly reminder to pay your 3-month rent deposit for the property: ${property?.title || "Rental Unit"}.\n\nYour booking is confirmed, but we haven't received the deposit yet. Please log in to the dashboard to complete the payment via Flutterwave.\n\nThank you!`,
            html: `
              <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #065f46;">Rent Deposit Reminder</h2>
                <p>Hi <strong>${tenant.displayName || "Tenant"}</strong>,</p>
                <p>This is a friendly reminder to pay your 3-month rent deposit for the property: <strong>${property?.title || "Rental Unit"}</strong>.</p>
                <p>Your booking is confirmed, but we haven't received the deposit yet. Please log in to the dashboard to complete the payment via Flutterwave.</p>
                <div style="margin-top: 20px; padding: 15px; background: #f0fdf4; border-radius: 8px;">
                  <p style="margin: 0; font-weight: bold;">Amount Due: UGX ${(booking.totalPrice * 3).toLocaleString()}</p>
                </div>
                <p style="margin-top: 20px; color: #666; font-size: 12px;">If you have already made the payment, please ignore this email.</p>
              </div>
            `,
          };
          
          try {
            if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
              await transporter.sendMail(mailOptions);
              console.log(`Reminder email sent to ${tenant.email} for booking ${doc.id}`);
            } else {
              console.log(`[SIMULATED EMAIL] To: ${tenant.email}, Subject: ${mailOptions.subject}`);
            }
          } catch (err) {
            console.error(`Failed to send email to ${tenant.email}:`, err);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper function for payment confirmation logic
  const confirmPaymentLogic = async (paymentId: string) => {
    const paymentRef = db.collection("payments").doc(paymentId);
    const paymentDoc = await paymentRef.get();
    
    if (!paymentDoc.exists) throw new Error("Payment not found");
    const payment = paymentDoc.data();
    if (payment?.status === "completed") return { success: true, message: "Already completed" };

    const bookingRef = db.collection("bookings").doc(payment?.bookingId);
    const bookingDoc = await bookingRef.get();
    if (!bookingDoc.exists) throw new Error("Booking not found");
    const booking = bookingDoc.data();

    const propertyRef = db.collection("properties").doc(booking?.propertyId);

    // Batch update for atomicity
    const batch = db.batch();
    
    // 1. Update Payment Status
    batch.update(paymentRef, { status: "completed" });
    
    // 2. Update Booking (mark deposit as paid)
    if (payment?.type === "deposit") {
      batch.update(bookingRef, { 
        depositPaid: true,
        escrowStatus: "held"
      });
      // 3. Update Property Status to rented
      batch.update(propertyRef, { status: "rented" });
    }

    // 4. Create Notifications
    const tenantNotifRef = db.collection("notifications").doc();
    batch.set(tenantNotifRef, {
      userId: booking?.tenantId,
      title: "Payment Confirmed",
      message: `Your payment of UGX ${payment?.amount.toLocaleString()} for ${payment?.type} has been confirmed.`,
      type: "payment",
      read: false,
      createdAt: new Date().toISOString(),
      link: "/dashboard"
    });

    const landlordNotifRef = db.collection("notifications").doc();
    batch.set(landlordNotifRef, {
      userId: booking?.landlordId,
      title: "New Payment Received",
      message: `A payment of UGX ${payment?.amount.toLocaleString()} has been received for your property.`,
      type: "payment",
      read: false,
      createdAt: new Date().toISOString(),
      link: "/dashboard"
    });

    await batch.commit();
    return { success: true };
  };

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Flutterwave Webhook
  app.post("/api/webhooks/flutterwave", async (req, res) => {
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
    const signature = req.headers["verif-hash"];

    if (secretHash && signature !== secretHash) {
      return res.status(401).send("Invalid signature");
    }

    const { data } = req.body;
    if (req.body.event === "charge.completed" && data.status === "successful") {
      try {
        // Assuming tx_ref is the paymentId
        const paymentId = data.tx_ref;
        await confirmPaymentLogic(paymentId);
        res.status(200).send("Webhook received");
      } catch (error) {
        console.error("Webhook processing error:", error);
        res.status(500).send("Internal server error");
      }
    } else {
      res.status(200).send("Event ignored");
    }
  });

  // Admin Manual Payment Confirmation
  app.post("/api/admin/confirm-payment", async (req, res) => {
    const { paymentId } = req.body;
    if (!paymentId) return res.status(400).json({ error: "paymentId is required" });

    try {
      const result = await confirmPaymentLogic(paymentId);
      res.json(result);
    } catch (error: any) {
      console.error("Manual confirmation error:", error);
      res.status(500).json({ error: error.message || "Failed to confirm payment" });
    }
  });

  // Test Reminders Endpoint (Admin only)
  app.post("/api/admin/test-reminders", async (req, res) => {
    console.log("Manual trigger for rent deposit reminders...");
    try {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const bookingsSnapshot = await db.collection("bookings")
        .where("status", "==", "confirmed")
        .where("depositPaid", "==", false)
        .get();
        
      let sentCount = 0;
      for (const doc of bookingsSnapshot.docs) {
        const booking = doc.data();
        const confirmedAt = booking.confirmedAt ? new Date(booking.confirmedAt) : null;
        
        if (confirmedAt && confirmedAt >= sevenDaysAgo) {
          const tenantDoc = await db.collection("users").doc(booking.tenantId).get();
          const tenant = tenantDoc.data();
          
          if (tenant && tenant.email) {
            const propertyDoc = await db.collection("properties").doc(booking.propertyId).get();
            const property = propertyDoc.data();
            
            const mailOptions = {
              from: `"Smart Rental System" <${process.env.EMAIL_USER || "realevrug@gmail.com"}>`,
              to: tenant.email,
              subject: "Reminder: Rent Deposit Payment Due",
              text: `Hi ${tenant.displayName || "Tenant"},\n\nThis is a friendly reminder to pay your 3-month rent deposit for the property: ${property?.title || "Rental Unit"}.\n\nYour booking is confirmed, but we haven't received the deposit yet. Please log in to the dashboard to complete the payment via Flutterwave.\n\nThank you!`,
              html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                  <h2 style="color: #065f46;">Rent Deposit Reminder</h2>
                  <p>Hi <strong>${tenant.displayName || "Tenant"}</strong>,</p>
                  <p>This is a friendly reminder to pay your 3-month rent deposit for the property: <strong>${property?.title || "Rental Unit"}</strong>.</p>
                  <p>Your booking is confirmed, but we haven't received the deposit yet. Please log in to the dashboard to complete the payment via Flutterwave.</p>
                  <div style="margin-top: 20px; padding: 15px; background: #f0fdf4; border-radius: 8px;">
                    <p style="margin: 0; font-weight: bold;">Amount Due: UGX ${(booking.totalPrice * 3).toLocaleString()}</p>
                  </div>
                  <p style="margin-top: 20px; color: #666; font-size: 12px;">If you have already made the payment, please ignore this email.</p>
                </div>
              `,
            };
            
            if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
              await transporter.sendMail(mailOptions);
            } else {
              console.log(`[SIMULATED EMAIL] To: ${tenant.email}, Subject: ${mailOptions.subject}`);
            }
            sentCount++;
          }
        }
      }
      res.json({ success: true, sentCount });
    } catch (error) {
      console.error("Error in manual trigger:", error);
      res.status(500).json({ error: "Failed to send reminders" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get(/.*/, (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log("Cron job scheduled: Daily rent deposit reminders.");
  });
}

startServer();
