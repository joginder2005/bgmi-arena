import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;
const hasValidKeys =
  Boolean(keyId) &&
  Boolean(keySecret) &&
  keyId !== "rzp_test_yourkey" &&
  keySecret !== "your_secret";

const razorpay = hasValidKeys
  ? new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })
  : null;

export const razorpayConfigured = hasValidKeys;
export default razorpay;
