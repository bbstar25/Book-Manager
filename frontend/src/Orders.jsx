import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Button,
  Box,
  IconButton,
  Drawer,
  ListItemIcon,
  Toolbar,
  AppBar,
  CssBaseline,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";

const API = "http://localhost:8000";

const drawerWidth = 240;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setOrders(res.data))
      .catch((err) => {
        console.error("Failed to fetch orders", err);
        setOrders([]);
      });
  }, []);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            My Orders
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            <ListItem button onClick={() => navigate("/books")}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Store" />
            </ListItem>
            <ListItem button onClick={() => navigate("/orders")}>
              <ListItemIcon>
                <ShoppingCartIcon />
              </ListItemIcon>
              <ListItemText primary="My Orders" />
            </ListItem>
            <ListItem button onClick={() => navigate("/")}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: "#f4f6f8", p: 3, minHeight: "100vh" }}
      >
        <Toolbar />
        <Typography variant="h4" gutterBottom>
          My Orders
        </Typography>

        {orders.length === 0 ? (
          <Typography>No orders yet.</Typography>
        ) : (
          orders.map((order) => (
            <Card
              key={order.id}
              sx={{ mb: 3, borderRadius: 3, boxShadow: 3, p: 2 }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Order #{order.id}
                  </Typography>
                  <Chip
                    label={order.status.toUpperCase()}
                    color={
                      order.status === "pending"
                        ? "warning"
                        : order.status === "processed"
                          ? "info"
                          : order.status === "shipped"
                            ? "primary"
                            : "success"
                    }
                    sx={{ ml: 2 }}
                  />
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Placed on: {new Date(order.created_at).toLocaleString()}
                </Typography>

                <List sx={{ mt: 2 }}>
                  {order.items.map((item, index) => (
                    <div key={index}>
                      <ListItem disablePadding>
                        <ListItemText
                          primary={item.title}
                          secondary={`₦${item.price} x ${item.quantity}`}
                        />
                      </ListItem>
                      {index < order.items.length - 1 && <Divider />}
                    </div>
                  ))}
                </List>

                <Button
                  variant="outlined"
                  startIcon={<TrackChangesIcon />}
                  onClick={() => navigate(`/track?id=${order.id}`)}
                  sx={{ mt: 2 }}
                >
                  Track Order
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Box>
  );
};

export default Orders;
