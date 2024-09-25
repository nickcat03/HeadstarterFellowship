"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useRouter } from "next/navigation";
import {
  Card,
  CardActionArea,
  CardContent,
  Container,
  Grid,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";

export default function Flashcards() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [open, setOpen] = useState(false);
  const [newSetName, setNewSetName] = useState("");
  const [deletingSet, setDeletingSet] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function getFlashcards() {
      if (!user) return;
      const docRef = doc(collection(db, "users"), user.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const collections = docSnap.data().flashcards || [];
        setFlashcards(collections);
      } else {
        await setDoc(docRef, { flashcards: [] });
      }
    }
    getFlashcards();
  }, [user]);

  if (!isLoaded || !isSignedIn) {
    return <></>;
  }

  const handleCardClick = (id) => {
    router.push(`/set?id=${id}`);
  };

  const handleAddSet = async () => {
    if (!user || !newSetName) return;
    
    const docRef = doc(collection(db, "users"), user.id);
    const docSnap = await getDoc(docRef);
    const collections = docSnap.data().flashcards || [];

    if (collections.find((f) => f.name === newSetName)) {
      alert("Flashcard set with this name already exists.");
      return;
    }

    collections.push({ name: newSetName });
    await setDoc(docRef, { flashcards: collections }, { merge: true });
    setNewSetName("");
    setOpen(false);
  };

  const handleDeleteSet = async () => {
    if (!user || !deletingSet) return;

    const docRef = doc(collection(db, "users"), user.id);
    const docSnap = await getDoc(docRef);
    const collections = docSnap.data().flashcards || [];

    const updatedCollections = collections.filter((set) => set.name !== deletingSet.name);
    await setDoc(docRef, { flashcards: updatedCollections }, { merge: true });
    setDeletingSet(null);
    setOpen(false);
  };

  return (
    <Container maxWidth="100vw">
      {/* Navigation Button */}
      <Button
        variant="contained"
        color="secondary"
        onClick={() => router.push('/generate')}
        sx={{ mb: 2 }}
      >
        Generate Set
      </Button>

      {/* Add Flashcard Set Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpen(true)}
        sx={{ mb: 2 }}
      >
        Add Flashcard Set
      </Button>

      <Grid container spacing={3} sx={{ mt: 4 }}>
        {flashcards.map((flashcard, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardActionArea
                onClick={() => {
                  handleCardClick(flashcard.name);
                }}
              >
                <CardContent>
                  <Typography variant="h6">{flashcard.name}</Typography>
                </CardContent>
              </CardActionArea>
              <Button
                variant="outlined"
                color="error"
                onClick={() => setDeletingSet(flashcard)}
                sx={{ mt: 1, mb: 1 }}
              >
                Delete
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Flashcard Set Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add Flashcard Set</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Flashcard Set Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newSetName}
            onChange={(e) => setNewSetName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddSet}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Flashcard Set Confirmation Dialog */}
      <Dialog open={Boolean(deletingSet)} onClose={() => setDeletingSet(null)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete the set "{deletingSet?.name}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingSet(null)}>Cancel</Button>
          <Button onClick={handleDeleteSet} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
