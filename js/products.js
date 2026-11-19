const PRODUCTS = [
  { id: "SKU-101", name: "Бездротові навушники", category: "Електроніка", price: 49.0, emoji: "🎧", description: "Легкі навушники з шумозаглушенням і 30 годинами роботи." },
  { id: "SKU-102", name: "Розумний годинник", category: "Електроніка", price: 129.0, emoji: "⌚", description: "Крокомір, пульс, сповіщення зі смартфона." },
  { id: "SKU-103", name: "Кавоварка гейзерна", category: "Дім і кухня", price: 34.5, emoji: "☕", description: "Класична кавоварка на 6 чашок з нержавіючої сталі." },
  { id: "SKU-104", name: "Набір рушників", category: "Дім і кухня", price: 22.0, emoji: "🧺", description: "Три бавовняні рушники різного розміру." },
  { id: "SKU-105", name: "Рюкзак міський", category: "Аксесуари", price: 59.9, emoji: "🎒", description: "Водостійкий рюкзак з відділенням для ноутбука." },
  { id: "SKU-106", name: "Сонцезахисні окуляри", category: "Аксесуари", price: 27.0, emoji: "🕶️", description: "Поляризовані лінзи, захист UV400." },
  { id: "SKU-107", name: "Крем для обличчя", category: "Краса", price: 18.5, emoji: "🧴", description: "Зволожувальний крем для щоденного догляду." },
  { id: "SKU-108", name: "Кросівки бігові", category: "Спорт", price: 89.0, emoji: "👟", description: "Амортизувальна підошва для бігу на довгі дистанції." },
];

function findProduct(id) {
  return PRODUCTS.find((p) => p.id === id);
}
