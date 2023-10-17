export default async function (event) {
  const id = event.pathParameters.productId;
  let products
  try {
    products = await import("../mocks/products.json");
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to load products"
      })
    };
  }

  const item = products.find(item => item.id === id);
  if (!item) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: "Item not found"
      })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(item)
  };
}