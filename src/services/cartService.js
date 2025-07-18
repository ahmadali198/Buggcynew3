export const addToCartService = (product, cart, setCart) => {
  const exists = cart.find((item) => item.id === product.id);
  if (exists) {
    const updated = cart.map((item) =>
      item.id === product.id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
    setCart(updated);
  } else {
    setCart([...cart, { ...product, quantity: 1 }]);
  }
};

export const removeFromCartService = (id, cart, setCart) => {
  const updated = cart.filter((item) => item.id !== id);
  setCart(updated);
};

export const updateQuantityService = (id, quantity, cart, setCart) => {
  const updated = cart.map((item) =>
    item.id === id ? { ...item, quantity } : item
  );
  setCart(updated);
};
