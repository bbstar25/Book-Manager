import BookManager from "./BookManager";
import BookList from "./BookList";
import CartPage from "./CartPage";
import CheckoutPage from "./CheckoutPage";
import Orders from "./Orders"; // ✅ import orders page
import OrderTracker from "./OrderTracker"; // ✅ import order tracker page
import { Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<BookManager />} />
        <Route path="/books" element={<BookList />} />
        <Route path="/books/:id" element={<BookList />} />
        <Route path="/books/:id/edit" element={<BookManager />} />
        <Route path="/books/:id/delete" element={<BookManager />} />
        <Route path="/books/:id/view" element={<BookList />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />

        <Route path="/orders" element={<Orders />} />
        <Route path="/track" element={<OrderTracker />} />

        <Route path="*" element={<BookList />} />
      </Routes>
    </>
  );
};

export default App;
