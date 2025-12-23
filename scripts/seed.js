const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "../data/items.json");

const CATEGORIES = [
  "Electronics",
  "Furniture",
  "Clothing",
  "Books",
  "Toys",
  "Sports",
  "Garden",
];
const ADJECTIVES = [
  "Pro",
  "Ultra",
  "Super",
  "Mega",
  "Compact",
  "Ergonomic",
  "Smart",
  "Noise-Cancelling",
  "Wireless",
];
const NOUNS = [
  "Laptop",
  "Chair",
  "Desk",
  "Monitor",
  "Headphones",
  "Speaker",
  "Watch",
  "Table",
  "Lamp",
  "Phone",
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateName() {
  const adj = ADJECTIVES[getRandomInt(0, ADJECTIVES.length - 1)];
  const noun = NOUNS[getRandomInt(0, NOUNS.length - 1)];
  return `${adj} ${noun} ${getRandomInt(100, 999)}`;
}

const items = [];
// Generate 5000 items
for (let i = 1; i <= 5000; i++) {
  items.push({
    id: i,
    name: generateName(),
    category: CATEGORIES[getRandomInt(0, CATEGORIES.length - 1)],
    price: getRandomInt(10, 5000),
  });
}

console.log(`Generated ${items.length} items.`);
fs.writeFileSync(DATA_PATH, JSON.stringify(items, null, 2));
console.log(`Wrote to ${DATA_PATH}`);
