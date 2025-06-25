// EnhancedCartPage.jsx
import React, { useState } from "react";
import { useCart } from "./CartContext";
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
  CircularProgress,
  Snackbar,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
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
  Discount,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000";
const drawerWidth = 200;

const EnhancedCartPage = () => {
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity } =
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

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.075;
  const total = subtotal + tax - discount;

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

  const applyCoupon = () => {
    if (coupon.toLowerCase() === "save10") {
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
      {/* Sidebar */}
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
            <ListItemIcon>
              <Home />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
          <ListItem button onClick={() => navigate("/books")}>
            <ListItemIcon>
              <MenuBook />
            </ListItemIcon>
            <ListItemText primary="Books" />
          </ListItem>
          <ListItem button onClick={() => navigate("/cart")}>
            <ListItemIcon>
              <ShoppingCart />
            </ListItemIcon>
            <ListItemText primary="Cart" />
          </ListItem>
        </List>
      </Drawer>

      <Box sx={{ flexGrow: 1 }}>
        <AppBar
          position="fixed"
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <Toolbar>
            <Typography variant="h6">Enhanced Shopping Cart</Typography>
          </Toolbar>
        </AppBar>
        <Toolbar />

        <Container sx={{ mt: 4, mb: 4 }}>
          <TextField
            label="Coupon Code"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            sx={{ mb: 2, mr: 2 }}
          />
          <Button
            variant="outlined"
            onClick={applyCoupon}
            startIcon={<Discount />}
          >
            Apply
          </Button>

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
                        <Button
                          onClick={() => removeFromCart(item.id)}
                          startIcon={<Delete />}
                          color="error"
                          variant="outlined"
                          size="small"
                        >
                          Remove
                        </Button>
                        <Button
                          onClick={() => setSelectedBook(item)}
                          startIcon={<Info />}
                          size="small"
                          sx={{ ml: 1 }}
                        >
                          Details
                        </Button>
                        <Button
                          startIcon={<Favorite />}
                          size="small"
                          sx={{ ml: 1 }}
                        >
                          Save
                        </Button>
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
                <Typography color="text.secondary">
                  Estimated Delivery: {estimatedDelivery.toDateString()}
                </Typography>

                <Box display="flex" justifyContent="space-between" mt={2}>
                  <Button onClick={() => window.print()} startIcon={<Print />}>
                    Print Cart
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => navigate("/checkout")}
                  >
                    Checkout
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </Container>

        {/* Book Detail Modal */}
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

        {/* Snackbar */}
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
