import connectDb from "@/lib/db";
import Grocery from "@/models/grocery.model";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import {
  Bike,
  Boxes,
  CheckCircle,
  ClipboardCheckIcon,
  Clock,
  DollarSign,
  PlusCircle,
  ShoppingBag,
  Truck,
  Users,
} from "lucide-react";
import Link from "next/link";
import React from "react";

/** Server component: shop overview for the admin (runs on the server, reads MongoDB directly). */
async function AdminDashboard() {
  await connectDb();

  // Online orders count only once paid (abandoned Stripe checkouts are ignored)
  const real = { $or: [{ paymentMethod: "COD" }, { isPaid: true }] };

  const sevenDaysAgo = new Date();
  // Days are counted in UTC so they line up with MongoDB's $dateToString
  sevenDaysAgo.setUTCHours(0, 0, 0, 0);
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);

  const [
    totalOrders,
    pending,
    outForDelivery,
    delivered,
    revenueAgg,
    customers,
    deliveryBoys,
    products,
    recentOrders,
    lastWeek,
  ] = await Promise.all([
    Order.countDocuments(real),
    Order.countDocuments({ ...real, status: "Pending" }),
    Order.countDocuments({ ...real, status: "Out for Delivery" }),
    Order.countDocuments({ ...real, status: "Delivered" }),
    Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]),
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: "deliveryBoy" }),
    Grocery.countDocuments(),
    Order.find(real).sort({ createdAt: -1 }).limit(5).lean(),
    Order.aggregate([
      { $match: { ...real, createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const revenue = revenueAgg[0]?.total ?? 0;

  // Orders per day for the last 7 days (fill missing days with 0)
  const countsByDay = new Map<string, number>(
    lastWeek.map((d: { _id: string; count: number }) => [d._id, d.count]),
  );
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sevenDaysAgo);
    d.setUTCDate(d.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    return {
      key,
      label: d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
      count: countsByDay.get(key) ?? 0,
    };
  });
  const maxCount = Math.max(1, ...days.map((d) => d.count));

  const stats = [
    { label: "Total Orders", value: totalOrders, icon: ShoppingBag, color: "text-green-700 bg-green-100" },
    { label: "Revenue (paid)", value: `$${revenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-700 bg-emerald-100" },
    { label: "Pending", value: pending, icon: Clock, color: "text-yellow-700 bg-yellow-100" },
    { label: "Out for Delivery", value: outForDelivery, icon: Truck, color: "text-blue-700 bg-blue-100" },
    { label: "Delivered", value: delivered, icon: CheckCircle, color: "text-green-700 bg-green-100" },
    { label: "Customers", value: customers, icon: Users, color: "text-purple-700 bg-purple-100" },
    { label: "Delivery Boys", value: deliveryBoys, icon: Bike, color: "text-orange-700 bg-orange-100" },
    { label: "Products", value: products, icon: Boxes, color: "text-teal-700 bg-teal-100" },
  ];

  const statusColor = (s: string) =>
    s === "Delivered"
      ? "bg-green-100 text-green-700"
      : s === "Pending"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-blue-100 text-blue-700";

  return (
    <div className="w-[92%] md:w-[85%] mx-auto pt-[120px] pb-16">
      <h1 className="text-2xl md:text-3xl font-bold text-green-700 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border shadow-sm p-4 flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-gray-800">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Orders in the last 7 days</h2>
          <div className="flex items-end gap-3 h-40">
            {days.map((d) => (
              <div key={d.key} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                <span className="text-xs text-gray-600">{d.count}</span>
                <div
                  className="w-full bg-green-500 rounded-t-md"
                  style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count ? 4 : 2 }}
                />
                <span className="text-xs text-gray-500">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-800">Recent orders</h2>
            <Link href="/admin/manage-orders" className="text-sm text-green-700 hover:underline">
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-500">No orders yet.</p>
          ) : (
            <ul className="divide-y">
              {recentOrders.map((o: any) => (
                <li key={String(o._id)} className="py-2 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-800">
                      #{String(o._id).slice(-6).toUpperCase()} · {o.address?.fullName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(o.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${o.totalPrice}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(o.status)}`}>
                      {o.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mt-8">
        <Link href="/admin/add-grocery" className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl p-4 transition">
          <PlusCircle /> Add Grocery
        </Link>
        <Link href="/admin/view-grocery" className="flex items-center gap-3 bg-white border hover:bg-green-50 text-green-700 font-semibold rounded-xl p-4 transition">
          <Boxes /> View Products
        </Link>
        <Link href="/admin/manage-orders" className="flex items-center gap-3 bg-white border hover:bg-green-50 text-green-700 font-semibold rounded-xl p-4 transition">
          <ClipboardCheckIcon /> Manage Orders
        </Link>
      </div>
    </div>
  );
}

export default AdminDashboard;
