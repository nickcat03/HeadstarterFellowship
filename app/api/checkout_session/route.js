import { NextResponse } from "next/server";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const formatAmountForStripe = (amount) => {
  return Math.round(amount * 100);
};

export async function POST(req) {
  const { plan } = await req.json(); // Get the selected plan from the request body
  console.log("plan:", plan)

  let unitAmount;
  let productName;

  // Determine the price and product name based on the plan
  if (plan === "basic") {
    unitAmount = formatAmountForStripe(5); // $5 plan
    productName = "Basic Subscription";
  } else {
    unitAmount = formatAmountForStripe(10); // $10 plan
    productName = "Pro Subscription";
  }

  const params = {
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: productName, // Dynamic product name
          },
          unit_amount: unitAmount, // Dynamic price
          recurring: {
            interval: "month",
            interval_count: 1,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${req.headers.get(
      "origin"
    )}/result?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.headers.get(
      "origin"
    )}/result?session_id={CHECKOUT_SESSION_ID}`,
  };

  try {
    const checkoutSession = await stripe.checkout.sessions.create(params);
    return NextResponse.json(checkoutSession, {
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: { message: error.message } },
      { status: 500 }
    );
  }
}
