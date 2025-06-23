import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Tooltip,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { useParams } from "react-router-dom";

const API = "http://localhost:8000";

const BookInfo = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [hasAccess, setHasAccess] = useState(false); // 🔒 access state

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Fetch book info
    axios
      .get(`${API}/books`)
      .then((res) => {
        const found = res.data.find((b) => b.id.toString() === id);
        setBook(found);
      })
      .catch((err) => console.error("Failed to fetch book info", err));

    // Check access (simulate: user has paid for this book)
    axios
      .get(`${API}/books/${id}/access`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setHasAccess(res.data.has_access))
      .catch((err) => {
        console.warn("Access check failed", err);
        setHasAccess(false);
      });
  }, [id]);

  if (!book) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Loading book information...</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Card
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
        }}
      >
        <CardMedia
          component="img"
          sx={{ width: 300 }}
          image={`${API}/books/${book.id}/image`}
          alt={book.title}
        />
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {book.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            By {book.author}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {book.description}
          </Typography>
          <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
            ₦{book.price}
          </Typography>

          {book.has_pdf && (
            <Tooltip
              title={
                hasAccess
                  ? "Click to download"
                  : "You must pay to download this book"
              }
            >
              <span>
                <Button
                  variant="contained"
                  color={hasAccess ? "secondary" : "inherit"}
                  href={hasAccess ? `${API}/books/${book.id}/pdf` : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  disabled={!hasAccess}
                  startIcon={hasAccess ? <LockOpenIcon /> : <LockIcon />}
                >
                  {hasAccess ? "Download PDF" : "Locked PDF"}
                </Button>
              </span>
            </Tooltip>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default BookInfo;
