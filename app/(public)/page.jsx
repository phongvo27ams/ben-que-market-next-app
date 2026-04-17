'use client'

import { useState } from "react";
import { useSelector } from "react-redux";
import BestSelling from "../../components/BestSelling";
import Hero from "../../components/Hero";
import Newsletter from "../../components/Newsletter";
import OurSpecs from "../../components/OurSpec";
import LatestProducts from "../../components/LatestProducts";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const products = useSelector((state) => state.product.list);

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : products;

  const handleToggleCategory = (category) => {
    setSelectedCategory((currentCategory) => currentCategory === category ? null : category);
  };

  return (
    <div>
      <Hero selectedCategory={selectedCategory} onToggleCategory={handleToggleCategory} />
      <LatestProducts products={filteredProducts} selectedCategory={selectedCategory} />
      <BestSelling products={filteredProducts} selectedCategory={selectedCategory} />
      <OurSpecs />
      <Newsletter />
    </div>
  );
}
