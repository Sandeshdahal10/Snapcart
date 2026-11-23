import React from "react";
import Link from "next/link";
import HeroSection from "./HeroSection";
import CategorySlider from "./CategorySlider";
import GroceryCard from "./GroceryCard";
import connectDb from "@/lib/db";
import Grocery from "@/models/grocery.model";

// Escape user text so it is matched literally inside a RegExp
const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function UserDashboard({ q, category }: { q?: string; category?: string }) {
  await connectDb();
  const search = q?.trim();
  const filter: Record<string, unknown> = {};
  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ name: regex }, { category: regex }];
  }
  if (category) {
    filter.category = category;
  }
  const groceries = await Grocery.find(filter).sort({ createdAt: -1 });
  const plainGrocery = JSON.parse(JSON.stringify(groceries));
  const isFiltered = !!(search || category);

  let heading = "Featured Products";
  if (search && category) heading = `"${search}" in ${category}`;
  else if (search) heading = `Results for "${search}"`;
  else if (category) heading = category;

  return (
    <>
      {!isFiltered && <HeroSection />}
      <div className={isFiltered ? "pt-[110px]" : ""}>
        <CategorySlider />
      </div>
      <div className="w-[90%] md:w-[80%] mx-auto mt-10 flex flex-col items-center gap-2 mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-green-700 text-center">
          {heading}
        </h2>
        {isFiltered && (
          <Link href="/" className="text-sm text-green-700 underline">
            Clear filter · show all products
          </Link>
        )}
      </div>
      {plainGrocery.length === 0 ? (
        <p className="text-center text-gray-500 py-16">
          No products found. Try another search.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 pb-16">
          {plainGrocery.map((item: any) => (
            <GroceryCard item={item} key={item._id} />
          ))}
        </div>
      )}
    </>
  );
}

export default UserDashboard;
