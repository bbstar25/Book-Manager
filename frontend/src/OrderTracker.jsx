// src/OrderTracker.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  Paper,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";

const API = "http://localhost:8000";

const steps = ["placed", "processed", "shipped", "delivered"];

const OrderTracker = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("id");

  const [order, setOrder] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!orderId) return;

    axios
      .get(`${API}/orders/${orderId}`)
      .then((res) => {
        const order = res.data;
        setOrder(order);

        const stepIndex = steps.findIndex(
          (s) => s.toLowerCase() === order.status.toLowerCase()
        );
        setActiveStep(stepIndex !== -1 ? stepIndex : 0);
      })
      .catch((err) => {
        console.error("Order not found", err);
        setOrder(null);
      });
  }, [orderId]);

  return (
    <Box sx={{ mt: 4, px: 2 }}>
      <Paper sx={{ p: 4, maxWidth: 600, margin: "auto" }}>
        <Typography variant="h5" gutterBottom>
          Track Order: {orderId}
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
            <Typography variant="body1" sx={{ mt: 2 }}>
              Current Status: <strong>{order.status.toUpperCase()}</strong>
            </Typography>
          </>
        ) : (
          <Typography color="error" sx={{ mt: 2 }}>
            Order not found or still loading.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default OrderTracker;
