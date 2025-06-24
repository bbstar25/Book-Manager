import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  CircularProgress,
  Box,
} from "@mui/material";

const API = "http://localhost:8000";

const PayPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get(`${API}/books/${id}`)
      .then((res) => setBook(res.data))
      .catch((err) => {
        console.error("Failed to load book", err);
        alert("Book not found");
        navigate("/books");
      });
  }, [id, navigate]);

  const handlePayment = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        `${API}/pay/${id}`, // Send book_id as path param
        null, // No body required
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Payment successful!");
      navigate(`/books/${id}`);
    } catch (err) {
      console.error("Payment failed", err);
      alert("Payment failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!book) return <Typography>Loading book info...</Typography>;

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Pay for "{book.title}"
      </Typography>
      <Typography variant="h6">Amount: ₦{book.price}</Typography>
      <Box sx={{ mt: 3 }}>
        <Button
          variant="contained"
          color="success"
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Pay Now"}
        </Button>
      </Box>
    </Container>
  );
};

export default PayPage;
