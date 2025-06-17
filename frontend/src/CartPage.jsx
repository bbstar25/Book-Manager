// CartPage.jsx
import React from "react";
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
} from "@mui/material";
import {
  Add,
  Remove,
  Delete,
  Home,
  ShoppingCart,
  MenuBook,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000";
const drawerWidth = 200;

const CartPage = () => {
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity } =
    useCart();
  const navigate = useNavigate();

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

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
            {" "}
            <ListItemIcon>
              <Home />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
          <ListItem button onClick={() => navigate("/books")}>
            {" "}
            <ListItemIcon>
              <MenuBook />
            </ListItemIcon>
            <ListItemText primary="Books" />
          </ListItem>
          <ListItem button onClick={() => navigate("/cart")}>
            {" "}
            <ListItemIcon>
              <ShoppingCart />
            </ListItemIcon>
            <ListItemText primary="Cart" />
          </ListItem>
        </List>
      </Drawer>

      {/* Main content */}
      <Box sx={{ flexGrow: 1 }}>
        {/* Top Navbar */}
        <AppBar
          position="fixed"
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              Shopping Cart
            </Typography>
          </Toolbar>
        </AppBar>
        <Toolbar /> {/* spacer */}
        <Container sx={{ mt: 4, mb: 4 }}>
          {cart.length === 0 ? (
            <Typography variant="h6" sx={{ mt: 4 }}>
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
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        {item.author}
                      </Typography>

                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
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
                ))}
              </Box>

              <Divider sx={{ my: 4 }} />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  maxWidth: 600,
                  mx: "auto",
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
      </Box>
    </Box>
  );
};

export default CartPage;
