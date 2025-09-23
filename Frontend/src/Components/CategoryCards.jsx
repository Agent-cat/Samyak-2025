import React from "react";
import { motion } from "framer-motion";

const CategoryCards = ({ categories, onCategorySelect }) => {
  return (
    <div className="w-full bg-black ">
      <div className="mb-8  text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          SAMYAK '25 COMMITTEE
        </h1>
        <p className="text-gray-400">
          Click on any category to view team members
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((category, index) => (
          <motion.div
            key={category.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-700 transition-all duration-300 group"
            onClick={() => onCategorySelect(category.label)}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-xl">
                  {category.members.length}
                </span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-blue-400 transition-colors">
                {category.label}
              </h3>
              <p className="text-gray-400 text-sm">
                {category.members.length} member
                {category.members.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex flex-wrap gap-1">
                {category.members.slice(0, 3).map((member, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                  >
                    {member.name.split(" ")[0]}
                  </span>
                ))}
                {category.members.length > 3 && (
                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                    +{category.members.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CategoryCards;
