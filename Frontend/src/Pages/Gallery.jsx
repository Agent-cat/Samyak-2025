import { useState, useEffect } from "react";
import Masonry from "../Components/ui/Masonry";

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("2024");
  const [key, setKey] = useState(0);

  const categories = {
    2024: [
      {
        id: "1",
        img: "/img/SAMYAK2024.webp",
        url: "https://example.com/nature-1",
        height: 400,
      },
      {
        id: "2",
        img: "/img/SAMYAK2024.webp",
        url: "https://example.com/nature-2",
        height: 250,
      },
      {
        id: "3",
        img: "/img/SAMYAK2024.webp",
        url: "https://example.com/nature-3",
        height: 600,
      },
      {
        id: "4",
        img: "/img/SAMYAK2024.webp",
        url: "https://example.com/nature-4",
        height: 350,
      },
      {
        id: "5",
        img: "/img/SAMYAK2024.webp",
        url: "https://example.com/nature-5",
        height: 500,
      },
      {
        id: "6",
        img: "/img/SAMYAK2024.webp",
        url: "https://example.com/nature-6",
        height: 450,
      },
      {
        id: "7",
        img: "/img/SAMYAK2024.webp",
        url: "https://example.com/nature-7",
        height: 550,
      },
      {
        id: "8",
        img: "/img/SAMYAK2024.webp",
        url: "https://example.com/nature-8",
        height: 400,
      },
    ],
    2023: [
      {
        id: "9",
        img: "/img/SAMYAK2024.webp",
        url: "https://example.com/city-1",
        height: 400,
      },
      {
        id: "10",
        img: "/img/SAMYAK2024.webp",
        url: "https://example.com/city-2",
        height: 250,
      },
      {
        id: "11",
        img: "/img/SAMYAK2024.webp",
        url: "https://example.com/city-3",
        height: 600,
      },
      {
        id: "12",
        img: "/img/SAMYAK2024.webp",
        url: "https://example.com/city-4",
        height: 350,
      },
      {
        id: "13",
        img: "/img/SAMYAK2024.webp",
        url: "https://example.com/city-5",
        height: 500,
      },
      {
        id: "14",
        img: "/img/SAMYAK2024.webp",
        url: "https://example.com/city-6",
        height: 450,
      },
      {
        id: "15",
        img: "/img/SAMYAK2024.webp",
        url: "https://example.com/city-7",
        height: 550,
      },
      {
        id: "16",
        img: "/img/SAMYAK2024.webp",
        url: "https://example.com/city-8",
        height: 400,
      },
    ],
    2022: [
      {
        id: "17",
        img: "/img/SAMYAK2024.webp",
        url: "https://example.com/abstract-1",
        height: 400,
      },
      {
        id: "18",
        img: "/img/SAMYAK2024.webp",
        url: "https://example.com/abstract-2",
        height: 250,
      },
      {
        id: "19",
        img: "/img/SAMYAK2024.webp",
        url: "https://example.com/abstract-3",
        height: 600,
      },
      {
        id: "20",
        img: "/img/SAMYAK2024.webp",
        url: "https://example.com/abstract-4",
        height: 350,
      },
      {
        id: "21",
        img: "/img/SAMYAK2024.webp",
        url: "https://example.com/abstract-5",
        height: 500,
      },
      {
        id: "22",
        img: "/img/SAMYAK2024.webp",
        url: "https://example.com/abstract-6",
        height: 450,
      },
      {
        id: "23",
        img: "/img/SAMYAK2024.webp",
        url: "https://example.com/abstract-7",
        height: 550,
      },
      {
        id: "24",
        img: "/img/SAMYAK2024.webp",
        url: "https://example.com/abstract-8",
        height: 400,
      },
    ],
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    // Increment the key to force the Masonry component to re-mount.
    setKey((prevKey) => prevKey + 1);
  };

  return (
    <div className="w-full flex flex-col overflow-hidden items-center justify-center font-bold h-screen text-xl md:text-9xl text-white bg-black">
      <h1 className="mt-14">Gallery</h1>
      <div className="flex justify-center gap-4 mt-8 mb-8 z-10">
        {Object.keys(categories).map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-4 py-2 rounded-full font-sans text-sm md:text-base transition-colors duration-300 ${
              activeCategory === category
                ? "bg-white text-black"
                : "bg-gray-800 text-white hover:bg-gray-700"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      <Masonry
        key={key} // Use the key to force a full re-render
        items={categories[activeCategory]}
        ease="power3.out"
        duration={0.6}
        stagger={0.05}
        animateFrom="bottom"
        scaleOnHover={true}
        hoverScale={0.95}
        blurToFocus={true}
        colorShiftOnHover={false}
      />
    </div>
  );
};

export default Gallery;
