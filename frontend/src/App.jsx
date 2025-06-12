import BookManager from "./BookManager";
import BookList from "./BookList";
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
        <Route path="*" element={<BookList />} />
      </Routes>
    </>
  );
};

export default App;
