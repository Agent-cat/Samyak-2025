import { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { MoveUpRight as ArrowIcon } from "lucide-react";

// Random image URLs for team members
const randomImages = [
  "https://images.pexels.com/photos/9002742/pexels-photo-9002742.jpeg",
  "https://images.pexels.com/photos/31622979/pexels-photo-31622979.jpeg",
  "https://images.pexels.com/photos/12187128/pexels-photo-12187128.jpeg",
  "https://images.pexels.com/photos/28168248/pexels-photo-28168248.jpeg",
  "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
  "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg",
  "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg",
  "https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg",
  "https://images.pexels.com/photos/1040882/pexels-photo-1040882.jpeg",
  "https://images.pexels.com/photos/1040883/pexels-photo-1040883.jpeg",
  "https://images.pexels.com/photos/1040884/pexels-photo-1040884.jpeg",
  "https://images.pexels.com/photos/1040885/pexels-photo-1040885.jpeg",
  "https://images.pexels.com/photos/1040886/pexels-photo-1040886.jpeg",
  "https://images.pexels.com/photos/1040887/pexels-photo-1040887.jpeg",
  "https://images.pexels.com/photos/1040888/pexels-photo-1040888.jpeg",
];

// Function to get random image
const getRandomImage = (index) => {
  return randomImages[index % randomImages.length];
};

// Flatten the team data to show individual members
const createMemberData = (teamData) => {
  const memberData = [];
  let memberIndex = 0;
  teamData.forEach((position) => {
    position.members.forEach((member) => {
      memberData.push({
        key: `${position.key}-${member.id}`,
        url: member.url || getRandomImage(memberIndex),
        label: member.name,
        category: position.label,
        dept: member.dept,
        id: member.id,
      });
      memberIndex++;
    });
  });
  return memberData;
};

const teamData = [
  {
    key: 1,

    label: "Chief Executive",
    members: [
      {
        id: "2200030526",
        name: "S SASIDHAR",
        dept: "CSE",
        url: "https://images.pexels.com/photos/9002742/pexels-photo-9002742.jpeg",
      },
      {
        id: "2401510242",
        name: "K C S VENKATA REDDY",
        dept: "MBA",
        url: "https://images.pexels.com/photos/31622979/pexels-photo-31622979.jpeg",
      },
      {
        id: "2300560115",
        name: "PRABHAV SUDHAN",
        dept: "BBA",
        url: "https://images.pexels.com/photos/12187128/pexels-photo-12187128.jpeg",
      },
      {
        id: "2200040063",
        name: "HARI HARAN",
        dept: "ECE",
        url: "https://images.pexels.com/photos/28168248/pexels-photo-28168248.jpeg",
      },
    ],
  },
  {
    key: 2,

    label: "Chief Secretary",
    members: [
      {
        id: "2300520010",
        name: "T ANU LEKHANA",
        dept: "BCA",
        url: "https://images.pexels.com/photos/9002742/pexels-photo-9002742.jpeg",
      },
      {
        id: "2200030316",
        name: "UDAY",
        dept: "CSE",
        url: "https://images.pexels.com/photos/31622979/pexels-photo-31622979.jpeg",
      },
    ],
  },
  {
    key: 3,
    url: "https://images.pexels.com/photos/12187128/pexels-photo-12187128.jpeg",
    label: "Chief Student Coordinator",
    members: [
      { id: "2200040195", name: "JYOTSHNA", dept: "ECE" },
      { id: "2200032656", name: "CH JAGANNATH REDDY", dept: "CSE" },
      { id: "2401510244", name: "S SAI KIRAN", dept: "MBA" },
      { id: "2200030883", name: "G RISHITHA", dept: "CSE" },
      { id: "2300590005", name: "M JAHNAVI", dept: "BA-IAS" },
      { id: "2200032718", name: "SIVA", dept: "CSE" },
    ],
  },
  {
    key: 4,
    url: "https://images.pexels.com/photos/28168248/pexels-photo-28168248.jpeg",
    label: "Joint Secretary",
    members: [
      { id: "2300040248", name: "RAMANA", dept: "ECE" },
      { id: "2300030729", name: "V ADITYA VARMA", dept: "CSE" },
      { id: "2300090062", name: "B ESWAR", dept: "CSIT" },
    ],
  },
  {
    key: 5,
    url: "https://images.pexels.com/photos/9002742/pexels-photo-9002742.jpeg",
    label: "Chief Treasurer",
    members: [
      { id: "2200032877", name: "CH YAGNESHWAR", dept: "CSE" },
      { id: "2200570015", name: "J SHANMUKHI", dept: "BBA-LLB" },
      { id: "2401510060", name: "GANESH", dept: "MBA" },
      { id: "2200049078", name: "KAMALESH", dept: "ECE" },
    ],
  },
  {
    key: 6,
    url: "https://images.pexels.com/photos/31622979/pexels-photo-31622979.jpeg",
    label: "Chief Technical Events",
    members: [
      { id: "2200031692", name: "B JAHNAVI", dept: "CSE" },
      { id: "2200040235", name: "K GOKUL", dept: "ECE" },
      { id: "2200030939", name: "P BHANU PRAKASH", dept: "CSE" },
      { id: "2200020001", name: "B K V A CHANDRA SEKHAR", dept: "CE" },
    ],
  },
  {
    key: 7,
    url: "https://images.pexels.com/photos/12187128/pexels-photo-12187128.jpeg",
    label: "Chief Non-Technical Events",
    members: [
      { id: "2200031988", name: "Aakula Venkata Vishnu Vardhan", dept: "CSE" },
      { id: "2200080079", name: "P SAI CHARAN", dept: "AI&DS" },
      { id: "2100570037", name: "D JAGADEESH CHADRA", dept: "BBA-LLB" },
      { id: "2300510001", name: "Y. ABHINAV MANIKANTA", dept: "ARCH" },
    ],
  },
  {
    key: 8,
    url: "https://images.pexels.com/photos/28168248/pexels-photo-28168248.jpeg",
    label: "Chief PR & Marketing",
    members: [
      { id: "2200049098", name: "YASWANTH", dept: "ECE" },
      { id: "2200030175", name: "SAMEERA", dept: "CSE" },
      { id: "2200030975", name: "SATYA VENKAT", dept: "CSE" },
      { id: "2300060018", name: "T GOWTHAM SAI", dept: "EEE" },
      { id: "2300670007", name: "J BHAVANA NAGA VARSHA", dept: "FT" },
      { id: "2200031609", name: "Gondi Anitha Chowdary", dept: "CSE" },
      { id: "2300530033", name: "T JESWANTH", dept: "PHARM" },
    ],
  },
  {
    key: 9,
    url: "https://images.pexels.com/photos/9002742/pexels-photo-9002742.jpeg",
    label: "Chief Sponsorship & Collaboration",
    members: [
      { id: "2200033258", name: "G.ROHIT", dept: "CSE" },
      { id: "2200010158", name: "ARYAANI", dept: "BT" },
      { id: "2200030784", name: "B CHARAN", dept: "CSE" },
      { id: "2300560044", name: "POOJITH PRANAV V", dept: "BBA" },
      { id: "2300030596", name: "S MEGHANA", dept: "CSE" },
      { id: "2300040416", name: "CH VIVEKANANDA REDDY", dept: "ECE" },
      { id: "2300560129", name: "K SATHYA", dept: "BBA" },
    ],
  },
  {
    key: 10,
    url: "https://images.pexels.com/photos/31622979/pexels-photo-31622979.jpeg",
    label: "Chief Logistics & Space Management",
    members: [
      { id: "2401600163", name: "S SASIKANTH", dept: "MCA" },
      { id: "2200030007", name: "D SUBASH NAIDU", dept: "CSE" },
      { id: "2300030786", name: "K SRAVYA", dept: "CSE" },
      { id: "2200032220", name: "S VENKATA AANISH", dept: "CSE" },
      { id: "2200049020", name: "VENKATA SASI", dept: "ECE" },
      { id: "2200080233", name: "VENKATA SAI", dept: "AI&DS" },
    ],
  },
  {
    key: 11,
    url: "https://images.pexels.com/photos/12187128/pexels-photo-12187128.jpeg",
    label: "Chief Hospitality",
    members: [
      { id: "2401510235", name: "JYOTHIKA", dept: "MBA" },
      { id: "2401600001", name: "K ABHIVAV", dept: "MCA" },
      { id: "2200031350", name: "VENKATARAMANA", dept: "CSE" },
      { id: "2400560158", name: "M MOHANA LAKSHMI", dept: "BBA" },
      { id: "2310560039", name: "MANJUSHA G", dept: "BBA" },
      { id: "2200040040", name: "CHANDRA HASA", dept: "ECE" },
    ],
  },
  {
    key: 12,
    url: "https://images.pexels.com/photos/28168248/pexels-photo-28168248.jpeg",
    label: "Chief Website & Drafting",
    members: [
      { id: "2200040002", name: "JYOTHIKA", dept: "ECE" },
      { id: "2300031042", name: "VISHNU VARDHAN REDDY", dept: "CSE" },
      { id: "2300031230", name: "SHYAM", dept: "CSE" },
      { id: "2300033258", name: "SOHAN", dept: "CSE" },
      { id: "2200080080", name: "JASWANTH SAI", dept: "AI&DS" },
    ],
  },
  {
    key: 13,
    url: "https://images.pexels.com/photos/9002742/pexels-photo-9002742.jpeg",
    label: "Chief Registrations and Certifications",
    members: [
      { id: "2200040109", name: "NAGA SAI RAM", dept: "ECE" },
      { id: "2401510243", name: "P AKSHAY", dept: "MBA" },
      { id: "2200031596", name: "T ARAVIND", dept: "CSE" },
      { id: "2300510005", name: "T. BHUPESH KUMAR", dept: "ARCH" },
    ],
  },
  {
    key: 14,
    url: "https://images.pexels.com/photos/31622979/pexels-photo-31622979.jpeg",
    label: "Chief Creative Arts",
    members: [
      { id: "2200040157", name: "VAMSI KRISHNA", dept: "ECE" },
      { id: "2200030089", name: "MANASWINI", dept: "CSE" },
      { id: "2300010018", name: "Tanmai Guptha Ch", dept: "BT" },
    ],
  },
  {
    key: 15,
    url: "https://images.pexels.com/photos/12187128/pexels-photo-12187128.jpeg",
    label: "Chief Broadcasting",
    members: [
      { id: "2200040330", name: "K SHASHANK", dept: "ECE" },
      { id: "2200031462", name: "T GURU KALYAN", dept: "CSE" },
      { id: "2300030259", name: "SAMITH REDDY", dept: "CSE" },
      { id: "2300032390", name: "L VENKATA SAI", dept: "CSE" },
      { id: "2300660013", name: "V VINAY KRISHNA", dept: "BSc Animation" },
    ],
  },
  {
    key: 16,
    url: "https://images.pexels.com/photos/28168248/pexels-photo-28168248.jpeg",
    label: "Chief Designing",
    members: [
      { id: "2300031000", name: "ARSHA VARDHAN", dept: "CSE" },
      { id: "2400090150", name: "RUPESH SAI", dept: "CSIT" },
    ],
  },
  {
    key: 17,
    url: "https://images.pexels.com/photos/9002742/pexels-photo-9002742.jpeg",
    label: "Chief STALLS",
    members: [
      { id: "2200031565", name: "N SEVANTH", dept: "CSE" },
      { id: "2300560075", name: "ASHROF SHAIK", dept: "BBA" },
      { id: "2200030818", name: "V SRI SRAVAN", dept: "CSE" },
      { id: "2200049021", name: "JAYA KRISHNA", dept: "ECE" },
      { id: "2200033100", name: "M BINUSH", dept: "CSE" },
    ],
  },
  {
    key: 18,
    url: "https://images.pexels.com/photos/31622979/pexels-photo-31622979.jpeg",
    label: "Chief Stage Management & Culturals",
    members: [
      { id: "2401600081", name: "PAVITHARA", dept: "MCA" },
      { id: "2300560083", name: "KEERTHI MOHAN", dept: "BBA" },
      { id: "2300080177", name: "K LOKESH REDDY", dept: "AI&DS" },
      { id: "2300030744", name: "BINDHU HARIKA", dept: "CSE" },
      { id: "2300060001", name: "T HAARYA", dept: "EEE" },
      { id: "2200040020", name: "RAMYA", dept: "ECE" },
    ],
  },
  {
    key: 19,
    url: "https://images.pexels.com/photos/12187128/pexels-photo-12187128.jpeg",
    label: "Chief Info, Communication & HR",
    members: [
      { id: "23000560354", name: "SATYA ISHWARYA", dept: "BBA" },
      { id: "2300031957", name: "P LIKITH PRABHU", dept: "CSE" },
      { id: "2200049054", name: "SAI LAKSHMI", dept: "ECE" },
      { id: "2200031455", name: "N DHAIRYA KARSHINI", dept: "CSE" },
      { id: "2200031221", name: "G SAHITHI", dept: "CSE" },
    ],
  },
  {
    key: 20,
    url: "https://images.pexels.com/photos/28168248/pexels-photo-28168248.jpeg",
    label: "Chief Department Coordinator",
    members: [
      { id: "2200032635", name: "V NAGA VENKAT", dept: "CSE" },
      { id: "2300590023", name: "KIRANMAI REDDY", dept: "BA-IAS" },
      { id: "2200070004", name: "Y DHANUSH", dept: "ME" },
    ],
  },
];

// Create flattened member data for ImageReveal
const allMemberData = createMemberData(teamData);

const ImageReveal = ({ selectedCategory = null, selectedMember = null, onBack = null }) => {
  const [focusedItem, setFocusedItem] = useState(null);
  const [isLargeScreen, setIsLargeScreen] = useState(true);

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const smoothX = useSpring(cursorX, { stiffness: 300, damping: 40 });
  const smoothY = useSpring(cursorY, { stiffness: 300, damping: 40 });

  useEffect(() => {
    const updateScreen = () => {
      setIsLargeScreen(window.innerWidth >= 768);
    };
    updateScreen();
    window.addEventListener("resize", updateScreen);
    return () => window.removeEventListener("resize", updateScreen);
  }, []);

  const onMouseTrack = (e) => {
    cursorX.set(e.clientX);
    cursorY.set(e.clientY);
  };

  const onHoverActivate = (item) => {
    setFocusedItem(item);
  };

  const onHoverDeactivate = () => {
    setFocusedItem(null);
  };

  // Handle both selectedCategory and selectedMember
  let memberData;
  if (selectedMember) {
    // Convert selectedMember to the format expected by ImageReveal
    memberData = [{
      key: selectedMember.id,
      url: selectedMember.url,
      label: selectedMember.name,
      category: selectedMember.role,
      dept: selectedMember.dept,
      id: selectedMember.id
    }];
  } else if (selectedCategory) {
    memberData = allMemberData.filter((member) => member.category === selectedCategory);
  } else {
    memberData = allMemberData;
  }

  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col items-start justify-start p-4 sm:p-8">
      {(selectedCategory || selectedMember) && onBack && (
        <div className="w-full pt-20 mb-6 sm:mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/40 text-sm sm:text-base"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-medium">Back to Committees</span>
          </button>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-wider mt-4 sm:mt-6">
            {selectedMember ? selectedMember.name.toUpperCase() : selectedCategory?.toUpperCase()}
          </h2>
        </div>
      )}
      <div
        className="relative w-full min-h-fit bg-black/50 rounded-lg border border-white/10 overflow-hidden backdrop-blur-sm"
        onMouseMove={onMouseTrack}
        onMouseLeave={onHoverDeactivate}
      >
        {memberData.map((item) => (
          <div
            key={item.key}
            className="p-4 sm:p-6 cursor-pointer relative flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-white/5 transition-all duration-300"
            onMouseEnter={() => onHoverActivate(item)}
          >
            {!isLargeScreen && (
              <img
                src={item.url}
                className="w-full h-48 sm:w-32 sm:h-20 object-cover rounded-lg mb-4 sm:mb-0"
                alt={item.label}
              />
            )}
            <div className="flex-1 w-full sm:w-auto">
              <h2
                className={`uppercase text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-6xl font-black py-2 sm:py-4 lg:py-8 leading-[100%] relative transition-all duration-300 ${
                  focusedItem?.key === item.key
                    ? "text-gray-200 scale-105"
                    : "text-white"
                }`}
              >
                {item.label}
              </h2>
              {focusedItem?.key === item.key && (
                <div className="mt-2 sm:mt-4 text-sm sm:text-lg text-gray-300 font-medium tracking-wide">
                  {item.category} • {item.dept} • {item.id}
                </div>
              )}
            </div>
            <button
              className={`hidden sm:block p-4 sm:p-6 rounded-full transition-all duration-300 ease-out border-2 ${
                focusedItem?.key === item.key
                  ? "bg-white text-black border-white"
                  : "border-white/20 hover:border-white/40"
              }`}
            >
              <ArrowIcon className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
            <div
              className={`h-1 bg-white absolute bottom-0 left-0 transition-all duration-500 ease-out ${
                focusedItem?.key === item.key ? "w-full" : "w-0"
              }`}
            />
          </div>
        ))}

        {isLargeScreen && focusedItem && (
          <motion.div
            className="fixed z-30 w-[320px] sm:w-[380px] md:w-[420px] max-h-[400px] sm:max-h-[480px] md:max-h-[520px] rounded-2xl pointer-events-none shadow-2xl bg-white overflow-hidden border border-gray-200"
            style={{
              left: smoothX,
              top: smoothY,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <img
              src={focusedItem.url}
              alt={focusedItem.label}
              className="w-full h-40 sm:h-48 md:h-52 object-cover grayscale"
            />
            <div className="p-4 sm:p-6 bg-white">
              <h3 className="text-lg sm:text-xl md:text-2xl font-black text-black mb-2 sm:mb-3 tracking-wide">
                {focusedItem.label.toUpperCase()}
              </h3>
              <div className="text-sm sm:text-base md:text-lg text-gray-600 mb-1 sm:mb-2 font-medium tracking-wide">
                {focusedItem.category}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 font-mono">
                {focusedItem.dept} • {focusedItem.id}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ImageReveal;
export { teamData };
