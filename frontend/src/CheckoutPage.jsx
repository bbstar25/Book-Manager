import React, { useState } from "react";
import { useCart } from "./CartContext";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000";

const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.address) {
      alert("Please fill all fields.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to place an order.");
      return;
    }

    const orderData = {
      items: cart.map((item) => ({
        book_id: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
      })),
    };

    try {
      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) {
        throw new Error("Failed to place order");
      }

      const data = await res.json();
      alert("✅ Order placed successfully!");
      clearCart();
      navigate(`/track?id=${data.id}`);
    } catch (err) {
      console.error("Order failed:", err);
      alert("❌ Failed to place order. Try again.");
    }
  };

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>

      <Grid container spacing={4}>
        {/* Form */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6">Shipping Information</Typography>
          <TextField
            label="Full Name"
            name="name"
            fullWidth
            margin="normal"
            value={form.name}
            onChange={handleChange}
          />
          <TextField
            label="Email"
            name="email"
            fullWidth
            margin="normal"
            value={form.email}
            onChange={handleChange}
          />
          <TextField
            label="Address"
            name="address"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={form.address}
            onChange={handleChange}
          />
          <Button
            variant="contained"
            color="success"
            onClick={handleSubmit}
            sx={{ mt: 2 }}
          >
            Place Order
          </Button>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6">Order Summary</Typography>
          <Card variant="outlined">
            <CardContent>
              {cart.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography>
                    {item.title} x {item.quantity}
                  </Typography>
                  <Typography>₦{item.price * item.quantity}</Typography>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Total: ₦{totalPrice}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CheckoutPage;
