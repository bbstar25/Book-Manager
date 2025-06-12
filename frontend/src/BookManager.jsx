import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Container,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Box,
  Tabs,
  Tab,
} from "@mui/material";
import { Edit, Delete, Logout } from "@mui/icons-material";
import { Link } from "react-router-dom";

const API = "http://localhost:8000";

const BookManager = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [editId, setEditId] = useState(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activeTab, setActiveTab] = useState("login");

  const fetchBooks = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/books`);
      setBooks(res.data);
    } catch (err) {
      console.error("Error fetching books:", err);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const login = async () => {
    const form = new FormData();
    form.append("username", username);
    form.append("password", password);
    try {
      const res = await axios.post(`${API}/token`, form);
      const accessToken = res.data.access_token;
      localStorage.setItem("token", accessToken);
      setToken(accessToken);
      setUsername("");
      setPassword("");
    } catch (err) {
      alert("Login failed. Check your credentials.");
      console.error("Login error:", err);
    }
  };

  const register = async () => {
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    try {
      await axios.post(`${API}/register`, {
        username,
        email,
        password,
      });
      alert("Registration successful! Please login.");
      setActiveTab("login");
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      alert(
        "Registration failed: " +
          (err.response?.data?.detail || "Please try again.")
      );
      console.error("Registration error:", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setBooks([]);
    setTitle("");
    setAuthor("");
    setPrice("");
    setImage(null);
    setEditId(null);
  };

  const saveBook = async () => {
    if (!title || !author || !price) {
      alert("Title, author, and price are required.");
      return;
    }

    const form = new FormData();
    form.append("title", title);
    form.append("author", author);
    form.append("price", price);
    if (image) form.append("image", image);

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      let res;
      if (editId) {
        // Updating book (image won't update here)
        res = await axios.put(
          `${API}/books/${editId}`,
          {
            title,
            author,
            price,
          },
          { headers }
        );
        setBooks(books.map((b) => (b.id === editId ? res.data : b)));
      } else {
        // Creating new book
        res = await axios.post(`${API}/books`, form, {
          headers: {
            ...headers,
            "Content-Type": "multipart/form-data",
          },
        });
        setBooks([...books, res.data]);
      }

      // Reset form
      setTitle("");
      setAuthor("");
      setPrice("");
      setImage(null);
      setEditId(null);
    } catch (err) {
      console.error("Error saving book:", err);
      alert("Failed to save book. You must be logged in.");
    }
  };

  const deleteBook = async (id) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      await axios.delete(`${API}/books/${id}`, { headers });
      setBooks(books.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Error deleting book:", err);
      alert("Failed to delete book.");
    }
  };

  return (
    <Container maxWidth="sm">
      {!token ? (
        <Paper elevation={3} sx={{ p: 4, mt: 10 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            centered
          >
            <Tab value="login" label="Login" />
            <Tab value="register" label="Register" />
          </Tabs>

          {activeTab === "login" ? (
            <>
              <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                Login
              </Typography>
              <TextField
                fullWidth
                margin="normal"
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={login}
                sx={{ mt: 2 }}
              >
                Login
              </Button>
            </>
          ) : (
            <>
              <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                Register
              </Typography>
              <TextField
                fullWidth
                margin="normal"
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={register}
                sx={{ mt: 2 }}
              >
                Register
              </Button>
            </>
          )}
        </Paper>
      ) : (
        <Box sx={{ mt: 6 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Button
              component={Link}
              to="/books"
              variant="outlined"
              sx={{ mr: 2 }}
            >
              View Store
            </Button>
            <Typography variant="h4">Book Manager</Typography>
            <Button onClick={logout} variant="outlined" startIcon={<Logout />}>
              Logout
            </Button>
          </Box>

          <Paper sx={{ p: 2, mb: 2 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <Button
              variant="contained"
              component="label"
              fullWidth
              sx={{ mt: 2 }}
            >
              Upload Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={saveBook}
              fullWidth
              sx={{ mt: 2 }}
            >
              {editId ? "Update Book" : "Add Book"}
            </Button>
          </Paper>

          <List>
            {books.map((book) => (
              <ListItem key={book.id} divider>
                <ListItemText
                  primary={`${book.title} by ${book.author}`}
                  secondary={`₦${book.price}`}
                />
                <img
                  src={`${API}/books/${book.id}/image`}
                  alt="Book"
                  style={{ width: 60, height: "auto", marginRight: 10 }}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => {
                      setTitle(book.title);
                      setAuthor(book.author);
                      setPrice(book.price);
                      setEditId(book.id);
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton edge="end" onClick={() => deleteBook(book.id)}>
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Container>
  );
};

export default BookManager;
