export default async function (event) {
  const products = await import("../mocks/products.json");

  return {
    statusCode: 200,
    body: JSON.stringify(Array.from(products))
  };
}
