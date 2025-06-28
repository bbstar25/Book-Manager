import React, { useState, useEffect, useCallback } from "react";
import { useCart } from "./CartContext";
import axios from "axios";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  CardMedia,
  Button,
  Box,
  IconButton,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
} from "@mui/material";
import {
  Add,
  Remove,
  Delete,
  Home,
  ShoppingCart,
  MenuBook,
  Info,
  Favorite,
  Print,
  LocalOffer,
  Refresh,
  LocalShipping,
  Loyalty,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000";
const drawerWidth = 200;

const generateCouponCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `NEW-${code}`;
};

const EnhancedCartPage = () => {
  const { cart, setCart, removeFromCart, increaseQuantity, decreaseQuantity } =
    useCart();
  const navigate = useNavigate();

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [selectedBook, setSelectedBook] = useState(null);
  const [generatedCoupon, setGeneratedCoupon] = useState("");
  const [prevCartLength, setPrevCartLength] = useState(0);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.075;
  const total = subtotal + tax - discount;

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

  const fetchCart = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCart(res.data);

      if (res.data.length > prevCartLength) {
        const newCode = generateCouponCode();
        setGeneratedCoupon(newCode);
        setCoupon(newCode);
        setDiscount(subtotal * 0.1);
        setSnackbar({
          open: true,
          message: `🎉 Coupon Applied: ${newCode}`,
          severity: "success",
        });
      }

      setPrevCartLength(res.data.length);
    } catch (err) {
      console.error("Error fetching cart:", err);
      setSnackbar({
        open: true,
        message: "Failed to load cart",
        severity: "error",
      });
    }
  }, [setCart, prevCartLength, subtotal]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (coupon === generatedCoupon) {
      setDiscount(subtotal * 0.1);
    }
  }, [coupon, generatedCoupon, subtotal]);

  const applyCoupon = () => {
    const validGenerated = generatedCoupon && coupon === generatedCoupon;
    if (coupon.toLowerCase() === "save10" || validGenerated) {
      setDiscount(subtotal * 0.1);
      setSnackbar({
        open: true,
        message: "Coupon applied!",
        severity: "success",
      });
    } else {
      setSnackbar({
        open: true,
        message: "Invalid coupon code",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Box sx={{ display: "flex" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#f5f5f5",
          },
        }}
      >
        <Toolbar />
        <List>
          <ListItem button onClick={() => navigate("/")}>
            {" "}
            <ListItemIcon>
              <Home />
            </ListItemIcon>{" "}
            <ListItemText primary="Home" />{" "}
          </ListItem>
          <ListItem button onClick={() => navigate("/books")}>
            {" "}
            <ListItemIcon>
              <MenuBook />
            </ListItemIcon>{" "}
            <ListItemText primary="Books" />{" "}
          </ListItem>
          <ListItem button onClick={() => navigate("/cart")}>
            {" "}
            <ListItemIcon>
              <ShoppingCart />
            </ListItemIcon>{" "}
            <ListItemText primary="Cart" />{" "}
          </ListItem>
        </List>
      </Drawer>

      <Box sx={{ flexGrow: 1 }}>
        <AppBar
          position="fixed"
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Enhanced Shopping Cart
            </Typography>
            <Tooltip title="Refresh Cart">
              <IconButton color="inherit" onClick={fetchCart}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
        <Toolbar />

        <Container sx={{ mt: 4, mb: 4 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <TextField
              label="Coupon Code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              sx={{ mr: 2 }}
            />
            <Button
              variant="outlined"
              onClick={applyCoupon}
              startIcon={<LocalOffer />}
            >
              Apply
            </Button>
          </Box>

          {cart.length === 0 ? (
            <Typography variant="h6" align="center" sx={{ mt: 4 }}>
              Your cart is empty.
            </Typography>
          ) : (
            <>
              <Box
                display="flex"
                flexDirection="column"
                gap={3}
                alignItems="center"
              >
                {cart.map((item) => (
                  <Card
                    key={item.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 2,
                      width: "100%",
                      maxWidth: 600,
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={`${API}/books/${item.id}/image`}
                      alt={item.title}
                      sx={{
                        width: 100,
                        height: 100,
                        objectFit: "cover",
                        borderRadius: 1,
                        mr: 2,
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6">{item.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.author}
                      </Typography>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Typography sx={{ mr: 1 }}>Qty:</Typography>
                        <IconButton onClick={() => decreaseQuantity(item.id)}>
                          <Remove />
                        </IconButton>
                        <Typography>{item.quantity}</Typography>
                        <IconButton onClick={() => increaseQuantity(item.id)}>
                          <Add />
                        </IconButton>
                      </Box>
                      <Typography variant="body1" color="primary">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </Typography>
                      <Box mt={1}>
                        <Tooltip title="Remove from cart">
                          <IconButton
                            onClick={() => removeFromCart(item.id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Book Details">
                          <IconButton onClick={() => setSelectedBook(item)}>
                            <Info />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Save for later">
                          <IconButton>
                            <Favorite />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Card>
                ))}
              </Box>

              <Divider sx={{ my: 4 }} />

              <Box maxWidth={600} mx="auto">
                <Typography>Subtotal: ₦{subtotal.toLocaleString()}</Typography>
                <Typography>Tax (7.5%): ₦{tax.toLocaleString()}</Typography>
                <Typography>Discount: ₦{discount.toLocaleString()}</Typography>
                <Typography variant="h6">
                  Total: ₦{total.toLocaleString()}
                </Typography>
                <Typography
                  color="text.secondary"
                  sx={{ display: "flex", alignItems: "center", mt: 1 }}
                >
                  <LocalShipping sx={{ mr: 1 }} fontSize="small" /> Estimated
                  Delivery: {estimatedDelivery.toDateString()}
                </Typography>
                <Box display="flex" justifyContent="space-between" mt={2}>
                  <Button onClick={() => window.print()} startIcon={<Print />}>
                    Print
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => navigate("/checkout")}
                    startIcon={<Loyalty />}
                  >
                    Checkout
                  </Button>
                </Box>

                {generatedCoupon && (
                  <Box mt={2} textAlign="left">
                    <Typography
                      variant="body2"
                      color="primary"
                      fontWeight="bold"
                    >
                      🎁 Your Coupon Code:{" "}
                      <span style={{ color: "#d32f2f" }}>
                        {generatedCoupon}
                      </span>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Use this at checkout for a special discount.
                    </Typography>
                  </Box>
                )}
              </Box>
            </>
          )}
        </Container>

        <Dialog open={!!selectedBook} onClose={() => setSelectedBook(null)}>
          <DialogTitle>{selectedBook?.title}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {selectedBook?.description || "No description available."}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedBook(null)}>Close</Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default EnhancedCartPage;
