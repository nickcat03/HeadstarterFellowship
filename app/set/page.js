"use client"
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
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
import Error from "@/components/Error";

export default function Flashcards() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openTitleEditDialog, setOpenTitleEditDialog] = useState(false);
  const [newFlashcard, setNewFlashcard] = useState({ front: "", back: "" });
  const [selectedFlashcard, setSelectedFlashcard] = useState(null);
  const [editFlashcard, setEditFlashcard] = useState({ front: "", back: "" });
  const [newTitle, setNewTitle] = useState("");
  const searchParams = useSearchParams();
  const flashcardSetName = searchParams.get("id");
  const router = useRouter();

  const fetchFlashcards = async () => {
    if (!user || !flashcardSetName) return;
    const colRef = collection(doc(collection(db, "users"), user.id), flashcardSetName);
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
    return <Error />;
  }

  const handleAddFlashcard = async () => {
    if (!user || !flashcardSetName || !newFlashcard.front || !newFlashcard.back) return;

    const colRef = collection(doc(collection(db, "users"), user.id), flashcardSetName);
    await addDoc(colRef, newFlashcard);
    setNewFlashcard({ front: "", back: "" });
    setOpenAddDialog(false);
    fetchFlashcards();  // Refresh the list of flashcards
  };

  const handleEditFlashcard = async () => {
    if (!user || !flashcardSetName || !selectedFlashcard) return;

    const colRef = doc(collection(doc(collection(db, "users"), user.id), flashcardSetName), selectedFlashcard.id);
    await updateDoc(colRef, editFlashcard);
    setEditFlashcard({ front: "", back: "" });
    setSelectedFlashcard(null);
    setOpenEditDialog(false);
    fetchFlashcards();  // Refresh the list of flashcards
  };

  const handleDeleteFlashcard = async () => {
    if (!user || !selectedFlashcard || !flashcardSetName) return;

    const colRef = doc(collection(doc(collection(db, "users"), user.id), flashcardSetName), selectedFlashcard.id);
    await deleteDoc(colRef);
    setSelectedFlashcard(null);
    setOpenDeleteDialog(false);
    fetchFlashcards();  // Refresh the list of flashcards
  };

  const handleEditTitle = async () => {
    if (!user || !flashcardSetName || !newTitle) return;

    try {
      const docRef = doc(collection(db, "users"), user.id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.error("User document does not exist.");
        return;
      }

      let collections = docSnap.data().flashcards || [];

      // Find and update the flashcard set with the old name
      const setIndex = collections.findIndex((f) => f.name === flashcardSetName);
      if (setIndex === -1) {
        console.error("Flashcard set not found.");
        return;
      }

      // Check if newTitle already exists
      if (collections.find((f) => f.name === newTitle)) {
        alert("Flashcard set with this name already exists.");
        return;
      }

      // Update the title
      collections[setIndex] = { name: newTitle };

      // Update the document
      await setDoc(docRef, { flashcards: collections }, { merge: true });

      // Redirect and close dialog
      router.push(`/set?id=${newTitle}`);
      setOpenTitleEditDialog(false);
    } catch (error) {
      console.error("Error updating title: ", error);
    }
  };

  return (
    <Container maxWidth="100vw">
      <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
        {flashcardSetName}
      </Typography>

      <Box className='flex flex-col md:flex-row items-center gap-5'>
        <Button
          variant="contained"
          onClick={() => setOpenAddDialog(true)}
          sx={{ mb: 2 }}
          className="bg-secondary text-black hover:bg-gray-200"
        >
          Add Flashcard
        </Button>

        <Button
          variant="outlined"
          onClick={() => router.push("/flashcards")}
          sx={{ mb: 2 }}
          className="bg-secondary text-black hover:bg-gray-200"
        >
          Go Back
        </Button>

        <Button
          variant="outlined"
          onClick={() => setOpenTitleEditDialog(true)}
          sx={{ mb: 2 }}
          className="bg-secondary text-black hover:bg-gray-200"
        >
          Edit Title
        </Button>

        {/* New Button to go to Study Flashcards Page */}
        <Button
          variant="contained"
          color="secondary"
          onClick={() => router.push(`/study-flashcards?id=${flashcardSetName}`)}
          sx={{ mb: 2 }}
          className="bg-secondary text-black hover:bg-gray-200"
        >
          Study Flashcards
        </Button>
      </Box>

      <Grid container spacing={3}>
        {flashcards.map((flashcard) => (
          <Grid item xs={12} sm={6} md={4} key={flashcard.id}>
            <Card>
              <CardActionArea
                onClick={() => {
                  setEditFlashcard({ front: flashcard.front, back: flashcard.back });
                  setSelectedFlashcard(flashcard);
                  setOpenEditDialog(true);
                }}
              >
                <CardContent>
                  <Typography variant="h6">{flashcard.front}</Typography>
                  <Typography variant="body2">{flashcard.back}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Flashcard Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add Flashcard</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Front"
            type="text"
            fullWidth
            variant="outlined"
            value={newFlashcard.front}
            onChange={(e) => setNewFlashcard({ ...newFlashcard, front: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Back"
            type="text"
            fullWidth
            variant="outlined"
            value={newFlashcard.back}
            onChange={(e) => setNewFlashcard({ ...newFlashcard, back: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddFlashcard}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Flashcard Dialog */}
      <Dialog open={Boolean(selectedFlashcard)} onClose={() => setSelectedFlashcard(null)}>
        <DialogTitle>Edit Flashcard</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Front"
            type="text"
            fullWidth
            variant="outlined"
            value={editFlashcard.front}
            onChange={(e) => setEditFlashcard({ ...editFlashcard, front: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Back"
            type="text"
            fullWidth
            variant="outlined"
            value={editFlashcard.back}
            onChange={(e) => setEditFlashcard({ ...editFlashcard, back: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedFlashcard(null)}>Cancel</Button>
          <Button onClick={handleEditFlashcard}>Save</Button>
          <Button onClick={() => {
            setOpenDeleteDialog(true);
            setEditFlashcard({ front: "", back: "" });
          }} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Flashcard Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this flashcard?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteFlashcard} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Title Dialog */}
      <Dialog open={openTitleEditDialog} onClose={() => setOpenTitleEditDialog(false)}>
        <DialogTitle>Edit Title</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Title"
            type="text"
            fullWidth
            variant="outlined"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTitleEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditTitle}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
