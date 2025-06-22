import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import { useSearchParams, useNavigate, Link } from "react-router-dom";

const API = "http://localhost:8000";
const steps = ["placed", "processed", "shipped", "delivered"];

const OrderTracker = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("id");
  const [order, setOrder] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  // Polling effect for live updates every 30 seconds
  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = () => {
      axios
        .get(`${API}/orders/${orderId}`)
        .then((res) => {
          const fetchedOrder = res.data;
          setOrder(fetchedOrder);

          const stepIndex = steps.findIndex(
            (s) => s.toLowerCase() === fetchedOrder.status.toLowerCase()
          );
          setActiveStep(stepIndex !== -1 ? stepIndex : 0);
        })
        .catch((err) => {
          console.error("Order not found", err);
          setOrder(null);
        });
    };

    fetchOrder(); // Initial load
    const interval = setInterval(fetchOrder, 30000); // Poll every 30s
    return () => clearInterval(interval); // Cleanup on unmount
  }, [orderId]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <>
      {/* Navbar */}
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={toggleDrawer}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Order Tracker
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer}
          onKeyDown={toggleDrawer}
        >
          <List>
            <ListItem button component={Link} to="/books">
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>
            <ListItem button component={Link} to="/orders">
              <ListItemIcon>
                <TrackChangesIcon />
              </ListItemIcon>
              <ListItemText primary="My Orders" />
            </ListItem>
            <ListItem button onClick={logout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main Tracker */}
      <Box
        sx={{
          mt: 6,
          px: 2,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Paper elevation={4} sx={{ p: 4, width: "100%", maxWidth: 700 }}>
          <Typography variant="h5" gutterBottom>
            Track Order: <span style={{ color: "#3f51b5" }}>{orderId}</span>
          </Typography>

          {order ? (
            <>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label.toUpperCase()}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Typography variant="body1" sx={{ mt: 3 }}>
                📦 <strong>Status:</strong>{" "}
                <span style={{ textTransform: "uppercase", color: "#2196f3" }}>
                  {order.status}
                </span>
              </Typography>

              <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
                Estimated Delivery:{" "}
                {order.status === "delivered"
                  ? "Delivered ✅"
                  : "Within 3 - 5 working days"}
              </Typography>
            </>
          ) : (
            <Typography color="error" sx={{ mt: 2 }}>
              Order not found or still loading.
            </Typography>
          )}
        </Paper>
      </Box>
    </>
  );
};

export default OrderTracker;
