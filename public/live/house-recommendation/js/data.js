// ============================================================
// House Recommendation System — Property Dataset & User Data
// ============================================================

const LOCATIONS = [
  "Mumbai", "Bangalore", "Delhi", "Chennai", "Hyderabad",
  "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Goa"
];

const AMENITIES_LIST = [
  "Parking", "Gym", "Swimming Pool", "Garden", "Security",
  "Power Backup", "Lift", "Club House", "Children's Play Area",
  "Jogging Track", "Indoor Games", "Intercom", "Fire Safety",
  "Rainwater Harvesting", "CCTV", "Visitor Parking"
];

const PROPERTY_TYPES = ["Apartment", "Villa", "Independent House", "Penthouse", "Studio"];
const FURNISHING_OPTIONS = ["Furnished", "Semi-Furnished", "Unfurnished"];

// ── 50 Realistic Indian Property Listings ──────────────────────
const properties = [
  {
    id: 1,
    title: "Skyline Luxury Apartment",
    price: 9500000,
    location: "Mumbai",
    area_sqft: 1200,
    bhk: 2,
    bathrooms: 2,
    furnishing: "Furnished",
    amenities: ["Parking", "Gym", "Swimming Pool", "Security", "Lift", "CCTV", "Power Backup"],
    property_type: "Apartment",
    age_years: 2,
    floor: 15,
    description: "Premium 2BHK apartment in the heart of Mumbai with breathtaking city skyline views. Modern interiors with Italian marble flooring."
  },
  {
    id: 2,
    title: "Green Valley Villa",
    price: 25000000,
    location: "Bangalore",
    area_sqft: 3500,
    bhk: 4,
    bathrooms: 4,
    furnishing: "Furnished",
    amenities: ["Parking", "Garden", "Swimming Pool", "Security", "Club House", "Children's Play Area", "Jogging Track"],
    property_type: "Villa",
    age_years: 1,
    floor: 0,
    description: "Stunning 4BHK villa in Whitefield with lush green surroundings. Private garden, modular kitchen, and smart home features."
  },
  {
    id: 3,
    title: "Heritage Heights",
    price: 4500000,
    location: "Jaipur",
    area_sqft: 1100,
    bhk: 2,
    bathrooms: 2,
    furnishing: "Semi-Furnished",
    amenities: ["Parking", "Security", "Power Backup", "Lift", "Rainwater Harvesting"],
    property_type: "Apartment",
    age_years: 3,
    floor: 7,
    description: "Elegant 2BHK apartment near Malviya Nagar with Rajasthani architectural elements and modern comforts."
  },
  {
    id: 4,
    title: "Marina Bay Penthouse",
    price: 35000000,
    location: "Mumbai",
    area_sqft: 4200,
    bhk: 5,
    bathrooms: 5,
    furnishing: "Furnished",
    amenities: ["Parking", "Gym", "Swimming Pool", "Garden", "Security", "Lift", "Club House", "CCTV", "Power Backup", "Indoor Games"],
    property_type: "Penthouse",
    age_years: 0,
    floor: 32,
    description: "Ultra-luxury penthouse with private terrace, infinity pool, and panoramic sea views. Imported fixtures throughout."
  },
  {
    id: 5,
    title: "Tech Park Residency",
    price: 6800000,
    location: "Hyderabad",
    area_sqft: 1450,
    bhk: 3,
    bathrooms: 2,
    furnishing: "Semi-Furnished",
    amenities: ["Parking", "Gym", "Security", "Lift", "Power Backup", "Children's Play Area", "Intercom"],
    property_type: "Apartment",
    age_years: 4,
    floor: 10,
    description: "Spacious 3BHK near HITEC City with excellent connectivity. Vastu-compliant design with cross ventilation."
  },
  {
    id: 6,
    title: "Seaside Studio",
    price: 3200000,
    location: "Goa",
    area_sqft: 550,
    bhk: 1,
    bathrooms: 1,
    furnishing: "Furnished",
    amenities: ["Parking", "Swimming Pool", "Garden", "Security", "CCTV"],
    property_type: "Studio",
    age_years: 1,
    floor: 3,
    description: "Cozy furnished studio apartment just 500m from Calangute Beach. Perfect for vacation home or rental income."
  },
  {
    id: 7,
    title: "Royal Orchid Villa",
    price: 18500000,
    location: "Chennai",
    area_sqft: 2800,
    bhk: 4,
    bathrooms: 3,
    furnishing: "Furnished",
    amenities: ["Parking", "Garden", "Swimming Pool", "Security", "Club House", "Jogging Track", "Fire Safety"],
    property_type: "Villa",
    age_years: 2,
    floor: 0,
    description: "Magnificent 4BHK villa in ECR with private pool. Temple room, servants' quarters, and covered car porch."
  },
  {
    id: 8,
    title: "Metro View Apartment",
    price: 7200000,
    location: "Delhi",
    area_sqft: 1350,
    bhk: 3,
    bathrooms: 2,
    furnishing: "Semi-Furnished",
    amenities: ["Parking", "Gym", "Security", "Lift", "Power Backup", "CCTV", "Fire Safety", "Intercom"],
    property_type: "Apartment",
    age_years: 5,
    floor: 8,
    description: "Well-connected 3BHK in Dwarka near metro station. Modular kitchen with chimney and built-in wardrobes."
  },
  {
    id: 9,
    title: "Lakeside Retreat",
    price: 12000000,
    location: "Pune",
    area_sqft: 2200,
    bhk: 3,
    bathrooms: 3,
    furnishing: "Furnished",
    amenities: ["Parking", "Gym", "Swimming Pool", "Garden", "Security", "Club House", "Children's Play Area", "Jogging Track", "Indoor Games"],
    property_type: "Apartment",
    age_years: 1,
    floor: 18,
    description: "Premium 3BHK in Baner with lake-facing balcony. Italian marble, smart locks, and designer bathrooms."
  },
  {
    id: 10,
    title: "Heritage Haveli House",
    price: 8500000,
    location: "Jaipur",
    area_sqft: 2400,
    bhk: 4,
    bathrooms: 3,
    furnishing: "Unfurnished",
    amenities: ["Parking", "Garden", "Security", "Power Backup", "Rainwater Harvesting"],
    property_type: "Independent House",
    age_years: 15,
    floor: 0,
    description: "Traditional Rajasthani haveli-style independent house with courtyard. Beautiful jharokhas and stone carvings."
  },
  {
    id: 11,
    title: "Cyber City Towers",
    price: 11500000,
    location: "Hyderabad",
    area_sqft: 1800,
    bhk: 3,
    bathrooms: 3,
    furnishing: "Furnished",
    amenities: ["Parking", "Gym", "Swimming Pool", "Security", "Lift", "Club House", "Power Backup", "CCTV"],
    property_type: "Apartment",
    age_years: 2,
    floor: 22,
    description: "Luxury 3BHK in Gachibowli with panoramic views. Walk-in closets, home theater setup, and premium fittings."
  },
  {
    id: 12,
    title: "Palm Grove Residency",
    price: 5500000,
    location: "Chennai",
    area_sqft: 1250,
    bhk: 2,
    bathrooms: 2,
    furnishing: "Semi-Furnished",
    amenities: ["Parking", "Gym", "Security", "Lift", "Power Backup", "Children's Play Area", "Rainwater Harvesting"],
    property_type: "Apartment",
    age_years: 3,
    floor: 6,
    description: "Comfortable 2BHK in OMR with excellent schools nearby. East-facing with natural light and ventilation."
  },
  {
    id: 13,
    title: "Sapphire Independent House",
    price: 15000000,
    location: "Delhi",
    area_sqft: 2600,
    bhk: 4,
    bathrooms: 4,
    furnishing: "Furnished",
    amenities: ["Parking", "Garden", "Security", "Power Backup", "CCTV", "Visitor Parking"],
    property_type: "Independent House",
    age_years: 8,
    floor: 0,
    description: "Spacious independent house in Greater Kailash with terrace garden. Italian kitchen, wooden flooring, and full basement."
  },
  {
    id: 14,
    title: "Riverside Apartment",
    price: 3800000,
    location: "Kolkata",
    area_sqft: 950,
    bhk: 2,
    bathrooms: 1,
    furnishing: "Semi-Furnished",
    amenities: ["Parking", "Security", "Lift", "Power Backup", "Fire Safety"],
    property_type: "Apartment",
    age_years: 6,
    floor: 4,
    description: "Charming 2BHK along the Hooghly riverfront. High ceilings, teak wood doors, and colonial-era charm."
  },
  {
    id: 15,
    title: "Sunrise Studio Loft",
    price: 2800000,
    location: "Pune",
    area_sqft: 480,
    bhk: 1,
    bathrooms: 1,
    furnishing: "Furnished",
    amenities: ["Parking", "Gym", "Security", "Lift", "Intercom"],
    property_type: "Studio",
    age_years: 1,
    floor: 12,
    description: "Modern studio loft in Hinjewadi IT hub. Double-height ceiling, mezzanine bedroom, and co-working space access."
  },
  {
    id: 16,
    title: "Emerald Bay Villa",
    price: 42000000,
    location: "Goa",
    area_sqft: 4800,
    bhk: 5,
    bathrooms: 5,
    furnishing: "Furnished",
    amenities: ["Parking", "Garden", "Swimming Pool", "Security", "CCTV", "Power Backup", "Visitor Parking"],
    property_type: "Villa",
    age_years: 0,
    floor: 0,
    description: "Ultra-premium beachfront villa with private beach access. Infinity pool, Portuguese-style architecture, and wine cellar."
  },
  {
    id: 17,
    title: "Silicon Valley Homes",
    price: 8200000,
    location: "Bangalore",
    area_sqft: 1650,
    bhk: 3,
    bathrooms: 2,
    furnishing: "Semi-Furnished",
    amenities: ["Parking", "Gym", "Swimming Pool", "Security", "Lift", "Club House", "Children's Play Area", "Jogging Track"],
    property_type: "Apartment",
    age_years: 3,
    floor: 9,
    description: "Well-designed 3BHK in Electronic City with excellent amenities. Near top IT parks and international schools."
  },
  {
    id: 18,
    title: "Golden Nest Apartment",
    price: 4200000,
    location: "Ahmedabad",
    area_sqft: 1100,
    bhk: 2,
    bathrooms: 2,
    furnishing: "Semi-Furnished",
    amenities: ["Parking", "Gym", "Security", "Lift", "Power Backup", "Children's Play Area"],
    property_type: "Apartment",
    age_years: 4,
    floor: 5,
    description: "Modern 2BHK in SG Highway with vastu-compliant layout. Earthquake-resistant structure with premium fittings."
  },
  {
    id: 19,
    title: "Hilltop Haven Villa",
    price: 22000000,
    location: "Pune",
    area_sqft: 3200,
    bhk: 4,
    bathrooms: 4,
    furnishing: "Furnished",
    amenities: ["Parking", "Garden", "Swimming Pool", "Security", "Club House", "Jogging Track", "Indoor Games", "CCTV"],
    property_type: "Villa",
    age_years: 2,
    floor: 0,
    description: "Spectacular hilltop villa in Lavasa with valley views. Japanese garden, home automation, and outdoor BBQ area."
  },
  {
    id: 20,
    title: "Central Park Residency",
    price: 13500000,
    location: "Delhi",
    area_sqft: 2100,
    bhk: 4,
    bathrooms: 3,
    furnishing: "Semi-Furnished",
    amenities: ["Parking", "Gym", "Swimming Pool", "Garden", "Security", "Lift", "Club House", "Power Backup", "Fire Safety"],
    property_type: "Apartment",
    age_years: 3,
    floor: 14,
    description: "Elegant 4BHK overlooking central park in Sector 48 Gurugram. Italian marble flooring and designer lighting."
  },
  {
    id: 21,
    title: "Ocean Pearl Studio",
    price: 4500000,
    location: "Mumbai",
    area_sqft: 620,
    bhk: 1,
    bathrooms: 1,
    furnishing: "Furnished",
    amenities: ["Parking", "Gym", "Swimming Pool", "Security", "Lift", "CCTV"],
    property_type: "Studio",
    age_years: 1,
    floor: 20,
    description: "Chic studio in Worli with Arabian Sea views. Smart home features, built-in Murphy bed, and high-end appliances."
  },
  {
    id: 22,
    title: "Koramangala Corner House",
    price: 16000000,
    location: "Bangalore",
    area_sqft: 2400,
    bhk: 3,
    bathrooms: 3,
    furnishing: "Unfurnished",
    amenities: ["Parking", "Garden", "Security", "Power Backup", "Visitor Parking"],
    property_type: "Independent House",
    age_years: 10,
    floor: 0,
    description: "Prime corner plot independent house in Koramangala. 30x40 site with potential for expansion. Excellent appreciation area."
  },
  {
    id: 23,
    title: "Amethyst Towers",
    price: 7500000,
    location: "Hyderabad",
    area_sqft: 1500,
    bhk: 3,
    bathrooms: 2,
    furnishing: "Semi-Furnished",
    amenities: ["Parking", "Gym", "Security", "Lift", "Power Backup", "Children's Play Area", "Indoor Games", "Intercom"],
    property_type: "Apartment",
    age_years: 2,
    floor: 11,
    description: "Modern 3BHK in Kondapur with open-plan living. Granite kitchen counters and branded CP fittings throughout."
  },
  {
    id: 24,
    title: "Lotus Pond Villa",
    price: 28000000,
    location: "Chennai",
    area_sqft: 3800,
    bhk: 5,
    bathrooms: 5,
    furnishing: "Furnished",
    amenities: ["Parking", "Garden", "Swimming Pool", "Security", "Club House", "Children's Play Area", "CCTV", "Power Backup"],
    property_type: "Villa",
    age_years: 1,
    floor: 0,
    description: "Grand 5BHK villa on ECR with private lotus pond. Home theater, wine room, and separate guest wing."
  },
  {
    id: 25,
    title: "Budget Bliss Apartment",
    price: 2200000,
    location: "Kolkata",
    area_sqft: 750,
    bhk: 1,
    bathrooms: 1,
    furnishing: "Unfurnished",
    amenities: ["Parking", "Security", "Lift"],
    property_type: "Apartment",
    age_years: 7,
    floor: 3,
    description: "Affordable 1BHK in Rajarhat New Town. Close to Eco Park, shopping malls, and upcoming metro station."
  },
  {
    id: 26,
    title: "Malabar Hill Mansion",
    price: 50000000,
    location: "Mumbai",
    area_sqft: 5500,
    bhk: 5,
    bathrooms: 6,
    furnishing: "Furnished",
    amenities: ["Parking", "Gym", "Swimming Pool", "Garden", "Security", "Lift", "Club House", "CCTV", "Power Backup", "Indoor Games", "Visitor Parking"],
    property_type: "Penthouse",
    age_years: 3,
    floor: 28,
    description: "Iconic penthouse on Malabar Hill with 360° Mumbai views. Private elevator, rooftop helipad access, and art gallery space."
  },
  {
    id: 27,
    title: "Whitefield Wonder",
    price: 5800000,
    location: "Bangalore",
    area_sqft: 1300,
    bhk: 2,
    bathrooms: 2,
    furnishing: "Semi-Furnished",
    amenities: ["Parking", "Gym", "Swimming Pool", "Security", "Lift", "Children's Play Area", "Jogging Track"],
    property_type: "Apartment",
    age_years: 4,
    floor: 7,
    description: "Bright 2BHK in Whitefield with resort-style amenities. Walking distance to Phoenix Mall and ITPL."
  },
  {
    id: 28,
    title: "Navi Mumbai Heights",
    price: 6500000,
    location: "Mumbai",
    area_sqft: 1150,
    bhk: 2,
    bathrooms: 2,
    furnishing: "Semi-Furnished",
    amenities: ["Parking", "Gym", "Security", "Lift", "Power Backup", "Rainwater Harvesting", "Fire Safety"],
    property_type: "Apartment",
    age_years: 3,
    floor: 12,
    description: "Value-for-money 2BHK in Kharghar with hill views. Near upcoming Navi Mumbai International Airport."
  },
  {
    id: 29,
    title: "Indira Nagar Bungalow",
    price: 32000000,
    location: "Bangalore",
    area_sqft: 4000,
    bhk: 5,
    bathrooms: 4,
    furnishing: "Semi-Furnished",
    amenities: ["Parking", "Garden", "Security", "Power Backup", "CCTV", "Visitor Parking"],
    property_type: "Independent House",
    age_years: 12,
    floor: 0,
    description: "Heritage bungalow in prime Indiranagar. 40x60 corner site with mature trees and separate staff quarters."
  },
  {
    id: 30,
    title: "Smart City Apartment",
    price: 3500000,
    location: "Ahmedabad",
    area_sqft: 900,
    bhk: 2,
    bathrooms: 1,
    furnishing: "Unfurnished",
    amenities: ["Parking", "Security", "Lift", "Power Backup", "Children's Play Area"],
    property_type: "Apartment",
    age_years: 5,
    floor: 4,
    description: "Affordable 2BHK in GIFT City area with smart home pre-wiring. Great investment in developing precinct."
  },
  {
    id: 31,
    title: "Candolim Beach House",
    price: 15000000,
    location: "Goa",
    area_sqft: 1800,
    bhk: 3,
    bathrooms: 3,
    furnishing: "Furnished",
    amenities: ["Parking", "Garden", "Swimming Pool", "Security", "CCTV"],
    property_type: "Independent House",
    age_years: 5,
    floor: 0,
    description: "Charming beach house 200m from Candolim Beach. Open-air shower, hammock garden, and rental income potential."
  },
  {
    id: 32,
    title: "Jubilee Hills Abode",
    price: 19500000,
    location: "Hyderabad",
    area_sqft: 2800,
    bhk: 4,
    bathrooms: 4,
    furnishing: "Furnished",
    amenities: ["Parking", "Gym", "Swimming Pool", "Garden", "Security", "Lift", "Club House", "Power Backup", "CCTV"],
    property_type: "Apartment",
    age_years: 1,
    floor: 16,
    description: "Premium 4BHK in Jubilee Hills with imported marble. Private gym access, concierge services, and rooftop lounge."
  },
  {
    id: 33,
    title: "Cozy Nest 1BHK",
    price: 1800000,
    location: "Pune",
    area_sqft: 520,
    bhk: 1,
    bathrooms: 1,
    furnishing: "Unfurnished",
    amenities: ["Parking", "Security", "Lift"],
    property_type: "Apartment",
    age_years: 8,
    floor: 2,
    description: "Compact yet well-designed 1BHK in Kothrud. Near Deccan Gymkhana, colleges, and Sinhagad Road corridor."
  },
  {
    id: 34,
    title: "Anna Nagar Classic",
    price: 8800000,
    location: "Chennai",
    area_sqft: 1600,
    bhk: 3,
    bathrooms: 2,
    furnishing: "Semi-Furnished",
    amenities: ["Parking", "Gym", "Security", "Lift", "Power Backup", "Children's Play Area", "Intercom", "Fire Safety"],
    property_type: "Apartment",
    age_years: 6,
    floor: 8,
    description: "Well-maintained 3BHK in Anna Nagar West. Near tower park, VR Mall, and excellent school catchment."
  },
  {
    id: 35,
    title: "Vaishali Apartment",
    price: 5200000,
    location: "Delhi",
    area_sqft: 1100,
    bhk: 2,
    bathrooms: 2,
    furnishing: "Unfurnished",
    amenities: ["Parking", "Security", "Lift", "Power Backup", "Visitor Parking"],
    property_type: "Apartment",
    age_years: 10,
    floor: 5,
    description: "Solid 2BHK in Vaishali, Ghaziabad with metro connectivity. Marble flooring and ample storage space."
  },
  {
    id: 36,
    title: "Shanti Niketan House",
    price: 45000000,
    location: "Delhi",
    area_sqft: 5000,
    bhk: 5,
    bathrooms: 5,
    furnishing: "Furnished",
    amenities: ["Parking", "Garden", "Swimming Pool", "Security", "Power Backup", "CCTV", "Visitor Parking"],
    property_type: "Independent House",
    age_years: 20,
    floor: 0,
    description: "Prestigious Shanti Niketan bungalow on 500 sq.yard plot. Renovated interiors with vintage charm. Diplomatic enclave."
  },
  {
    id: 37,
    title: "Electronic City Compact",
    price: 4000000,
    location: "Bangalore",
    area_sqft: 980,
    bhk: 2,
    bathrooms: 1,
    furnishing: "Semi-Furnished",
    amenities: ["Parking", "Gym", "Security", "Lift", "Children's Play Area"],
    property_type: "Apartment",
    age_years: 5,
    floor: 6,
    description: "Budget-friendly 2BHK in Electronic City Phase 1. Near Infosys, Wipro campuses and Nandi Hills weekend getaway."
  },
  {
    id: 38,
    title: "Salt Lake Elegance",
    price: 6200000,
    location: "Kolkata",
    area_sqft: 1400,
    bhk: 3,
    bathrooms: 2,
    furnishing: "Semi-Furnished",
    amenities: ["Parking", "Gym", "Security", "Lift", "Power Backup", "Club House", "Fire Safety"],
    property_type: "Apartment",
    age_years: 4,
    floor: 9,
    description: "Spacious 3BHK in Salt Lake Sector V IT hub. Teak wood doors, vitrified tile flooring, and modular kitchen."
  },
  {
    id: 39,
    title: "Panjim Heritage Flat",
    price: 5500000,
    location: "Goa",
    area_sqft: 1050,
    bhk: 2,
    bathrooms: 2,
    furnishing: "Furnished",
    amenities: ["Parking", "Garden", "Security", "Power Backup"],
    property_type: "Apartment",
    age_years: 8,
    floor: 2,
    description: "Character-filled 2BHK in Fontainhas Latin Quarter. Portuguese tiles, balcão (balcony), and river views."
  },
  {
    id: 40,
    title: "Magarpatta Pinnacle",
    price: 9800000,
    location: "Pune",
    area_sqft: 1700,
    bhk: 3,
    bathrooms: 3,
    furnishing: "Furnished",
    amenities: ["Parking", "Gym", "Swimming Pool", "Security", "Lift", "Club House", "Children's Play Area", "Jogging Track", "Indoor Games"],
    property_type: "Apartment",
    age_years: 2,
    floor: 15,
    description: "Premium 3BHK in Magarpatta City township. Walk-to-work lifestyle, international school, and 24/7 security."
  },
  {
    id: 41,
    title: "Prahlad Nagar Prime",
    price: 7000000,
    location: "Ahmedabad",
    area_sqft: 1550,
    bhk: 3,
    bathrooms: 2,
    furnishing: "Semi-Furnished",
    amenities: ["Parking", "Gym", "Security", "Lift", "Power Backup", "Children's Play Area", "Club House"],
    property_type: "Apartment",
    age_years: 3,
    floor: 10,
    description: "Well-located 3BHK in Prahlad Nagar with terrace access. Near SG Highway restaurants and Iscon Mega Mall."
  },
  {
    id: 42,
    title: "Jubilee Studio",
    price: 3800000,
    location: "Hyderabad",
    area_sqft: 600,
    bhk: 1,
    bathrooms: 1,
    furnishing: "Furnished",
    amenities: ["Parking", "Gym", "Security", "Lift", "CCTV", "Intercom"],
    property_type: "Studio",
    age_years: 1,
    floor: 14,
    description: "Contemporary studio in Jubilee Hills with concierge. Ideal for working professionals. Premium locality."
  },
  {
    id: 43,
    title: "Adyar Garden House",
    price: 20000000,
    location: "Chennai",
    area_sqft: 3000,
    bhk: 4,
    bathrooms: 3,
    furnishing: "Semi-Furnished",
    amenities: ["Parking", "Garden", "Security", "Power Backup", "Rainwater Harvesting", "Visitor Parking"],
    property_type: "Independent House",
    age_years: 15,
    floor: 0,
    description: "Charming independent house in Adyar with 100-year-old banyan tree. Near IIT Madras and Theosophical Society."
  },
  {
    id: 44,
    title: "Hinjewadi Smart Home",
    price: 6000000,
    location: "Pune",
    area_sqft: 1200,
    bhk: 2,
    bathrooms: 2,
    furnishing: "Furnished",
    amenities: ["Parking", "Gym", "Swimming Pool", "Security", "Lift", "Power Backup", "Indoor Games"],
    property_type: "Apartment",
    age_years: 1,
    floor: 11,
    description: "Smart home-enabled 2BHK in Hinjewadi Phase 3. Alexa-integrated, motorized blinds, and EV charging point."
  },
  {
    id: 45,
    title: "New Town Breeze",
    price: 4800000,
    location: "Kolkata",
    area_sqft: 1200,
    bhk: 2,
    bathrooms: 2,
    furnishing: "Semi-Furnished",
    amenities: ["Parking", "Gym", "Security", "Lift", "Power Backup", "Children's Play Area", "Jogging Track"],
    property_type: "Apartment",
    age_years: 2,
    floor: 7,
    description: "Airy 2BHK in New Town Action Area 1. Near Eco Park, Biswa Bangla Convention Centre, and upcoming metro."
  },
  {
    id: 46,
    title: "C-Scheme Luxury Flat",
    price: 11000000,
    location: "Jaipur",
    area_sqft: 2000,
    bhk: 3,
    bathrooms: 3,
    furnishing: "Furnished",
    amenities: ["Parking", "Gym", "Swimming Pool", "Security", "Lift", "Club House", "Power Backup", "CCTV"],
    property_type: "Apartment",
    age_years: 2,
    floor: 12,
    description: "Upscale 3BHK in C-Scheme with club membership. Rajasthani jali screens, Italian modular kitchen, and spa bathroom."
  },
  {
    id: 47,
    title: "Porvorim Family Home",
    price: 9000000,
    location: "Goa",
    area_sqft: 1800,
    bhk: 3,
    bathrooms: 3,
    furnishing: "Semi-Furnished",
    amenities: ["Parking", "Garden", "Security", "Power Backup", "Visitor Parking"],
    property_type: "Independent House",
    age_years: 6,
    floor: 0,
    description: "Spacious family home in Porvorim with mango tree garden. Quiet residential area near Mapusa market."
  },
  {
    id: 48,
    title: "Noida Extension Value",
    price: 3000000,
    location: "Delhi",
    area_sqft: 850,
    bhk: 2,
    bathrooms: 1,
    furnishing: "Unfurnished",
    amenities: ["Parking", "Security", "Lift", "Power Backup", "Children's Play Area"],
    property_type: "Apartment",
    age_years: 6,
    floor: 3,
    description: "Budget 2BHK in Noida Extension with good connectivity. Near Gaur City Mall and upcoming metro corridor."
  },
  {
    id: 49,
    title: "Sarjapur Road Premium",
    price: 14000000,
    location: "Bangalore",
    area_sqft: 2200,
    bhk: 3,
    bathrooms: 3,
    furnishing: "Furnished",
    amenities: ["Parking", "Gym", "Swimming Pool", "Garden", "Security", "Lift", "Club House", "Children's Play Area", "Jogging Track", "CCTV"],
    property_type: "Apartment",
    age_years: 1,
    floor: 19,
    description: "Ultra-premium 3BHK on Sarjapur Road with private terrace garden. Japanese-style bathroom and butler's pantry."
  },
  {
    id: 50,
    title: "Mansarovar Budget Home",
    price: 2500000,
    location: "Jaipur",
    area_sqft: 700,
    bhk: 1,
    bathrooms: 1,
    furnishing: "Unfurnished",
    amenities: ["Parking", "Security", "Power Backup"],
    property_type: "Apartment",
    age_years: 10,
    floor: 2,
    description: "Affordable 1BHK in Mansarovar for first-time buyers. Near Durgapura railway station and local markets."
  }
];


// ── Simulated User Interaction Data (for Collaborative Filtering) ──
// Each user has rated some properties on a scale of 1-5
const users = [
  {
    id: 1,
    name: "Arjun Mehta",
    preferences: { budget_max: 15000000, preferred_locations: ["Mumbai", "Pune"], preferred_bhk: 3 },
    ratings: { 1: 4, 5: 3, 9: 5, 11: 4, 17: 3, 28: 4, 40: 5, 44: 3 }
  },
  {
    id: 2,
    name: "Priya Sharma",
    preferences: { budget_max: 30000000, preferred_locations: ["Bangalore", "Hyderabad"], preferred_bhk: 4 },
    ratings: { 2: 5, 17: 4, 22: 3, 29: 5, 32: 4, 49: 5, 11: 3 }
  },
  {
    id: 3,
    name: "Ravi Kumar",
    preferences: { budget_max: 5000000, preferred_locations: ["Chennai", "Kolkata"], preferred_bhk: 2 },
    ratings: { 12: 4, 14: 5, 25: 3, 34: 4, 38: 3, 45: 4 }
  },
  {
    id: 4,
    name: "Neha Gupta",
    preferences: { budget_max: 50000000, preferred_locations: ["Mumbai", "Delhi", "Goa"], preferred_bhk: 5 },
    ratings: { 4: 5, 16: 5, 26: 4, 36: 5, 13: 3, 31: 4 }
  },
  {
    id: 5,
    name: "Vikram Singh",
    preferences: { budget_max: 10000000, preferred_locations: ["Jaipur", "Ahmedabad"], preferred_bhk: 2 },
    ratings: { 3: 4, 10: 3, 18: 5, 30: 4, 46: 3, 50: 4, 41: 3 }
  },
  {
    id: 6,
    name: "Ananya Reddy",
    preferences: { budget_max: 20000000, preferred_locations: ["Hyderabad", "Bangalore"], preferred_bhk: 3 },
    ratings: { 5: 4, 11: 5, 23: 4, 32: 3, 42: 4, 49: 4, 17: 5 }
  },
  {
    id: 7,
    name: "Karthik Iyer",
    preferences: { budget_max: 25000000, preferred_locations: ["Chennai", "Bangalore"], preferred_bhk: 4 },
    ratings: { 7: 5, 24: 4, 34: 3, 43: 5, 12: 3, 2: 4, 49: 3 }
  },
  {
    id: 8,
    name: "Sneha Patel",
    preferences: { budget_max: 8000000, preferred_locations: ["Ahmedabad", "Pune"], preferred_bhk: 2 },
    ratings: { 18: 4, 30: 3, 41: 4, 15: 5, 33: 3, 44: 5, 40: 4 }
  },
  {
    id: 9,
    name: "Amit Banerjee",
    preferences: { budget_max: 7000000, preferred_locations: ["Kolkata", "Delhi"], preferred_bhk: 3 },
    ratings: { 14: 4, 25: 3, 38: 5, 45: 4, 8: 3, 35: 4, 48: 3 }
  },
  {
    id: 10,
    name: "Divya Nair",
    preferences: { budget_max: 15000000, preferred_locations: ["Goa", "Mumbai"], preferred_bhk: 3 },
    ratings: { 6: 4, 31: 5, 39: 4, 47: 3, 1: 4, 21: 3, 28: 4, 9: 5 }
  }
];

// ── Helper: Format price in Indian currency notation ──
function formatPrice(price) {
  if (price >= 10000000) {
    return "₹" + (price / 10000000).toFixed(2) + " Cr";
  } else if (price >= 100000) {
    return "₹" + (price / 100000).toFixed(2) + " L";
  }
  return "₹" + price.toLocaleString("en-IN");
}

// ── Helper: Get unique locations from dataset ──
function getUniqueLocations() {
  return [...new Set(properties.map(p => p.location))].sort();
}

// ── Helper: Get price range from dataset ──
function getPriceRange() {
  const prices = properties.map(p => p.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

// ── Helper: Get unique amenities from dataset ──
function getUniqueAmenities() {
  const amenities = new Set();
  properties.forEach(p => p.amenities.forEach(a => amenities.add(a)));
  return [...amenities].sort();
}

// Export for use by other modules
window.HouseData = {
  properties,
  users,
  LOCATIONS,
  AMENITIES_LIST,
  PROPERTY_TYPES,
  FURNISHING_OPTIONS,
  formatPrice,
  getUniqueLocations,
  getPriceRange,
  getUniqueAmenities
};
