// ============================================================
// WAVERLY PROJECT PRESET DATA
// Pre-loads all scope data for 5640 Waverly Ave, La Jolla
// ============================================================

const WAVERLY_PRESET = {
  projectInfo: {
    projectName: 'Waverly',
    propertyAddress: '5640 Waverly Ave, La Jolla',
    clientName: 'Sarah Street',
    propertyType: 'Single Family',
    projectType: 'Kitchen + Bathrooms',
    totalSF: '2800',
    yearBuilt: '1965',
    bedsBaths: '4 bed / 3 bath',
    ownerOccupied: 'Yes - phased approach needed',
    inputSourceType: 'combined',
    planSheets: 'Kitchen shop drawings, Bath 2 shop drawings, Pool Bath shop drawings',
    designDocs: 'Waverly Materials Lists (Kitchen, Primary Bath, Girls Bath, Pool Bath)',
    sowVersion: '1.0',
    sowStatus: 'PRELIMINARY',
    sowRevisionNotes: 'Initial issue from budget and materials lists.',
  },
  selectedModules: { kitchen: true, bathroom: true },
  bathCount: 3,
  bathNames: {
    'bathroom-1': { name: 'Primary Bathroom', type: 'Master Bath' },
    'bathroom-2': { name: "Girl's Bathroom", type: 'Guest Bath' },
    'bathroom-3': { name: 'Pool Bathroom', type: 'Other' },
  },
  // scopeData keyed by moduleKey -> tradeIndex -> itemIndex -> { included, detail, notes, qty }
  // Kitchen trades: 0=Demo, 1=Framing, 2=Plumbing, 3=Electrical, 4=HVAC, 5=Drywall,
  //   6=Cabinetry, 7=Countertops, 8=Backsplash, 9=Flooring, 10=Painting,
  //   11=Plumbing Fixtures, 12=Electrical Fixtures, 13=Appliances, 14=Doors&Windows, 15=Final
  scopeData: {
    // ==================== KITCHEN ====================
    'kitchen': {
      // DEMOLITION
      0: {
        0: { included: true, detail: 'All', notes: 'Remove all existing cabinets, countertops, appliances' },
        1: { included: true, notes: 'Remove existing countertops' },
        2: { included: true, notes: 'Remove all existing appliances' },
        3: { included: true, detail: 'Tile', notes: 'Remove existing tile flooring' },
        4: { included: true, notes: 'Remove existing backsplash' },
        5: { included: true, notes: 'Protect adjacent living areas' },
        6: { included: true, notes: 'Dumpster fees included in General Conditions' },
      },
      // FRAMING
      1: {
        0: { included: true, notes: 'Framing for pantry cabinet area' },
        2: { included: true, notes: 'Backing for cabinets and fixtures throughout kitchen' },
      },
      // PLUMBING
      2: {
        0: { included: true, detail: 'Same location', notes: 'Rough plumbing for farmhouse sink' },
        1: { included: true, notes: 'Dishwasher supply and drain' },
        3: { included: true, notes: 'Gas line for ILVE range at existing location' },
        5: { included: true, notes: 'Garbage disposal rough-in' },
      },
      // ELECTRICAL
      3: {
        0: { included: true, qty: '4', notes: 'Dedicated circuits: range, refrigerator, microwave, dishwasher' },
        1: { included: true, notes: 'Under-cabinet LED strip lighting rough-in' },
        2: { included: true, notes: 'Pendant lighting rough-in over island - 3 pendants' },
        5: { included: true, notes: 'Range hood electrical connection' },
        6: { included: true, notes: 'All outlets and switches per code' },
        8: { included: true, qty: '6', notes: 'Recessed lighting throughout kitchen' },
      },
      // HVAC
      4: {
        0: { included: true, notes: 'Modify ductwork as needed for new layout' },
        2: { included: true, detail: 'Ducted to exterior', notes: 'Vent-A-Hood 36" insert' },
      },
      // DRYWALL
      5: {
        0: { included: true, notes: 'New drywall where needed after framing' },
        1: { included: true },
        2: { included: true, detail: 'Smooth (Level 4)', notes: 'Smooth finish throughout kitchen' },
      },
      // CABINETRY
      6: {
        0: { included: true, detail: 'New custom', notes: 'Custom painted cabinets in sage green per design' },
        1: { included: true, qty: '7', notes: '7 base cabinet types per shop drawings' },
        2: { included: true, qty: '2', notes: '2 upper cabinet styles per shop drawings' },
        3: { included: true, qty: '1', notes: 'Full-height pantry cabinet' },
        4: { included: true, notes: 'Island cabinets per design' },
        6: { included: true, detail: 'Pulls', qty: '45', notes: '42 cabinet pulls + 3 appliance pulls' },
        8: { included: true, qty: '6', notes: '6 reeded glass panels for upper cabinets' },
        9: { included: true, notes: 'Soft-close on all doors and drawers' },
      },
      // COUNTERTOPS
      7: {
        0: { included: true, detail: 'Quartz', notes: 'Quartz countertops per materials list' },
        1: { included: true, qty: '134', notes: '134 SF estimated' },
        2: { included: true, detail: 'Mitered', notes: 'Mitered edge per design' },
        3: { included: true, detail: 'Island', notes: 'Waterfall edge on island' },
        4: { included: true, notes: 'Farmhouse sink cutout' },
        5: { included: true, notes: 'Cooktop cutout for ILVE range' },
      },
      // BACKSPLASH
      8: {
        0: { included: true, detail: 'To underside of uppers', notes: 'Full backsplash to underside of upper cabinets' },
        1: { included: true, detail: 'Marble', notes: 'Full-height marble slab backsplash' },
        2: { included: true, detail: 'Brick/offset', notes: 'Brick/offset pattern' },
        3: { included: true, detail: 'Full slab', notes: 'Full slab behind range area' },
      },
      // FLOORING
      9: {
        0: { included: true, notes: 'Remove existing tile flooring' },
        1: { included: true, notes: 'Subfloor prep and leveling as needed' },
        2: { included: true, detail: 'Porcelain tile', notes: 'Specialty terracotta-look porcelain tile' },
        3: { included: true, qty: '262', notes: '262 SF per materials list' },
        4: { included: true, detail: 'Custom', notes: 'Pattern layout per design specifications' },
        5: { included: true, detail: 'Flush', notes: 'Flush transitions to adjacent rooms' },
        6: { included: true, detail: 'New', qty: '40', notes: 'New baseboards, estimated 40 LF' },
      },
      // PAINTING
      10: {
        0: { included: true, notes: 'Wall prep, patching, sanding, priming' },
        1: { included: true, notes: 'Paint all kitchen walls' },
        2: { included: true, notes: 'Paint kitchen ceiling' },
        3: { included: true, notes: 'Paint all trim and baseboards' },
        4: { included: true, detail: '3-4', notes: '3-4 colors for kitchen' },
      },
      // PLUMBING FIXTURES
      11: {
        0: { included: true, detail: 'Farmhouse/apron', notes: 'Ruvati Fiore 33" farmhouse sink' },
        1: { included: true, detail: 'Bridge', notes: 'Hansgrohe Talis N faucet' },
        2: { included: true, detail: 'Brushed gold', notes: 'Brushed gold finish to match design' },
        3: { included: true, detail: 'Premium/quiet', notes: 'Premium quiet garbage disposal' },
        4: { included: true, notes: 'Air switch for disposal' },
      },
      // ELECTRICAL FIXTURES
      12: {
        0: { included: true, notes: 'LED strip lighting under all cabinets' },
        1: { included: true, qty: '3', notes: '3 West Elm Henry pendant lights over island' },
        2: { included: true, notes: 'Dimmer switches throughout' },
      },
      // APPLIANCES
      13: {
        0: { included: true, detail: 'Gas range', notes: 'ILVE Nostalgie II 36" in Graphite Matte' },
        1: { included: true, detail: 'Insert/liner', notes: 'Vent-A-Hood 36" insert' },
        2: { included: true, detail: 'Panel-ready', notes: 'Thermador Freedom 36" panel-ready refrigerator' },
        3: { included: true, detail: 'Panel-ready', notes: 'Bosch 800 Series panel-ready dishwasher' },
        4: { included: true, detail: 'Built-in', notes: 'Sharp 24" microwave drawer' },
        5: { included: true, notes: 'Garbage disposal and air switch' },
      },
      // FINAL
      15: {
        0: { included: true, notes: 'Final cleaning of all kitchen surfaces' },
        1: { included: true, notes: 'Test all appliances and connections' },
        2: { included: true, notes: 'Complete punch list items' },
        3: { included: true, notes: 'Final inspection coordination' },
        4: { included: true, notes: 'Client walkthrough of completed kitchen' },
      },
    },

    // ==================== PRIMARY BATHROOM ====================
    'bathroom-1': {
      // DEMOLITION
      0: {
        0: { included: true, notes: 'Remove existing tub, shower, vanity, toilet' },
        1: { included: true, notes: 'Remove all existing tile' },
        3: { included: true, notes: 'Remove all existing fixtures' },
        4: { included: true, notes: 'Protect adjacent areas' },
        5: { included: true, notes: 'Debris removal, dumpster shared with project' },
      },
      // FRAMING
      1: {
        0: { included: true, notes: 'Frame new walk-in shower area' },
        1: { included: true, notes: 'Frame for freestanding tub location' },
        2: { included: true, notes: 'Blocking for grab bars and fixtures throughout' },
      },
      // PLUMBING
      2: {
        0: { included: true, detail: 'Curbless', notes: 'Large walk-in curbless shower' },
        1: { included: true, detail: 'Linear', notes: 'Linear drain for curbless shower' },
        2: { included: true, detail: 'Thermostatic', notes: 'Signature Hardware thermostatic shower system' },
        3: { included: true, detail: 'Rain + handheld', notes: 'Rain showerhead plus handheld' },
        4: { included: true, notes: 'Relocate tub plumbing to new freestanding tub location' },
        5: { included: true, notes: 'Rough plumbing for 92" double sink vanity' },
        6: { included: true, notes: 'Toilet rough-in for TOTO Nexus' },
      },
      // ELECTRICAL
      3: {
        0: { included: true, notes: 'New circuits for primary bathroom' },
        1: { included: true, qty: '6', notes: '6 Greenwich sconce rough-ins' },
        2: { included: true, qty: '2', notes: '2 Panasonic exhaust fan rough-ins' },
        3: { included: true, notes: 'GFCI outlets per code' },
        5: { included: true, notes: 'Bidet seat outlet for TOTO Washlet' },
        6: { included: true, notes: 'Heated floor thermostat wiring' },
      },
      // WATERPROOFING
      4: {
        0: { included: true, detail: 'Sheet membrane (Kerdi)', notes: 'Kerdi system for curbless shower' },
        1: { included: true, detail: 'Kerdi board', notes: 'Kerdi board on shower walls' },
        2: { included: true, detail: 'N/A (curbless)', notes: 'Curbless design' },
        4: { included: true, notes: 'Shower bench waterproofing' },
        5: { included: true, notes: 'Niche waterproofing' },
        6: { included: true, notes: 'Flood test and inspection required' },
      },
      // TILE
      5: {
        0: { included: true, detail: 'Porcelain', notes: 'Calacatta porcelain for tile material' },
        1: { included: true, qty: '395', notes: '395 SF Calacatta porcelain floor tile' },
        2: { included: true, detail: 'Porcelain mosaic', notes: '24 SF mosaic tile for shower floor' },
        3: { included: true, detail: 'To ceiling', notes: 'Shower wall tile to ceiling' },
        4: { included: true, qty: '2', notes: '2 shower niches' },
        5: { included: true, notes: '140 SF wall tile + 26 SF accent tiles' },
        7: { included: true, detail: 'N/A', notes: 'N/A for primary bath' },
        8: { included: true, detail: 'Brick/offset', notes: 'Brick/offset pattern for wall tile' },
        9: { included: true, notes: 'Schluter edge trim at tile transitions' },
        10: { included: true, notes: 'Professional grouting and sealing throughout' },
      },
      // CABINETRY
      6: {
        0: { included: true, detail: 'Custom built', notes: 'Custom 92" double vanity' },
        1: { included: true, detail: '92"+', notes: '92" vanity per design' },
        3: { included: true, detail: 'Recessed', qty: '3', notes: '3 Eaton recessed medicine cabinets' },
        4: { included: true, detail: 'Yes - custom', notes: 'Storage cabinet per design' },
        5: { included: true, notes: 'Hardware in aged brass finish' },
      },
      // COUNTERTOPS
      7: {
        0: { included: true, detail: 'Quartz', notes: 'Quartz countertop for 92" vanity' },
        1: { included: true, qty: '50', notes: '50 SF estimated' },
        2: { included: true, detail: 'Undermount', notes: 'Double undermount sink cutouts' },
        3: { included: true, detail: 'Eased', notes: 'Eased edge profile' },
      },
      // GLASS / SHOWER ENCLOSURE
      8: {
        0: { included: true, detail: 'Frameless', notes: 'Custom frameless glass shower enclosure' },
        1: { included: true, detail: 'Swing door', notes: 'Swing door per design' },
        2: { included: true, detail: 'Clear', notes: 'Clear glass' },
        3: { included: true, detail: 'Brushed gold', notes: 'Brushed gold/aged brass hardware' },
      },
      // PLUMBING FIXTURES
      9: {
        0: { included: true, detail: 'Standard 2-piece', notes: 'TOTO Nexus with Washlet bidet seat' },
        1: { included: true, detail: 'Bidet seat (Washlet)', notes: 'TOTO Washlet bidet seat' },
        2: { included: true, detail: 'Undermount', notes: '2 undermount sinks' },
        3: { included: true, detail: 'Widespread', notes: '2 Greyfield widespread faucets' },
        4: { included: true, detail: 'Brushed gold', notes: 'Aged brass / brushed gold finish throughout' },
        5: { included: true, notes: 'Signature Hardware shower system with thermostatic valve' },
        6: { included: true, detail: 'Freestanding', notes: 'Kohler freestanding soaking tub' },
        7: { included: true, detail: 'Freestanding floor mount', notes: 'Lentz freestanding tub filler in brushed gold' },
        8: { included: true, qty: '4', notes: '4 towel bars' },
        9: { included: true, notes: 'Toilet paper holder in aged brass' },
        10: { included: true, qty: '4', notes: '4 robe hooks' },
        11: { included: true, detail: 'Match faucet', notes: 'All accessories in aged brass to match' },
      },
      // ELECTRICAL FIXTURES
      10: {
        0: { included: true, qty: '6', notes: '6 Greenwich sconces' },
        1: { included: true, notes: 'Overhead light fixture' },
        2: { included: true, detail: 'Whisper-quiet humidity sensing', notes: '2 Panasonic WhisperGreen exhaust fans' },
        3: { included: true, detail: 'Hardwired', notes: 'Hardwired towel warmer' },
      },
      // FLOORING
      11: {
        0: { included: true, notes: 'Remove existing bathroom flooring' },
        1: { included: true, notes: 'Subfloor prep and repair as needed' },
        2: { included: true, detail: 'Electric mat', notes: 'Electric heated floor system' },
        3: { included: true, detail: 'Porcelain tile', notes: 'Calacatta porcelain tile' },
        4: { included: true, qty: '395', notes: '395 SF - includes bathroom floor area' },
        5: { included: true, detail: 'Tile base', notes: 'Tile base throughout' },
        6: { included: true, detail: 'Marble saddle', notes: 'Marble saddle at doorway' },
      },
      // PAINTING
      12: {
        0: { included: true, notes: 'Wall prep and paint' },
        1: { included: true, detail: 'Moisture-resistant', notes: 'Moisture-resistant ceiling paint' },
        2: { included: true, notes: 'Paint trim and door' },
      },
      // TRIM & FINISH
      13: {
        0: { included: true, detail: 'New standard', notes: 'New bathroom door' },
        1: { included: true, detail: 'Privacy lock', notes: 'Privacy lock hardware' },
        2: { included: true, detail: 'N/A (tile base)', notes: 'Tile base instead of wood baseboards' },
      },
      // FINAL
      14: {
        0: { included: true, notes: 'Final cleaning of all surfaces' },
        1: { included: true, notes: 'Fixture cleaning and polishing' },
        2: { included: true, notes: 'Punchlist items' },
        3: { included: true, notes: 'Final walkthrough with client' },
      },
    },

    // ==================== GIRL'S BATHROOM ====================
    'bathroom-2': {
      // DEMOLITION
      0: {
        0: { included: true, notes: 'Remove existing tub/shower, vanity, toilet' },
        1: { included: true, notes: 'Remove existing tile' },
        4: { included: true, notes: 'Protect adjacent areas' },
        5: { included: true, notes: 'Debris removal, dumpster shared' },
      },
      // FRAMING
      1: {
        0: { included: true, notes: 'Minor framing adjustments' },
        2: { included: true, notes: 'Backing for fixtures and tile' },
      },
      // PLUMBING
      2: {
        0: { included: true, detail: 'Curbed', notes: 'Standard curbed tub/shower combo' },
        4: { included: true, notes: 'Rough plumbing for new tub/shower' },
        5: { included: true, notes: 'Rough plumbing for 38" vanity' },
        6: { included: true, notes: 'Toilet rough-in' },
      },
      // ELECTRICAL
      3: {
        0: { included: true, notes: 'Lighting circuits' },
        2: { included: true, qty: '1', notes: 'Exhaust fan rough-in' },
        3: { included: true, notes: 'GFCI outlets per code' },
      },
      // WATERPROOFING
      4: {
        0: { included: true, detail: 'Sheet membrane (Kerdi)', notes: 'Waterproofing for tub surround' },
        6: { included: true, notes: 'Flood test and inspection' },
      },
      // TILE
      5: {
        0: { included: true, detail: 'Zellige', notes: 'Zellige Ivory mosaic for floor' },
        1: { included: true, notes: 'Zellige Ivory mosaic floor tile' },
        2: { included: true, detail: 'Same as floor', notes: 'Coordinated tile' },
        3: { included: true, detail: 'To ceiling', notes: 'Tub surround tile to ceiling' },
        5: { included: true, notes: 'Zellige Oat, Peony ceramic, Calacatta marble accent, Pearl shell mosaic' },
        7: { included: true, detail: 'Zellige', notes: 'Zellige wainscoting' },
        10: { included: true, notes: 'Grouting and sealing all tile' },
      },
      // CABINETRY
      6: {
        0: { included: true, detail: 'Semi-custom', notes: 'Custom 38" vanity' },
        1: { included: true, detail: '36"', notes: '38" vanity (closest standard: 36")' },
        2: { included: true, detail: 'Built-in', notes: 'Linen closet cabinet' },
        5: { included: true, notes: 'Chrome hardware' },
      },
      // COUNTERTOPS
      7: {
        0: { included: true, detail: 'Quartz', notes: 'Quartz vanity top' },
        1: { included: true, notes: 'Fabrication and installation' },
        2: { included: true, detail: 'Undermount', notes: 'Undermount sink cutout' },
      },
      // GLASS / SHOWER ENCLOSURE (N/A - shower curtain)
      // PLUMBING FIXTURES
      9: {
        0: { included: true, detail: 'Standard 2-piece', notes: 'Standard toilet' },
        2: { included: true, detail: 'Undermount', notes: 'Undermount sink' },
        3: { included: true, detail: 'Single hole', notes: 'Single hole faucet' },
        4: { included: true, detail: 'Chrome', notes: 'Chrome finish throughout' },
        6: { included: true, detail: 'Alcove', notes: 'Alcove tub/shower combo' },
        11: { included: true, detail: 'Chrome', notes: 'Chrome accessories throughout' },
      },
      // ELECTRICAL FIXTURES
      10: {
        0: { included: true, qty: '1', notes: 'Vanity sconce' },
        2: { included: true, detail: 'Standard', notes: 'Standard exhaust fan' },
      },
      // FLOORING
      11: {
        0: { included: true, notes: 'Remove existing flooring' },
        3: { included: true, detail: 'Ceramic tile', notes: 'Zellige Ivory mosaic' },
        4: { included: true, notes: 'Floor tile throughout bathroom' },
      },
      // PAINTING
      12: {
        0: { included: true, notes: 'Wall prep and paint' },
        1: { included: true, detail: 'Moisture-resistant' },
        2: { included: true },
      },
      // FINAL
      14: {
        0: { included: true, notes: 'Final cleaning' },
        2: { included: true, notes: 'Punchlist items' },
        3: { included: true, notes: 'Final walkthrough' },
      },
    },

    // ==================== POOL BATHROOM ====================
    'bathroom-3': {
      // DEMOLITION
      0: {
        0: { included: true, notes: 'Remove existing fixtures from powder room' },
        1: { included: true, notes: 'Remove existing finishes' },
        4: { included: true, notes: 'Wall opening for new exterior door' },
        5: { included: true, notes: 'Debris removal' },
      },
      // FRAMING
      1: {
        0: { included: true, notes: "Frame for new shower enclosure (3'8\" x 5'4\")" },
        1: { included: true, notes: 'Frame new exterior door opening, install header' },
        2: { included: true, notes: 'Backing for tile and fixtures' },
      },
      // PLUMBING
      2: {
        0: { included: true, detail: 'Curbed', notes: 'New shower in converted powder room' },
        2: { included: true, detail: 'Pressure balance', notes: 'Pressure balance valve - Greyfield matte black' },
        5: { included: true, notes: 'Rough plumbing for Wallace 36" vanity' },
        6: { included: true, notes: 'Toilet rough-in for Kohler Reach' },
      },
      // ELECTRICAL
      3: {
        0: { included: true, notes: 'Lighting circuits for new full bath' },
        2: { included: true, qty: '1', notes: 'Exhaust fan rough-in' },
        3: { included: true, notes: 'GFCI outlets per code' },
      },
      // WATERPROOFING
      4: {
        0: { included: true, detail: 'Sheet membrane (Kerdi)', notes: 'Full shower waterproofing' },
        1: { included: true, detail: 'Kerdi board', notes: 'Kerdi board on shower walls' },
        2: { included: true, detail: 'Standard curb' },
        6: { included: true, notes: 'Flood test and inspection' },
      },
      // TILE
      5: {
        0: { included: true, detail: 'Porcelain', notes: 'Autograph Espresso Brown porcelain' },
        1: { included: true, notes: 'Autograph Espresso Brown floor tile + mosaic accent' },
        2: { included: true, detail: 'Porcelain mosaic', notes: 'Mosaic accent on shower floor' },
        3: { included: true, detail: 'To ceiling', notes: 'Shower wall tile to ceiling with mosaic accent' },
        7: { included: true, detail: 'Custom pattern', qty: '112', notes: 'Custom wainscoting throughout, 112 LF estimated' },
        10: { included: true, notes: 'Grouting and sealing' },
      },
      // CABINETRY
      6: {
        0: { included: true, detail: 'Prefab', notes: 'Wallace 36" vanity' },
        1: { included: true, detail: '36"', notes: '36" vanity' },
        3: { included: true, detail: 'Surface mount', qty: '1', notes: '1 medicine cabinet' },
        5: { included: true, notes: 'Matte black hardware' },
      },
      // GLASS / SHOWER ENCLOSURE
      8: {
        0: { included: true, detail: 'Semi-frameless', notes: 'Glass shower door/enclosure' },
        3: { included: true, detail: 'Matte black', notes: 'Matte black hardware' },
      },
      // PLUMBING FIXTURES
      9: {
        0: { included: true, detail: 'Standard 2-piece', notes: 'Kohler Reach toilet' },
        2: { included: true, detail: 'Undermount', notes: 'Undermount sink in Wallace vanity' },
        3: { included: true, detail: 'Single hole', notes: 'Greyfield matte black faucet' },
        4: { included: true, detail: 'Matte black', notes: 'Matte black finish throughout pool bath' },
        5: { included: true, notes: 'Greyfield matte black shower system' },
        11: { included: true, detail: 'Matte black', notes: 'All accessories in matte black' },
      },
      // ELECTRICAL FIXTURES
      10: {
        0: { included: true, qty: '2', notes: '2 Brianna wallchieres sconces' },
        2: { included: true, detail: 'Whisper-quiet', notes: 'Whisper-quiet exhaust fan' },
      },
      // FLOORING
      11: {
        0: { included: true, notes: 'Remove existing flooring' },
        3: { included: true, detail: 'Porcelain tile', notes: 'Autograph Espresso Brown' },
        4: { included: true, notes: 'Floor tile throughout' },
      },
      // PAINTING
      12: {
        0: { included: true, notes: 'Wall prep and paint' },
        1: { included: true, detail: 'Moisture-resistant' },
        2: { included: true, notes: 'Paint trim and door' },
      },
      // TRIM & FINISH
      13: {
        0: { included: true, detail: 'New standard', notes: 'New exterior door to pool/patio area' },
      },
      // FINAL
      14: {
        0: { included: true, notes: 'Final cleaning' },
        2: { included: true, notes: 'Punchlist items' },
        3: { included: true, notes: 'Final walkthrough' },
      },
    },
  },

  additionalItems: {
    'kitchen': '',
    'bathroom-1': '',
    'bathroom-2': '',
    'bathroom-3': 'New exterior door installation to pool/patio area with weather sealing, threshold, and hardware',
  },

  conditionsData: {
    'pre-con': {
      0: true,  // Portable toilet
      1: true,  // Dumpster
      4: true,  // Floor protection
      5: true,  // Dust barriers
      6: true,  // Zip walls
      7: true,  // Material staging
      8: true,  // Lockbox
    },
    'permits': {
      0: true,  // Building permit
      1: true,  // Plumbing permit
      2: true,  // Electrical permit
      3: true,  // Mechanical permit
      4: true,  // Plan check fees
      6: true,  // Inspection scheduling
    },
    'pm': {
      0: true,  // Project coordination
      1: true,  // Sub scheduling
      2: true,  // Daily site visits
      3: true,  // Client communication
      5: true,  // Change order management
      6: true,  // Material procurement
    },
    'post-con': {
      0: true,  // Final interior cleaning
      2: true,  // Window cleaning
      3: true,  // Debris removal
      4: true,  // Appliance cleaning
      5: true,  // Punch list
      6: true,  // Client walkthrough
      7: true,  // Key turnover
      8: true,  // Warranty info
    },
    'contingency': {
      0: true,  // Contingency allowance
      1: true,  // Code compliance
      2: true,  // Minor field adjustments
    },
  },

  exclusionsData: {
    0: true,   // Structural engineering fees
    4: true,   // Landscaping or exterior work
    5: true,   // Appliances (owner-provided portions)
    10: true,  // Hazardous material abatement
    14: true,  // Unforeseen conditions beyond contingency
    15: true,  // Changes beyond specified scope
    18: true,  // Temporary housing
  },
};

// Function to load Waverly preset into the app
function loadWaverlyPreset() {
  const p = WAVERLY_PRESET;

  // Fill project info
  Object.entries(p.projectInfo).forEach(([key, val]) => {
    const el = document.getElementById(key);
    if (el) el.value = val;
  });

  // Handle input source
  if (typeof handleInputSourceChange === 'function') {
    handleInputSourceChange();
  }
  const planSheetsEl = document.getElementById('planSheets');
  if (planSheetsEl) planSheetsEl.value = p.projectInfo.planSheets || '';
  const designDocsEl = document.getElementById('designDocs');
  if (designDocsEl) designDocsEl.value = p.projectInfo.designDocs || '';

  // Select modules
  if (!selectedModules['kitchen']) toggleModule('kitchen');
  if (!selectedModules['bathroom']) toggleModule('bathroom');

  // Set bathroom count
  const countEl = document.getElementById('count-bathroom');
  if (countEl) countEl.value = p.bathCount;

  // Build module steps
  buildModuleSteps();

  // Set bathroom names
  Object.entries(p.bathNames).forEach(([key, info]) => {
    const nameEl = document.getElementById(`bathname-${key}`);
    if (nameEl) nameEl.value = info.name;
    const typeEl = document.getElementById(`bathtype-${key}`);
    if (typeEl) typeEl.value = info.type;
  });

  // Load scope data
  Object.entries(p.scopeData).forEach(([moduleKey, trades]) => {
    scopeData[moduleKey] = {};
    Object.entries(trades).forEach(([tIdx, items]) => {
      scopeData[moduleKey][tIdx] = {};
      Object.entries(items).forEach(([iIdx, data]) => {
        scopeData[moduleKey][tIdx][iIdx] = { ...data };

        // Update UI
        const id = `${moduleKey}-${tIdx}-${iIdx}`;
        const el = document.getElementById(`si-${id}`);
        if (el && data.included) {
          el.classList.add('included');
          const ti = document.getElementById(`ti-${id}`);
          if (ti) ti.innerHTML = '&#x2713;';
        }
        if (data.detail) {
          const det = document.getElementById(`det-${id}`);
          if (det) det.value = data.detail;
        }
        if (data.qty) {
          const qty = document.getElementById(`qty-${id}`);
          if (qty) qty.value = data.qty;
        }
        if (data.notes) {
          const notes = document.getElementById(`notes-${id}`);
          if (notes) notes.value = data.notes;
        }
      });
    });
  });

  // Load additional items
  Object.entries(p.additionalItems).forEach(([key, val]) => {
    additionalItems[key] = val;
    const el = document.getElementById(`additional-${key}`);
    if (el) el.value = val;
  });

  // Load conditions
  conditionsData = { ...p.conditionsData };

  // Load exclusions
  exclusionsData = { ...p.exclusionsData };

  // Update project badge
  document.getElementById('projectBadge').textContent = 'Waverly';

  // Save to localStorage
  if (typeof saveProjectToLocal === 'function') saveProjectToLocal();

  alert('Waverly project loaded! Navigate through the modules to review, then go to Review & Generate.');
}
