# Snapcart: 10-minute grocery delivery

Grocery delivery app with three roles:

- **Customer**: browse, search and filter by category, cart, checkout with a map (Cash on Delivery or Stripe), My Orders, live order tracking.
- **Admin**: dashboard with stats, add/edit/delete products, manage orders, send orders out for delivery.
- **Delivery boy**: gets nearby orders in real time, accepts or rejects them, navigates on a live map, and completes a delivery with the customer's 4-digit code.

Tech: Next.js 16 (App Router), NextAuth v5, MongoDB/Mongoose, Redux Toolkit, Tailwind v4, Leaflet maps, Socket.IO, Stripe, Cloudinary.

```
snapcart/       ← Next.js app (frontend + API routes)
socketServer/   ← small Express + Socket.IO server for real-time events
```

## Run it locally

You need Node.js 20+ and a MongoDB database (MongoDB Atlas free tier works).

```bash
git clone https://github.com/Sandeshdahal10/Snapcart.git
cd Snapcart

# 1. Next.js app
cd snapcart
npm install
cp .env.example .env.local      # then fill in your values
npm run dev                     # http://localhost:3000

# 2. Socket server (in a second terminal)
cd socketServer
npm install
cp .env.example .env            # same SOCKET_SECRET as the app
npm run dev                     # http://localhost:5000

# 3. Stripe webhook (only for online payments, third terminal)
stripe listen --forward-to localhost:3000/api/user/stripe/webhook
# copy the whsec_... it prints into STRIPE_WEBHOOK_SECRET
```

`SOCKET_SECRET` must be the same in both `.env` files. Besides protecting the server-to-server calls, it signs the token each browser uses to tell the socket server who it is (`/api/socket/token`), so nobody can pose as another user to read their delivery code.

## Try the whole flow

Use three different browsers (or one normal window plus incognito windows) so each role has its own login.

1. **Register the admin first.** After login, choose the *Admin* role. Only one admin is allowed.
2. Admin: **Add Grocery** → add a few products.
3. **Register a delivery boy** → choose *Delivery Boy* and allow location access.
4. **Register a customer** → add items to the cart → **Checkout** → pick a location → *Place Order*.
5. Admin: **Manage Orders** → set the order to **Out for Delivery**. Delivery boys within 50 km get it instantly.
6. Delivery boy: **Accept** → the live map opens.
7. Customer: **My Orders** now shows the delivery boy and a **4-digit delivery code**. **Track Your Order** shows his live position.
8. Delivery boy: enter the customer's code → **Mark as Delivered**. Everyone's screen updates to *Delivered*, and COD orders are marked paid.

> Live location uses the browser's GPS. On a laptop it's approximate. To see the marker move, use Chrome DevTools → *More tools → Sensors → Location*.

## Stripe test card

`4242 4242 4242 4242`, any future date, any CVC.
