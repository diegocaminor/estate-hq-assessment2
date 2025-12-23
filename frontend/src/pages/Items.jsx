import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { List } from "react-window";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

const Row = ({ index, style, data }) => {
  const item = data[index];
  return (
    <div
      style={style}
      className="flex items-center px-4 hover:bg-gray-100 transition-colors border-b"
    >
      <Link
        to={`/items/${item.id}`}
        className="text-blue-600 font-medium hover:underline flex-1"
      >
        {item.name}
      </Link>
      <span className="text-gray-500 text-sm">${item.price}</span>
    </div>
  );
};

function Items() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

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
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Items</h1>
        <span className="text-muted-foreground text-sm">Total: {total}</span>
      </div>

      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          type="text"
          className="w-full text-white"
          placeholder="Search items..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {loading && <p className="text-center text-gray-500">Loading...</p>}

      {!loading && items.length === 0 && (
        <div className="text-center py-10 text-gray-400">No items found.</div>
      )}

      {!loading && items.length > 0 && (
        <div className="rounded-md border h-[500px] overflow-hidden bg-white shadow-sm">
          <List
            rowCount={items.length}
            rowHeight={50}
            rowComponent={Row}
            rowProps={{ data: items }}
            className="products-list bg-gray-50"
            style={{ height: "500px" }}
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </Button>
        <span className="text-sm text-gray-600">
          Page {page} of {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default Items;
