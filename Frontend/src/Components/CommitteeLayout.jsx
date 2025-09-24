import React, { useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import ImageReveal from "./ImageReveal";

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

const CommitteeLayout = () => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [hoveredMember, setHoveredMember] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Motion values for smooth cursor tracking
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const smoothX = useSpring(cursorX, { stiffness: 300, damping: 40 });
  const smoothY = useSpring(cursorY, { stiffness: 300, damping: 40 });

  // Group members by their roles
  const committeeRoles = {
    "Chief Executive": [
      {
        id: "2200040063",
        name: "HARI HARAN",
        role: "Chief Executive",
        dept: "ECE",
        url: getRandomImage(3),
      },
      {
        id: "2200030526",
        name: "S SASIDHAR",
        role: "Chief Executive",
        dept: "CSE",
        url: getRandomImage(0),
      },
      {
        id: "2401510242",
        name: "K C S VENKATA REDDY",
        role: "Chief Executive",
        dept: "MBA",
        url: getRandomImage(1),
      },
      {
        id: "2300560115",
        name: "PRABHAV SUDHAN",
        role: "Chief Executive",
        dept: "BBA",
        url: getRandomImage(2),
      },
    ],
    "Chief Website & Drafting": [
      {
        id: "2300031042",
        name: "VISHNU VARDHAN REDDY",
        role: "Chief Website & Drafting",
        dept: "CSE",
        url: getRandomImage(54),
      },
      {
        id: "2200040002",
        name: "JYOTHIKA",
        role: "Chief Website & Drafting",
        dept: "ECE",
        url: getRandomImage(53),
      },
      {
        id: "2300031230",
        name: "SHYAM",
        role: "Chief Website & Drafting",
        dept: "CSE",
        url: getRandomImage(55),
      },

      {
        id: "2300033258",
        name: "SOHAN",
        role: "Chief Website & Drafting",
        dept: "CSE",
        url: getRandomImage(56),
      },
      {
        id: "2200080080",
        name: "JASWANTH SAI",
        role: "Chief Website & Drafting",
        dept: "AI&DS",
        url: getRandomImage(57),
      },
    ],
    "Chief Secretary": [
      {
        id: "2300520010",
        name: "T ANU LEKHANA",
        role: "Chief Secretary",
        dept: "BCA",
        url: getRandomImage(4),
      },
      {
        id: "2200030316",
        name: "UDAY",
        role: "Chief Secretary",
        dept: "CSE",
        url: getRandomImage(5),
      },
    ],
    "Chief Student Coordinator": [
      {
        id: "2200040195",
        name: "JYOTSHNA",
        role: "Chief Student Coordinator",
        dept: "ECE",
        url: getRandomImage(6),
      },
      {
        id: "2200032656",
        name: "CH JAGANNATH REDDY",
        role: "Chief Student Coordinator",
        dept: "CSE",
        url: getRandomImage(7),
      },
      {
        id: "2401510244",
        name: "S SAI KIRAN",
        role: "Chief Student Coordinator",
        dept: "MBA",
        url: getRandomImage(8),
      },
      {
        id: "2200030883",
        name: "G RISHITHA",
        role: "Chief Student Coordinator",
        dept: "CSE",
        url: getRandomImage(9),
      },
      {
        id: "2300590005",
        name: "M JAHNAVI",
        role: "Chief Student Coordinator",
        dept: "BA-IAS",
        url: getRandomImage(10),
      },
      {
        id: "2200032718",
        name: "SIVA",
        role: "Chief Student Coordinator",
        dept: "CSE",
        url: getRandomImage(11),
      },
    ],
    "Chief Department Coordinator": [
      {
        id: "2200040033",
        name: "SIVESH",
        role: "Chief Department Coordinator",
        dept: "ECE",
        url: getRandomImage(88),
      },
      {
        id: "2200032635",
        name: "V NAGA VENKAT",
        role: "Chief Department Coordinator",
        dept: "CSE",
        url: getRandomImage(88),
      },
      {
        id: "2300590023",
        name: "KIRANMAI REDDY",
        role: "Chief Department Coordinator",
        dept: "BA-IAS",
        url: getRandomImage(89),
      },
      {
        id: "2200070004",
        name: "Y DHANUSH",
        role: "Chief Department Coordinator",
        dept: "ME",
        url: getRandomImage(90),
      },
    ],
    "Joint Secretary": [
      {
        id: "2300040248",
        name: "RAMANA",
        role: "Joint Secretary",
        dept: "ECE",
        url: getRandomImage(12),
      },
      {
        id: "2300030729",
        name: "V ADITYA VARMA",
        role: "Joint Secretary",
        dept: "CSE",
        url: getRandomImage(13),
      },
      {
        id: "2300090062",
        name: "B ESWAR",
        role: "Joint Secretary",
        dept: "CSIT",
        url: getRandomImage(14),
      },
    ],
    "Chief Treasurer": [
      {
        id: "2200049078",
        name: "KAMAL",
        role: "Chief Treasurer",
        dept: "ECE",
        url: getRandomImage(18),
      },
      {
        id: "2200032877",
        name: "CH YAGNESHWAR",
        role: "Chief Treasurer",
        dept: "CSE",
        url: getRandomImage(15),
      },
      {
        id: "2200570015",
        name: "J SHANMUKHI",
        role: "Chief Treasurer",
        dept: "BBA-LLB",
        url: getRandomImage(16),
      },
      {
        id: "2401510060",
        name: "GANESH",
        role: "Chief Treasurer",
        dept: "MBA",
        url: getRandomImage(17),
      },
    ],
    "Chief Technical Events": [
      {
        id: "2200031692",
        name: "B JAHNAVI",
        role: "Chief Technical Events",
        dept: "CSE",
        url: getRandomImage(19),
      },
      {
        id: "2200040235",
        name: "K GOKUL",
        role: "Chief Technical Events",
        dept: "ECE",
        url: getRandomImage(20),
      },
      {
        id: "2300030853",
        name: "LOKAKALYAN",
        role: "Chief Technical Events",
        dept: "CSE",
        url: getRandomImage(20),
      },
      {
        id: "2200030939",
        name: "P BHANU PRAKASH",
        role: "Chief Technical Events",
        dept: "CSE",
        url: getRandomImage(21),
      },
      {
        id: "2200020001",
        name: "B K V A CHANDRA SEKHAR",
        role: "Chief Technical Events",
        dept: "CE",
        url: getRandomImage(22),
      },
    ],
    "Chief Non-Technical Events": [
      {
        id: "2200031988",
        name: "Aakula Venkata Vishnu Vardhan",
        role: "Chief Non-Technical Events",
        dept: "CSE",
        url: getRandomImage(23),
      },
      {
        id: "2200080079",
        name: "P SAI CHARAN",
        role: "Chief Non-Technical Events",
        dept: "AI&DS",
        url: getRandomImage(24),
      },
      {
        id: "2100570037",
        name: "D JAGADEESH CHADRA",
        role: "Chief Non-Technical Events",
        dept: "BBA-LLB",
        url: getRandomImage(25),
      },
      {
        id: "2300510001",
        name: "Y. ABHINAV MANIKANTA",
        role: "Chief Non-Technical Events",
        dept: "ARCH",
        url: getRandomImage(26),
      },
      {
        id: "2300030153",
        name: "LOHITH",
        role: "Chief Non-Technical Events",
        dept: "CSE",
        url: getRandomImage(26),
      },
    ],
    "Chief PR & Marketing": [
      {
        id: "2200049098",
        name: "YASWANTH",
        role: "Chief PR & Marketing",
        dept: "ECE",
        url: getRandomImage(27),
      },
      {
        id: "2200030175",
        name: "SAMEERA",
        role: "Chief PR & Marketing",
        dept: "CSE",
        url: getRandomImage(28),
      },
      {
        id: "2200030975",
        name: "SATYA VENKAT",
        role: "Chief PR & Marketing",
        dept: "CSE",
        url: getRandomImage(29),
      },
      {
        id: "2300060018",
        name: "T GOWTHAM SAI",
        role: "Chief PR & Marketing",
        dept: "EEE",
        url: getRandomImage(30),
      },
      {
        id: "2300670007",
        name: "J BHAVANA NAGA VARSHA",
        role: "Chief PR & Marketing",
        dept: "FT",
        url: getRandomImage(31),
      },
      {
        id: "2200031609",
        name: "Gondi Anitha Chowdary",
        role: "Chief PR & Marketing",
        dept: "CSE",
        url: getRandomImage(32),
      },
      {
        id: "2300530033",
        name: "T JESWANTH",
        role: "Chief PR & Marketing",
        dept: "PHARM",
        url: getRandomImage(33),
      },
    ],
    "Chief Sponsorship & Collaboration": [
      {
        id: "2200033258",
        name: "G.ROHIT",
        role: "Chief Sponsorship & Collaboration",
        dept: "CSE",
        url: getRandomImage(34),
      },
      {
        id: "2300040416",
        name: "CH VIVEKANANDA REDDY",
        role: "Chief Sponsorship & Collaboration",
        dept: "ECE",
        url: getRandomImage(39),
      },
      {
        id: "2200010158",
        name: "ARYAANI",
        role: "Chief Sponsorship & Collaboration",
        dept: "BT",
        url: getRandomImage(35),
      },
      {
        id: "2200030784",
        name: "B CHARAN",
        role: "Chief Sponsorship & Collaboration",
        dept: "CSE",
        url: getRandomImage(36),
      },
      {
        id: "2300560044",
        name: "POOJITH PRANAV V",
        role: "Chief Sponsorship & Collaboration",
        dept: "BBA",
        url: getRandomImage(37),
      },
      {
        id: "2300030596",
        name: "S MEGHANA",
        role: "Chief Sponsorship & Collaboration",
        dept: "CSE",
        url: getRandomImage(38),
      },
      {
        id: "2300560129",
        name: "K SATHYA",
        role: "Chief Sponsorship & Collaboration",
        dept: "BBA",
        url: getRandomImage(40),
      },
    ],
    "Chief Logistics & Space Management": [
      {
        id: "2401600163",
        name: "S SASIKANTH",
        role: "Chief Logistics & Space Management",
        dept: "MCA",
        url: getRandomImage(41),
      },
      {
        id: "2200030007",
        name: "D SUBASH NAIDU",
        role: "Chief Logistics & Space Management",
        dept: "CSE",
        url: getRandomImage(42),
      },
      {
        id: "2300030786",
        name: "K SRAVYA",
        role: "Chief Logistics & Space Management",
        dept: "CSE",
        url: getRandomImage(43),
      },
      {
        id: "2200032220",
        name: "S VENKATA AANISH",
        role: "Chief Logistics & Space Management",
        dept: "CSE",
        url: getRandomImage(44),
      },
      {
        id: "2200040066",
        name: "SRIVATSA",
        role: "Chief Logistics & Space Management",
        dept: "ECE",
        url: getRandomImage(45),
      },
      {
        id: "2300040409",
        name: "DHARMENDRA",
        role: "Chief Logistics & Space Management",
        dept: "CSE",
        url: getRandomImage(45),
      },
      {
        id: "2200080233",
        name: "VENKATA SAI",
        role: "Chief Logistics & Space Management",
        dept: "AI&DS",
        url: getRandomImage(46),
      },
    ],
    "Chief Hospitality": [
      {
        id: "2401510235",
        name: "JYOTHIKA",
        role: "Chief Hospitality",
        dept: "MBA",
        url: getRandomImage(47),
      },
      {
        id: "2401600001",
        name: "K ABHIVAV",
        role: "Chief Hospitality",
        dept: "MCA",
        url: getRandomImage(48),
      },
      {
        id: "2200031350",
        name: "VENKATARAMANA",
        role: "Chief Hospitality",
        dept: "CSE",
        url: getRandomImage(49),
      },
      {
        id: "2300560384",
        name: "V.SARUPYA",
        role: "Chief Hospitality",
        dept: "BBA",
        url: getRandomImage(50),
      },
      {
        id: "2310560039",
        name: "MANJUSHA G",
        role: "Chief Hospitality",
        dept: "BBA",
        url: getRandomImage(51),
      },
      {
        id: "2200040040",
        name: "CHANDRA HASA",
        role: "Chief Hospitality",
        dept: "ECE",
        url: getRandomImage(52),
      },
    ],

    "Chief Registrations and Certifications": [
      {
        id: "2401510243",
        name: "P AKSHAY",
        role: "Chief Registrations and Certifications",
        dept: "MBA",
        url: getRandomImage(59),
      },
      {
        id: "2200031596",
        name: "T ARAVIND",
        role: "Chief Registrations and Certifications",
        dept: "CSE",
        url: getRandomImage(60),
      },
      {
        id: "2300510005",
        name: "T. BHUPESH KUMAR",
        role: "Chief Registrations and Certifications",
        dept: "ARCH",
        url: getRandomImage(61),
      },
      {
        id: "2200031385",
        name: "SARWAN SAI",
        role: "Chief Registrations and Certifications",
        dept: "CSE",
        url: getRandomImage(58),
      },
      {
        id: "2200040109",
        name: "NAGA SAI RAM",
        role: "Chief Registrations and Certifications",
        dept: "ECE",
        url: getRandomImage(58),
      },
    ],
    "Chief Creative Arts": [
      {
        id: "2200040157",
        name: "VAMSI KRISHNA",
        role: "Chief Creative Arts",
        dept: "ECE",
        url: getRandomImage(62),
      },
      {
        id: "2200030089",
        name: "MANASWINI",
        role: "Chief Creative Arts",
        dept: "CSE",
        url: getRandomImage(63),
      },
      {
        id: "2300031581",
        name: "J SHOBITH",
        role: "Chief Creative Arts",
        dept: "CSE",
        url: getRandomImage(63),
      },
      {
        id: "2300010018",
        name: "Tanmai Guptha Ch",
        role: "Chief Creative Arts",
        dept: "BT",
        url: getRandomImage(64),
      },
    ],
    "Chief Broadcasting": [
      {
        id: "2300030259",
        name: "SAMITH REDDY",
        role: "Chief Broadcasting",
        dept: "CSE",
        url: getRandomImage(67),
      },
      {
        id: "2200040330",
        name: "K SHASHANK",
        role: "Chief Broadcasting",
        dept: "ECE",
        url: getRandomImage(65),
      },
      {
        id: "2200031462",
        name: "T GURU KALYAN",
        role: "Chief Broadcasting",
        dept: "CSE",
        url: getRandomImage(66),
      },

      {
        id: "2300032390",
        name: "L VENKATA SAI",
        role: "Chief Broadcasting",
        dept: "CSE",
        url: getRandomImage(68),
      },
      {
        id: "2300660013",
        name: "V VINAY KRISHNA",
        role: "Chief Broadcasting",
        dept: "BSc Animation",
        url: getRandomImage(69),
      },
    ],
    "Chief Designing": [
      {
        id: "2300031000",
        name: "ARSHA VARDHAN",
        role: "Chief Designing",
        dept: "CSE",
        url: getRandomImage(70),
      },
      {
        id: "2400090150",
        name: "RUPESH SAI",
        role: "Chief Designing",
        dept: "CSIT",
        url: getRandomImage(71),
      },
      {
        id: "2200069065",
        name: "BANOTH JAYANTH",
        role: "Chief Designing",
        dept: "EEE",
        url: getRandomImage(71),
      },
    ],
    "Chief STALLS": [
      {
        id: "2200031565",
        name: "N SEVANTH",
        role: "Chief STALLS",
        dept: "CSE",
        url: getRandomImage(72),
      },
      {
        id: "2300560075",
        name: "ASHROF SHAIK",
        role: "Chief STALLS",
        dept: "BBA",
        url: getRandomImage(73),
      },
      {
        id: "2200030818",
        name: "V SRI SRAVAN",
        role: "Chief STALLS",
        dept: "CSE",
        url: getRandomImage(74),
      },
      {
        id: "2200049021",
        name: "JAYA KRISHNA",
        role: "Chief STALLS",
        dept: "ECE",
        url: getRandomImage(75),
      },
      {
        id: "2300560074",
        name: "P.RISHI",
        role: "Chief STALLS",
        dept: "BBA",
        url: getRandomImage(75),
      },
      {
        id: "2200033100",
        name: "M BINUSH",
        role: "Chief STALLS",
        dept: "CSE",
        url: getRandomImage(76),
      },
    ],
    "Chief Stage Management & Culturals": [
      {
        id: "2401600081",
        name: "PAVITHARA",
        role: "Chief Stage Management & Culturals",
        dept: "MCA",
        url: getRandomImage(77),
      },
      {
        id: "2300560083",
        name: "KEERTHI MOHAN",
        role: "Chief Stage Management & Culturals",
        dept: "BBA",
        url: getRandomImage(78),
      },
      {
        id: "2300080177",
        name: "K LOKESH REDDY",
        role: "Chief Stage Management & Culturals",
        dept: "AI&DS",
        url: getRandomImage(79),
      },
      {
        id: "2300030744",
        name: "BINDHU HARIKA",
        role: "Chief Stage Management & Culturals",
        dept: "CSE",
        url: getRandomImage(80),
      },
      {
        id: "2300060001",
        name: "T HAARYA",
        role: "Chief Stage Management & Culturals",
        dept: "EEE",
        url: getRandomImage(81),
      },
      {
        id: "2200040020",
        name: "RAMYA",
        role: "Chief Stage Management & Culturals",
        dept: "ECE",
        url: getRandomImage(82),
      },
    ],
    "Chief Info, Communication & HR": [
      {
        id: "23000560354",
        name: "SATYA ISHWARYA",
        role: "Chief Info, Communication & HR",
        dept: "BBA",
        url: getRandomImage(83),
      },
      {
        id: "2300031957",
        name: "P LIKITH PRABHU",
        role: "Chief Info, Communication & HR",
        dept: "CSE",
        url: getRandomImage(84),
      },
      {
        id: "2200049054",
        name: "SAI LAKSHMI",
        role: "Chief Info, Communication & HR",
        dept: "ECE",
        url: getRandomImage(85),
      },
      {
        id: "2200031455",
        name: "N DHAIRYA KARSHINI",
        role: "Chief Info, Communication & HR",
        dept: "CSE",
        url: getRandomImage(86),
      },
      {
        id: "2200031221",
        name: "G SAHITHI",
        role: "Chief Info, Communication & HR",
        dept: "CSE",
        url: getRandomImage(87),
      },
    ],
    "Chief Emergency": [
      {
        id: "2200040057",
        name: "MANJU VANI",
        role: "Chief Emergency",
        dept: "ECE",
        url: getRandomImage(83),
      },
      {
        id: "2300031582",
        name: "J SNEHITH",
        role: "Chief Emergency",
        dept: "CSE",
        url: getRandomImage(84),
      },
      {
        id: "2200031712",
        name: "LIKITHA",
        role: "Chief Emergency",
        dept: "CSE",
        url: getRandomImage(85),
      },
      {
        id: "2401030002",
        name: "K.chandu prakash",
        role: "Chief Emergency",
        dept: "MTECH",
        url: getRandomImage(86),
      },
    ],
  };

  const handleMemberClick = (member) => {
    setSelectedMember(member);
  };

  const handleBackToCommittees = () => {
    setSelectedMember(null);
  };

  // Mouse tracking for hover effects
  const handleMouseMove = (e) => {
    cursorX.set(e.clientX);
    cursorY.set(e.clientY);
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMemberHover = (member) => {
    setHoveredMember(member);
  };

  const handleMemberLeave = () => {
    setHoveredMember(null);
  };

  // If a member is selected, show ImageReveal
  if (selectedMember) {
    return (
      <ImageReveal
        selectedMember={selectedMember}
        onBack={handleBackToCommittees}
      />
    );
  }

  return (
    <div
      className="w-full min-h-screen bg-black text-white p-8 relative"
      onMouseMove={handleMouseMove}
    >
      {/* Hover Image Preview */}
      {hoveredMember && (
        <motion.div
          className="fixed z-50 pointer-events-none"
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
          <div className="relative">
            <img
              src={hoveredMember.url}
              alt={hoveredMember.name}
              className="w-64 h-80 object-cover rounded-2xl shadow-2xl border-2 border-white/20"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-2xl"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-white font-bold text-lg mb-1">
                {hoveredMember.name}
              </h3>
              <p className="text-white/90 text-sm font-medium">
                {hoveredMember.role}
              </p>
              <p className="text-white/70 text-xs">{hoveredMember.dept}</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto pt-28 ">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-2xl font-light text-gray-300 mb-8 tracking-wide">
            STUDENT COMMITTEE
          </h2>
          <div className="h-0.5 w-40 bg-white mx-auto"></div>
        </motion.div>

        {/* Role-based Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {Object.entries(committeeRoles).map(
            ([roleName, members], roleIndex) => (
              <motion.div
                key={roleName}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: roleIndex * 0.1 }}
                className="space-y-6"
              >
                {/* Role Header */}
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2 tracking-wide">
                    {roleName.toUpperCase()}
                  </h2>

                  <p className="text-gray-400 text-sm mt-2">
                    {members.length} member{members.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Members List */}
                <div className="space-y-4">
                  {members.map((member, memberIndex) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.6,
                        delay: roleIndex * 0.1 + memberIndex * 0.05,
                      }}
                      className="group cursor-pointer"
                      onClick={() => handleMemberClick(member)}
                      onMouseEnter={() => handleMemberHover(member)}
                      onMouseLeave={handleMemberLeave}
                    >
                      <div className="flex flex-col space-y-1 py-3 hover:bg-gray-900/30 transition-colors duration-300 rounded-lg px-4 -mx-4">
                        <span className="text-white font-medium text-lg leading-tight group-hover:text-blue-300 transition-colors">
                          {member.name}
                        </span>
                        <span className="text-gray-400 text-sm font-light tracking-wide group-hover:text-blue-200 transition-colors">
                          {member.dept} • {member.id}
                        </span>
                      </div>
                      {memberIndex < members.length - 1 && (
                        <div className="h-px bg-gray-800 mt-4"></div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )
          )}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center mt-16"
        >
          <p className="text-gray-500 text-sm tracking-wide">
            Click on any member to view details
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default CommitteeLayout;
