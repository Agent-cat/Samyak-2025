import { useState, useEffect } from "react";
import Masonry from "../Components/ui/Masonry";

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("2024");
  const [key, setKey] = useState(0);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [lightboxVisible, setLightboxVisible] = useState(false);

  const categories = {
    2024: [
      {
        id: "1",
        img: "/gallery/1.JPG",
        url: "https://example.com/nature-1",
        height: 400,
      },
      {
        id: "2",
        img: "/gallery/2.JPG",
        url: "https://example.com/nature-2",
        height: 250,
      },
      {
        id: "3",
        img: "/gallery/3.JPG",
        url: "https://example.com/nature-3",
        height: 600,
      },
      {
        id: "4",
        img: "/gallery/4.JPG",
        url: "https://example.com/nature-4",
        height: 350,
      },
      {
        id: "5",
        img: "/gallery/5.jpg",
        url: "https://example.com/nature-5",
        height: 500,
      },
      {
        id: "6",
        img: "/gallery/6.JPG",
        url: "https://example.com/nature-6",
        height: 450,
      },
      {
        id: "7",
        img: "/gallery/7.JPG",
        url: "https://example.com/nature-7",
        height: 550,
      },
      {
        id: "8",
        img: "/gallery/8.JPG",
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
    setKey((prevKey) => prevKey + 1);
  };

  const handleOpenLightbox = (item) => {
    setLightboxImg(item.img);
  };

  useEffect(() => {
    if (lightboxImg) {
      const id = requestAnimationFrame(() => setLightboxVisible(true));
      return () => cancelAnimationFrame(id);
    } else {
      setLightboxVisible(false);
    }
  }, [lightboxImg]);

  const handleCloseLightbox = () => {
    setLightboxVisible(false);
    setTimeout(() => setLightboxImg(null), 200);
  };

  return (
    <div className="w-full flex flex-col items-center font-bold min-h-screen text-xl md:text-9xl text-white bg-black overflow-y-auto">
      <h1 className="mt-14 mb-8">Gallery</h1>
      <div className="flex justify-center gap-4 mb-8 z-10">
        {Object.keys(categories).map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-4 py-2 rounded-full font-sans text-sm md:text-base cursor-target transition-colors duration-300 ${
              activeCategory === category
                ? "bg-white text-black"
                : "bg-gray-800 text-white hover:bg-gray-700"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="w-full max-w-7xl px-4 pb-20">
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
          onItemClick={handleOpenLightbox}
        />
      </div>

      {lightboxImg && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm transition-opacity duration-200 ${
            lightboxVisible ? "opacity-100" : "opacity-0"
          }`}
          onClick={handleCloseLightbox}
        >
          <button
            aria-label="Close"
            className={`absolute top-4 right-4 text-white text-3xl leading-none px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 transition-colors duration-200`}
            onClick={(e) => {
              e.stopPropagation();
              handleCloseLightbox();
            }}
          >
            ×
          </button>
          <img
            src={lightboxImg}
            alt="preview"
            className={`max-w-[95vw] max-h-[85vh] rounded-lg shadow-2xl border border-white/10 transition-transform duration-200 ${
              lightboxVisible ? "scale-100" : "scale-95"
            }`}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default Gallery;
