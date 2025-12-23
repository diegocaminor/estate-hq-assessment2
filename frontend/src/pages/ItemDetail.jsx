import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    fetch("/api/items/" + id, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        setItem(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Error fetching item:", err);
          navigate("/");
        }
      });

    return () => controller.abort();
  }, [id, navigate]);

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <Button
        variant="ghost"
        className="pl-0 hover:pl-2 transition-all"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {loading ? (
        <Card>
          <CardHeader className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      ) : item ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle className="text-2xl">{item.name}</CardTitle>
                <CardDescription>Item ID: {item.id}</CardDescription>
              </div>
              <div className="text-2xl font-bold font-mono text-primary">
                ${item.price}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-muted-foreground block">
                    Category
                  </span>
                  {item.category || "Uncategorized"}
                </div>
              </div>

              <div className="rounded-md bg-muted p-4 mt-4">
                <p className="text-sm text-muted-foreground">
                  Description for {item.name}. Lorem ipsum dolor sit amet,
                  consectetur adipiscing elit. Integer consequat velit eu enim
                  tempor, et sollicitudin lorem rhoncus. Ut nec rutrum quam.
                  Mauris egestas sollicitudin mollis. Vivamus aliquam mauris in
                  tincidunt rutrum. Integer sagittis non ipsum non consectetur.
                  Nulla sit amet vehicula erat, in commodo lorem. Morbi finibus
                  volutpat lectus. Phasellus id odio blandit, tristique est
                  condimentum, elementum velit.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

export default ItemDetail;
