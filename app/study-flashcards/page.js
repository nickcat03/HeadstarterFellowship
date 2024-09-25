"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, doc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import {
  Container,
  Box,
  Typography,
  Button,
  IconButton,
  Card,
  CardActionArea,
  CardContent,
} from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";

export default function StudyFlashcards() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewedCards, setViewedCards] = useState(new Set());
  const [flipped, setFlipped] = useState({});
  const searchParams = useSearchParams();
  const flashcardSetName = searchParams.get("id");
  const router = useRouter();

  const fetchFlashcards = async () => {
    if (!user || !flashcardSetName) return;
    const colRef = collection(
      doc(collection(db, "users"), user.id),
      flashcardSetName
    );
    const docs = await getDocs(colRef);
    const flashcards = [];
    docs.forEach((doc) => {
      flashcards.push({ id: doc.id, ...doc.data() });
    });
    setFlashcards(flashcards);
  };

  useEffect(() => {
    fetchFlashcards();
  }, [user, flashcardSetName]);

  if (!isLoaded || !isSignedIn) {
    return <></>;
  }

  if (flashcards.length === 0)
    return <Container>Loading cards...</Container>;

  const currentFlashcard = flashcards[currentIndex];
  const isLastCard = viewedCards.size === flashcards.length;

  const handleFlip = (id) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCorrect = () => {
    const nextIndex = (currentIndex + 1) % flashcards.length;
    setViewedCards(new Set([...viewedCards, currentFlashcard.id]));
    setCurrentIndex(nextIndex);
    setFlipped((prev) => ({
      ...prev,
      [currentFlashcard.id]: false,
    }));
  };

  const handleIncorrect = () => {
    const nextIndex = (currentIndex + 1) % flashcards.length;
    setCurrentIndex(nextIndex);
    setFlipped((prev) => ({
      ...prev,
      [currentFlashcard.id]: false,
    }));
  };

  const handleRedo = () => {
    setCurrentIndex(0);
    setViewedCards(new Set());
    setFlipped({});
  };

  return (
    <Container maxWidth="100vw">
      <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
        Study Flashcards
      </Typography>

      <Box
        sx={{
          maxWidth: "800px",
          height: "70vh",
          perspective: "1000px",
          margin: "0 auto",
          position: "relative", // Added relative positioning here
        }}
      >
        <Card
          sx={{
            backgroundColor: "rgba(0,0,0,0)",
            boxShadow: "0",
            padding: "80px",
          }}
        >
          <CardActionArea
            onClick={() => {
              handleFlip(currentFlashcard.id);
            }}
          >
            <CardContent>
              <Box
                sx={{
                  perspective: "1000px",
                  "& > div": {
                    transition: "transform 0.6s",
                    transformStyle: "preserve-3d",
                    position: "relative",
                    width: "100%",
                    height: "200px",
                    boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
                    transform: flipped[currentFlashcard.id]
                      ? "rotateY(180deg)"
                      : "rotateY(0deg)",
                    backfaceVisibility: "hidden",
                    backgroundColor: "white",
                  },
                  "& > div > .card-side": {
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
                    display: "flex",
                    backfaceVisibility: "hidden",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 2,
                    boxSizing: "border-box",
                    backgroundColor: "white",
                  },
                  "& > div > .card-back": {
                    transform: "rotateY(180deg)",
                  },
                }}
              >
                <div>
                  <div className="card-side card-front">
                    <Typography variant="h5" component="div">
                      {currentFlashcard.front}
                    </Typography>
                  </div>
                  <div className="card-side card-back">
                    <Typography variant="h5" component="div">
                      {currentFlashcard.back}
                    </Typography>
                  </div>
                </div>
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>

        <div
          style={{
            position: "absolute",
            bottom: 10, // Positioning the buttons at the bottom
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            justifyContent: "space-around",
            width: "100%",
            padding: "0 20px",
          }}
        >
          <IconButton color="success" onClick={handleCorrect}>
            <CheckCircle />
          </IconButton>
          <IconButton color="error" onClick={handleIncorrect}>
            <Cancel />
          </IconButton>
        </div>
      </Box>

      {isLastCard && (
        <div style={{ marginTop: 20 }}>
          <Button variant="contained" onClick={handleRedo} sx={{ mr: 2 }}>
            Redo Set
          </Button>
          <Button variant="outlined" onClick={() => router.push("/flashcards")}>
            Go Back
          </Button>
        </div>
      )}
    </Container>
  );
}
