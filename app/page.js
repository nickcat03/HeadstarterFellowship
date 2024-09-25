"use client";
import { useUser } from "@clerk/nextjs";
import getStripe from "@/utils/get-stripe";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import Head from "next/head";
import CardFeatures from "@/components/CardFeatures";


import { features } from "@/lib/data";


export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter()
  const handleSubmit = async (plan) => {
    try {
      const checkoutSession = await fetch("/api/checkout_session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }), // Send the plan data
      });

      if (!checkoutSession.ok) {
        const errorData = await checkoutSession.json(); // Read error message if not OK
        console.error("Error creating checkout session:", errorData.error);
        return;
      }

      const checkoutSessionJson = await checkoutSession.json(); // Parse JSON
      const stripe = await getStripe();
      const { error } = await stripe.redirectToCheckout({
        sessionId: checkoutSessionJson.id,
      });

      if (error) {
        console.warn(error.message);
      }
    } catch (err) {
      console.error("Fetch failed:", err);
    }
  };

  const handleGetStarted = () => {
    if (isSignedIn) {
      router.push("/flashcards");
    } else {
      router.push("/sign-in");
    }
  };

  if (isSignedIn) {
    router.push("/flashcards")
  }

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          textAlign: "center",
          my: 4,
        }}
      >
        <Typography
          variant="h2"
          gutterBottom
          className="shadow-sm"
        >
          Welcome to StudyGenie AI
        </Typography>
        <Typography variant="h5" gutterBottom>
          {" "}
          The easiest way to make flashcards from your text
        </Typography>
        <Button variant="contained"
          onClick={() => router.push('/sign-in')}
          className="mt-5 bg-secondary text-black hover:bg-gray-200"
        >
          Get Started
        </Button>
      </Box>
      <Box sx={{ my: 6 }}>
        <Typography variant="h4" gutterBottom
          className='mb-10 text-secondary'
        >
          Features
        </Typography>

        <Grid container spacing={2}>
          {
            features.length > 0 && features.map((value) => (
              <Grid
                key={value.id}
                item xs={12} md={6} lg={4}
              >
                <CardFeatures {...value} />
              </Grid>

            ))
          }
        </Grid>
      </Box>
      <Box sx={{ my: 6, textAlign: "center" }}>
        <Typography
          variant="h4"
          gutterBottom
          className='text-secondary'
        >
          Pricing
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 3,
                border: "1px solid",
                borderColor: "grey.300",
                borderRadius: 2,
              }}
              className='border border-secondary hover:bg-gray-200 hover:text-black transition-all ease-in-out'
            >
              <Typography
                variant="h5"
                gutterBottom
                className='text-secondary'
              >
                Basic
              </Typography>
              <Typography variant="h6" gutterBottom>
                $5 / month
              </Typography>
              <Typography>
                {" "}
                Access to basic flashcard features and limited storage.
              </Typography>
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => handleSubmit('basic')}
                className="bg-secondary hover:bg-secondary text-black"
              >
                Choose Basic
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 3,
                border: "1px solid",
                borderColor: "primary",
                borderRadius: 2,
              }}
              className='border border-secondary hover:bg-gray-200 hover:text-black transition-all ease-in-out'
            >
              <Typography variant="h5" 
              gutterBottom
              className="text-secondary"
              >
                Pro
              </Typography>
              <Typography variant="h6" gutterBottom>
                $10 / month
              </Typography>
              <Typography>
                {" "}
                Access to unlimited flashcards and storage with priority
                support.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={() => handleSubmit('pro')}
                className="bg-secondary hover:bg-secondary text-black"
              >
                Choose Pro
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}