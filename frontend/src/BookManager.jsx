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
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const API = "http://localhost:8000";

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        width: 200,
        height: "100vh",
        backgroundColor: "#f5f5f5",
        p: 2,
        boxShadow: 3,
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      <Typography variant="h6" sx={{ mb: 4 }}>
        Admin Menu
      </Typography>

      <Button
        fullWidth
        variant="outlined"
        sx={{ mb: 2 }}
        onClick={() => navigate("/books")}
      >
        View Store
      </Button>

      <Button
        fullWidth
        variant="outlined"
        sx={{ mb: 2 }}
        onClick={() => navigate("/orders")}
      >
        View Orders
      </Button>

      <Button
        fullWidth
        variant="contained"
        color="error"
        startIcon={<Logout />}
        onClick={onLogout}
      >
        Logout
      </Button>
    </Box>
  );
};

const BookManager = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [pdf, setPdf] = useState(null);
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activeTab, setActiveTab] = useState("login");

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken("");
    navigate("/");
  }, [navigate]);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const role = decoded?.role;
        const expiry = decoded?.exp;

        if (Date.now() >= expiry * 1000) {
          logout();
        } else if (role !== "admin") {
          navigate("/books");
        }
      } catch (err) {
        console.error("Invalid token:", err);
        logout();
      }
    }
  }, [token, navigate, logout]);

  const fetchBooks = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/books`);
      setBooks(res.data);
    } catch (err) {
      console.error("Error fetching books:", err);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchBooks();
    }
  }, [fetchBooks, token]);

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
      console.error("Login failed:", err);
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
        if (pdf) form.append("pdf", pdf);

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
      setPdf(null);
      setEditId(null);
    } catch (err) {
      console.error("Failed to save book:", err);
      alert("Failed to save book. You must be logged in.");
    }
  };

  const deleteBook = async (id) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      await axios.delete(`${API}/books/${id}`, { headers });
      setBooks(books.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Failed to delete book:", err);
      alert("Failed to delete book.");
    }
  };

  return (
    <Container maxWidth="lg">
      {!token ? (
        <Box display="flex" justifyContent="center" mt={10}>
          <Paper elevation={3} sx={{ p: 4, width: 400 }}>
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
        </Box>
      ) : (
        <Box sx={{ display: "flex", mt: 6 }}>
          <Sidebar onLogout={logout} />
          <Box sx={{ ml: 25, flexGrow: 1 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>
              Book Manager
            </Typography>

            <Box sx={{ display: "flex", gap: 4 }}>
              <Paper sx={{ p: 2, mb: 2, width: 400 }}>
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
                  component="label"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Upload Book PDF
                  <input
                    type="file"
                    hidden
                    accept="application/pdf"
                    onChange={(e) => setPdf(e.target.files[0])}
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

              <Box sx={{ flexGrow: 1 }}>
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
                                <Typography variant="body2">
                                  ₦{book.price}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ whiteSpace: "pre-line" }}
                                >
                                  {book.description}
                                </Typography>
                              </>
                            }
                          />
                          {book.has_pdf && (
                            <Button
                              size="small"
                              href={`${API}/books/${book.id}/pdf`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Download PDF
                            </Button>
                          )}
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
            </Box>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default BookManager;
