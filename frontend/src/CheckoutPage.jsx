// CheckoutPage.jsx
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

const CheckoutPage = () => {
  const { cart } = useCart();
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.address) {
      alert("Please fill all fields.");
      return;
    }

    // TODO: Send to backend if needed
    console.log("Order placed!", { form, cart });
    alert("✅ Order placed successfully!");
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
