// CartPage.jsx
import React from "react";
import { useCart } from "./CartContext"; // Ensure this path is correct
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
} from "@mui/material";

const API = "http://localhost:8000";

const CartPage = () => {
  const { cart, removeFromCart } = useCart();

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Your Cart
      </Typography>
      {cart.length === 0 ? (
        <Typography>No items in cart.</Typography>
      ) : (
        <Grid container spacing={3}>
          {cart.map((book) => (
            <Grid item xs={12} sm={6} md={4} key={book.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={`${API}/books/${book.id}/image`}
                  alt={book.title}
                />
                <CardContent>
                  <Typography variant="h6">{book.title}</Typography>
                  <Typography variant="body2">{book.author}</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {book.description}
                  </Typography>
                  <Typography color="primary">₦{book.price}</Typography>
                  <Button
                    variant="outlined"
                    color="error"
                    sx={{ mt: 1 }}
                    onClick={() => removeFromCart(book.id)}
                  >
                    Remove
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default CartPage;
