import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { List } from "react-window";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";

const Row = ({ index, style, data }) => {
  const item = data[index];
  return (
    <div
      style={style}
      className="flex items-center justify-between px-4 transition-colors border-b border-slate-700"
    >
      <Link
        to={`/items/${item.id}`}
        className="font-medium hover:underline flex-1 truncate mr-4"
      >
        {item.name}
      </Link>
      <span className="text-sm shrink-0">${item.price}</span>
    </div>
  );
};

function Items() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // URL State Management
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("q") || "";
  const LIMIT = 20;

  // Local input state for debounced typing
  const [inputValue, setInputValue] = useState(search);

  // Sync Input to URL (Debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== search) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          if (inputValue) {
            newParams.set("q", inputValue);
          } else {
            newParams.delete("q");
          }
          newParams.set("page", "1");
          newParams.set("limit", LIMIT.toString());
          return newParams;
        });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue, search, setSearchParams]);

  // Sync state to Input (e.g. on Back button)
  useEffect(() => {
    setInputValue(search);
  }, [search]);

  // Fetch Data based on URL Params
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      try {
        // Artificially wait 1 second to show Skeleton ONLY on first page
        if (page === 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

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

    fetchData();

    return () => {
      controller.abort();
    };
  }, [page, search]);

  const totalPages = Math.ceil(total / LIMIT);

  const handlePageChange = (newPage) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("page", newPage.toString());
      newParams.set("limit", LIMIT.toString());
      return newParams;
    });
  };

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
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="rounded-md border h-[500px] overflow-hidden shadow-sm bg-[#1e293b] p-4 space-y-4">
          {/* Skeleton Loader matching List layout */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between h-[34px]">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[50px]" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {items.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              No items found.
            </div>
          ) : (
            <div className="rounded-md border h-[500px] overflow-hidden shadow-sm">
              <List
                rowCount={items.length}
                rowHeight={50}
                rowComponent={Row}
                rowProps={{ data: items }}
                className="products-list"
                style={{ height: "500px" }}
              />
            </div>
          )}
        </>
      )}

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => handlePageChange(page - 1)}
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
          onClick={() => handlePageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default Items;
