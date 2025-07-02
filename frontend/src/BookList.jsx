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
  Rating,
  Skeleton,
  Pagination,
  GlobalStyles,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ShoppingCart as ShoppingCartIcon,
  Search as SearchIcon,
  Logout as LogoutIcon,
  Home as HomeIcon,
  TrackChanges as TrackChangesIcon,
  Info as InfoIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import imageleft from "./assets/bookshelve.jpg";

// ✅ Live Chat Component
const LiveChat = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://embed.tawk.to/6864ef41584668190c259d36/1iv54d64t";
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  return null;
};

const API = "http://localhost:8000";

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [page, setPage] = useState(1);
  const booksPerPage = 8;

  const { cart, addToCart } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get(`${API}/books`);
        setBooks(res.data);
        setLoading(false);
        const cats = [...new Set(res.data.map((b) => b.category || "Other"))];
        setCategories(["All", ...cats]);
      } catch (err) {
        console.error("Failed to fetch books:", err);
      }
    };
    fetchBooks();
  }, []);

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const filteredBooks = books.filter(
    (book) =>
      (selectedCategory === "All" || book.category === selectedCategory) &&
      (book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const paginatedBooks = filteredBooks.slice(
    (page - 1) * booksPerPage,
    page * booksPerPage
  );

  const handleRatingChange = async (bookId, newValue) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API}/ratings`,
        { book_id: bookId, score: Math.round(newValue) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { average_rating, rating_count } = res.data;
      setBooks((prev) =>
        prev.map((b) =>
          b.id === bookId ? { ...b, average_rating, rating_count } : b
        )
      );
    } catch (err) {
      console.error("Rating error:", err);
      alert("Login required to rate books.");
    }
  };

  return (
    <>
      <LiveChat />

      <GlobalStyles
        styles={{
          "@keyframes marquee": {
            "0%": { transform: "translateX(100%)" },
            "100%": { transform: "translateX(-100%)" },
          },
          "@keyframes fadeInUp": {
            from: { opacity: 0, transform: "translateY(10px)" },
            to: { opacity: 1, transform: "translateY(0)" },
          },
        }}
      />

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

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer}>
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

      <Box
        sx={{
          height: 400,
          backgroundImage: `url(${imageleft})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          color: "#fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          px: 2,
          mb: 4,
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(10, 10, 10, 0.6)",
            zIndex: 1,
          },
        }}
      >
        <Box
          sx={{
            textAlign: "center",
            maxWidth: 600,
            position: "relative",
            zIndex: 2,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              color: "#FFF",
              mb: 2,
              textShadow: "0px 2px 6px black",
            }}
          >
            Welcome to Our Book Store
          </Typography>
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "#FFD700", fontWeight: "500" }}
          >
            Explore. Discover. Add to Cart. Track Orders.
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 3,
              fontSize: "1.6rem",
              mb: 2,
            }}
          >
            <span title="Books">📚</span>
            <span title="Shopping Cart">🛒</span>
            <span title="Ratings">⭐</span>
            <span title="Favorites">❤️</span>
            <span title="Bookmarks">🔖</span>
            <span title="Share">📤</span>
            <span title="Delivery">🚚</span>
          </Box>

          <Paper
            elevation={4}
            sx={{ p: 1, borderRadius: "30px", backgroundColor: "#f1f1f1" }}
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
                sx: { borderRadius: "30px", backgroundColor: "#fff" },
              }}
            />
          </Paper>

          <Box
            sx={{
              mt: 2,
              fontSize: "1.2rem",
              fontWeight: "bold",
              color: "#FFD700",
              whiteSpace: "nowrap",
              overflow: "hidden",
              position: "relative",
              width: "100%",
              maxWidth: 600,
              mx: "auto",
              height: "30px",
            }}
          >
            <Box
              component="span"
              sx={{
                position: "absolute",
                animation: "marquee 12s linear infinite",
                display: "inline-block",
                whiteSpace: "nowrap",
              }}
            >
              📚 Thousands of books available · 🛒 Shop now · 🚚 Fast Delivery ·
              ❤️ Save your favorites
            </Box>
          </Box>
        </Box>
      </Box>

      <Container sx={{ pb: 6 }}>
        <Box
          display="flex"
          justifyContent="center"
          mb={3}
          flexWrap="wrap"
          gap={2}
        >
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "contained" : "outlined"}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </Box>

        {loading ? (
          <Grid container spacing={4}>
            {Array.from(new Array(8)).map((_, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rectangular" width="100%" height={350} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={4}>
            {paginatedBooks.map((book) => (
              <Grid item xs={12} sm={6} md={3} key={book.id}>
                <Card
                  sx={{
                    height: 390,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    animation: "fadeInUp 0.5s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="180"
                    image={`${API}/books/${book.id}/image`}
                    alt={book.title}
                  />
                  <CardContent>
                    <Typography variant="h6" noWrap>
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
                      onChange={(e, value) =>
                        handleRatingChange(book.id, value)
                      }
                    />
                    <Typography variant="caption">
                      ({book.rating_count || 0} ratings)
                    </Typography>
                  </CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      px: 2,
                      pb: 2,
                    }}
                  >
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => addToCart(book)}
                    >
                      Add to Cart
                    </Button>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/books/${book.id}/view`)}
                      >
                        <InfoIcon />
                      </IconButton>
                      <IconButton size="small">
                        <FavoriteIcon color="error" />
                      </IconButton>
                      <IconButton size="small">
                        <BookmarkIcon color="primary" />
                      </IconButton>
                      <IconButton size="small">
                        <ShareIcon color="success" />
                      </IconButton>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={Math.ceil(filteredBooks.length / booksPerPage)}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      </Container>
    </>
  );
};

export default BookList;
