import BookManager from "./BookManager";
import BookList from "./BookList";
import BookInfo from "./BookInfo"; // ✅ New
import CartPage from "./CartPage";
import CheckoutPage from "./CheckoutPage";
import Orders from "./Orders";
import OrderTracker from "./OrderTracker";
import PayPage from "./PayPage";
import { Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<BookManager />} />
        <Route path="/books" element={<BookList />} />
        <Route path="/books/:id/view" element={<BookInfo />} />
        <Route path="/books/:id/edit" element={<BookManager />} />
        <Route path="/books/:id/delete" element={<BookManager />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/track" element={<OrderTracker />} />
        <Route path="/pay/:id" element={<PayPage />} />
        <Route path="*" element={<BookList />} />
      </Routes>
    </>
  );
};

export default App;
