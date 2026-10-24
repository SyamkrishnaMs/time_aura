"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

import {
  ArrowLeft,
  MapPin,
  CreditCard,
  ShoppingBag,
  Check,
  Plus,
  Trash2,
  ShieldCheck,
  Truck,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();

  // =====================================================
  // STATES
  // =====================================================

  const [cartItems, setCartItems] = useState([]);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  const [showAddressForm, setShowAddressForm] = useState(false);

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // =====================================================
  // LOAD RAZORPAY SCRIPT
  // =====================================================

  useEffect(() => {
    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) return;

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    document.body.appendChild(script);

    return () => {
      // Do not remove script here.
      // Razorpay can be reused while page is open.
    };
  }, []);

  // =====================================================
  // FETCH CHECKOUT DATA
  // =====================================================

  useEffect(() => {
    fetchCheckoutData();
  }, []);

  const fetchCheckoutData = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        fetchCart(),
        fetchAddresses(),
      ]);
    } catch (error) {
      console.error(
        "Checkout data error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH CART
  // =====================================================

  const fetchCart = async () => {
    try {
      const response = await axios.get(
        "/api/cart",
        {
          withCredentials: true,
        }
      );

      if (
        !response.data?.success ||
        !response.data?.cart
      ) {
        setCartItems([]);
        return;
      }

      const items =
        response.data.cart.items || [];

      if (items.length === 0) {
        router.replace("/cart");
        return;
      }

      setCartItems(items);
    } catch (error) {
      console.error(
        "Fetch cart error:",
        error
      );

      if (error.response?.status === 401) {
        router.replace("/auth");
        return;
      }

      setError(
        error.response?.data?.message ||
          "Unable to load cart"
      );
    }
  };

  // =====================================================
  // FETCH ADDRESSES
  // =====================================================

  const fetchAddresses = async () => {
    try {
      const response = await axios.get(
        "/api/address",
        {
          withCredentials: true,
        }
      );

      const data =
        response.data?.addresses || [];

      setAddresses(data);

      if (data.length > 0) {
        setSelectedAddressId(
          String(data[0]._id)
        );
        setShowAddressForm(false);
      } else {
        setSelectedAddressId("");
        setShowAddressForm(true);
      }
    } catch (error) {
      console.error(
        "Fetch addresses error:",
        error
      );

      if (error.response?.status === 401) {
        router.replace("/auth");
        return;
      }

      setError(
        error.response?.data?.message ||
          "Unable to load addresses"
      );
    }
  };

  // =====================================================
  // ADDRESS INPUT
  // =====================================================

  const handleAddressChange = (e) => {
    const { name, value } = e.target;

    setAddress((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // ADD ADDRESS
  // =====================================================

  const handleAddAddress = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      if (
        !address.name.trim() ||
        !address.phone.trim() ||
        !address.addressLine.trim() ||
        !address.city.trim() ||
        !address.state.trim() ||
        !address.pincode.trim()
      ) {
        setError(
          "Please complete all address fields"
        );
        return;
      }

      const response = await axios.post(
        "/api/address",
        address,
        {
          withCredentials: true,
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to add address"
        );
      }

      const newAddress =
        response.data.address;

      setAddresses((previous) => [
        ...previous,
        newAddress,
      ]);

      setSelectedAddressId(
        String(newAddress._id)
      );

      setAddress({
        name: "",
        phone: "",
        addressLine: "",
        city: "",
        state: "",
        pincode: "",
      });

      setShowAddressForm(false);

      setMessage(
        "Delivery address added successfully"
      );
    } catch (error) {
      console.error(
        "Add address error:",
        error
      );

      if (error.response?.status === 401) {
        router.replace("/auth");
        return;
      }

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to add address"
      );
    }
  };

  // =====================================================
  // DELETE ADDRESS
  // =====================================================

  const handleDeleteAddress = async (
    addressId
  ) => {
    try {
      setError("");
      setMessage("");

      const response = await axios.delete(
        `/api/address/${addressId}`,
        {
          withCredentials: true,
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to delete address"
        );
      }

      const remaining =
        addresses.filter(
          (item) =>
            String(item._id) !==
            String(addressId)
        );

      setAddresses(remaining);

      if (
        String(selectedAddressId) ===
        String(addressId)
      ) {
        if (remaining.length > 0) {
          setSelectedAddressId(
            String(remaining[0]._id)
          );
        } else {
          setSelectedAddressId("");
          setShowAddressForm(true);
        }
      }

      setMessage(
        "Address deleted successfully"
      );
    } catch (error) {
      console.error(
        "Delete address error:",
        error
      );

      if (error.response?.status === 401) {
        router.replace("/auth");
        return;
      }

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to delete address"
      );
    }
  };

  // =====================================================
  // SELECTED ADDRESS
  // =====================================================

  const getSelectedAddress = () => {
    return addresses.find(
      (item) =>
        String(item._id) ===
        String(selectedAddressId)
    );
  };

  // =====================================================
  // PRICE CALCULATIONS
  // =====================================================

  const getItemPrice = (item) => {
    const product = item.product;

    return Number(
      product?.offerPrice ??
        product?.price ??
        product?.mrp ??
        item.price ??
        0
    );
  };

  const subtotal = cartItems.reduce(
    (total, item) => {
      const price = getItemPrice(item);

      const quantity = Number(
        item.quantity || 0
      );

      return total + price * quantity;
    },
    0
  );

  const shipping = 0;

  const totalAmount =
    subtotal + shipping;

  // =====================================================
  // CREATE COD ORDER
  // =====================================================

  const placeCODOrder = async (
    selectedAddress
  ) => {
    try {
      setError("");
      setMessage("");
      setPlacingOrder(true);

      const response = await axios.post(
        "/api/order",
        {
          action: "create",

          shippingAddress: {
            name: selectedAddress.name,
            phone: selectedAddress.phone,
            addressLine:
              selectedAddress.addressLine,
            city: selectedAddress.city,
            state: selectedAddress.state,
            pincode: selectedAddress.pincode,
          },

          paymentMethod: "COD",
        },
        {
          withCredentials: true,
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to place order"
        );
      }

      window.dispatchEvent(
        new Event("cartUpdated")
      );

      setPaymentSuccess(true);
      setPlacingOrder(false);

      setTimeout(() => {
        router.push("/shop");
      }, 3000);
    } catch (error) {
      console.error(
        "COD order error:",
        error
      );

      setPlacingOrder(false);

      if (error.response?.status === 401) {
        router.replace("/auth");
        return;
      }

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to place order"
      );
    }
  };

  // =====================================================
  // START RAZORPAY PAYMENT
  // =====================================================

  const startRazorpayPayment = async (
    selectedAddress
  ) => {
    try {
      setError("");
      setMessage(
        "Creating secure payment..."
      );

      setPlacingOrder(true);

      if (
        typeof window === "undefined" ||
        !window.Razorpay
      ) {
        setPlacingOrder(false);

        setError(
          "Razorpay is still loading. Please try again."
        );

        return;
      }

      const response = await axios.post(
        "/api/order",
        {
          action: "create",

          shippingAddress: {
            name: selectedAddress.name,
            phone: selectedAddress.phone,
            addressLine:
              selectedAddress.addressLine,
            city: selectedAddress.city,
            state: selectedAddress.state,
            pincode: selectedAddress.pincode,
          },

          paymentMethod: "Razorpay",
        },
        {
          withCredentials: true,
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to create Razorpay order"
        );
      }

      const razorpayOrder =
        response.data.razorpayOrder;

      const razorpayKey =
        response.data.key ||
        process.env
          .NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (!razorpayOrder?.id) {
        throw new Error(
          "Razorpay order ID is missing"
        );
      }

      if (!razorpayKey) {
        throw new Error(
          "Razorpay key is missing"
        );
      }

      const options = {
        key: razorpayKey,

        amount:
          razorpayOrder.amount,

        currency:
          razorpayOrder.currency || "INR",

        name: "Time Aura",

        description:
          "Luxury Watch Purchase",

        order_id:
          razorpayOrder.id,

        prefill: {
          name: selectedAddress.name,
          contact: selectedAddress.phone,
        },

        notes: {
          address:
            selectedAddress.addressLine,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode:
            selectedAddress.pincode,
        },

        theme: {
          color: "#eab308",
        },

        modal: {
          ondismiss: () => {
            setPlacingOrder(false);
            setMessage("");
          },
        },

        handler: async (
          paymentResponse
        ) => {
          await verifyRazorpayPayment(
            paymentResponse,
            selectedAddress
          );
        },
      };

      const razorpay =
        new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        (response) => {
          console.error(
            "Razorpay payment failed:",
            response
          );

          setPlacingOrder(false);

          setError(
            response.error?.description ||
              "Payment failed. Please try again."
          );
        }
      );

      razorpay.open();
    } catch (error) {
      console.error(
        "Razorpay create error:",
        error
      );

      setPlacingOrder(false);

      if (error.response?.status === 401) {
        router.replace("/auth");
        return;
      }

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to start payment"
      );
    }
  };

  // =====================================================
  // VERIFY RAZORPAY PAYMENT
  // =====================================================

  const verifyRazorpayPayment = async (
    paymentResponse,
    selectedAddress
  ) => {
    try {
      setError("");

      setMessage(
        "Verifying payment..."
      );

      const response = await axios.post(
        "/api/order",
        {
          action: "verify",

          paymentMethod: "Razorpay",

          razorpay_order_id:
            paymentResponse.razorpay_order_id,

          razorpay_payment_id:
            paymentResponse.razorpay_payment_id,

          razorpay_signature:
            paymentResponse.razorpay_signature,

          shippingAddress: {
            name: selectedAddress.name,
            phone: selectedAddress.phone,
            addressLine:
              selectedAddress.addressLine,
            city: selectedAddress.city,
            state: selectedAddress.state,
            pincode: selectedAddress.pincode,
          },
        },
        {
          withCredentials: true,
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Payment verification failed"
        );
      }

      window.dispatchEvent(
        new Event("cartUpdated")
      );

      setPaymentSuccess(true);

      setPlacingOrder(false);

      setMessage("");

      setTimeout(() => {
        router.push("/shop");
      }, 3000);
    } catch (error) {
      console.error(
        "Payment verification error:",
        error
      );

      setPlacingOrder(false);

      if (error.response?.status === 401) {
        router.replace("/auth");
        return;
      }

      setError(
        error.response?.data?.message ||
          error.message ||
          "Payment verification failed"
      );
    }
  };

  // =====================================================
  // PLACE ORDER
  // =====================================================

  const handlePlaceOrder = async () => {
    setError("");
    setMessage("");

    if (!selectedAddressId) {
      setError(
        "Please select a delivery address"
      );

      return;
    }

    const selectedAddress =
      getSelectedAddress();

    if (!selectedAddress) {
      setError(
        "Please select a valid delivery address"
      );

      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    if (totalAmount <= 0) {
      setError(
        "Invalid order amount"
      );

      return;
    }

    if (paymentMethod === "COD") {
      await placeCODOrder(
        selectedAddress
      );

      return;
    }

    if (
      paymentMethod === "Razorpay"
    ) {
      await startRazorpayPayment(
        selectedAddress
      );

      return;
    }

    setError(
      "Please select a payment method"
    );
  };

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0b0e] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

          <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-400">
            Loading checkout...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAYMENT / ORDER SUCCESS
  // =====================================================

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-[#0a0b0e] flex items-center justify-center px-4 text-white">
        <div className="w-full max-w-md rounded-[28px] border-2 border-amber-400/40 bg-[#12151d] p-10 text-center shadow-2xl">
          <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-yellow-600 text-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/30">
            <Check size={30} strokeWidth={2.5} />
          </div>

          <h1 className="font-serif text-2xl font-bold text-white mb-3">
            Order Placed Successfully
          </h1>

          <p className="text-gray-400 text-sm leading-6">
            Your Time Aura order has been
            successfully placed.
          </p>

          <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mt-5">
            Redirecting you to the shop...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN CHECKOUT
  // =====================================================

  return (
    <>
      <style jsx global>{`
        @keyframes goldBorderBlink {
          0%, 100% {
            border-color: rgba(234, 179, 8, 0.85);
            box-shadow: 0 0 18px rgba(234, 179, 8, 0.35), 0 8px 25px rgba(0, 0, 0, 0.4);
          }
          50% {
            border-color: rgba(234, 179, 8, 0.25);
            box-shadow: 0 0 6px rgba(234, 179, 8, 0.1), 0 8px 25px rgba(0, 0, 0, 0.4);
          }
        }
        .gold-blink-card {
          animation: goldBorderBlink 2.5s infinite ease-in-out;
        }
      `}</style>

      <div className="min-h-screen bg-[#0a0b0e] text-white">
        {/* =================================================
            HEADER
        ================================================= */}

        <header className="border-b border-white/10 bg-[#0a0b0e]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
            <Link
              href="/cart"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 hover:text-amber-300 transition"
            >
              <ArrowLeft size={16} />

              <span>
                Back to Cart
              </span>
            </Link>

            <div className="text-center">
              <h1 className="font-serif text-xl font-bold tracking-[0.25em] text-white">
                TIME AURA
              </h1>

              <p className="text-[9px] tracking-[0.35em] text-amber-400 mt-1">
                MORE THAN JUST TIME
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <ShieldCheck size={16} className="text-amber-400" />

              <span className="hidden sm:block">
                Secure Checkout
              </span>
            </div>
          </div>
        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <main className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
          <div className="mb-10">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
              Secure Transaction
            </p>
            <h2 className="font-serif text-3xl font-bold text-white md:text-4xl">
              Checkout
            </h2>

            <p className="text-gray-400 mt-2 text-sm">
              Complete your master-crafted timepiece order securely.
            </p>
          </div>

          {/* =================================================
              ERROR / MESSAGE
          ================================================= */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-3.5 text-sm font-semibold text-red-300 shadow-md">
              {error}
            </div>
          )}

          {message && !error && (
            <div className="mb-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3.5 text-sm font-semibold text-emerald-300 shadow-md">
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
            {/* =================================================
                LEFT SIDE
            ================================================= */}

            <div className="space-y-8">
              {/* =================================================
                  DELIVERY ADDRESS
              ================================================= */}

              <section className="rounded-[24px] border border-white/10 bg-[#12151d] overflow-hidden shadow-xl">
                <div className="px-6 py-5 border-b border-white/10 bg-[#161a23] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center">
                      <MapPin size={18} />
                    </div>

                    <div>
                      <h3 className="font-serif font-bold text-white uppercase tracking-wider text-sm">
                        Delivery Address
                      </h3>

                      <p className="text-xs text-gray-400 mt-0.5">
                        Where should we deliver your watch?
                      </p>
                    </div>
                  </div>

                  {!showAddressForm && (
                    <button
                      type="button"
                      onClick={() =>
                        setShowAddressForm(true)
                      }
                      className="flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-amber-300 hover:bg-amber-400 hover:text-black transition"
                    >
                      <Plus size={15} />

                      Add New
                    </button>
                  )}
                </div>

                <div className="p-6">
                  {/* =============================================
                      SAVED ADDRESSES
                  ============================================= */}

                  {addresses.length > 0 &&
                    !showAddressForm && (
                      <div className="space-y-4">
                        {addresses.map(
                          (item) => {
                            const selected =
                              String(
                                selectedAddressId
                              ) ===
                              String(
                                item._id
                              );

                            return (
                              <div
                                key={item._id}
                                className={`rounded-2xl border p-5 transition ${
                                  selected
                                    ? "border-amber-400 bg-amber-400/5 shadow-[0_0_15px_rgba(234,179,8,0.15)]"
                                    : "border-white/10 bg-[#161a23]/60 hover:border-white/20"
                                }`}
                              >
                                <div className="flex items-start gap-4">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSelectedAddressId(
                                        String(
                                          item._id
                                        )
                                      )
                                    }
                                    className="pt-1"
                                  >
                                    <span
                                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                        selected
                                          ? "border-amber-400 bg-amber-400/20"
                                          : "border-gray-500"
                                      }`}
                                    >
                                      {selected && (
                                        <span className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
                                      )}
                                    </span>
                                  </button>

                                  <div className="flex-1">
                                    <div className="flex items-center justify-between gap-4">
                                      <div>
                                        <h4 className="font-bold text-sm text-white">
                                          {
                                            item.name
                                          }
                                        </h4>

                                        <p className="text-xs text-amber-400/90 font-medium mt-0.5">
                                          {
                                            item.phone
                                          }
                                        </p>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDeleteAddress(
                                            item._id
                                          )
                                        }
                                        className="text-gray-400 hover:text-red-400 transition"
                                        title="Delete address"
                                      >
                                        <Trash2
                                          size={
                                            17
                                          }
                                        />
                                      </button>
                                    </div>

                                    <p className="text-xs text-gray-300 mt-3 leading-relaxed">
                                      {
                                        item.addressLine
                                      }
                                      ,{" "}
                                      {
                                        item.city
                                      }
                                      ,{" "}
                                      {
                                        item.state
                                      }{" "}
                                      -{" "}
                                      {
                                        item.pincode
                                      }
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}

                  {/* =============================================
                      ADD ADDRESS FORM
                  ============================================= */}

                  {showAddressForm && (
                    <form
                      onSubmit={
                        handleAddAddress
                      }
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                            Full Name
                          </label>

                          <input
                            type="text"
                            name="name"
                            value={
                              address.name
                            }
                            onChange={
                              handleAddressChange
                            }
                            placeholder="Enter full name"
                            className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                            Phone
                          </label>

                          <input
                            type="tel"
                            name="phone"
                            value={
                              address.phone
                            }
                            onChange={
                              handleAddressChange
                            }
                            placeholder="Enter phone number"
                            className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                          Address
                        </label>

                        <textarea
                          name="addressLine"
                          value={
                            address.addressLine
                          }
                          onChange={
                            handleAddressChange
                          }
                          rows={3}
                          placeholder="House / street / locality"
                          className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-amber-400 resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                            City
                          </label>

                          <input
                            type="text"
                            name="city"
                            value={
                              address.city
                            }
                            onChange={
                              handleAddressChange
                            }
                            placeholder="City"
                            className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                            State
                          </label>

                          <input
                            type="text"
                            name="state"
                            value={
                              address.state
                            }
                            onChange={
                              handleAddressChange
                            }
                            placeholder="State"
                            className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                            Pincode
                          </label>

                          <input
                            type="text"
                            name="pincode"
                            value={
                              address.pincode
                            }
                            onChange={
                              handleAddressChange
                            }
                            placeholder="Pincode"
                            className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 pt-3">
                        <button
                          type="submit"
                          className="rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 px-6 py-3 text-xs font-extrabold uppercase tracking-widest text-black shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-500 transition"
                        >
                          Save Address
                        </button>

                        {addresses.length >
                          0 && (
                          <button
                            type="button"
                            onClick={() =>
                              setShowAddressForm(
                                false
                              )
                            }
                            className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-xs font-bold uppercase tracking-widest text-gray-300 hover:border-amber-400 hover:text-white transition"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              </section>

              {/* =================================================
                  PAYMENT METHOD
              ================================================= */}

              <section className="rounded-[24px] border border-white/10 bg-[#12151d] overflow-hidden shadow-xl">
                <div className="px-6 py-5 border-b border-white/10 bg-[#161a23] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center">
                    <CreditCard size={18} />
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-white uppercase tracking-wider text-sm">
                      Payment Method
                    </h3>

                    <p className="text-xs text-gray-400 mt-0.5">
                      Choose how you want to pay.
                    </p>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* =============================================
                      COD
                  ============================================= */}

                  <button
                    type="button"
                    onClick={() =>
                      setPaymentMethod(
                        "COD"
                      )
                    }
                    className={`w-full rounded-2xl border p-5 text-left transition ${
                      paymentMethod ===
                      "COD"
                        ? "border-amber-400 bg-amber-400/5 shadow-[0_0_15px_rgba(234,179,8,0.15)]"
                        : "border-white/10 bg-[#161a23]/60 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          paymentMethod ===
                          "COD"
                            ? "border-amber-400 bg-amber-400/20"
                            : "border-gray-500"
                        }`}
                      >
                        {paymentMethod ===
                          "COD" && (
                          <span className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
                        )}
                      </span>

                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-white">
                          Cash on Delivery
                        </h4>

                        <p className="text-xs text-gray-400 mt-1">
                          Pay when your order arrives.
                        </p>
                      </div>

                      <Truck
                        size={21}
                        className="text-amber-400"
                      />
                    </div>
                  </button>

                  {/* =============================================
                      RAZORPAY
                  ============================================= */}

                  <button
                    type="button"
                    onClick={() =>
                      setPaymentMethod(
                        "Razorpay"
                      )
                    }
                    className={`w-full rounded-2xl border p-5 text-left transition ${
                      paymentMethod ===
                      "Razorpay"
                        ? "border-amber-400 bg-amber-400/5 shadow-[0_0_15px_rgba(234,179,8,0.15)]"
                        : "border-white/10 bg-[#161a23]/60 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          paymentMethod ===
                          "Razorpay"
                            ? "border-amber-400 bg-amber-400/20"
                            : "border-gray-500"
                        }`}
                      >
                        {paymentMethod ===
                          "Razorpay" && (
                          <span className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
                        )}
                      </span>

                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-white">
                          Razorpay
                        </h4>

                        <p className="text-xs text-gray-400 mt-1">
                          Pay securely using UPI,
                          cards or net banking.
                        </p>
                      </div>

                      <CreditCard
                        size={21}
                        className="text-amber-400"
                      />
                    </div>
                  </button>
                </div>
              </section>

              {/* =================================================
                  SECURITY INFO
              ================================================= */}

              <div className="flex items-start gap-3 text-gray-400 px-2">
                <ShieldCheck
                  size={18}
                  className="mt-0.5 text-amber-400"
                />

                <p className="text-xs leading-relaxed">
                  Your payment and personal
                  information are securely
                  protected during checkout with modern encryption standards.
                </p>
              </div>
            </div>

            {/* =================================================
                RIGHT SIDE - ORDER SUMMARY
            ================================================= */}

            <aside className="lg:sticky lg:top-6 h-fit">
              <div className="rounded-[24px] border-2 border-amber-400/40 bg-[#12151d] overflow-hidden shadow-2xl gold-blink-card">
                <div className="px-6 py-5 border-b border-white/10 bg-[#161a23] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center">
                    <ShoppingBag size={18} />
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-white uppercase tracking-wider text-sm">
                      Order Summary
                    </h3>

                    <p className="text-xs text-gray-400 mt-0.5">
                      {cartItems.length}{" "}
                      {cartItems.length === 1
                        ? "item"
                        : "items"}
                    </p>
                  </div>
                </div>

                {/* =============================================
                    PRODUCTS
                ============================================= */}

                <div className="p-6 space-y-4 max-h-[340px] overflow-y-auto">
                  {cartItems.map(
                    (item, index) => {
                      const product =
                        item.product;

                      const price =
                        getItemPrice(item);

                      const quantity =
                        Number(
                          item.quantity || 0
                        );

                      const image =
                        product?.images?.[0] ||
                        product?.image ||
                        "";

                      return (
                        <div
                          key={
                            item._id ||
                            `${product?._id}-${index}`
                          }
                          className="flex gap-4 p-3 rounded-2xl bg-[#161a23]/60 border border-white/5"
                        >
                          <div className="w-16 h-16 bg-black rounded-xl border border-white/10 flex-shrink-0 overflow-hidden">
                            {image ? (
                              <img
                                src={image}
                                alt={
                                  product?.name ||
                                  "Watch"
                                }
                                className="w-full h-full object-contain p-1"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500 text-[10px]">
                                No image
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-white truncate uppercase tracking-wider">
                              {product?.name ||
                                "Product"}
                            </h4>

                            {product?.brand && (
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {
                                  product.brand
                                }
                              </p>
                            )}

                            {item.size && (
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                Size:{" "}
                                {item.size}
                              </p>
                            )}

                            <div className="flex items-center justify-between mt-2">
                              <p className="text-[10px] text-gray-400 font-semibold uppercase">
                                Qty:{" "}
                                {quantity}
                              </p>

                              <p className="text-xs font-black text-amber-400">
                                ₹
                                {(
                                  price *
                                  quantity
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                {/* =============================================
                    PRICE
                ============================================= */}

                <div className="border-t border-white/10 px-6 py-5 space-y-3 bg-[#161a23]/40">
                  <div className="flex justify-between text-xs font-medium text-gray-300">
                    <span className="text-gray-400">
                      Subtotal
                    </span>

                    <span className="text-white">
                      ₹
                      {subtotal.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs font-medium text-gray-300">
                    <span className="text-gray-400">
                      Shipping
                    </span>

                    <span className="text-emerald-400 font-bold uppercase">
                      {shipping === 0
                        ? "FREE"
                        : `₹${shipping}`}
                    </span>
                  </div>

                  <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                    <span className="font-bold text-white text-sm uppercase tracking-wider">
                      Total
                    </span>

                    <span className="font-black text-lg text-amber-400">
                      ₹
                      {totalAmount.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                </div>

                {/* =============================================
                    PLACE ORDER BUTTON
                ============================================= */}

                <div className="p-6 pt-2 bg-[#161a23]/40">
                  <button
                    type="button"
                    onClick={
                      handlePlaceOrder
                    }
                    disabled={
                      placingOrder ||
                      !selectedAddressId ||
                      cartItems.length === 0
                    }
                    className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 py-4 text-xs font-extrabold uppercase tracking-widest text-black shadow-lg shadow-amber-500/30 hover:from-amber-400 hover:to-yellow-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {placingOrder
                      ? paymentMethod ===
                        "Razorpay"
                        ? "Processing Payment..."
                        : "Placing Order..."
                      : paymentMethod ===
                        "Razorpay"
                      ? `Pay ₹${totalAmount.toLocaleString(
                          "en-IN"
                        )}`
                      : "Place Order"}
                  </button>

                  <p className="text-[10px] text-gray-400 text-center mt-4 leading-relaxed">
                    By placing your order,
                    you agree to our luxury terms &
                    conditions.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </>
  );
}