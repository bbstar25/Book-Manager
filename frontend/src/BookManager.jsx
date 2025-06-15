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
  const [description, setDescription] = useState("");
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
      console.error("Login error:", err);
      alert("Login failed. Check your credentials.");
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
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setBooks([]);
    setTitle("");
    setAuthor("");
    setPrice("");
    setDescription("");
    setImage(null);
    setEditId(null);
  };

  const saveBook = async () => {
    if (!title || !author || !price || !description) {
      alert("All fields including description are required.");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    try {
      let res;
      if (editId) {
        res = await axios.put(
          `${API}/books/${editId}`,
          { title, author, price, description },
          { headers }
        );
        setBooks(books.map((b) => (b.id === editId ? res.data : b)));
      } else {
        const form = new FormData();
        form.append("title", title);
        form.append("author", author);
        form.append("price", price);
        form.append("description", description);
        if (image) form.append("image", image);

        res = await axios.post(`${API}/books`, form, {
          headers: {
            ...headers,
            "Content-Type": "multipart/form-data",
          },
        });
        setBooks([...books, res.data]);
      }

      setTitle("");
      setAuthor("");
      setPrice("");
      setDescription("");
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
              <Typography variant="h5" sx={{ mt: 2 }}>
                Login
              </Typography>
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mt: 2 }}
              />
              <Button
                fullWidth
                sx={{ mt: 2 }}
                onClick={login}
                variant="contained"
              >
                Login
              </Button>
            </>
          ) : (
            <>
              <Typography variant="h5" sx={{ mt: 2 }}>
                Register
              </Typography>
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                fullWidth
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{ mt: 2 }}
              />
              <Button
                fullWidth
                sx={{ mt: 2 }}
                onClick={register}
                variant="contained"
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
            <Button component={Link} to="/books" variant="outlined">
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
              label="Title"
              margin="normal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              fullWidth
              label="Author"
              margin="normal"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
            <TextField
              fullWidth
              label="Price"
              type="number"
              margin="normal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <TextField
              fullWidth
              label="Description"
              margin="normal"
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              fullWidth
              sx={{ mt: 2 }}
              onClick={saveBook}
            >
              {editId ? "Update Book" : "Add Book"}
            </Button>
          </Paper>

          <List>
            {books.map((book) => (
              <ListItem key={book.id} divider alignItems="flex-start">
                <Box sx={{ display: "flex", width: "100%" }}>
                  <img
                    src={`${API}/books/${book.id}/image`}
                    alt="Book"
                    style={{ width: 60, height: "auto", marginRight: 10 }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <ListItemText
                      primary={`${book.title} by ${book.author}`}
                      secondary={
                        <>
                          <Typography variant="body2">₦{book.price}</Typography>
                          <Typography
                            variant="body2"
                            sx={{ whiteSpace: "pre-line" }}
                          >
                            {book.description}
                          </Typography>
                        </>
                      }
                    />
                  </Box>
                  <Box>
                    <IconButton
                      onClick={() => {
                        setTitle(book.title);
                        setAuthor(book.author);
                        setPrice(book.price);
                        setDescription(book.description);
                        setEditId(book.id);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => deleteBook(book.id)}>
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Container>
  );
};

export default BookManager;
