// CartPage.jsx
import React from "react";
import { useCart } from "./CartContext";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  IconButton,
  Divider,
} from "@mui/material";
import { Add, Remove, Delete } from "@mui/icons-material";
import { useNavigate } from "react-router-dom"; // For navigating to checkout

const API = "http://localhost:8000";

const CartPage = () => {
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity } =
    useCart();
  const navigate = useNavigate();

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Shopping Cart
      </Typography>

      {cart.length === 0 ? (
        <Typography variant="h6" sx={{ mt: 4 }}>
          Your cart is empty.
        </Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {cart.map((item) => (
              <Grid item xs={12} key={item.id}>
                <Card sx={{ display: "flex", alignItems: "center", p: 2 }}>
                  <CardMedia
                    component="img"
                    image={`${API}/books/${item.id}/image`}
                    alt={item.title}
                    sx={{
                      width: 150,
                      height: 150,
                      objectFit: "cover",
                      mr: 2,
                      borderRadius: 1,
                    }}
                  />

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">{item.title}</Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {item.author}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography variant="body1" sx={{ mr: 1 }}>
                        Quantity:
                      </Typography>
                      <IconButton onClick={() => decreaseQuantity(item.id)}>
                        <Remove />
                      </IconButton>
                      <Typography>{item.quantity}</Typography>
                      <IconButton onClick={() => increaseQuantity(item.id)}>
                        <Add />
                      </IconButton>
                    </Box>

                    <Typography variant="h6" color="primary">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </Typography>

                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => removeFromCart(item.id)}
                      startIcon={<Delete />}
                      sx={{ mt: 1 }}
                    >
                      Remove
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h5">
              Total: ₦{totalPrice.toLocaleString()}
            </Typography>

            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/checkout")}
              sx={{ px: 4, py: 1 }}
            >
              Proceed to Checkout
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
};

export default CartPage;
