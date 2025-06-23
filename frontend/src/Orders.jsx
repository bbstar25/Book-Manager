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
  List as MUIList,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import DeleteIcon from "@mui/icons-material/Delete";

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

  const handleDeleteOrder = async (orderId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${API}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Only admin can delete order");
    }
  };

  const user = JSON.parse(localStorage.getItem("user"));

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
          <MUIList>
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
          </MUIList>
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
              sx={{
                mb: 4,
                borderRadius: 4,
                boxShadow: 5,
                p: 2,
                backgroundColor: "#ffffff",
                borderLeft: "6px solid #1976d2",
              }}
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
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                      📦 Order #{order.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      🕒 Placed on:{" "}
                      {new Date(order.created_at).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      🧾 Items: {order.items.length}
                    </Typography>
                  </Box>
                  <Box>
                    <Chip
                      label={`Status: ${order.status.toUpperCase()}`}
                      color={
                        order.status === "pending"
                          ? "warning"
                          : order.status === "processed"
                            ? "info"
                            : order.status === "shipped"
                              ? "primary"
                              : "success"
                      }
                      sx={{ fontWeight: "bold", mb: 1 }}
                    />
                    {user?.role === "admin" && (
                      <IconButton
                        color="error"
                        title="Delete Order"
                        onClick={() => handleDeleteOrder(order.id)}
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  📚 Ordered Items:
                </Typography>
                <List dense>
                  {order.items.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={item.title}
                        secondary={`₦${item.price} x ${item.quantity}`}
                      />
                    </ListItem>
                  ))}
                </List>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<TrackChangesIcon />}
                    onClick={() => navigate(`/track?id=${order.id}`)}
                  >
                    Track Order
                  </Button>
                  <Box sx={{ fontSize: "1.4rem", display: "flex", gap: 2 }}>
                    <span title="Delivery">🚚</span>
                    <span title="Confirmed">✅</span>
                    <span title="Payment">💳</span>
                    <span title="Timeline">📈</span>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Box>
  );
};

export default Orders;
