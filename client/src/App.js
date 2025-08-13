import React, { useState, useEffect } from "react";
import Login from "./Login/Login";
import SignUpPage from "./SignUp/SignUpPage";
import PasswordFlow from "./PasswordRecovery/PasswordFlow";
import HomePage from "./Home/HomePage";
import CartPage from "./Cart/CartPage";
import WishlistPage from "./Wishlist/WishlistPage";
import AdminDashboard from './admin/AdminDashboard';
import AdminUserTable from "./admin/AdminUserTable";
import AdminProducts from "./admin/AdminProducts";
import AdminOrders from "./admin/AdminOrders";
import AdminCategories from "./admin/AdminCategories";
import ProductsPage from './products/ProductsPage';
import SearchPage from './Search/SearchPage';
import ContactUs from "./ContactUs/ContactUsPage";
import CheckoutPage from "./Checkout/CheckoutPage";
import OrderStatusPage from "./OrderStatus/OrderStatusPage";
import OrdersInformation from "./OrdersInformation/OrdersInformation";

function App() {
  const [view, setView] = useState("home");
  const [wishlistItems, setWishlistItems] = useState([]); // (יישאר זמני עד שיעודכן ה-WishlistPage)
  const [cartItems, setCartItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [lastOrderId, setLastOrderId] = useState(null);
  const [toast, setToast] = useState({ show: false, text: "" });

  const goTo = (page) => setView(page);

  // ===== helper: user id נוכחי =====
  const getCurrentUserId = () =>
    JSON.parse(localStorage.getItem("user") || "{}")?.user_id || "guest";

  const [currentUserId, setCurrentUserId] = useState(getCurrentUserId());

  // ===== username להצגה =====
  const [username, setUsername] = useState(() => {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    return localStorage.getItem("username") ?? u.name ?? u.username ?? null;
  });

  // ===== ספירת מועדפים (לבאדג') =====
  const [wishlistCount, setWishlistCount] = useState(() => {
    try {
      const wl = JSON.parse(localStorage.getItem(`wishlist:${getCurrentUserId()}`) || "[]");
      return Array.isArray(wl) ? wl.length : 0;
    } catch {
      return 0;
    }
  });

  // ===== טוען סל ומועדפים כשהמשתמש מתחלף =====
  useEffect(() => {
    // cart
    try {
      const cart = JSON.parse(localStorage.getItem(`cart:${currentUserId}`) || "[]");
      setCartItems(Array.isArray(cart) ? cart : []);
    } catch {
      setCartItems([]);
    }
    // wishlist count
    try {
      const wl = JSON.parse(localStorage.getItem(`wishlist:${currentUserId}`) || "[]");
      setWishlistCount(Array.isArray(wl) ? wl.length : 0);
    } catch {
      setWishlistCount(0);
    }
  }, [currentUserId]);

  // ===== סנכרון בין טאבים: מגיב רק למפתחות של המשתמש הנוכחי =====
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === `wishlist:${currentUserId}`) {
        try {
          const arr = JSON.parse(e.newValue || "[]");
          setWishlistCount(Array.isArray(arr) ? arr.length : 0);
        } catch {
          setWishlistCount(0);
        }
      }
      if (e.key === `cart:${currentUserId}`) {
        try {
          const arr = JSON.parse(e.newValue || "[]");
          setCartItems(Array.isArray(arr) ? arr : []);
        } catch {
          setCartItems([]);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [currentUserId]);

  // ===== פונקציות לסל (שומרות לפי משתמש) =====
  const saveCart = (items) =>
    localStorage.setItem(`cart:${currentUserId}`, JSON.stringify(items));

  const addToCart = (product) => {
    const existingItem = cartItems.find((item) => item.name === product.name);
    if (existingItem) {
      const updatedCart = cartItems.map((item) =>
        item.name === product.name
          ? { ...item, quantity: (item.quantity || 1) + 1 }
          : item
      );
      setCartItems(updatedCart);
      saveCart(updatedCart);
      showToast(`Added another "${product.name}" to cart`);
    } else {
      const updatedCart = [...cartItems, { ...product, quantity: 1 }];
      setCartItems(updatedCart);
      saveCart(updatedCart);
      showToast(`"${product.name}" added to cart`);
    }
  };

  const removeFromCart = (productName) => {
    const updated = cartItems.filter((item) => item.name !== productName);
    setCartItems(updated);
    saveCart(updated);
  };

  // ===== התחברות/התנתקות =====
  const handleLoginSuccess = () => {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    setUsername(localStorage.getItem("username") ?? u.name ?? u.username ?? null);
    setCurrentUserId(getCurrentUserId()); 
    goTo("home");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("username");
    localStorage.removeItem("user_id");
    setUsername(null);
    setCurrentUserId("guest"); 
 
    //אם הלקוח אין לא חשבון(אורח) מאפסים הסל והמועדפים
     localStorage.removeItem("cart:guest");
     localStorage.removeItem("wishlist:guest");

    goTo("home");
  };

  const isLoggedIn = currentUserId !== "guest";

  const handleProceedCheckout = () => {
    if (!isLoggedIn) {
      alert("You need to sign in to place an order.");
      setView("login");
      return;
    }
    setView("checkout");
  };

  const showToast = (text) => {
    setToast({ show: true, text });
    setTimeout(() => setToast({ show: false, text: "" }), 2000);
  };

  return (
    <div className="App">
      {view === "login" && (
        <Login
          onForgotPassword={() => goTo("recovery")}
          onRegister={() => goTo("signup")}
          onAdminLogin={() => goTo("admin")}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {view === "signup" && <SignUpPage onBack={() => goTo("login")} />}
      {view === "recovery" && <PasswordFlow onBackToLogin={() => goTo("login")} />}

      {view === "home" && (
        <HomePage
          onCart={() => goTo("cart")}
          onWishlist={() => goTo("wishlist")}
          onViewProducts={() => goTo("products")}
          onLoginClick={() => goTo("login")}
          onSearch={() => goTo("search")}
          onSelectCategory={(cat) => { setSelectedCategory(cat); goTo("products"); }}
          cartCount={cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)}
          wishlistCount={wishlistCount}
          onContact={() => goTo("contact")}
          onMyOrders={() => goTo("ordersInfo")}
          username={username}
          onLogout={handleLogout}
        />
      )}

      {view === "products" && (
        <ProductsPage
          category={selectedCategory}
          onAddToCart={addToCart}
          onAddToWishlist={() => {}} 
          onBack={() => goTo("home")}
          onWishlistChange={(len) => setWishlistCount(len)}
          currentUserId={currentUserId} // נעביר כדי לעדכן מפתחות שם
        />
      )}

      {view === "cart" && (
        <CartPage
          items={cartItems}
          onBack={() => goTo("home")}
          onRemove={removeFromCart}
          onCheckout={handleProceedCheckout}
          isLoggedIn={currentUserId !== "guest"}
        />
      )}

      {view === "checkout" && (
        <CheckoutPage
          items={cartItems}
          onBack={() => goTo("cart")}
          onOrderPlaced={(orderId) => {
            setLastOrderId(orderId);
            goTo("orderStatus");
          }}
        />
      )}

      {view === "orderStatus" && lastOrderId && (
        <OrderStatusPage orderId={lastOrderId} onBack={() => goTo("home")} />
      )}

      {view === "ordersInfo" && (
        <OrdersInformation userId={currentUserId} onBack={() => goTo("home")} />
      )}

      {view === "wishlist" && (
        <WishlistPage
          items={wishlistItems}
          onBack={() => goTo("home")}
          onRemove={(name) => setWishlistItems(wishlistItems.filter(i => i.name !== name))}
          onAddToCart={addToCart}
           currentUserId={currentUserId} 
          onWishlistChange={(len) => setWishlistCount(len)}
        />
      )}

      {view === "search" && (
        <SearchPage
          onBack={() => goTo("home")}
          onAddToCart={addToCart}
          onAddToWishlist={() => {}}
        />
      )}
      {view === "contact" && <ContactUs onBack={() => goTo("home")} />}
      
       {/* ===== Admin: Dashboard ===== */}
      {view === "admin" && (
        <AdminDashboard
          onBack={() => goTo("home")}
          onManageUsers={() => goTo("adminUsers")} // ← כפתור Manage Users יעביר לכאן
          onManageProducts={() => goTo("adminProducts")}
          onManageCategories={() => goTo("adminCategories")}
          onManageOrders={() => goTo("adminOrders")}
        />
      )}

      {/* ===== Admin: Users Table ===== */}
      {view === "adminUsers" && ( <AdminUserTable
          onBack={() => goTo("admin")} // ← חזרה לדשבון אדמין
        />
      )}

      {view === "adminProducts" && (<AdminProducts
     onBack={() => goTo("admin")}      // ← חזרה לדשבורד אדמין
  />
)}
    {view === "adminCategories" && (
  <AdminCategories onBack={() => goTo("admin")} />
)}

  {view === "adminOrders" && (
  <AdminOrders onBack={() => goTo("admin")} />
 )}


      {toast.show && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#333",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: 10,
            boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
            fontWeight: 600,
            opacity: 0.97,
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}

export default App;
