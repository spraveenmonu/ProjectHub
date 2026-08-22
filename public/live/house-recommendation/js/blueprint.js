// ============================================================
// House Recommendation System — Blueprint & Floor Plan Generator
// Generates visual floor plans based on user inputs
// ============================================================

(function () {
  "use strict";

  let activeBlueprintConfig = null;

  // ── Floor-specific room allocations for multi-floor designs ──
  function getRoomsForFloor(bhk, totalFloors, floorIndex) {
    let rooms;
    if (totalFloors === 1) {
      const template = ROOM_TEMPLATES[Math.min(bhk, 5)] || ROOM_TEMPLATES[3];
      rooms = template.rooms.map(r => ({ ...r }));
    } else if (totalFloors === 2) {
      if (floorIndex === 0) {
        rooms = [
          { name: "Living Room", type: "living", ratio: 0.35, color: "#3b82f6", icon: "🛋️" },
          { name: "Kitchen", type: "kitchen", ratio: 0.20, color: "#f59e0b", icon: "🍳" },
          { name: "Dining Hall", type: "dining", ratio: 0.15, color: "#ec4899", icon: "🍽️" },
          { name: "Bath 1", type: "bathroom", ratio: 0.08, color: "#06b6d4", icon: "🚿" },
          { name: "Staircase", type: "passage", ratio: 0.12, color: "#6b7280", icon: "🧗" }
        ];
        if (bhk >= 4) {
          rooms.push({ name: "Guest Bed", type: "bedroom", ratio: 0.10, color: "#a78bfa", icon: "🛏️" });
        }
      } else {
        rooms = [
          { name: "Master Bed", type: "bedroom", ratio: 0.30, color: "#8b5cf6", icon: "🛏️" },
          { name: "Family Lounge", type: "living", ratio: 0.20, color: "#60a5fa", icon: "🛋️" },
          { name: "Bath 2", type: "bathroom", ratio: 0.10, color: "#22d3ee", icon: "🚿" },
          { name: "Balcony", type: "balcony", ratio: 0.10, color: "#10b981", icon: "🌿" },
          { name: "Staircase", type: "passage", ratio: 0.10, color: "#6b7280", icon: "🧗" }
        ];
        if (bhk === 2) {
          rooms.push({ name: "Kids Bed", type: "bedroom", ratio: 0.20, color: "#a78bfa", icon: "🛏️" });
        } else if (bhk === 3) {
          rooms.push({ name: "Bedroom 2", type: "bedroom", ratio: 0.18, color: "#a78bfa", icon: "🛏️" });
          rooms.push({ name: "Pooja Room", type: "pooja", ratio: 0.08, color: "#fbbf24", icon: "🪔" });
        } else if (bhk === 4) {
          rooms.push({ name: "Bedroom 2", type: "bedroom", ratio: 0.16, color: "#a78bfa", icon: "🛏️" });
          rooms.push({ name: "Bedroom 3", type: "bedroom", ratio: 0.14, color: "#c4b5fd", icon: "🛏️" });
        } else if (bhk >= 5) {
          rooms.push({ name: "Bedroom 2", type: "bedroom", ratio: 0.14, color: "#a78bfa", icon: "🛏️" });
          rooms.push({ name: "Bedroom 3", type: "bedroom", ratio: 0.12, color: "#c4b5fd", icon: "🛏️" });
          rooms.push({ name: "Study Room", type: "study", ratio: 0.10, color: "#14b8a6", icon: "📚" });
        }
      }
    } else {
      if (floorIndex === 0) {
        rooms = [
          { name: "Living Room", type: "living", ratio: 0.35, color: "#3b82f6", icon: "🛋️" },
          { name: "Kitchen", type: "kitchen", ratio: 0.22, color: "#f59e0b", icon: "🍳" },
          { name: "Dining Room", type: "dining", ratio: 0.15, color: "#ec4899", icon: "🍽️" },
          { name: "Bath 1", type: "bathroom", ratio: 0.08, color: "#06b6d4", icon: "🚿" },
          { name: "Staircase", type: "passage", ratio: 0.10, color: "#6b7280", icon: "🧗" },
          { name: "Lobby", type: "passage", ratio: 0.10, color: "#6b7280", icon: "🚪" }
        ];
      } else if (floorIndex === 1) {
        rooms = [
          { name: "Master Bed", type: "bedroom", ratio: 0.30, color: "#8b5cf6", icon: "🛏️" },
          { name: "Family Lounge", type: "living", ratio: 0.22, color: "#60a5fa", icon: "🛋️" },
          { name: "Bath 2", type: "bathroom", ratio: 0.10, color: "#22d3ee", icon: "🚿" },
          { name: "Balcony", type: "balcony", ratio: 0.10, color: "#10b981", icon: "🌿" },
          { name: "Staircase", type: "passage", ratio: 0.10, color: "#6b7280", icon: "🧗" }
        ];
        if (bhk === 2) {
          rooms.push({ name: "Kids Bed", type: "bedroom", ratio: 0.18, color: "#a78bfa", icon: "🛏️" });
        } else if (bhk >= 3) {
          rooms.push({ name: "Bedroom 2", type: "bedroom", ratio: 0.18, color: "#a78bfa", icon: "🛏️" });
        }
      } else {
        rooms = [
          { name: "Staircase", type: "passage", ratio: 0.12, color: "#6b7280", icon: "🧗" },
          { name: "Open Terrace", type: "balcony", ratio: 0.35, color: "#10b981", icon: "🌸" },
          { name: "Study/Office", type: "study", ratio: 0.20, color: "#14b8a6", icon: "📚" }
        ];
        if (bhk === 3) {
          rooms.push({ name: "Guest Bed", type: "bedroom", ratio: 0.23, color: "#c4b5fd", icon: "🛏️" });
          rooms.push({ name: "Bath 3", type: "bathroom", ratio: 0.10, color: "#67e8f9", icon: "🚿" });
        } else if (bhk === 4) {
          rooms.push({ name: "Bedroom 3", type: "bedroom", ratio: 0.20, color: "#c4b5fd", icon: "🛏️" });
          rooms.push({ name: "Bath 3", type: "bathroom", ratio: 0.08, color: "#67e8f9", icon: "🚿" });
          rooms.push({ name: "Store Room", type: "store", ratio: 0.05, color: "#78716c", icon: "📦" });
        } else if (bhk >= 5) {
          rooms.push({ name: "Bedroom 3", type: "bedroom", ratio: 0.16, color: "#c4b5fd", icon: "🛏️" });
          rooms.push({ name: "Bedroom 4", type: "bedroom", ratio: 0.14, color: "#ddd6fe", icon: "🛏️" });
          rooms.push({ name: "Bath 3", type: "bathroom", ratio: 0.08, color: "#67e8f9", icon: "🚿" });
          rooms.push({ name: "Gym Room", type: "gym", ratio: 0.10, color: "#f97316", icon: "🏋️" });
        }
      }
    }

    // Append custom added rooms if any
    if (activeBlueprintConfig && activeBlueprintConfig.addedRooms && activeBlueprintConfig.addedRooms[floorIndex]) {
      const added = activeBlueprintConfig.addedRooms[floorIndex].map(r => ({ ...r }));
      rooms = [...rooms, ...added];
    }

    // Filter out deleted rooms
    if (activeBlueprintConfig && activeBlueprintConfig.deletedRooms) {
      rooms = rooms.filter(r => !activeBlueprintConfig.deletedRooms[`${floorIndex}_${r.name}`]);
    }

    // Apply custom ratio overrides
    if (activeBlueprintConfig && activeBlueprintConfig.customRatios) {
      rooms.forEach(r => {
        const key = `${floorIndex}_${r.name}`;
        if (activeBlueprintConfig.customRatios[key] !== undefined) {
          r.ratio = activeBlueprintConfig.customRatios[key];
        }
      });
    }

    normalizeRatios(rooms);
    return rooms;
  }

  function normalizeRatios(rooms) {
    const sum = rooms.reduce((s, r) => s + r.ratio, 0);
    if (sum > 0) {
      rooms.forEach(r => {
        r.ratio = r.ratio / sum;
      });
    }
  }

  // ── Room configuration templates by BHK ──
  const ROOM_TEMPLATES = {
    1: {
      rooms: [
        { name: "Living Room", type: "living", ratio: 0.30, color: "#3b82f6", icon: "🛋️" },
        { name: "Bedroom", type: "bedroom", ratio: 0.25, color: "#8b5cf6", icon: "🛏️" },
        { name: "Kitchen", type: "kitchen", ratio: 0.18, color: "#f59e0b", icon: "🍳" },
        { name: "Bathroom", type: "bathroom", ratio: 0.10, color: "#06b6d4", icon: "🚿" },
        { name: "Balcony", type: "balcony", ratio: 0.07, color: "#10b981", icon: "🌿" },
        { name: "Passage", type: "passage", ratio: 0.10, color: "#6b7280", icon: "🚪" }
      ]
    },
    2: {
      rooms: [
        { name: "Living Room", type: "living", ratio: 0.22, color: "#3b82f6", icon: "🛋️" },
        { name: "Master Bed", type: "bedroom", ratio: 0.18, color: "#8b5cf6", icon: "🛏️" },
        { name: "Bedroom 2", type: "bedroom", ratio: 0.15, color: "#a78bfa", icon: "🛏️" },
        { name: "Kitchen", type: "kitchen", ratio: 0.14, color: "#f59e0b", icon: "🍳" },
        { name: "Dining", type: "dining", ratio: 0.08, color: "#ec4899", icon: "🍽️" },
        { name: "Bath 1", type: "bathroom", ratio: 0.06, color: "#06b6d4", icon: "🚿" },
        { name: "Bath 2", type: "bathroom", ratio: 0.05, color: "#22d3ee", icon: "🚿" },
        { name: "Balcony", type: "balcony", ratio: 0.06, color: "#10b981", icon: "🌿" },
        { name: "Passage", type: "passage", ratio: 0.06, color: "#6b7280", icon: "🚪" }
      ]
    },
    3: {
      rooms: [
        { name: "Living Room", type: "living", ratio: 0.18, color: "#3b82f6", icon: "🛋️" },
        { name: "Master Bed", type: "bedroom", ratio: 0.15, color: "#8b5cf6", icon: "🛏️" },
        { name: "Bedroom 2", type: "bedroom", ratio: 0.13, color: "#a78bfa", icon: "🛏️" },
        { name: "Bedroom 3", type: "bedroom", ratio: 0.12, color: "#c4b5fd", icon: "🛏️" },
        { name: "Kitchen", type: "kitchen", ratio: 0.10, color: "#f59e0b", icon: "🍳" },
        { name: "Dining", type: "dining", ratio: 0.08, color: "#ec4899", icon: "🍽️" },
        { name: "Bath 1", type: "bathroom", ratio: 0.05, color: "#06b6d4", icon: "🚿" },
        { name: "Bath 2", type: "bathroom", ratio: 0.05, color: "#22d3ee", icon: "🚿" },
        { name: "Balcony", type: "balcony", ratio: 0.06, color: "#10b981", icon: "🌿" },
        { name: "Pooja Room", type: "pooja", ratio: 0.03, color: "#fbbf24", icon: "🪔" },
        { name: "Passage", type: "passage", ratio: 0.05, color: "#6b7280", icon: "🚪" }
      ]
    },
    4: {
      rooms: [
        { name: "Living Room", type: "living", ratio: 0.15, color: "#3b82f6", icon: "🛋️" },
        { name: "Master Bed", type: "bedroom", ratio: 0.13, color: "#8b5cf6", icon: "🛏️" },
        { name: "Bedroom 2", type: "bedroom", ratio: 0.11, color: "#a78bfa", icon: "🛏️" },
        { name: "Bedroom 3", type: "bedroom", ratio: 0.10, color: "#c4b5fd", icon: "🛏️" },
        { name: "Bedroom 4", type: "bedroom", ratio: 0.10, color: "#ddd6fe", icon: "🛏️" },
        { name: "Kitchen", type: "kitchen", ratio: 0.08, color: "#f59e0b", icon: "🍳" },
        { name: "Dining", type: "dining", ratio: 0.07, color: "#ec4899", icon: "🍽️" },
        { name: "Bath 1", type: "bathroom", ratio: 0.04, color: "#06b6d4", icon: "🚿" },
        { name: "Bath 2", type: "bathroom", ratio: 0.04, color: "#22d3ee", icon: "🚿" },
        { name: "Bath 3", type: "bathroom", ratio: 0.03, color: "#67e8f9", icon: "🚿" },
        { name: "Balcony", type: "balcony", ratio: 0.05, color: "#10b981", icon: "🌿" },
        { name: "Store", type: "store", ratio: 0.03, color: "#78716c", icon: "📦" },
        { name: "Pooja Room", type: "pooja", ratio: 0.03, color: "#fbbf24", icon: "🪔" },
        { name: "Passage", type: "passage", ratio: 0.04, color: "#6b7280", icon: "🚪" }
      ]
    },
    5: {
      rooms: [
        { name: "Living Room", type: "living", ratio: 0.13, color: "#3b82f6", icon: "🛋️" },
        { name: "Master Suite", type: "bedroom", ratio: 0.12, color: "#8b5cf6", icon: "🛏️" },
        { name: "Bedroom 2", type: "bedroom", ratio: 0.09, color: "#a78bfa", icon: "🛏️" },
        { name: "Bedroom 3", type: "bedroom", ratio: 0.09, color: "#c4b5fd", icon: "🛏️" },
        { name: "Bedroom 4", type: "bedroom", ratio: 0.08, color: "#ddd6fe", icon: "🛏️" },
        { name: "Bedroom 5", type: "bedroom", ratio: 0.08, color: "#ede9fe", icon: "🛏️" },
        { name: "Kitchen", type: "kitchen", ratio: 0.07, color: "#f59e0b", icon: "🍳" },
        { name: "Dining Hall", type: "dining", ratio: 0.06, color: "#ec4899", icon: "🍽️" },
        { name: "Family Room", type: "living", ratio: 0.06, color: "#60a5fa", icon: "👨‍👩‍👧‍👦" },
        { name: "Bath 1", type: "bathroom", ratio: 0.03, color: "#06b6d4", icon: "🚿" },
        { name: "Bath 2", type: "bathroom", ratio: 0.03, color: "#22d3ee", icon: "🚿" },
        { name: "Bath 3", type: "bathroom", ratio: 0.03, color: "#67e8f9", icon: "🚿" },
        { name: "Balcony", type: "balcony", ratio: 0.04, color: "#10b981", icon: "🌿" },
        { name: "Store", type: "store", ratio: 0.02, color: "#78716c", icon: "📦" },
        { name: "Pooja", type: "pooja", ratio: 0.02, color: "#fbbf24", icon: "🪔" },
        { name: "Servant", type: "servant", ratio: 0.03, color: "#9ca3af", icon: "🏠" },
        { name: "Passage", type: "passage", ratio: 0.02, color: "#6b7280", icon: "🚪" }
      ]
    }
  };

  // ── Style recommendations ──
  const STYLE_DETAILS = {
    "Modern": {
      description: "Clean lines, open floor plans, floor-to-ceiling windows, and minimalist aesthetics. Uses concrete, steel, and glass.",
      features: ["Open Floor Plan", "Large Windows", "Flat Roof", "Minimalist Interior", "Neutral Palette", "Smart Home Ready"],
      materials: ["Reinforced Concrete", "Steel Frame", "Tempered Glass", "Engineered Wood", "Ceramic Tiles"],
      color: "#3b82f6"
    },
    "Traditional": {
      description: "Classic Indian architecture with ornate details, courtyards, and Vastu-compliant layouts. Rich wooden elements.",
      features: ["Vastu Compliant", "Central Courtyard", "Ornate Carvings", "Pooja Room", "Sit-out Veranda", "Jali Screens"],
      materials: ["Red Brick", "Teak Wood", "Marble Flooring", "Clay Tiles", "Granite Stone"],
      color: "#f59e0b"
    },
    "Contemporary": {
      description: "Blend of modern and traditional with bold geometric shapes, mixed materials, and dramatic lighting.",
      features: ["Mixed Materials", "Bold Geometry", "Accent Lighting", "Indoor Garden", "Double Height Ceiling", "Statement Staircase"],
      materials: ["Exposed Brick", "Polished Concrete", "Wood Cladding", "Metal Accents", "Italian Marble"],
      color: "#8b5cf6"
    },
    "Minimalist": {
      description: "\"Less is more\" philosophy with maximum functionality in minimum space. Japanese-inspired clean aesthetics.",
      features: ["Compact Design", "Built-in Storage", "Concealed Wiring", "Natural Light", "Multi-Purpose Rooms", "Zen Garden"],
      materials: ["Light Wood", "White Plaster", "Bamboo", "Recycled Materials", "Polished Stone"],
      color: "#10b981"
    },
    "Colonial": {
      description: "Indo-European fusion with pillared porticos, arched windows, high ceilings, and wrap-around verandas.",
      features: ["Pillared Entrance", "Arched Windows", "High Ceilings", "Veranda", "Wooden Staircase", "Garden Lawn"],
      materials: ["Lime Mortar", "Burma Teak", "Cast Iron", "Mosaic Tiles", "Laterite Stone"],
      color: "#ef4444"
    }
  };

  // ── Cost breakdown ratios ──
  const COST_BREAKDOWN = {
    "Foundation & Structure": 0.30,
    "Walls & Masonry": 0.15,
    "Roofing": 0.08,
    "Flooring & Tiling": 0.10,
    "Plumbing & Sanitary": 0.08,
    "Electrical & Wiring": 0.07,
    "Doors & Windows": 0.06,
    "Painting & Finishing": 0.06,
    "Kitchen Fittings": 0.05,
    "Miscellaneous & Labour": 0.05
  };

  // ── Cost per sq.ft based on style ──
  const COST_PER_SQFT = {
    "Modern": 2200,
    "Traditional": 1800,
    "Contemporary": 2500,
    "Minimalist": 1600,
    "Colonial": 2000
  };

  // ── Interior Design Specs Database ──
  const INTERIOR_SPECS = {
    "Modern": {
      "bedroom": {
        paint: "Off-white matte paint with a charcoal grey fluted wood accent panel behind the bed",
        flooring: "Light maple hardwood planks or high-gloss grey marble slab tiling",
        lighting: "Warm recessed LED spots (3000K), under-bed warm LED strip glow, floating glass wall sconces",
        furniture: "Low-profile platform king bed, floating timber nightstands, minimalist built-in wardrobe with black frames",
        features: "Automated block-out roller blinds, smart bedside controls, minimalist monochrome framed art"
      },
      "living": {
        paint: "Alabaster white paint with charcoal marble veneers on the TV media console backdrop",
        flooring: "Polished Italian Carrara marble tiles (3' × 3') with brass inlay borders",
        lighting: "Linear ceiling light profiles, dimmable warm cove lighting, matte black industrial arc floor lamp",
        furniture: "L-shaped charcoal grey fabric sectional sofa, round walnut coffee table, floating oak media console",
        features: "Invisible-bezel Smart TV, motorized sheer beige curtains, large indoor fiddle leaf fig plant in ceramic pot"
      },
      "kitchen": {
        paint: "Moisture-resistant cool grey paint with white subway tile backsplash and dark contrast grout",
        flooring: "Anti-skid matte slate grey porcelain tiles (2' × 2')",
        lighting: "Under-cabinet LED task lights, pendant lights over breakfast bar, warm spotlight grids",
        furniture: "Modular handle-less cabinets in dual-tone (navy blue & white), white quartz countertop, pull-out pantry",
        features: "Built-in oven & microwave, touchless sensor kitchen faucet, high-suction auto-clean chimney"
      },
      "bathroom": {
        paint: "Waterproof paint, wet shower wall finished in deep turquoise mosaic tiles",
        flooring: "Textured charcoal vitrified tile flooring (1' × 1')",
        lighting: "Backlit LED vanity mirror, waterproof ceiling downlights, soft niche strip lighting",
        furniture: "Floating marine-ply vanity unit in dark charcoal laminate, mirror-front medicine cabinet",
        features: "Tempered glass shower partition, wall-hung WC with concealed cistern, chrome rain shower head"
      },
      "dining": {
        paint: "Warm grey paint with a large custom frameless smoke-tinted mirror wall panel",
        flooring: "Polished Italian Carrara marble tiles matching the living area",
        lighting: "Modern geometric black metal pendant light cluster centered over the dining table",
        furniture: "6-seater quartz-top dining table, sleek metal-framed leatherette chairs in tan finish",
        features: "Built-in sideboard cabinet with tinted glass doors and warm internal glassware spot lighting"
      },
      "balcony": {
        paint: "Exposed brick-cladding tile finishes with weatherproof protective glaze",
        flooring: "Weatherproof interlocking teak wood decking tiles combined with an artificial grass patch",
        lighting: "Waterproof warm copper wall sconces, solar-powered warm fairy lights along the railing",
        furniture: "Compact rattan balcony coffee set (2 armchairs + small round glass-top table)",
        features: "Vertical garden grid for creepers, artificial grass area, bronze wind chimes"
      },
      "pooja": {
        paint: "Textured wallpaper with gold leaf patterns and accent saffron paint",
        flooring: "White Makrana marble with delicate mother-of-pearl border inlays",
        lighting: "Concealed warm cove lighting, spotlight focusing on the main deity",
        furniture: "Minimalist teak-wood floating mandir unit with drawer for prayer accessories",
        features: "Brass hanging diya, small brass bells, lattice wood (jali) sliding screen panels"
      },
      "study": {
        paint: "Deep forest green accent wall behind desk, remaining walls in warm cream",
        flooring: "Light maple hardwood planks matching the bedrooms",
        lighting: "Glare-free LED linear desk light, warm amber LED strip backlights on library shelves",
        furniture: "Ergonomic mesh-back office chair, floating solid oak desk, wall-to-wall floating book shelves",
        features: "Integrated cork pin-board, cable management grommets, acoustic wall sound panels"
      },
      "gym": {
        paint: "Energetic concrete texture paint with a large motivational quote decal",
        flooring: "Heavy-duty black rubber interlocking mats (10mm thickness)",
        lighting: "Bright daylight LED panel lights (4500K) to sustain high workout energy",
        furniture: "Steel dumbbell rack, accessories storage shelf, wall hangers for yoga mats",
        features: "Bluetooth soundbar bracket, wall-mounted high-speed fan, digital screen mount"
      },
      "theater": {
        paint: "Sound-absorbing acoustic fabric panels in deep plum/burgundy",
        flooring: "Acoustic carpet tile flooring in deep navy blue",
        lighting: "Dimmable theater step-lights, fiber-optic star ceiling light, smart home scene switch",
        furniture: "Two rows of plush leather electric recliners with integrated cup holders",
        features: "120-inch projector screen or micro-LED wall, 7.1 surround sound wall mounts"
      },
      "store": {
        paint: "Washable white distemper paint",
        flooring: "Durable ceramic grey tiles",
        lighting: "Motion-sensor utility LED tube light",
        furniture: "Heavy-duty slotted angle steel storage racks",
        features: "Ventilation exhaust fan, overhead concrete loft spaces"
      },
      "passage": {
        paint: "Light neutral warm grey paint",
        flooring: "Carrara marble tiles matching living area",
        lighting: "Recessed pathway wall spot-lights at ankle height, ceiling downlights",
        furniture: "Narrow console table with a decorative ceramic vase",
        features: "Vastu-compliant mirror orientation"
      }
    },
    "Traditional": {
      "bedroom": {
        paint: "Warm ivory paint with stenciled traditional border motifs (Kalamkari/Mughal style)",
        flooring: "Teak wood parquet or polished red clay floor tiles",
        lighting: "Carved brass wall brackets, warm bedside lamps with cotton shades",
        furniture: "Ornate carved wooden four-poster bed in teak wood, solid wood wardrobe, heritage wooden chest",
        features: "Handloom cotton bedsheets, framed Tanjore/Madhubani paintings, brass wardrobe handles"
      },
      "living": {
        paint: "Warm ochre lime-wash paint, solid wooden columns highlighting doorways",
        flooring: "Polished Jaisalmer yellow stone or rich Chettinad tiles",
        lighting: "Ornate brass chandelier, warm floor lamps with fabric shades",
        furniture: "Carved wooden sofa set in rosewood, traditional swing (jhoola) suspended with brass chains",
        features: "Brass Urli container with floating candles, traditional jali partition screens"
      },
      "kitchen": {
        paint: "Traditional clay-plaster tone with floral ceramic tile backsplash",
        flooring: "Terracotta-colored anti-skid vitrified tiles",
        lighting: "Bright warm-white task lighting grids",
        furniture: "Solid wood shaker-style modular shutters, black granite countertop",
        features: "Copper and brass spice containers, clay-pot drinking water station"
      },
      "bathroom": {
        paint: "Warm beige paint with stone cladding highlights",
        flooring: "Rough-finish granite stone flooring",
        lighting: "Warm white frosted globe lights",
        furniture: "Anti-moisture treated wood vanity cabinet",
        features: "Copper bucket and mug set, brass towel rails and towel hooks"
      },
      "dining": {
        paint: "Terracotta accent paint with wood framing borders",
        flooring: "Polished Jaisalmer yellow stone matching living room",
        lighting: "Warm hanging brass lanterns over table center",
        furniture: "6-seater carved teak wood dining table and high-back chairs",
        features: "Traditional copper water dispenser, hand-woven table runner"
      },
      "balcony": {
        paint: "Yellow ochre lime-wash paint with plaster details",
        flooring: "Terracotta tiles with traditional border designs",
        lighting: "Hanging terracotta lantern with warm bulb",
        furniture: "Traditional low wooden stools (peetha) or wrought-iron chairs",
        features: "Tulsi plant pedestal, hanging brass bells, terracotta planter pots"
      },
      "pooja": {
        paint: "Saffron yellow wall finish with intricate wood paneling",
        flooring: "Pure white Makrana marble with elaborate floral border inlays",
        lighting: "Hanging brass oil lamp + spot light on deity frame",
        furniture: "Ornate carved teak-wood home temple (mandir) with drawer",
        features: "Brass bells hung from ceiling, silver pooja plate accessories, peacock feather decoration"
      },
      "study": {
        paint: "Olive green paint with wooden wainscoting up to 3ft",
        flooring: "Polished teak wood parquet",
        lighting: "Classic banker's brass desk lamp + bookcase spotlights",
        furniture: "Classic solid wood partner desk, leatherette wingback study chair",
        features: "World globe on stand, brass paperweight, historical framed maps"
      },
      "gym": {
        paint: "Soft cream paint with motivational scripts in sanskrit calligraphy",
        flooring: "Heavy-duty wood-look rubber tiles",
        lighting: "Overhead diffuse warm-white light panels",
        furniture: "Teakwood storage trunk for accessories and yoga mats",
        features: "Wall-mounted wooden pull-up bar, traditional Indian exercise clubs (mugdals)"
      },
      "theater": {
        paint: "Sound-absorbing panels covered in deep-colored silk fabric",
        flooring: "Deep maroon plush carpet with traditional patterns",
        lighting: "Dimmable theater step-lights + step spots",
        furniture: "Plush reclining wooden-framed sofas, cozy floor cushions",
        features: "Ornate wooden frame around the screen, traditional acoustics panels"
      },
      "store": {
        paint: "Plain white plaster paint",
        flooring: "Basic stone flooring",
        lighting: "Bright simple utility ceiling bulb",
        furniture: "Heavy teak wood open shelving units",
        features: "Traditional brass storage containers, pest-control ventilation"
      },
      "passage": {
        paint: "Warm white paint with stenciled ceiling borders",
        flooring: "Jaisalmer yellow stone with dark marble borders",
        lighting: "Hanging wooden pendant lamps",
        furniture: "Carved wooden console table with brass vase",
        features: "Framed traditional mirror, miniature paintings gallery"
      }
    }
  };

  // Resolve specification mapping
  function getInteriorSpecs(roomName, roomType, style) {
    let type = roomType.toLowerCase();
    if (type.includes("bedroom") || type.includes("suite") || type.includes("bed")) type = "bedroom";
    else if (type.includes("bathroom") || type.includes("bath")) type = "bathroom";
    else if (type.includes("living") || type.includes("lounge") || type.includes("family")) type = "living";
    else if (type.includes("dining")) type = "dining";
    else if (type.includes("balcony") || type.includes("terrace")) type = "balcony";
    else if (type.includes("passage") || type.includes("lobby") || type.includes("staircase")) type = "passage";
    else if (type.includes("pooja")) type = "pooja";
    else if (type.includes("study") || type.includes("office")) type = "study";
    else if (type.includes("gym")) type = "gym";
    else if (type.includes("theater")) type = "theater";
    else if (type.includes("store")) type = "store";
    else type = "bedroom"; // default fallback

    const styleKey = INTERIOR_SPECS[style] ? style : "Modern";
    const spec = INTERIOR_SPECS[styleKey][type] || INTERIOR_SPECS["Modern"]["bedroom"];
    
    // Adapt specs dynamically for other styles
    if (style === "Minimalist") {
      return {
        paint: "Chalky ultra-matte white or light beige walls with zero patterns",
        flooring: "Polished light concrete slabs or smooth natural bamboo floor boards",
        lighting: "Concealed single-source warm LED panels, flush wall mounts, zero decorative hanging items",
        furniture: "Floor-level multi-functional Japanese-inspired modular low furniture in light birch",
        features: "Hidden storage spaces with push-to-open doors, wall-recessed shelves, singular Zen branch artwork"
      };
    } else if (style === "Contemporary") {
      return {
        paint: "Textured plaster walls in concrete grey, dramatic charcoal wooden panels behind main focal points",
        flooring: "Dark walnut engineered wood planks or polished slate slab tiling",
        lighting: "Sculptural geometric black steel chandeliers, track spotlights, color-tunable smart LED backlighting",
        furniture: "Curved organic-shaped statement sofa in textured boucle fabric, floating glass coffee table",
        features: "Integrated voice-activated media hubs, custom dynamic glass partition walls, brushed metal accents"
      };
    } else if (style === "Colonial") {
      return {
        paint: "Soft pastel mint green or muted tea-rose pink with classical white wood wainscoting",
        flooring: "Dark Burma teak parquet or vintage black-and-white checkerboard marble tiles",
        lighting: "Classic crystal branch chandeliers, frosted glass wall sconces, brass table lamps",
        furniture: "High-backed tufted leather Chesterfield sofa, dark mahogany four-poster bed, antique wooden writing bureau",
        features: "Arched column walkthroughs, wooden window louver shutters, antique brass fans with wooden blades"
      };
    }

    return spec;
  }

  // ── Procedural Flooring Textures ──
  function drawFlooringTexture(ctx, room, r) {
    const { type } = room;
    const { x, y, w, h } = r;

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    if (type === "bedroom") {
      // Wood planks
      ctx.fillStyle = "#ebdcc3"; // Maple base
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = "rgba(161, 98, 7, 0.12)";
      ctx.lineWidth = 1;
      for (let py = y + 8; py < y + h; py += 10) {
        ctx.beginPath();
        ctx.moveTo(x, py);
        ctx.lineTo(x + w, py);
        ctx.stroke();
      }
    } else if (type === "living" || type === "dining") {
      // Marble grids
      ctx.fillStyle = "#f8fafc"; // White grey
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = "rgba(148, 163, 184, 0.18)";
      ctx.lineWidth = 0.5;
      const tileSize = 32;
      for (let px = x + tileSize; px < x + w; px += tileSize) {
        ctx.beginPath();
        ctx.moveTo(px, y);
        ctx.lineTo(px, y + h);
        ctx.stroke();
      }
      for (let py = y + tileSize; py < y + h; py += tileSize) {
        ctx.beginPath();
        ctx.moveTo(x, py);
        ctx.lineTo(x + w, py);
        ctx.stroke();
      }
    } else if (type === "kitchen" || type === "bathroom") {
      // Square tiles
      ctx.fillStyle = type === "kitchen" ? "#f1f5f9" : "#e0f2fe"; // grey vs cyan tiles
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = "rgba(100, 116, 139, 0.15)";
      ctx.lineWidth = 0.5;
      const tileSize = 12;
      for (let px = x + tileSize; px < x + w; px += tileSize) {
        ctx.beginPath();
        ctx.moveTo(px, y);
        ctx.lineTo(px, y + h);
        ctx.stroke();
      }
      for (let py = y + tileSize; py < y + h; py += tileSize) {
        ctx.beginPath();
        ctx.moveTo(x, py);
        ctx.lineTo(x + w, py);
        ctx.stroke();
      }
    } else if (type === "balcony") {
      // Wood deck planks
      ctx.fillStyle = "#d97706";
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = "rgba(69, 26, 3, 0.25)";
      ctx.lineWidth = 1;
      for (let px = x + 6; px < x + w; px += 6) {
        ctx.beginPath();
        ctx.moveTo(px, y);
        ctx.lineTo(px, y + h);
        ctx.stroke();
      }
    } else if (type === "pooja") {
      // Golden spiritual tiles
      ctx.fillStyle = "#fef3c7";
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = "rgba(217, 119, 6, 0.15)";
      ctx.lineWidth = 0.5;
      const t = 10;
      for (let px = x + t; px < x + w; px += t) {
        ctx.beginPath();
        ctx.moveTo(px, y);
        ctx.lineTo(px, y + h);
        ctx.stroke();
      }
      for (let py = y + t; py < y + h; py += t) {
        ctx.beginPath();
        ctx.moveTo(x, py);
        ctx.lineTo(x + w, py);
        ctx.stroke();
      }
    } else if (type === "gym") {
      // Charcoal rubber tiling
      ctx.fillStyle = "#334155";
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = "rgba(15, 23, 42, 0.3)";
      ctx.lineWidth = 1;
      const t = 20;
      for (let px = x + t; px < x + w; px += t) {
        ctx.beginPath();
        ctx.moveTo(px, y);
        ctx.lineTo(px, y + h);
        ctx.stroke();
      }
    } else if (type === "theater") {
      // Dark movie room purple
      ctx.fillStyle = "#3b0764";
      ctx.fillRect(x, y, w, h);
    } else {
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(x, y, w, h);
    }

    ctx.restore();
  }

  // ── Procedural Furniture Drawing ──
  function drawRoomFurniture(ctx, room, r, viewMode) {
    const { type, color } = room;
    const { x, y, w, h } = r;

    // Standard outline colors
    if (viewMode === "blueprint") {
      ctx.strokeStyle = "rgba(0, 242, 254, 0.5)"; // neon cyan blueprint silhouettes
      ctx.lineWidth = 1;
      ctx.fillStyle = "rgba(0, 242, 254, 0.04)";
    } else {
      ctx.strokeStyle = "rgba(51, 65, 85, 0.75)";
      ctx.lineWidth = 1.2;
      ctx.fillStyle = "#ffffff";
      // Shadow for realistic 3D pop
      ctx.shadowColor = "rgba(15, 23, 42, 0.12)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
    }

    if (type === "bedroom") {
      // Draw Bed Frame and Mattress
      const isWide = w >= h;
      const bedW = Math.min(w * 0.45, 55);
      const bedH = Math.min(h * 0.45, 50);
      
      let bx, by;
      if (isWide) {
        bx = x + (w - bedW) / 2;
        by = y + 4;
      } else {
        bx = x + 4;
        by = y + (h - bedH) / 2;
      }

      if (viewMode === "interior") {
        ctx.fillStyle = "#78350f"; // wood frame
        ctx.fillRect(bx, by, bedW, bedH);
        ctx.fillStyle = "#ffffff"; // mattress
        ctx.fillRect(bx + 2, by + 4, bedW - 4, bedH - 6);
        
        // Pillows
        ctx.fillStyle = color; // Room accent color
        const pilW = bedW * 0.35;
        const pilH = bedH * 0.18;
        ctx.fillRect(bx + bedW * 0.1, by + 6, pilW, pilH);
        ctx.fillRect(bx + bedW * 0.55, by + 6, pilW, pilH);
        
        // Duvet sheet
        ctx.fillStyle = color + "44";
        ctx.fillRect(bx + 2, by + bedH * 0.45, bedW - 4, bedH * 0.5);
      } else {
        ctx.fillRect(bx, by, bedW, bedH);
        ctx.strokeRect(bx, by, bedW, bedH);
        const pilW = bedW * 0.35;
        const pilH = bedH * 0.18;
        ctx.strokeRect(bx + bedW * 0.1, by + 6, pilW, pilH);
        ctx.strokeRect(bx + bedW * 0.55, by + 6, pilW, pilH);
      }

      // Draw Wardrobe Along opposite wall
      const wardW = isWide ? Math.min(22, w * 0.18) : w - 8;
      const wardH = isWide ? h - 8 : Math.min(18, h * 0.18);
      const wx = isWide ? x + w - wardW - 4 : x + 4;
      const wy = isWide ? y + 4 : y + h - wardH - 4;

      if (viewMode === "interior") {
        ctx.fillStyle = "#451a03";
        ctx.fillRect(wx, wy, wardW, wardH);
        ctx.strokeStyle = "#78350f";
        ctx.strokeRect(wx, wy, wardW, wardH);
        ctx.beginPath();
        if (isWide) {
          ctx.moveTo(wx + wardW / 2, wy);
          ctx.lineTo(wx + wardW / 2, wy + wardH);
        } else {
          ctx.moveTo(wx, wy + wardH / 2);
          ctx.lineTo(wx + wardW, wy + wardH / 2);
        }
        ctx.stroke();
      } else {
        ctx.fillRect(wx, wy, wardW, wardH);
        ctx.strokeRect(wx, wy, wardW, wardH);
      }

    } else if (type === "living") {
      // Draw sofa and coffee table
      const sofaW = Math.min(w * 0.6, 75);
      const sofaH = Math.min(h * 0.6, 70);
      const thick = Math.min(14, Math.min(w, h) * 0.15);

      if (viewMode === "interior") {
        ctx.fillStyle = "#1e293b"; // dark fabric
        ctx.fillRect(x + 4, y + 4, sofaW, thick);
        ctx.fillRect(x + 4, y + 4, thick, sofaH);
        // cushions
        ctx.fillStyle = color;
        ctx.fillRect(x + thick + 2, y + 4, sofaW - thick - 4, thick - 2);
        ctx.fillRect(x + 4, y + thick + 2, thick - 2, sofaH - thick - 4);
      } else {
        ctx.fillRect(x + 4, y + 4, sofaW, thick);
        ctx.strokeRect(x + 4, y + 4, sofaW, thick);
        ctx.fillRect(x + 4, y + 4, thick, sofaH);
        ctx.strokeRect(x + 4, y + 4, thick, sofaH);
      }

      // Coffee table
      const tabW = Math.min(sofaW * 0.5, 30);
      const tabH = Math.min(sofaH * 0.5, 24);
      const tx = x + thick + 8;
      const ty = y + thick + 8;

      if (viewMode === "interior") {
        ctx.fillStyle = "rgba(146, 64, 14, 0.85)"; // rich wood
        ctx.fillRect(tx, ty, tabW, tabH);
      } else {
        ctx.fillRect(tx, ty, tabW, tabH);
        ctx.strokeRect(tx, ty, tabW, tabH);
      }

      // TV cabinet console
      const tvW = Math.min(w * 0.55, 65);
      const tvH = 6;
      const tvx = x + (w - tvW) / 2;
      const tvy = y + h - tvH - 4;

      if (viewMode === "interior") {
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(tvx, tvy, tvW, tvH);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(tvx + 6, tvy + tvH / 3, tvW - 12, tvH / 3);
      } else {
        ctx.fillRect(tvx, tvy, tvW, tvH);
        ctx.strokeRect(tvx, tvy, tvW, tvH);
      }

    } else if (type === "kitchen") {
      const cntThick = Math.min(18, Math.min(w, h) * 0.24);

      if (viewMode === "interior") {
        ctx.fillStyle = "#cbd5e1"; // marble counter top
        ctx.fillRect(x + 2, y + 2, w - 4, cntThick);
        ctx.fillRect(x + 2, y + 2, cntThick, h - 4);
      } else {
        ctx.fillRect(x + 2, y + 2, w - 4, cntThick);
        ctx.strokeRect(x + 2, y + 2, w - 4, cntThick);
        ctx.fillRect(x + 2, y + 2, cntThick, h - 4);
        ctx.strokeRect(x + 2, y + 2, cntThick, h - 4);
      }

      // Stove
      const stW = Math.min(22, w * 0.25);
      const stH = cntThick - 4;
      const sx = x + w * 0.5 - stW / 2;
      const sy = y + 4;

      if (viewMode === "interior") {
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(sx, sy, stW, stH);
        ctx.fillStyle = "#f97316"; // glowing stove burners
        ctx.beginPath();
        ctx.arc(sx + stW * 0.28, sy + stH / 2, 2.5, 0, Math.PI * 2);
        ctx.arc(sx + stW * 0.72, sy + stH / 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeRect(sx, sy, stW, stH);
      }

      // Sink
      const skW = cntThick - 4;
      const skH = Math.min(20, h * 0.25);
      const kx = x + 4;
      const ky = y + h * 0.6 - skH / 2;

      if (viewMode === "interior") {
        ctx.fillStyle = "#94a3b8";
        ctx.fillRect(kx, ky, skW, skH);
        ctx.strokeStyle = "#475569";
        ctx.strokeRect(kx + 2, ky + 2, skW - 4, skH - 4);
      } else {
        ctx.strokeRect(kx, ky, skW, skH);
      }

    } else if (type === "dining") {
      const cx = x + w / 2;
      const cy = y + h / 2;
      const isWide = w >= h;
      const tabW = isWide ? Math.min(w * 0.45, 45) : Math.min(w * 0.4, 30);
      const tabH = isWide ? Math.min(h * 0.4, 30) : Math.min(h * 0.45, 45);

      if (viewMode === "interior") {
        ctx.fillStyle = "#7c2d12"; // table top
        ctx.fillRect(cx - tabW / 2, cy - tabH / 2, tabW, tabH);
        ctx.fillStyle = "#cbd5e1"; // dining chair textures
        if (isWide) {
          ctx.fillRect(cx - tabW * 0.35, cy - tabH / 2 - 5, 8, 4);
          ctx.fillRect(cx + tabW * 0.15, cy - tabH / 2 - 5, 8, 4);
          ctx.fillRect(cx - tabW * 0.35, cy + tabH / 2 + 1, 8, 4);
          ctx.fillRect(cx + tabW * 0.15, cy + tabH / 2 + 1, 8, 4);
        } else {
          ctx.fillRect(cx - tabW / 2 - 5, cy - tabH * 0.35, 4, 8);
          ctx.fillRect(cx - tabW / 2 - 5, cy + tabH * 0.15, 4, 8);
          ctx.fillRect(cx + tabW / 2 + 1, cy - tabH * 0.35, 4, 8);
          ctx.fillRect(cx + tabW / 2 + 1, cy + tabH * 0.15, 4, 8);
        }
      } else {
        ctx.strokeRect(cx - tabW / 2, cy - tabH / 2, tabW, tabH);
      }

    } else if (type === "bathroom") {
      // Commode tank and basin
      const commW = 10;
      const commH = 14;
      const cx = x + 4;
      const cy = y + 4;

      if (viewMode === "interior") {
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(cx, cy, commW, 4);
        ctx.beginPath();
        ctx.arc(cx + commW / 2, cy + 9, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#cbd5e1";
        ctx.stroke();
      } else {
        ctx.strokeRect(cx, cy, commW, 4);
        ctx.beginPath();
        ctx.arc(cx + commW / 2, cy + 9, 4.5, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Basin
      const basW = 11;
      const basH = 9;
      const bx = x + w - basW - 4;
      const by = y + 4;
      if (viewMode === "interior") {
        ctx.fillStyle = "#f8fafc";
        ctx.beginPath();
        ctx.ellipse(bx + basW / 2, by + basH / 2, 4.5, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#cbd5e1";
        ctx.stroke();
      } else {
        ctx.strokeRect(bx, by, basW, basH);
      }

      // Glass shower partition
      const isWide = w >= h;
      ctx.strokeStyle = "rgba(6, 182, 212, 0.65)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (isWide) {
        const shX = x + w - Math.min(24, w * 0.35);
        ctx.moveTo(shX, y);
        ctx.lineTo(shX, y + h);
      } else {
        const shY = y + h - Math.min(24, h * 0.35);
        ctx.moveTo(x, shY);
        ctx.lineTo(x + w, shY);
      }
      ctx.stroke();

    } else if (type === "balcony") {
      const px1 = x + 6;
      const py1 = y + h / 2;
      const px2 = x + w - 6;
      const py2 = y + h / 2;

      if (viewMode === "interior") {
        ctx.fillStyle = "#047857"; // lush green plants
        ctx.beginPath();
        ctx.arc(px1, py1, 3.5, 0, Math.PI * 2);
        ctx.arc(px2, py2, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#d97706"; // planter pots
        ctx.beginPath();
        ctx.arc(px1, py1, 1.8, 0, Math.PI * 2);
        ctx.arc(px2, py2, 1.8, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(px1, py1, 3, 0, Math.PI * 2);
        ctx.arc(px2, py2, 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (type === "pooja") {
      const mx = x + w / 2 - 8;
      const my = y + 4;
      if (viewMode === "interior") {
        ctx.fillStyle = "#fbbf24";
        ctx.fillRect(mx, my, 16, 9);
        // glowing oil lamp circle
        ctx.fillStyle = "#f97316";
        ctx.beginPath();
        ctx.arc(x + w / 2, my + 4.5, 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeRect(mx, my, 16, 9);
      }
    } else if (type === "study") {
      const dW = Math.min(w * 0.5, 45);
      const dH = Math.min(h * 0.25, 14);
      const dx = x + (w - dW) / 2;
      const dy = y + 4;

      if (viewMode === "interior") {
        ctx.fillStyle = "#7c2d12"; // study desk
        ctx.fillRect(dx, dy, dW, dH);
        ctx.fillStyle = "#1e293b"; // office chair
        ctx.fillRect(dx + dW * 0.38, dy + dH + 2, dW * 0.24, 7);
      } else {
        ctx.strokeRect(dx, dy, dW, dH);
        ctx.strokeRect(dx + dW * 0.38, dy + dH + 2, dW * 0.24, 5);
      }
    } else if (type === "gym") {
      const mW = Math.min(w * 0.2, 12);
      const mH = Math.min(h * 0.5, 28);
      const mx = x + w * 0.3 - mW / 2;
      const my = y + (h - mH) / 2;

      if (viewMode === "interior") {
        ctx.fillStyle = "#ec4899"; // pink yoga mat
        ctx.fillRect(mx, my, mW, mH);
      } else {
        ctx.strokeRect(mx, my, mW, mH);
      }
    }

    // Reset shadows
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  // ── Doors and Windows Placements ──
  function drawDoorsAndWindows(ctx, r, startX, startY, planW, planH, viewMode) {
    const { x, y, w, h } = r;
    const isOuterLeft = Math.abs(x - (startX + 2)) < 2.5;
    const isOuterRight = Math.abs((x + w) - (startX + planW - 2)) < 2.5;
    const isOuterTop = Math.abs(y - (startY + 2)) < 2.5;
    const isOuterBottom = Math.abs((y + h) - (startY + planH - 2)) < 2.5;

    const winColor = viewMode === "blueprint" ? "#00f2fe" : "#38bdf8";
    const wallColor = viewMode === "blueprint" ? "rgba(255,255,255,0.7)" : "#1e293b";

    ctx.save();
    const winSize = Math.min(w * 0.4, 25);
    ctx.lineWidth = viewMode === "blueprint" ? 2 : 3;

    // Outer windows
    if (isOuterTop) {
      const wx = x + w / 2;
      ctx.fillStyle = winColor;
      ctx.strokeStyle = wallColor;
      ctx.fillRect(wx - winSize / 2, y - 2, winSize, 4);
      ctx.strokeRect(wx - winSize / 2, y - 2, winSize, 4);
      ctx.strokeStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(wx - winSize / 2, y);
      ctx.lineTo(wx + winSize / 2, y);
      ctx.stroke();
    }
    if (isOuterBottom) {
      const wx = x + w / 2;
      ctx.fillStyle = winColor;
      ctx.strokeStyle = wallColor;
      ctx.fillRect(wx - winSize / 2, y + h - 2, winSize, 4);
      ctx.strokeRect(wx - winSize / 2, y + h - 2, winSize, 4);
      ctx.strokeStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(wx - winSize / 2, y + h);
      ctx.lineTo(wx + winSize / 2, y + h);
      ctx.stroke();
    }
    if (isOuterLeft) {
      const wy = y + h / 2;
      ctx.fillStyle = winColor;
      ctx.strokeStyle = wallColor;
      ctx.fillRect(x - 2, wy - winSize / 2, 4, winSize);
      ctx.strokeRect(x - 2, wy - winSize / 2, 4, winSize);
      ctx.strokeStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(x, wy - winSize / 2);
      ctx.lineTo(x, wy + winSize / 2);
      ctx.stroke();
    }
    if (isOuterRight) {
      const wy = y + h / 2;
      ctx.fillStyle = winColor;
      ctx.strokeStyle = wallColor;
      ctx.fillRect(x + w - 2, wy - winSize / 2, 4, winSize);
      ctx.strokeRect(x + w - 2, wy - winSize / 2, 4, winSize);
      ctx.strokeStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(x + w, wy - winSize / 2);
      ctx.lineTo(x + w, wy + winSize / 2);
      ctx.stroke();
    }

    // Inner room entrance swing doors
    if (r.data && r.data.type !== "passage" && r.data.type !== "balcony" && r.data.type !== "living") {
      const doorRadius = Math.min(w * 0.25, h * 0.25, 12);
      const dx = x + 2;
      const dy = y + h - 2;

      ctx.strokeStyle = viewMode === "blueprint" ? "rgba(255,255,255,0.6)" : "#78350f";
      ctx.lineWidth = 1.2;

      // Draw open door leaf pointing straight up
      ctx.beginPath();
      ctx.moveTo(dx, dy);
      ctx.lineTo(dx, dy - doorRadius);
      ctx.stroke();

      // Dashed swing arc
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.arc(dx, dy, doorRadius, -Math.PI / 2, 0);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Balcony slider door
    if (r.data && r.data.type === "balcony") {
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + w * 0.3, y + 1);
      ctx.lineTo(x + w * 0.7, y + 1);
      ctx.moveTo(x + w * 0.35, y + 3);
      ctx.lineTo(x + w * 0.75, y + 3);
      ctx.stroke();
    }

    ctx.restore();
  }

  // ── FLOOR PLAN GENERATOR ──
  function generateFloorPlan(canvas, config) {
    const {
      plotWidth,
      plotDepth,
      bhk,
      style,
      floors
    } = config;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;

    const totalArea = plotWidth * plotDepth;
    const currentFloorIdx = config.currentFloorIdx || 0;
    const rooms = getRoomsForFloor(bhk, floors, currentFloorIdx);

    // Cancel active animations to prevent leaks and multi-loop collisions
    if (canvas.animFrameId) {
      cancelAnimationFrame(canvas.animFrameId);
    }

    const viewMode = config.viewMode || "blueprint";
    if (viewMode === "3d") {
      render3DWalkthrough(canvas, config);
      return;
    }

    // Layout constants
    const padding = 40;
    const titleH = 50;
    const legendH = 60;
    const availW = W - padding * 2;
    const availH = H - padding * 2 - titleH - legendH;

    // Scale plot to fit canvas
    const scaleX = availW / plotWidth;
    const scaleY = availH / plotDepth;
    const scale = Math.min(scaleX, scaleY) * 0.82;

    const planW = plotWidth * scale;
    const planH = plotDepth * scale;
    const startX = (W - planW) / 2;
    const startY = titleH + padding;

    // ── Clear & Background Styles ──
    if (viewMode === "blueprint") {
      ctx.fillStyle = "#0b0f19"; // Deep blueprint dark slate-950
      ctx.fillRect(0, 0, W, H);
      
      // Grid Pattern lines
      ctx.strokeStyle = "rgba(0, 242, 254, 0.035)";
      ctx.lineWidth = 0.5;
      const gSize = 16;
      for (let gx = 0; gx < W; gx += gSize) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, H);
        ctx.stroke();
      }
      for (let gy = 0; gy < H; gy += gSize) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(W, gy);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = "#0f172a"; // slate-900 background for luxury renders
      ctx.fillRect(0, 0, W, H);

      // Soft layout panel paper drop-shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
      ctx.shadowBlur = 18;
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(startX - 3, startY - 3, planW + 6, planH + 6);
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
    }

    // ── Title ──
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 15px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`Floor Plan — ${bhk} BHK ${style} (${plotWidth}' × ${plotDepth}')`, W / 2, 28);
    ctx.font = "11px 'Inter', sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.48)";
    const floorNames = ["Ground Floor", "First Floor", "Second Floor"];
    const floorLabel = floorNames[currentFloorIdx] || `Floor ${currentFloorIdx + 1}`;
    ctx.fillText(`Total Area: ${totalArea} sq.ft | ${floorLabel}${floors > 1 ? ' (of ' + floors + ' Floors)' : ''}`, W / 2, 44);

    // ── Compass ──
    const compassX = startX + planW - 30;
    const compassY = startY + 30;
    ctx.save();
    ctx.translate(compassX, compassY);
    ctx.fillStyle = "#f59e0b";
    ctx.font = "bold 12px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("N", 0, -14);
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(-5, 2);
    ctx.lineTo(5, 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "9px 'Inter', sans-serif";
    ctx.fillText("S", 0, 18);
    ctx.fillText("E", 16, 4);
    ctx.fillText("W", -16, 4);
    ctx.restore();

    // ── Room Placement Treemap ──
    const roomRects = treemapLayout(
      rooms.map(r => ({ ...r, area: r.ratio * totalArea })),
      startX + 2,
      startY + 2,
      planW - 4,
      planH - 4
    );

    canvas.roomRects = roomRects;

    // ── Render rooms sequentially ──
    let roomIndex = 0;
    const totalRooms = roomRects.length;

    function animateRoom() {
      if (roomIndex >= totalRooms) {
        drawOuterWalls();
        drawDimensions();
        drawDoorIndicators();
        drawLegend();
        
        // Screen Fade Opacity Overlay (if transitioning)
        if (config.fadeOpacity && config.fadeOpacity > 0) {
          ctx.fillStyle = `rgba(15, 23, 42, ${config.fadeOpacity})`;
          ctx.fillRect(0, 0, W, H);
        }
        return;
      }

      const r = roomRects[roomIndex];
      const room = r.data;

      // 1. Draw flooring background
      if (viewMode === "interior") {
        drawFlooringTexture(ctx, room, r);
      } else {
        ctx.fillStyle = room.color + "1F"; // 12% fill opacity
        ctx.fillRect(r.x, r.y, r.w, r.h);
      }

      // 2. Draw interior furniture (if room is large enough)
      if (r.w >= 40 && r.h >= 30) {
        drawRoomFurniture(ctx, room, r, viewMode);
      }

      // 3. Draw doors & windows indicators
      drawDoorsAndWindows(ctx, r, startX, startY, planW, planH, viewMode);

      // 4. Draw room borders (thick charcoal walls in interior, colored line in blueprint)
      const isHighlighted = config.highlightedRoomName && config.highlightedRoomName === room.name;
      if (isHighlighted) {
        ctx.strokeStyle = "#e11d48"; // Rose highlighted border
        ctx.lineWidth = viewMode === "interior" ? 5 : 3.5;
      } else {
        ctx.strokeStyle = viewMode === "interior" ? "#1e293b" : room.color + "7a";
        ctx.lineWidth = viewMode === "interior" ? 4 : 1.8;
      }
      ctx.strokeRect(r.x, r.y, r.w, r.h);

      // Outer glow for highlighted active room
      if (isHighlighted) {
        ctx.save();
        ctx.strokeStyle = "rgba(225, 29, 72, 0.35)";
        ctx.lineWidth = viewMode === "interior" ? 10 : 7;
        ctx.strokeRect(r.x, r.y, r.w, r.h);
        ctx.restore();
      }

      // 5. Draw Labels
      const roomArea = Math.round(room.area);
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;

      ctx.save();
      if (viewMode === "interior") {
        // High contrast text dropshadow
        ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
      }

      if (r.w > 45 && r.h > 35) {
        // Icon
        ctx.font = `${Math.min(18, r.w / 4.8)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(room.icon, cx, cy - 7);

        // Name
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${Math.min(10.5, r.w / 8.5)}px 'Inter', sans-serif`;
        ctx.fillText(room.name, cx, cy + 8);

        // Area text
        ctx.fillStyle = viewMode === "interior" ? "#f1f5f9" : "rgba(255,255,255,0.52)";
        ctx.font = `${Math.min(8.5, r.w / 10.5)}px 'Inter', sans-serif`;
        ctx.fillText(`${roomArea} sq.ft`, cx, cy + 20);

        // Dimensions text
        const roomW = Math.round(Math.sqrt(room.area * (r.w / r.h)));
        const roomD = Math.round(room.area / roomW);
        ctx.fillText(`${roomW}' × ${roomD}'`, cx, cy + 30);
      } else if (r.w > 25 && r.h > 20) {
        ctx.font = `${Math.min(13, r.w / 3.5)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(room.icon, cx, cy + 2);
      }
      ctx.restore();

      roomIndex++;
      canvas.animFrameId = requestAnimationFrame(animateRoom);
    }

    function drawOuterWalls() {
      ctx.strokeStyle = viewMode === "interior" ? "#0f172a" : "#ffffff";
      ctx.lineWidth = viewMode === "interior" ? 6 : 3;
      ctx.strokeRect(startX, startY, planW, planH);
    }

    function drawDimensions() {
      ctx.strokeStyle = "rgba(255,255,255,0.32)";
      ctx.fillStyle = "rgba(255,255,255,0.52)";
      ctx.lineWidth = 1;
      ctx.font = "10.5px 'Inter', sans-serif";
      ctx.textAlign = "center";

      // Bottom dimension line
      const dimY = startY + planH + 18;
      ctx.beginPath();
      ctx.moveTo(startX, dimY);
      ctx.lineTo(startX + planW, dimY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(startX, dimY - 4);
      ctx.lineTo(startX, dimY + 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(startX + planW, dimY - 4);
      ctx.lineTo(startX + planW, dimY + 4);
      ctx.stroke();
      ctx.fillText(`${plotWidth}'`, startX + planW / 2, dimY + 14);

      // Right dimension line
      const dimX = startX + planW + 18;
      ctx.beginPath();
      ctx.moveTo(dimX, startY);
      ctx.lineTo(dimX, startY + planH);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(dimX - 4, startY);
      ctx.lineTo(dimX + 4, startY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(dimX - 4, startY + planH);
      ctx.lineTo(dimX + 4, startY + planH);
      ctx.stroke();
      ctx.save();
      ctx.translate(dimX + 14, startY + planH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(`${plotDepth}'`, 0, 0);
      ctx.restore();
    }

    function drawDoorIndicators() {
      if ((config.currentFloorIdx || 0) === 0) {
        const doorW = Math.min(28, planW * 0.08);
        const doorX = startX + planW / 2 - doorW / 2;
        const doorY = startY + planH - 2;

        ctx.fillStyle = "#f59e0b";
        ctx.fillRect(doorX, doorY, doorW, 4);

        ctx.strokeStyle = "#f59e0b88";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(doorX, doorY, doorW, 0, -Math.PI / 2, true);
        ctx.stroke();

        ctx.fillStyle = "#f59e0b";
        ctx.font = "bold 9.5px 'Inter', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("▲ MAIN ENTRANCE", startX + planW / 2, startY + planH + 8);
      } else {
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.font = "bold 9.5px 'Inter', sans-serif";
        ctx.textAlign = "center";
        const fNames = ["Ground", "First", "Second"];
        const currentFloorName = fNames[config.currentFloorIdx || 0] || `Floor ${config.currentFloorIdx + 1}`;
        ctx.fillText(`▲ STAIRCASE ARRIVAL - ${currentFloorName.toUpperCase()} FLOOR`, startX + planW / 2, startY + planH + 8);
      }
    }

    function drawLegend() {
      const legendY = H - legendH + 12;
      const legendStartX = padding;
      ctx.font = "9.5px 'Inter', sans-serif";
      ctx.textAlign = "left";

      const uniqueTypes = [];
      const seen = new Set();
      rooms.forEach(r => {
        if (!seen.has(r.type)) {
          seen.add(r.type);
          uniqueTypes.push(r);
        }
      });

      const maxPerRow = Math.floor((W - padding * 2) / 95);
      uniqueTypes.forEach((room, i) => {
        const col = i % maxPerRow;
        const row = Math.floor(i / maxPerRow);
        const cx = legendStartX + col * ((W - padding * 2) / maxPerRow);
        const cy = legendY + row * 18;

        ctx.fillStyle = room.color;
        ctx.fillRect(cx, cy, 9, 9);
        ctx.fillStyle = "rgba(255,255,255,0.56)";
        ctx.fillText(room.name, cx + 13, cy + 8);
      });
    }

    animateRoom();
    return roomRects;
  }

  // ── Treemap Layout Algorithm (Squarified) ──
  function treemapLayout(items, x, y, w, h) {
    const total = items.reduce((s, i) => s + i.area, 0);
    const rects = [];

    function layout(data, bx, by, bw, bh) {
      if (data.length === 0) return;
      if (data.length === 1) {
        rects.push({ x: bx, y: by, w: bw, h: bh, data: data[0] });
        return;
      }

      const dataTotal = data.reduce((s, d) => s + d.area, 0);
      const isHorizontal = bw >= bh;

      let accumulated = 0;
      let splitIdx = 0;
      const half = dataTotal / 2;

      for (let i = 0; i < data.length; i++) {
        accumulated += data[i].area;
        if (accumulated >= half) {
          splitIdx = i + 1;
          break;
        }
      }

      if (splitIdx === 0) splitIdx = 1;
      if (splitIdx >= data.length) splitIdx = data.length - 1;

      const leftData = data.slice(0, splitIdx);
      const rightData = data.slice(splitIdx);
      const leftTotal = leftData.reduce((s, d) => s + d.area, 0);
      const ratio = leftTotal / dataTotal;

      if (isHorizontal) {
        const splitW = bw * ratio;
        layout(leftData, bx, by, splitW, bh);
        layout(rightData, bx + splitW, by, bw - splitW, bh);
      } else {
        const splitH = bh * ratio;
        layout(leftData, bx, by, bw, splitH);
        layout(rightData, bx, by + splitH, bw, bh - splitH);
      }
    }

    // Sort items by area descending for better treemap
    const sorted = [...items].sort((a, b) => b.area - a.area);
    layout(sorted, x, y, w, h);
    return rects;
  }

  // ────────────────────────────────────────────────────────────
  // GENERATE COST BREAKDOWN
  // ────────────────────────────────────────────────────────────
  function generateCostBreakdown(totalBudget, style) {
    const breakdown = [];
    for (const [category, ratio] of Object.entries(COST_BREAKDOWN)) {
      breakdown.push({
        category,
        amount: Math.round(totalBudget * ratio),
        percentage: Math.round(ratio * 100)
      });
    }
    return breakdown;
  }

  // ────────────────────────────────────────────────────────────
  // GENERATE DESIGN RECOMMENDATIONS
  // ────────────────────────────────────────────────────────────
  function generateRecommendations(config) {
    const { plotWidth, plotDepth, bhk, style, budget, floors } = config;
    const totalArea = plotWidth * plotDepth;
    const builtUpArea = Math.round(totalArea * 0.65 * floors); // 65% coverage
    const estimatedCost = builtUpArea * (COST_PER_SQFT[style] || 2000);
    const styleInfo = STYLE_DETAILS[style] || STYLE_DETAILS["Modern"];
    const costBreakdown = generateCostBreakdown(budget, style);

    const budgetStatus = budget >= estimatedCost
      ? { status: "sufficient", label: "✅ Within Budget", color: "#10b981" }
      : { status: "over", label: "⚠️ Over Budget", color: "#ef4444" };

    const vastu = [
      "Main entrance facing East or North for positive energy",
      "Kitchen in the South-East corner (Agni direction)",
      "Master bedroom in the South-West for stability",
      `Living room in the North-East for prosperity`,
      "Bathrooms in the North-West direction",
      "Pooja room in the North-East corner",
      "Staircase in the South or West direction"
    ];

    return {
      totalArea,
      builtUpArea,
      estimatedCost,
      budgetStatus,
      styleInfo,
      costBreakdown,
      vastuTips: vastu.slice(0, Math.min(bhk + 3, vastu.length)),
      summary: {
        plotSize: `${plotWidth}' × ${plotDepth}' (${totalArea} sq.ft)`,
        builtUp: `${builtUpArea} sq.ft`,
        costPerSqft: `₹${(COST_PER_SQFT[style] || 2000).toLocaleString()}`,
        bhk: `${bhk} BHK`,
        style: style,
        floors: floors
      }
    };
  }

  // ────────────────────────────────────────────────────────────
  // DRAW COST BREAKDOWN CHART
  // ────────────────────────────────────────────────────────────
  function drawCostChart(canvasId, breakdown, budget) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;

    const colors = [
      "#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444",
      "#ec4899", "#06b6d4", "#f97316", "#6366f1", "#14b8a6"
    ];

    const padding = { top: 40, right: 20, bottom: 30, left: 120 };
    const chartW = W - padding.left - padding.right;
    const barH = Math.min(22, (H - padding.top - padding.bottom) / breakdown.length - 6);
    const maxAmount = Math.max(...breakdown.map(b => b.amount));

    // Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Estimated Cost Breakdown", W / 2, 24);

    // Bars
    let startTime = null;
    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / 1000);
      const eased = 1 - Math.pow(1 - progress, 3);

      ctx.clearRect(0, padding.top - 5, W, H - padding.top + 5);

      breakdown.forEach((item, i) => {
        const y = padding.top + i * (barH + 6);
        const barW = (item.amount / maxAmount) * chartW * eased;
        const color = colors[i % colors.length];

        // Label
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.font = "10px 'Inter', sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(item.category, padding.left - 8, y + barH / 2 + 4);

        // Bar bg
        ctx.fillStyle = "rgba(255,255,255,0.04)";
        ctx.fillRect(padding.left, y, chartW, barH);

        // Bar
        const gradient = ctx.createLinearGradient(padding.left, y, padding.left + barW, y);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, color + "88");
        ctx.fillStyle = gradient;

        ctx.beginPath();
        const r = Math.min(3, barH / 4);
        ctx.roundRect(padding.left, y, barW, barH, [0, r, r, 0]);
        ctx.fill();

        // Amount
        if (eased > 0.5) {
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 10px 'Inter', sans-serif";
          ctx.textAlign = "left";
          const amountStr = "₹" + (item.amount >= 100000
            ? (item.amount / 100000).toFixed(1) + "L"
            : item.amount.toLocaleString());
          ctx.fillText(`${amountStr} (${item.percentage}%)`, padding.left + barW + 6, y + barH / 2 + 4);
        }
      });

      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }

  // ────────────────────────────────────────────────────────────
  // ROOM SIZE ADJUSTER PANEL
  // ────────────────────────────────────────────────────────────
  function renderAdjusterPanel() {
    const container = document.getElementById("bp-adjuster-panel");
    if (!container) return;

    const currentFloorIdx = activeBlueprintConfig.currentFloorIdx || 0;
    const bhk = activeBlueprintConfig.bhk;
    const floors = activeBlueprintConfig.floors;
    
    if (!activeBlueprintConfig.customRatios) {
      activeBlueprintConfig.customRatios = {};
    }
    if (!activeBlueprintConfig.addedRooms) {
      activeBlueprintConfig.addedRooms = {};
    }
    if (!activeBlueprintConfig.deletedRooms) {
      activeBlueprintConfig.deletedRooms = {};
    }

    const rooms = getRoomsForFloor(bhk, floors, currentFloorIdx);

    let html = `
      <div class="bp-adjuster-header">
        <h4>🔧 Customize Room Sizes</h4>
        <button class="bp-adjuster-btn" id="bp-shuffle-btn">🔀 Shuffle Layout</button>
      </div>
      <div class="bp-adjuster-grid">
    `;

    rooms.forEach(room => {
      const percentage = Math.round(room.ratio * 100);
      html += `
        <div class="bp-adjuster-row">
          <span class="bp-adjuster-label">${room.icon} ${room.name}</span>
          <input type="range" class="bp-adjuster-slider" data-room-name="${room.name}" min="5" max="50" value="${percentage}" title="Adjust ${room.name} size">
          <span class="bp-adjuster-val">${percentage}%</span>
          <button class="bp-adjuster-delete-btn" data-room-name="${room.name}" title="Delete ${room.name}">✕</button>
        </div>
      `;
    });

    html += `
      </div>
      <!-- Add Room Row -->
      <div class="bp-add-room-row">
        <select id="bp-add-room-select" class="bp-adjuster-select" title="Choose Room Type to Add">
          <option value="Guest Bed|bedroom|#a78bfa|🛏️">🛏️ Guest Bed</option>
          <option value="Study Room|study|#14b8a6|📚">📚 Study Room</option>
          <option value="Balcony|balcony|#10b981|🌿">🌿 Balcony</option>
          <option value="Bathroom|bathroom|#06b6d4|🚿">🚿 Bathroom</option>
          <option value="Home Theater|theater|#ec4899|🎬">🎬 Home Theater</option>
          <option value="Gym Room|gym|#f97316|🏋️">🏋️ Gym Room</option>
          <option value="Store Room|store|#78716c|📦">📦 Store Room</option>
          <option value="Pooja Room|pooja|#fbbf24|🪔">🪔 Pooja Room</option>
          <option value="Walk-in Closet|closet|#ddd6fe|👗">👗 Walk-in Closet</option>
          <option value="custom">✍️ Custom Room...</option>
        </select>
        <input type="text" id="bp-add-room-custom-name" class="bp-adjuster-input" placeholder="Room Name" style="display: none;" title="Custom Room Name">
        <button class="bp-adjuster-btn" id="bp-add-room-btn">➕ Add Room</button>
      </div>
    `;

    container.innerHTML = html;

    // Sliders Listener
    container.querySelectorAll(".bp-adjuster-slider").forEach(slider => {
      slider.addEventListener("input", () => {
        const roomName = slider.dataset.roomName;
        const val = parseInt(slider.value) / 100;
        slider.nextElementSibling.textContent = `${slider.value}%`;

        const key = `${currentFloorIdx}_${roomName}`;
        activeBlueprintConfig.customRatios[key] = val;

        const canvas = document.getElementById("blueprint-canvas");
        if (canvas) {
          generateFloorPlan(canvas, activeBlueprintConfig);
        }
      });
    });

    // Delete Listener
    container.querySelectorAll(".bp-adjuster-delete-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const roomName = btn.dataset.roomName;
        const key = `${currentFloorIdx}_${roomName}`;
        
        // Mark room as deleted
        activeBlueprintConfig.deletedRooms[key] = true;
        
        // Remove from custom ratios or added rooms if exists
        delete activeBlueprintConfig.customRatios[key];
        if (activeBlueprintConfig.addedRooms[currentFloorIdx]) {
          activeBlueprintConfig.addedRooms[currentFloorIdx] = activeBlueprintConfig.addedRooms[currentFloorIdx].filter(r => r.name !== roomName);
        }

        // Redraw & Refresh Adjuster
        const canvas = document.getElementById("blueprint-canvas");
        if (canvas) {
          generateFloorPlan(canvas, activeBlueprintConfig);
        }
        renderAdjusterPanel();
      });
    });

    // Preset Dropdown change for Custom name option
    const select = document.getElementById("bp-add-room-select");
    const customNameInput = document.getElementById("bp-add-room-custom-name");
    if (select && customNameInput) {
      select.addEventListener("change", () => {
        if (select.value === "custom") {
          customNameInput.style.display = "inline-block";
          customNameInput.focus();
        } else {
          customNameInput.style.display = "none";
        }
      });
    }

    // Add Room Button Listener
    const addRoomBtn = document.getElementById("bp-add-room-btn");
    if (addRoomBtn && select) {
      addRoomBtn.addEventListener("click", () => {
        let name, type, color, icon;
        
        if (select.value === "custom") {
          const customName = customNameInput.value.trim();
          if (!customName) {
            alert("Please enter a room name.");
            return;
          }
          name = customName;
          type = "custom";
          color = "#e2e8f0";
          icon = "🚪";
        } else {
          const parts = select.value.split("|");
          name = parts[0];
          type = parts[1];
          color = parts[2];
          icon = parts[3];
        }

        // Make sure room name doesn't already exist on this floor
        const nameExists = rooms.some(r => r.name.toLowerCase() === name.toLowerCase());
        if (nameExists) {
          alert(`A room named "${name}" already exists on this floor.`);
          return;
        }

        // Initialize active floor addedRooms
        if (!activeBlueprintConfig.addedRooms[currentFloorIdx]) {
          activeBlueprintConfig.addedRooms[currentFloorIdx] = [];
        }

        // Add the new room
        const newRoom = { name, type, color, icon, ratio: 0.15 };
        activeBlueprintConfig.addedRooms[currentFloorIdx].push(newRoom);

        // Reset inputs
        customNameInput.value = "";
        customNameInput.style.display = "none";
        select.value = select.options[0].value;

        // Redraw & Refresh Adjuster
        const canvas = document.getElementById("blueprint-canvas");
        if (canvas) {
          generateFloorPlan(canvas, activeBlueprintConfig);
        }
        renderAdjusterPanel();
      });
    }

    // Shuffle Button Listener
    const shuffleBtn = document.getElementById("bp-shuffle-btn");
    if (shuffleBtn) {
      shuffleBtn.addEventListener("click", () => {
        rooms.forEach(r => {
          const key = `${currentFloorIdx}_${r.name}`;
          activeBlueprintConfig.customRatios[key] = (activeBlueprintConfig.customRatios[key] || r.ratio) * (0.8 + Math.random() * 0.4);
        });
        
        const canvas = document.getElementById("blueprint-canvas");
        if (canvas) {
          generateFloorPlan(canvas, activeBlueprintConfig);
        }
        renderAdjusterPanel();
      });
    }
  }

  // ────────────────────────────────────────────────────────────
  // RENDER RESULTS PANEL
  // ────────────────────────────────────────────────────────────
  function renderBlueprintResults(config) {
    const results = generateRecommendations(config);
    const container = document.getElementById("blueprint-results");
    if (!container) return;

    const formatPrice = window.HouseData ? window.HouseData.formatPrice : (p) => "₹" + p.toLocaleString();

    // Setup active closured level config
    activeBlueprintConfig = {
      ...config,
      currentFloorIdx: 0,
      viewMode: (activeBlueprintConfig && activeBlueprintConfig.viewMode) || config.viewMode || "blueprint",
      highlightedRoomName: null
    };

    container.innerHTML = `
      <div class="bp-results-inner">
        <!-- Summary Cards -->
        <div class="bp-summary-grid">
          <div class="bp-summary-card">
            <div class="bp-summary-icon">📐</div>
            <div class="bp-summary-value">${results.summary.plotSize}</div>
            <div class="bp-summary-label">Plot Size</div>
          </div>
          <div class="bp-summary-card">
            <div class="bp-summary-icon">🏗️</div>
            <div class="bp-summary-value">${results.summary.builtUp}</div>
            <div class="bp-summary-label">Built-up Area</div>
          </div>
          <div class="bp-summary-card">
            <div class="bp-summary-icon">💰</div>
            <div class="bp-summary-value" style="color: ${results.budgetStatus.color}">
              ${formatPrice(results.estimatedCost)}
            </div>
            <div class="bp-summary-label">${results.budgetStatus.label}</div>
          </div>
          <div class="bp-summary-card">
            <div class="bp-summary-icon">🏠</div>
            <div class="bp-summary-value">${results.summary.bhk}</div>
            <div class="bp-summary-label">${results.summary.style} Style</div>
          </div>
        </div>

        <!-- Floor Plan & Cost Side by Side -->
        <div class="bp-plan-row">
          <div class="bp-plan-card">
            <div class="bp-plan-header">
              <div class="bp-title-group">
                <h3>🏗️ Layout & Design Studio</h3>
                <div class="bp-view-modes">
                  <button class="bp-view-btn" data-view-mode="blueprint" title="Show Technical Blueprint">📐 Blueprint</button>
                  <button class="bp-view-btn" data-view-mode="interior" title="Show Detailed Interior Decor Render">🛋️ Interior View</button>
                  <button class="bp-view-btn" data-view-mode="3d" title="Show Interactive 3D Room Walkthrough">👁️ 3D View</button>
                </div>
              </div>
              <div class="bp-floor-tabs" id="bp-floor-tabs-container"></div>
            </div>
            <canvas id="blueprint-canvas" style="width:100%; height:450px;"></canvas>
            <div class="bp-adjuster-panel" id="bp-adjuster-panel"></div>
          </div>
          <div class="bp-plan-card">
            <h3>💰 Cost Breakdown</h3>
            <canvas id="cost-chart-canvas" style="width:100%; height:450px;"></canvas>
          </div>
        </div>

        <!-- Dynamic Interior Specs Dashboard -->
        <div class="bp-interior-card">
          <div class="bp-interior-header">
            <h3>🛋️ Room-by-Room Interior Details</h3>
            <span class="bp-badge">Design Theme: ${config.style}</span>
          </div>
          <p class="bp-style-desc">Select any room from your floor plan below to inspect wall colors, flooring materials, lighting grids, and Vastu-compliant furniture layouts tailored specifically to your layout.</p>
          <div class="bp-interior-grid">
            <div class="bp-room-list" id="bp-room-list-container">
              <!-- Dynamically populated -->
            </div>
            <div class="bp-spec-display" id="bp-spec-display-container">
              <!-- Dynamically populated -->
            </div>
          </div>
        </div>

        <!-- Architecture Style Card -->
        <div class="bp-style-card" style="border-left: 4px solid ${results.styleInfo.color};">
          <h3>🎨 ${config.style} Architecture</h3>
          <p class="bp-style-desc">${results.styleInfo.description}</p>
          <div class="bp-features-row">
            <div class="bp-feature-col">
              <h4>Design Features</h4>
              <ul class="bp-feature-list">
                ${results.styleInfo.features.map(f => `<li>✦ ${f}</li>`).join('')}
              </ul>
            </div>
            <div class="bp-feature-col">
              <h4>Recommended Materials</h4>
              <ul class="bp-feature-list">
                ${results.styleInfo.materials.map(m => `<li>🧱 ${m}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>

        <!-- Vastu Tips -->
        <div class="bp-vastu-card">
          <h3>🧭 Vastu Shastra Recommendations</h3>
          <div class="bp-vastu-grid">
            ${results.vastuTips.map(tip => `
              <div class="bp-vastu-tip">
                <span class="bp-vastu-bullet">☸</span>
                <span>${tip}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Budget Advice -->
        ${results.budgetStatus.status === "over" ? `
        <div class="bp-budget-warning">
          <h3>⚠️ Budget Advisory</h3>
          <p>Your budget of <strong>${formatPrice(config.budget)}</strong> is below the estimated construction cost of <strong>${formatPrice(results.estimatedCost)}</strong> for a ${config.bhk} BHK ${config.style} home on a ${config.plotWidth}' × ${config.plotDepth}' plot.</p>
          <h4>Suggestions to Reduce Cost:</h4>
          <ul class="bp-feature-list">
            <li>🔹 Consider reducing built-up area or number of rooms</li>
            <li>🔹 Use cost-effective local materials</li>
            <li>🔹 Opt for a Minimalist style (lowest cost per sq.ft)</li>
            <li>🔹 Build in phases — ground floor first, expand later</li>
            <li>🔹 Reduce decorative elements and premium finishes</li>
          </ul>
        </div>
        ` : `
        <div class="bp-budget-ok">
          <h3>✅ Budget Health</h3>
          <p>Great news! Your budget of <strong>${formatPrice(config.budget)}</strong> covers the estimated cost of <strong>${formatPrice(results.estimatedCost)}</strong>. You have <strong>${formatPrice(config.budget - results.estimatedCost)}</strong> remaining for interior design, landscaping, and furnishing.</p>
        </div>
        `}
      </div>
    `;

    container.style.display = "block";
    container.scrollIntoView({ behavior: "smooth", block: "start" });

    // Draw cost chart and blueprint canvas after DOM settles
    requestAnimationFrame(() => {
      const numFloors = config.floors || 1;
      const tabsContainer = document.getElementById("bp-floor-tabs-container");
      const canvas = document.getElementById("blueprint-canvas");
      
      if (tabsContainer) {
        if (numFloors > 1) {
          const floorNames = ["Ground", "First", "Second"];
          let tabsHtml = '';
          for (let i = 0; i < numFloors; i++) {
            const activeClass = i === 0 ? "active" : "";
            tabsHtml += `<button class="bp-floor-tab-btn ${activeClass}" data-floor-idx="${i}">${floorNames[i] || 'Floor ' + (i + 1)}</button>`;
          }
          tabsContainer.innerHTML = tabsHtml;
          tabsContainer.querySelectorAll(".bp-floor-tab-btn").forEach(btn => {
            btn.addEventListener("click", () => {
              tabsContainer.querySelectorAll(".bp-floor-tab-btn").forEach(b => b.classList.remove("active"));
              btn.classList.add("active");
              
              const floorIdx = parseInt(btn.dataset.floorIdx) || 0;
              activeBlueprintConfig.currentFloorIdx = floorIdx;
              
              // Redraw floor plan
              if (canvas) {
                generateFloorPlan(canvas, activeBlueprintConfig);
              }
              // Rerender layout adjuster panel & specs
              renderAdjusterPanel();
              renderInteriorDashboard();
            });
          });
        } else {
          tabsContainer.style.display = "none";
        }
      }

      // View mode buttons listener
      const viewBtns = container.querySelectorAll(".bp-view-btn");
      viewBtns.forEach(btn => {
        if (btn.dataset.viewMode === activeBlueprintConfig.viewMode) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
        btn.addEventListener("click", () => {
          viewBtns.forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          const mode = btn.dataset.viewMode;
          activeBlueprintConfig.viewMode = mode;
          
          // Reset rotation when changing views
          activeBlueprintConfig.cameraTheta = 0;
          
          // Redraw floor plan
          if (canvas) {
            generateFloorPlan(canvas, activeBlueprintConfig);
          }
        });
      });

      // 3D Walkthrough Camera Look-Around drag controller & interactive clicks
      let isDragging = false;
      let lastX = 0;
      let dragStartX = 0;
      let dragStartY = 0;

      function switchRoom(dir) {
        if (activeBlueprintConfig.isTransitioning) return;
        const bhk = activeBlueprintConfig.bhk;
        const floors = activeBlueprintConfig.floors;
        const currentFloorIdx = activeBlueprintConfig.currentFloorIdx || 0;
        const rooms = getRoomsForFloor(bhk, floors, currentFloorIdx);
        
        const activeRoomName = activeBlueprintConfig.highlightedRoomName || rooms[0].name;
        const currentIndex = rooms.findIndex(r => r.name === activeRoomName);
        const nextIndex = (currentIndex + dir + rooms.length) % rooms.length;
        const nextRoom = rooms[nextIndex];
        
        activeBlueprintConfig.isTransitioning = true;
        
        let start = null;
        const durationFade = 250;
        
        function animateFadeOut(timestamp) {
          if (!start) start = timestamp;
          const elapsed = timestamp - start;
          const progress = Math.min(1, elapsed / durationFade);
          
          activeBlueprintConfig.fadeOpacity = progress;
          generateFloorPlan(canvas, activeBlueprintConfig);
          
          if (progress < 1) {
            requestAnimationFrame(animateFadeOut);
          } else {
            activeBlueprintConfig.highlightedRoomName = nextRoom.name;
            activeBlueprintConfig.cameraTheta = 0;
            activeBlueprintConfig.doorOpenProgress = 0;
            renderInteriorDashboard();
            
            let startIn = null;
            function animateFadeIn(timestampIn) {
              if (!startIn) startIn = timestampIn;
              const elapsedIn = timestampIn - startIn;
              const progressIn = Math.min(1, elapsedIn / durationFade);
              
              activeBlueprintConfig.fadeOpacity = 1 - progressIn;
              generateFloorPlan(canvas, activeBlueprintConfig);
              
              if (progressIn < 1) {
                requestAnimationFrame(animateFadeIn);
              } else {
                activeBlueprintConfig.fadeOpacity = 0;
                activeBlueprintConfig.isTransitioning = false;
                generateFloorPlan(canvas, activeBlueprintConfig);
              }
            }
            requestAnimationFrame(animateFadeIn);
          }
        }
        requestAnimationFrame(animateFadeOut);
      }

      function triggerDoorTransition() {
        if (activeBlueprintConfig.isTransitioning) return;
        activeBlueprintConfig.isTransitioning = true;
        
        let start = null;
        const durationOpen = 600;
        
        function animateDoorOpen(timestamp) {
          if (!start) start = timestamp;
          const elapsed = timestamp - start;
          const progress = Math.min(1, elapsed / durationOpen);
          
          activeBlueprintConfig.doorOpenProgress = Math.pow(progress, 2);
          generateFloorPlan(canvas, activeBlueprintConfig);
          
          if (progress < 1) {
            requestAnimationFrame(animateDoorOpen);
          } else {
            let startFade = null;
            const durationFade = 300;
            
            function animateFadeOut(timestampFade) {
              if (!startFade) startFade = timestampFade;
              const elapsedFade = timestampFade - startFade;
              const progressFade = Math.min(1, elapsedFade / durationFade);
              
              activeBlueprintConfig.fadeOpacity = progressFade;
              generateFloorPlan(canvas, activeBlueprintConfig);
              
              if (progressFade < 1) {
                requestAnimationFrame(animateFadeOut);
              } else {
                const bhk = activeBlueprintConfig.bhk;
                const floors = activeBlueprintConfig.floors;
                const currentFloorIdx = activeBlueprintConfig.currentFloorIdx || 0;
                const rooms = getRoomsForFloor(bhk, floors, currentFloorIdx);
                
                const activeRoomName = activeBlueprintConfig.highlightedRoomName || rooms[0].name;
                const currentIndex = rooms.findIndex(r => r.name === activeRoomName);
                const nextRoom = rooms[(currentIndex + 1) % rooms.length];
                
                activeBlueprintConfig.highlightedRoomName = nextRoom.name;
                activeBlueprintConfig.doorOpenProgress = 0;
                activeBlueprintConfig.cameraTheta = 0;
                renderInteriorDashboard();
                
                let startIn = null;
                function animateFadeIn(timestampIn) {
                  if (!startIn) startIn = timestampIn;
                  const elapsedIn = timestampIn - startIn;
                  const progressIn = Math.min(1, elapsedIn / durationFade);
                  
                  activeBlueprintConfig.fadeOpacity = 1 - progressIn;
                  generateFloorPlan(canvas, activeBlueprintConfig);
                  
                  if (progressIn < 1) {
                    requestAnimationFrame(animateFadeIn);
                  } else {
                    activeBlueprintConfig.fadeOpacity = 0;
                    activeBlueprintConfig.isTransitioning = false;
                    generateFloorPlan(canvas, activeBlueprintConfig);
                  }
                }
                requestAnimationFrame(animateFadeIn);
              }
            }
            requestAnimationFrame(animateFadeOut);
          }
        }
        requestAnimationFrame(animateDoorOpen);
      }

      if (canvas) {
        canvas.addEventListener("mousedown", (e) => {
          dragStartX = e.clientX;
          dragStartY = e.clientY;
          if (activeBlueprintConfig.viewMode === "3d") {
            isDragging = true;
            lastX = e.clientX;
          }
        });

        canvas.addEventListener("mousemove", (e) => {
          const rect = canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          let isHoveringInteractive = false;

          if (activeBlueprintConfig.viewMode === "3d") {
            const isOverLeftArrow = canvas.leftArrowCircle && Math.hypot(x - canvas.leftArrowCircle.x, y - canvas.leftArrowCircle.y) <= canvas.leftArrowCircle.r;
            const isOverRightArrow = canvas.rightArrowCircle && Math.hypot(x - canvas.rightArrowCircle.x, y - canvas.rightArrowCircle.y) <= canvas.rightArrowCircle.r;
            const isOverDoor = canvas.doorPolygon && isPointInPolygon(x, y, canvas.doorPolygon);

            if (isOverLeftArrow || isOverRightArrow || isOverDoor) {
              isHoveringInteractive = true;
              canvas.style.cursor = "pointer";
              
              if (isOverLeftArrow && !activeBlueprintConfig.hoveringLeftArrow) {
                activeBlueprintConfig.hoveringLeftArrow = true;
                activeBlueprintConfig.hoveringRightArrow = false;
                activeBlueprintConfig.hoveringDoor = false;
                generateFloorPlan(canvas, activeBlueprintConfig);
              } else if (isOverRightArrow && !activeBlueprintConfig.hoveringRightArrow) {
                activeBlueprintConfig.hoveringRightArrow = true;
                activeBlueprintConfig.hoveringLeftArrow = false;
                activeBlueprintConfig.hoveringDoor = false;
                generateFloorPlan(canvas, activeBlueprintConfig);
              } else if (isOverDoor && !activeBlueprintConfig.hoveringDoor && !activeBlueprintConfig.isTransitioning) {
                activeBlueprintConfig.hoveringDoor = true;
                activeBlueprintConfig.hoveringLeftArrow = false;
                activeBlueprintConfig.hoveringRightArrow = false;
                generateFloorPlan(canvas, activeBlueprintConfig);
              }
            } else {
              canvas.style.cursor = isDragging ? "grabbing" : "grab";
              if (activeBlueprintConfig.hoveringLeftArrow || activeBlueprintConfig.hoveringRightArrow || activeBlueprintConfig.hoveringDoor) {
                activeBlueprintConfig.hoveringLeftArrow = false;
                activeBlueprintConfig.hoveringRightArrow = false;
                activeBlueprintConfig.hoveringDoor = false;
                generateFloorPlan(canvas, activeBlueprintConfig);
              }
            }
          } else {
            if (canvas.roomRects) {
              const hoveredRect = canvas.roomRects.find(r => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
              if (hoveredRect) {
                isHoveringInteractive = true;
                canvas.style.cursor = "pointer";
              } else {
                canvas.style.cursor = "default";
              }
            }
          }

          if (isDragging && activeBlueprintConfig.viewMode === "3d" && !isHoveringInteractive) {
            const deltaX = e.clientX - lastX;
            lastX = e.clientX;
            
            if (activeBlueprintConfig.cameraTheta === undefined) {
              activeBlueprintConfig.cameraTheta = 0;
            }
            
            activeBlueprintConfig.cameraTheta = Math.max(-0.85, Math.min(0.85, activeBlueprintConfig.cameraTheta + deltaX * 0.007));
            generateFloorPlan(canvas, activeBlueprintConfig);
          }
        });

        window.addEventListener("mouseup", () => {
          isDragging = false;
        });

        canvas.addEventListener("click", (e) => {
          const rect = canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          const moveDist = Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY);
          if (moveDist < 6) {
            if (activeBlueprintConfig.viewMode === "3d") {
              if (canvas.leftArrowCircle && Math.hypot(x - canvas.leftArrowCircle.x, y - canvas.leftArrowCircle.y) <= canvas.leftArrowCircle.r) {
                switchRoom(-1);
                return;
              }
              if (canvas.rightArrowCircle && Math.hypot(x - canvas.rightArrowCircle.x, y - canvas.rightArrowCircle.y) <= canvas.rightArrowCircle.r) {
                switchRoom(1);
                return;
              }
              if (canvas.doorPolygon && isPointInPolygon(x, y, canvas.doorPolygon)) {
                triggerDoorTransition();
                return;
              }
            } else {
              if (canvas.roomRects) {
                const clickedRect = canvas.roomRects.find(r => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
                if (clickedRect) {
                  activeBlueprintConfig.highlightedRoomName = clickedRect.data.name;
                  renderInteriorDashboard();
                  generateFloorPlan(canvas, activeBlueprintConfig);
                }
              }
            }
          }
        });

        canvas.addEventListener("touchstart", (e) => {
          if (e.touches.length > 0) {
            dragStartX = e.touches[0].clientX;
            dragStartY = e.touches[0].clientY;
            if (activeBlueprintConfig.viewMode === "3d") {
              isDragging = true;
              lastX = e.touches[0].clientX;
            }
          }
        });

        canvas.addEventListener("touchmove", (e) => {
          if (isDragging && activeBlueprintConfig.viewMode === "3d" && e.touches.length > 0) {
            const deltaX = e.touches[0].clientX - lastX;
            lastX = e.touches[0].clientX;
            
            if (activeBlueprintConfig.cameraTheta === undefined) {
              activeBlueprintConfig.cameraTheta = 0;
            }
            
            activeBlueprintConfig.cameraTheta = Math.max(-0.85, Math.min(0.85, activeBlueprintConfig.cameraTheta + deltaX * 0.008));
            generateFloorPlan(canvas, activeBlueprintConfig);
          }
        });

        canvas.addEventListener("touchend", (e) => {
          isDragging = false;
          
          if (e.changedTouches.length > 0) {
            const rect = canvas.getBoundingClientRect();
            const x = e.changedTouches[0].clientX - rect.left;
            const y = e.changedTouches[0].clientY - rect.top;
            
            const moveDist = Math.hypot(e.changedTouches[0].clientX - dragStartX, e.changedTouches[0].clientY - dragStartY);
            if (moveDist < 10) {
              if (activeBlueprintConfig.viewMode === "3d") {
                if (canvas.leftArrowCircle && Math.hypot(x - canvas.leftArrowCircle.x, y - canvas.leftArrowCircle.y) <= canvas.leftArrowCircle.r) {
                  switchRoom(-1);
                  return;
                }
                if (canvas.rightArrowCircle && Math.hypot(x - canvas.rightArrowCircle.x, y - canvas.rightArrowCircle.y) <= canvas.rightArrowCircle.r) {
                  switchRoom(1);
                  return;
                }
                if (canvas.doorPolygon && isPointInPolygon(x, y, canvas.doorPolygon)) {
                  triggerDoorTransition();
                  return;
                }
              } else {
                if (canvas.roomRects) {
                  const clickedRect = canvas.roomRects.find(r => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
                  if (clickedRect) {
                    activeBlueprintConfig.highlightedRoomName = clickedRect.data.name;
                    renderInteriorDashboard();
                    generateFloorPlan(canvas, activeBlueprintConfig);
                  }
                }
              }
            }
          }
        });

        generateFloorPlan(canvas, activeBlueprintConfig);
      }

      drawCostChart("cost-chart-canvas", results.costBreakdown, config.budget);
      renderAdjusterPanel();
      renderInteriorDashboard();
    });
  }

  // ────────────────────────────────────────────────────────────
  // INITIALIZE
  // ────────────────────────────────────────────────────────────
  function initBlueprint() {
    const form = document.getElementById("blueprint-form");
    if (!form) return;

    // Plot area auto-calculation
    const widthInput = document.getElementById("bp-plot-width");
    const depthInput = document.getElementById("bp-plot-depth");
    const areaDisplay = document.getElementById("bp-area-display");

    function updateArea() {
      const w = parseInt(widthInput.value) || 0;
      const d = parseInt(depthInput.value) || 0;
      areaDisplay.textContent = `${(w * d).toLocaleString()} sq.ft`;
    }

    widthInput.addEventListener("input", updateArea);
    depthInput.addEventListener("input", updateArea);

    // Budget display
    const budgetSlider = document.getElementById("bp-budget-slider");
    const budgetDisplay = document.getElementById("bp-budget-display");
    if (budgetSlider) {
      budgetSlider.addEventListener("input", () => {
        const val = parseInt(budgetSlider.value);
        if (val >= 10000000) {
          budgetDisplay.textContent = "₹" + (val / 10000000).toFixed(2) + " Cr";
        } else {
          budgetDisplay.textContent = "₹" + (val / 100000).toFixed(0) + " L";
        }
      });
    }

    // Style cards
    document.querySelectorAll(".bp-style-option").forEach(card => {
      card.addEventListener("click", () => {
        document.querySelectorAll(".bp-style-option").forEach(c => c.classList.remove("active"));
        card.classList.add("active");
      });
    });

    // BHK buttons
    document.querySelectorAll(".bp-bhk-tag").forEach(tag => {
      tag.addEventListener("click", () => {
        document.querySelectorAll(".bp-bhk-tag").forEach(t => t.classList.remove("active"));
        tag.classList.add("active");
      });
    });

    // Floor buttons
    document.querySelectorAll(".bp-floor-tag").forEach(tag => {
      tag.addEventListener("click", () => {
        document.querySelectorAll(".bp-floor-tag").forEach(t => t.classList.remove("active"));
        tag.classList.add("active");
      });
    });

    // Generate button
    const generateBtn = document.getElementById("bp-generate-btn");
    if (generateBtn) {
      generateBtn.addEventListener("click", () => {
        const plotWidth = parseInt(widthInput.value) || 30;
        const plotDepth = parseInt(depthInput.value) || 40;
        const bhk = parseInt(document.querySelector(".bp-bhk-tag.active")?.dataset.bhk || "2");
        const floors = parseInt(document.querySelector(".bp-floor-tag.active")?.dataset.floor || "1");
        const style = document.querySelector(".bp-style-option.active")?.dataset.style || "Modern";
        const budget = parseInt(budgetSlider.value) || 5000000;

        if (plotWidth < 15 || plotDepth < 15) {
          if (window.HouseUI) window.HouseUI.showToast("⚠️ Plot dimensions too small (min 15' × 15')");
          return;
        }

        renderBlueprintResults({
          plotWidth,
          plotDepth,
          bhk,
          style,
          budget,
          floors
        });

        if (window.HouseUI) window.HouseUI.showToast("🏗️ Blueprint generated successfully!");
      });
    }

    // Reset
    const resetBtn = document.getElementById("bp-reset-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        widthInput.value = 30;
        depthInput.value = 40;
        budgetSlider.value = 5000000;
        budgetDisplay.textContent = "₹50 L";
        areaDisplay.textContent = "1,200 sq.ft";
        document.querySelectorAll(".bp-bhk-tag").forEach(t => t.classList.remove("active"));
        document.querySelector('[data-bhk="2"]')?.classList.add("active");
        document.querySelectorAll(".bp-floor-tag").forEach(t => t.classList.remove("active"));
        document.querySelector('[data-floor="1"]')?.classList.add("active");
        document.querySelectorAll(".bp-style-option").forEach(c => c.classList.remove("active"));
        document.querySelector('[data-style="Modern"]')?.classList.add("active");
        document.getElementById("blueprint-results").style.display = "none";
        if (window.HouseUI) window.HouseUI.showToast("🔄 Reset complete");
      });
    }
  }

  // Boot
  document.addEventListener("DOMContentLoaded", initBlueprint);

  // ── Interactive Interior Design Specifications Dashboard ──
  function renderInteriorDashboard() {
    const roomListContainer = document.getElementById("bp-room-list-container");
    const specDisplayContainer = document.getElementById("bp-spec-display-container");
    if (!roomListContainer || !specDisplayContainer) return;

    const currentFloorIdx = activeBlueprintConfig.currentFloorIdx || 0;
    const bhk = activeBlueprintConfig.bhk;
    const floors = activeBlueprintConfig.floors;
    const style = activeBlueprintConfig.style;
    const rooms = getRoomsForFloor(bhk, floors, currentFloorIdx);

    if (rooms.length === 0) {
      roomListContainer.innerHTML = `<div class="bp-room-empty">No active rooms found on this floor. Add a room below to begin customizing.</div>`;
      specDisplayContainer.innerHTML = "";
      return;
    }

    if (!activeBlueprintConfig.highlightedRoomName || !rooms.some(r => r.name === activeBlueprintConfig.highlightedRoomName)) {
      activeBlueprintConfig.highlightedRoomName = rooms[0].name;
    }

    // Render list
    let listHtml = "";
    rooms.forEach(room => {
      const isActive = room.name === activeBlueprintConfig.highlightedRoomName ? "active" : "";
      listHtml += `
        <button class="bp-room-item ${isActive}" data-room-name="${room.name}">
          <span class="bp-room-icon">${room.icon}</span>
          <span class="bp-room-name">${room.name}</span>
        </button>
      `;
    });
    roomListContainer.innerHTML = listHtml;

    // Render spec details
    const activeRoom = rooms.find(r => r.name === activeBlueprintConfig.highlightedRoomName) || rooms[0];
    const spec = getInteriorSpecs(activeRoom.name, activeRoom.type, style);
    const accentCol = activeRoom.color || "#3b82f6";
    const secCol = style === "Traditional" ? "#d97706" : style === "Colonial" ? "#854d0e" : "#475569";

    specDisplayContainer.innerHTML = `
      <div class="bp-spec-card">
        <div class="bp-spec-header-row">
          <h4>${activeRoom.icon} ${activeRoom.name} Specifications</h4>
          <div class="bp-swatch-box">
            <span class="bp-swatch-label">Theme Palette:</span>
            <div class="bp-swatch-list">
              <span class="bp-swatch-dot" style="background: ${accentCol};" title="Primary Accent: ${activeRoom.name}"></span>
              <span class="bp-swatch-dot" style="background: ${secCol};" title="Secondary Base"></span>
              <span class="bp-swatch-dot" style="background: #f8fafc; border: 1px solid #e2e8f0;" title="Neutral Shade"></span>
            </div>
          </div>
        </div>

        <div class="bp-spec-items-grid">
          <div class="bp-spec-panel">
            <div class="bp-spec-panel-icon">🎨</div>
            <div class="bp-spec-panel-body">
              <h5>Paint & Wall Finishes</h5>
              <p>${spec.paint}</p>
            </div>
          </div>
          <div class="bp-spec-panel">
            <div class="bp-spec-panel-icon">🪵</div>
            <div class="bp-spec-panel-body">
              <h5>Flooring & Planks</h5>
              <p>${spec.flooring}</p>
            </div>
          </div>
          <div class="bp-spec-panel">
            <div class="bp-spec-panel-icon">💡</div>
            <div class="bp-spec-panel-body">
              <h5>Lighting & Atmosphere</h5>
              <p>${spec.lighting}</p>
            </div>
          </div>
          <div class="bp-spec-panel">
            <div class="bp-spec-panel-icon">🛋️</div>
            <div class="bp-spec-panel-body">
              <h5>Furniture & Styling</h5>
              <p>${spec.furniture}</p>
            </div>
          </div>
          <div class="bp-spec-panel bp-spec-panel--full">
            <div class="bp-spec-panel-icon">✨</div>
            <div class="bp-spec-panel-body">
              <h5>Architectural Details & Vastu Additions</h5>
              <p>${spec.features}</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Click tabs listener
    roomListContainer.querySelectorAll(".bp-room-item").forEach(item => {
      item.addEventListener("click", () => {
        const roomName = item.dataset.roomName;
        activeBlueprintConfig.highlightedRoomName = roomName;
        renderInteriorDashboard();

        const canvas = document.getElementById("blueprint-canvas");
        if (canvas) {
          generateFloorPlan(canvas, activeBlueprintConfig);
        }
      });
    });
  }

  // ── Point in Polygon Helper ──
  function isPointInPolygon(x, y, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y;
      const xj = polygon[j].x, yj = polygon[j].y;
      
      const intersect = ((yi > y) !== (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  // ── 3D Projection Math Engine ──
  function project3D(X, Y, Z, theta, W, H) {
    // 1. Rotate around Y axis (look left/right)
    const cosT = Math.cos(-theta);
    const sinT = Math.sin(-theta);
    
    const rotX = X * cosT - Z * sinT;
    const rotZ = X * sinT + Z * cosT;
    
    // 2. Perspective projection
    const zOffset = rotZ + 20; // camera focal distance offset
    const distance = 250; // focal length scale
    
    const rotY = Y;
    const projX = (rotX * distance) / zOffset + W / 2;
    const projY = (rotY * distance) / zOffset + H / 2 + 25; // slide horizon down slightly to show floor
    
    return { x: projX, y: projY, z: rotZ };
  }

  // Darken hex colors for 3D box side shadings
  function darkenColor(hex, percent) {
    if (hex.startsWith("#")) {
      let num = parseInt(hex.replace("#",""), 16),
      amt = Math.round(2.55 * percent * 100),
      R = (num >> 16) - amt,
      G = (num >> 8 & 0x00FF) - amt,
      B = (num & 0x0000FF) - amt;
      return "#" + (0x1000000 + (R<0?0:R>255?255:R)*0x10000 + (G<0?0:G>255?255:G)*0x100 + (B<0?0:B>255?255:B)).toString(16).slice(1);
    }
    return hex;
  }

  // 3D Polygon Drawer
  function drawPolygon(ctx, vertices, fillColor, strokeColor) {
    if (vertices.length === 0) return;
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor || "transparent";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);
    for (let i = 1; i < vertices.length; i++) {
      ctx.lineTo(vertices[i].x, vertices[i].y);
    }
    ctx.closePath();
    ctx.fill();
    if (strokeColor) ctx.stroke();
  }

  // 3D Box Drawer
  function draw3DBox(ctx, x1, y1, z1, x2, y2, z2, theta, W, H, fillColor, strokeColor) {
    const v = [
      project3D(x1, y1, z1, theta, W, H), // 0
      project3D(x2, y1, z1, theta, W, H), // 1
      project3D(x2, y2, z1, theta, W, H), // 2
      project3D(x1, y2, z1, theta, W, H), // 3
      project3D(x1, y1, z2, theta, W, H), // 4
      project3D(x2, y1, z2, theta, W, H), // 5
      project3D(x2, y2, z2, theta, W, H), // 6
      project3D(x1, y2, z2, theta, W, H)  // 7
    ];

    const faces = [
      { idxs: [4, 5, 6, 7], shade: "rgba(0,0,0,0.18)" }, // back
      { idxs: [3, 2, 6, 7], shade: "rgba(0,0,0,0.28)" }, // bottom
      { idxs: [0, 1, 5, 4], shade: "rgba(255,255,255,0.16)" }, // top
      { idxs: [0, 3, 7, 4], shade: "rgba(0,0,0,0.1)" }, // left
      { idxs: [1, 2, 6, 5], shade: "rgba(0,0,0,0.05)" }, // right
      { idxs: [0, 1, 2, 3], shade: "" } // front
    ];

    faces.forEach(face => {
      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor || "rgba(0,0,0,0.12)";
      ctx.lineWidth = 1.1;
      
      ctx.beginPath();
      ctx.moveTo(v[face.idxs[0]].x, v[face.idxs[0]].y);
      ctx.lineTo(v[face.idxs[1]].x, v[face.idxs[1]].y);
      ctx.lineTo(v[face.idxs[2]].x, v[face.idxs[2]].y);
      ctx.lineTo(v[face.idxs[3]].x, v[face.idxs[3]].y);
      ctx.closePath();
      ctx.fill();
      
      if (face.shade) {
        ctx.fillStyle = face.shade;
        ctx.fill();
      }
      ctx.stroke();
    });
  }

  // ── First Person Perspective 3D Room Walkthrough Renderer ──
  function render3DWalkthrough(canvas, config) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;

    const currentFloorIdx = config.currentFloorIdx || 0;
    const bhk = config.bhk;
    const floors = config.floors;
    const style = config.style;
    const rooms = getRoomsForFloor(bhk, floors, currentFloorIdx);

    let activeRoom = rooms.find(r => r.name === config.highlightedRoomName) || rooms[0];
    if (!activeRoom) {
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#ffffff";
      ctx.font = "14px 'Inter', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Select a room to explore in 3D walkthrough", W / 2, H / 2);
      return;
    }

    const theta = config.cameraTheta || 0;
    const activeColor = activeRoom.color || "#3b82f6";

    // Clear background
    ctx.fillStyle = "#0f172a"; 
    ctx.fillRect(0, 0, W, H);

    // Wall coordinates: X from -60 to 60, Y from -40 to 40, Z from 20 to 120
    const TL = project3D(-60, -40, 120, theta, W, H);
    const TR = project3D(60, -40, 120, theta, W, H);
    const BR = project3D(60, 40, 120, theta, W, H);
    const BL = project3D(-60, 40, 120, theta, W, H);

    const FTL = project3D(-60, -40, 20, theta, W, H);
    const FTR = project3D(60, -40, 20, theta, W, H);
    const FBR = project3D(60, 40, 20, theta, W, H);
    const FBL = project3D(-60, 40, 20, theta, W, H);

    // 1. Draw Ceiling (white plaster)
    drawPolygon(ctx, [FTL, FTR, TR, TL], "#f1f5f9", "rgba(255,255,255,0.06)");

    // 2. Draw Floor
    let floorCol = "#cbd5e1";
    if (activeRoom.type === "bedroom") floorCol = "#e7d4b8"; // Oak planks
    else if (activeRoom.type === "living" || activeRoom.type === "dining") floorCol = "#f1f5f9"; // Marble
    else if (activeRoom.type === "kitchen") floorCol = "#f8fafc"; // Ceramic tile
    else if (activeRoom.type === "bathroom") floorCol = "#bae6fd"; // Light blue tile
    else if (activeRoom.type === "balcony") floorCol = "#d97706"; // Deck planks
    else if (activeRoom.type === "pooja") floorCol = "#fef3c7"; // Gold yellow marble
    else if (activeRoom.type === "gym") floorCol = "#475569"; // Slate rubber
    else if (activeRoom.type === "theater") floorCol = "#3b0764"; // Movie carpet
    
    drawPolygon(ctx, [FBL, FBR, BR, BL], floorCol);

    // Draw Floor Perspective Lines
    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    ctx.lineWidth = 0.8;
    const numPlanks = 10;
    for (let i = 0; i <= numPlanks; i++) {
      const fx = -60 + (120 / numPlanks) * i;
      const startPt = project3D(fx, 40, 20, theta, W, H);
      const endPt = project3D(fx, 40, 120, theta, W, H);
      ctx.beginPath();
      ctx.moveTo(startPt.x, startPt.y);
      ctx.lineTo(endPt.x, endPt.y);
      ctx.stroke();
    }
    const numCross = 6;
    for (let j = 0; j <= numCross; j++) {
      const fz = 20 + (100 / numCross) * j;
      const startPt = project3D(-60, 40, fz, theta, W, H);
      const endPt = project3D(60, 40, fz, theta, W, H);
      ctx.beginPath();
      ctx.moveTo(startPt.x, startPt.y);
      ctx.lineTo(endPt.x, endPt.y);
      ctx.stroke();
    }

    // 3. Draw Side & Back Walls
    drawPolygon(ctx, [FTL, TL, BL, FBL], "#1e293b"); // Left Wall
    drawPolygon(ctx, [FTR, TR, BR, FBR], "#1e293b"); // Right Wall
    drawPolygon(ctx, [TL, TR, BR, BL], "#0f172a");   // Back Wall

    // Shading
    drawPolygon(ctx, [FTL, TL, BL, FBL], "rgba(0,0,0,0.18)"); // Shadow Left
    drawPolygon(ctx, [FTR, TR, BR, FBR], "rgba(0,0,0,0.08)"); // Shadow Right

    // 4. Draw Window on Left Wall
    const winV = [
      project3D(-60, -18, 50, theta, W, H),
      project3D(-60, -18, 95, theta, W, H),
      project3D(-60, 15, 95, theta, W, H),
      project3D(-60, 15, 50, theta, W, H)
    ];
    drawPolygon(ctx, winV, "#38bdf8", "#ffffff");
    const wMidT = project3D(-60, -18, 72.5, theta, W, H);
    const wMidB = project3D(-60, 15, 72.5, theta, W, H);
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(wMidT.x, wMidT.y);
    ctx.lineTo(wMidB.x, wMidB.y);
    ctx.stroke();

    // 5. Draw Doorway Frame on Right Wall (behind the door)
    const doorFrameV = [
      project3D(60, -25, 45, theta, W, H),
      project3D(60, -25, 70, theta, W, H),
      project3D(60, 40, 70, theta, W, H),
      project3D(60, 40, 45, theta, W, H)
    ];
    drawPolygon(ctx, doorFrameV, "#090d16", "#1e293b");

    // Compute swinging door vertices
    const openProgress = config.doorOpenProgress || 0;
    const phi = openProgress * (Math.PI / 2); // Swing open up to 90 degrees
    
    // Rotate outer edge of the door inward around the hinge at Z = 70
    const outerTop = project3D(60 - 25 * Math.sin(phi), -25, 70 - 25 * Math.cos(phi), theta, W, H);
    const outerBottom = project3D(60 - 25 * Math.sin(phi), 40, 70 - 25 * Math.cos(phi), theta, W, H);
    const hingeBottom = project3D(60, 40, 70, theta, W, H);
    const hingeTop = project3D(60, -25, 70, theta, W, H);
    
    const doorV = [outerTop, outerBottom, hingeBottom, hingeTop];
    drawPolygon(ctx, doorV, "#451a03", "#78350f");

    // Save interactive door polygon for click detection
    canvas.doorPolygon = doorFrameV;

    // 6. Draw Picture Frame on Back Wall
    const frameV = [
      project3D(-16, -18, 120, theta, W, H),
      project3D(16, -18, 120, theta, W, H),
      project3D(16, -2, 120, theta, W, H),
      project3D(-16, -2, 120, theta, W, H)
    ];
    drawPolygon(ctx, frameV, activeColor, "#ffffff");
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 9.5px 'Inter', sans-serif";
    ctx.textAlign = "center";
    const frameCent = project3D(0, -10, 120, theta, W, H);
    ctx.fillText(activeRoom.name, frameCent.x, frameCent.y);

    // 7. Draw 3D Furniture models
    if (activeRoom.type === "bedroom") {
      draw3DBox(ctx, -26, 22, 75, 26, 40, 118, theta, W, H, "#78350f", "#451a03"); // bed frame
      draw3DBox(ctx, -24, 18, 77, 24, 34, 116, theta, W, H, "#ffffff", "#cbd5e1"); // mattress
      draw3DBox(ctx, -24, 17.5, 77, 24, 34, 94, theta, W, H, activeColor, darkenColor(activeColor, 0.15)); // duvet comforter
      draw3DBox(ctx, -18, 12, 103, -4, 18, 111, theta, W, H, activeColor, "#ffffff"); // pillow Left
      draw3DBox(ctx, 4, 12, 103, 18, 18, 111, theta, W, H, activeColor, "#ffffff"); // pillow Right
      draw3DBox(ctx, -40, 24, 105, -30, 40, 118, theta, W, H, "#451a03", "#1c0d02"); // nightstand Left
      draw3DBox(ctx, 30, 24, 105, 40, 40, 118, theta, W, H, "#451a03", "#1c0d02"); // nightstand Right

    } else if (activeRoom.type === "living") {
      draw3DBox(ctx, -45, 20, 95, 45, 40, 115, theta, W, H, "#1e293b", "#0f172a"); // sofa back
      draw3DBox(ctx, -41, 26, 95, 41, 34, 111, theta, W, H, activeColor, darkenColor(activeColor, 0.15)); // seat cushions
      draw3DBox(ctx, -45, 20, 55, -25, 40, 95, theta, W, H, "#1e293b", "#0f172a"); // L-sectional side
      draw3DBox(ctx, -10, 28, 65, 18, 40, 85, theta, W, H, "rgba(146, 64, 14, 0.95)", "#451a03"); // wood table

    } else if (activeRoom.type === "kitchen") {
      draw3DBox(ctx, -60, 20, 100, 60, 40, 120, theta, W, H, "#cbd5e1", "#94a3b8"); // back counter
      draw3DBox(ctx, -60, 20, 45, -36, 40, 100, theta, W, H, "#cbd5e1", "#94a3b8"); // left counter
      draw3DBox(ctx, 42, -12, 100, 58, 40, 118, theta, W, H, "#64748b", "#334155"); // fridge
      draw3DBox(ctx, -12, 16.5, 104, 12, 20, 114, theta, W, H, "#1e293b", "#000000"); // stove

    } else if (activeRoom.type === "dining") {
      draw3DBox(ctx, -20, 22, 65, 20, 40, 95, theta, W, H, "#7c2d12", "#451a03"); // table
      draw3DBox(ctx, -16, 14, 100, -8, 40, 108, theta, W, H, "#a8a29e", "#57534e"); // chair back L
      draw3DBox(ctx, 8, 14, 100, 16, 40, 108, theta, W, H, "#a8a29e", "#57534e"); // chair back R
      draw3DBox(ctx, -16, 24, 52, -8, 40, 60, theta, W, H, "#a8a29e", "#57534e"); // chair front L
      draw3DBox(ctx, 8, 24, 52, 16, 40, 60, theta, W, H, "#a8a29e", "#57534e"); // chair front R

    } else if (activeRoom.type === "bathroom") {
      // glass shower partition
      const g1 = project3D(-25, -40, 30, theta, W, H);
      const g2 = project3D(-25, -40, 90, theta, W, H);
      const g3 = project3D(-25, 40, 90, theta, W, H);
      const g4 = project3D(-25, 40, 30, theta, W, H);
      ctx.save();
      ctx.fillStyle = "rgba(165, 243, 252, 0.25)";
      ctx.strokeStyle = "rgba(6, 182, 212, 0.65)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(g1.x, g1.y);
      ctx.lineTo(g2.x, g2.y);
      ctx.lineTo(g3.x, g3.y);
      ctx.lineTo(g4.x, g4.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      
      draw3DBox(ctx, 32, 22, 90, 56, 40, 118, theta, W, H, "#ffffff", "#cbd5e1"); // vanity unit
      draw3DBox(ctx, -10, 22, 98, 10, 40, 118, theta, W, H, "#f8fafc", "#cbd5e1"); // WC toilet

    } else if (activeRoom.type === "balcony") {
      // Draw foreground railing
      ctx.save();
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 4;
      const rTopL = project3D(-60, 10, 32, theta, W, H);
      const rTopR = project3D(60, 10, 32, theta, W, H);
      const rMidL = project3D(-60, 24, 32, theta, W, H);
      const rMidR = project3D(60, 24, 32, theta, W, H);
      
      ctx.beginPath();
      ctx.moveTo(rTopL.x, rTopL.y);
      ctx.lineTo(rTopR.x, rTopR.y);
      ctx.stroke();
      
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(rMidL.x, rMidL.y);
      ctx.lineTo(rMidR.x, rMidR.y);
      ctx.stroke();
      
      ctx.lineWidth = 1.5;
      for (let i = -10; i <= 10; i++) {
        const barX = i * 6;
        const bTop = project3D(barX, 10, 32, theta, W, H);
        const bBot = project3D(barX, 40, 32, theta, W, H);
        ctx.beginPath();
        ctx.moveTo(bTop.x, bTop.y);
        ctx.lineTo(bBot.x, bBot.y);
        ctx.stroke();
      }
      ctx.restore();

      draw3DBox(ctx, -48, 25, 45, -38, 40, 55, theta, W, H, "#b45309", "#78350f"); // left pot
      draw3DBox(ctx, 38, 25, 45, 48, 40, 55, theta, W, H, "#b45309", "#78350f"); // right pot

    } else if (activeRoom.type === "pooja") {
      draw3DBox(ctx, -16, 18, 95, 16, 40, 118, theta, W, H, "#fbbf24", "#d97706"); // altar
      draw3DBox(ctx, -10, 10, 100, 10, 18, 118, theta, W, H, "#f59e0b", "#b45309"); // step

    } else if (activeRoom.type === "study") {
      draw3DBox(ctx, -30, 22, 80, 20, 40, 110, theta, W, H, "#7c2d12", "#451a03"); // desk
      draw3DBox(ctx, -12, 6, 95, 2, 22, 98, theta, W, H, "#0f172a", "#000000"); // screen
      draw3DBox(ctx, -10, 25, 60, 5, 40, 75, theta, W, H, "#475569", "#1e293b"); // chair
    }

    // 10. Title Overlay
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 15px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`🕶️ 3D First-Person View — ${activeRoom.name}`, W / 2, 30);
    ctx.font = "10px 'Inter', sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.48)";
    ctx.fillText("(Click & Drag on Canvas to Look Around the Room)", W / 2, 46);

    // 11. Door Hover Hint Tooltip
    if (config.hoveringDoor && !config.isTransitioning) {
      const dfCent = project3D(60, 7.5, 57.5, theta, W, H);
      ctx.save();
      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 1.2;
      
      const tw = 145;
      const th = 22;
      const tx = dfCent.x - tw / 2;
      const ty = dfCent.y - th / 2;
      
      ctx.beginPath();
      ctx.roundRect(tx, ty, tw, th, 4);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 9.5px 'Inter', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("🚪 Click Door to Open & Enter", dfCent.x, dfCent.y + 3);
      ctx.restore();
    }

    // 12. Draw Visual Chevron Arrows on Canvas Margins for easy room switching
    ctx.save();
    ctx.lineWidth = 2;
    
    // Left arrow circle
    ctx.fillStyle = config.hoveringLeftArrow ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.15)";
    ctx.strokeStyle = config.hoveringLeftArrow ? "#fbbf24" : "rgba(255, 255, 255, 0.4)";
    ctx.beginPath();
    ctx.arc(30, H / 2, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Left arrow chevron
    ctx.strokeStyle = config.hoveringLeftArrow ? "#fbbf24" : "rgba(255, 255, 255, 0.7)";
    ctx.beginPath();
    ctx.moveTo(33, H / 2 - 6);
    ctx.lineTo(26, H / 2);
    ctx.lineTo(33, H / 2 + 6);
    ctx.stroke();
    
    // Right arrow circle
    ctx.fillStyle = config.hoveringRightArrow ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.15)";
    ctx.strokeStyle = config.hoveringRightArrow ? "#fbbf24" : "rgba(255, 255, 255, 0.4)";
    ctx.beginPath();
    ctx.arc(W - 30, H / 2, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Right arrow chevron
    ctx.strokeStyle = config.hoveringRightArrow ? "#fbbf24" : "rgba(255, 255, 255, 0.7)";
    ctx.beginPath();
    ctx.moveTo(W - 33, H / 2 - 6);
    ctx.lineTo(W - 26, H / 2);
    ctx.lineTo(W - 33, H / 2 + 6);
    ctx.stroke();
    
    ctx.restore();

    // Save chevron coordinates for click detection
    canvas.leftArrowCircle = { x: 30, y: H / 2, r: 18 };
    canvas.rightArrowCircle = { x: W - 30, y: H / 2, r: 18 };

    // 13. Screen Fade Opacity Overlay
    if (config.fadeOpacity && config.fadeOpacity > 0) {
      ctx.fillStyle = `rgba(15, 23, 42, ${config.fadeOpacity})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  // Export
  window.Blueprint = {
    generate: generateFloorPlan,
    renderResults: renderBlueprintResults,
    getStyleDetails: () => STYLE_DETAILS,
    getCostPerSqft: () => COST_PER_SQFT
  };
})();
