import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Container,
  Button,
  Box,
  TextField,
  Paper,
  InputAdornment,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import Rating from "@mui/material/Rating";
import { useCart } from "./CartContext";

const API = "http://localhost:8000";

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { cart, addToCart } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API}/books`)
      .then((res) => setBooks(res.data))
      .catch((err) => console.error("Failed to fetch books:", err));
  }, []);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRatingChange = async (bookId, newValue) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API}/ratings`,
        { book_id: bookId, score: newValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Optionally update book ratings after submission
      setBooks((prevBooks) =>
        prevBooks.map((book) =>
          book.id === bookId ? { ...book, average_rating: newValue } : book
        )
      );
    } catch (err) {
      console.error("Failed to submit rating:", err);
      alert("Login required to rate books.");
    }
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
            Book Store
          </Typography>
          <IconButton color="inherit" onClick={() => navigate("/cart")}>
            <Badge badgeContent={cart.length} color="secondary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
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
              <ListItemText primary="Storefront" />
            </ListItem>
            <ListItem button component={Link} to="/cart">
              <ListItemIcon>
                <ShoppingCartIcon />
              </ListItemIcon>
              <ListItemText primary={`View Cart (${cart.length})`} />
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

      {/* Banner */}
      <Box
        sx={{
          height: 350,
          backgroundImage:
            "url('https://source.unsplash.com/1600x900/?books,library')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          px: 2,
          mb: 4,
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(to bottom right, rgba(0,0,0,0.6), rgba(0,0,0,0.3))",
            zIndex: 1,
          },
        }}
      >
        <Box sx={{ zIndex: 2 }}>
          <Typography variant="h3" sx={{ fontWeight: "bold", mb: 2 }}>
            Welcome to Our Book Store
          </Typography>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Explore. Discover. Add to Cart.
          </Typography>
          <Paper
            elevation={4}
            sx={{
              p: 1,
              borderRadius: "30px",
              width: "100%",
              maxWidth: 600,
              mx: "auto",
              backgroundColor: "#ffffffcc",
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: "30px",
                  backgroundColor: "#f9f9f9",
                },
              }}
            />
          </Paper>
        </Box>
      </Box>

      {/* Book Grid */}
      <Container sx={{ mt: 2, pb: 4 }}>
        <Grid container spacing={4}>
          {filteredBooks.map((book) => (
            <Grid item xs={12} sm={6} md={4} key={book.id}>
              <Card
                sx={{
                  height: 400,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={`${API}/books/${book.id}/image`}
                  alt={book.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom noWrap>
                    {book.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {book.author}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ₦{book.price}
                  </Typography>
                  <Rating
                    name={`rating-${book.id}`}
                    value={book.average_rating || 0}
                    precision={0.5}
                    onChange={(event, newValue) =>
                      handleRatingChange(book.id, newValue)
                    }
                  />
                </CardContent>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => addToCart(book)}
                  sx={{ m: 2 }}
                >
                  Add to Cart
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
};

export default BookList;
