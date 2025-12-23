import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { List } from "react-window";

const Row = ({ index, style, data }) => {
  const item = data[index];
  return (
    <div
      style={{
        ...style,
        display: "flex",
        alignItems: "center",
        padding: "0 10px",
      }}
    >
      <Link
        to={`/items/${item.id}`}
        style={{ textDecoration: "none", color: "blue" }}
      >
        {item.name} <span style={{ color: "#666" }}>(${item.price})</span>
      </Link>
    </div>
  );
};

function Items() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const LIMIT = 20; // Reasonable limit for pagination

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:4001/api/items?page=${page}&limit=${LIMIT}&q=${encodeURIComponent(
            search
          )}`,
          {
            signal: controller.signal,
          }
        );
        if (!res.ok) throw new Error("Network response was not ok");
        const json = await res.json();
        if (json.data) {
          setItems(json.data);
          setTotal(json.meta.total);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Fetch error:", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    // Debounce search
    const timer = setTimeout(() => {
      fetchData();
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [page, search]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Items</h1>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search items..."
          style={{ padding: "5px", fontSize: "16px", width: "300px" }}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </button>
        <span style={{ margin: "0 10px" }}>
          Page {page} of {totalPages || 1} (Total: {total})
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && items.length === 0 && <p>No items found.</p>}

      {!loading && items.length > 0 && (
        <div style={{ border: "1px solid #ccc", height: "500px" }}>
          <List
            rowCount={items.length}
            rowHeight={40}
            rowComponent={Row}
            rowProps={{ data: items }}
            className="products-list"
            style={{ height: "500px" }}
          />
        </div>
      )}
    </div>
  );
}

export default Items;
