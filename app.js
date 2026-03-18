
// ============================================================
// AUTHENTICATION
// ============================================================

// SHA-256 hash of the team password "honeycomb2026"
// To change: update this hash with the SHA-256 of your new password
const PASSWORD_HASH = 'd04598f3f776b86fd4b2c6edb89d1ecfb12cdf345633e536f46c7125e2513b19';

async function sha256(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Check if already authenticated
(function checkAuth() {
  const stored = localStorage.getItem('hc_sow_auth');
  if (stored) {
    try {
      const { hash, expires } = JSON.parse(stored);
      if (hash === PASSWORD_HASH && Date.now() < expires) {
        document.getElementById('loginOverlay').style.display = 'none';
        return;
      }
    } catch(e) {}
    localStorage.removeItem('hc_sow_auth');
  }
})();

async function handleLogin(e) {
  e.preventDefault();
  const pw = document.getElementById('loginPassword').value;
  const hash = await sha256(pw);

  if (hash === PASSWORD_HASH) {
    // Store auth
    const remember = document.getElementById('loginRemember').checked;
    const expires = Date.now() + (remember ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000); // 30 days or 8 hours
    localStorage.setItem('hc_sow_auth', JSON.stringify({ hash: PASSWORD_HASH, expires }));

    // Fade out overlay
    const overlay = document.getElementById('loginOverlay');
    overlay.style.transition = 'opacity 0.3s ease';
    overlay.style.opacity = '0';
    setTimeout(() => overlay.style.display = 'none', 300);
  } else {
    document.getElementById('loginError').textContent = 'Incorrect password. Please try again.';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginPassword').focus();
  }
  return false;
}

// ============================================================
// DATA: All modules and their scope items
// ============================================================

const MODULES = [
  { id: 'kitchen', name: 'Kitchen', icon: '&#x1F373;', desc: 'Full kitchen remodel', countable: false },
  { id: 'bathroom', name: 'Bathroom', icon: '&#x1F6C1;', desc: 'Bath remodel(s)', countable: true, countLabel: 'How many?' },
  { id: 'bedroom', name: 'Bedroom', icon: '&#x1F6CF;', desc: 'Bedroom renovation(s)', countable: true, countLabel: 'How many?' },
  { id: 'living', name: 'Living Areas', icon: '&#x1F6CB;', desc: 'Living, dining, foyer', countable: false },
  { id: 'laundry', name: 'Laundry', icon: '&#x1F9FA;', desc: 'Laundry room', countable: false },
  { id: 'garage', name: 'Garage', icon: '&#x1F697;', desc: 'Garage renovation', countable: false },
  { id: 'addition', name: 'Addition', icon: '&#x1F3D7;', desc: 'New construction / addition', countable: false },
  { id: 'exterior', name: 'Exterior / Roofing', icon: '&#x1F3E0;', desc: 'Exterior, roof, siding', countable: false },
  { id: 'paint', name: 'Interior Paint', icon: '&#x1F3A8;', desc: 'Whole-house interior paint', countable: false },
  { id: 'extpaint', name: 'Exterior Paint', icon: '&#x1F58C;', desc: 'Exterior painting', countable: false },
];

const KITCHEN_TRADES = [
  { name: 'Demolition', sub: 'Demo', items: [
    { name: 'Remove existing cabinets', options: ['All','Upper only','Lower only','Island only'] },
    { name: 'Save/salvage items from demo', notes: true },
    { name: 'Remove existing countertops' },
    { name: 'Remove existing backsplash' },
    { name: 'Remove existing flooring', options: ['Hardwood','Tile','Vinyl/LVP','Linoleum'] },
    { name: 'Disconnect/remove appliances', options: ['Gas disconnect req\'d','Electric only','Both gas & electric'] },
    { name: 'Remove plumbing fixtures (sink, faucet, disposal)' },
    { name: 'Remove existing light fixtures' },
    { name: 'Remove/modify ceiling or soffit', options: ['Full ceiling removal','Soffit only','Partial','N/A'] },
    { name: 'Widen or modify wall openings per plans' },
    { name: 'Remove wall (partial or full)', options: ['Non-bearing','Load-bearing (engineer req\'d)','Partial'] },
    { name: 'Debris removal and disposal' },
  ]},
  { name: 'Framing / Structural', sub: 'Framing', items: [
    { name: 'Wall modifications per plans', options: ['Remove wall','Add wall','Partial removal','Header required'] },
    { name: 'Structural beam/header installation per engineer' },
    { name: 'Blocking for cabinets and heavy fixtures' },
    { name: 'Island framing/support' },
    { name: 'Pantry area framing' },
    { name: 'Floor leveling / subfloor repair' },
  ]},
  { name: 'Plumbing', sub: 'Plumbing', items: [
    { name: 'Sink rough-in', options: ['Same location','Relocate','Add second sink'] },
    { name: 'Dishwasher water supply and drain' },
    { name: 'Garbage disposal rough-in' },
    { name: 'Gas line for range', options: ['Existing location','New run required','Relocate','N/A (electric)'] },
    { name: 'Ice maker water line', options: ['New run','Existing','N/A'] },
    { name: 'Pot filler rough-in', options: ['Yes','N/A'] },
    { name: 'Water filtration system rough-in', options: ['Under-sink','N/A'] },
    { name: 'New shut-off valves at all fixtures' },
  ]},
  { name: 'Electrical', sub: 'Electrical', items: [
    { name: 'Dedicated circuit: Range/Cooktop', options: ['240V electric','Gas ignition only'] },
    { name: 'Dedicated circuit: Refrigerator' },
    { name: 'Dedicated circuit: Dishwasher' },
    { name: 'Dedicated circuit: Microwave' },
    { name: 'Dedicated circuit: Garbage disposal' },
    { name: 'General outlet circuits (countertop GFCI)' },
    { name: 'Under-cabinet lighting circuit' },
    { name: 'Pendant/decorative lighting circuit' },
    { name: 'Recessed lighting', hasQty: true },
    { name: 'Dimmer switches', hasQty: true },
    { name: 'Outlet relocations/additions', hasQty: true },
    { name: 'Range hood electrical' },
    { name: 'Island electrical (outlets in island)', options: ['Yes','N/A'] },
  ]},
  { name: 'HVAC', sub: 'HVAC', items: [
    { name: 'Ductwork modification/extension' },
    { name: 'Range hood ventilation to exterior', options: ['Roof vent','Wall vent','New duct run'] },
    { name: 'Mini-split installation', options: ['Yes','N/A'] },
  ]},
  { name: 'Drywall', sub: 'Drywall', items: [
    { name: 'New drywall installation', hasQty: true, unit: 'SF' },
    { name: 'Drywall patch and repair', hasQty: true, unit: 'SF' },
    { name: 'Texture finish', options: ['Smooth','Orange peel','Knockdown','Match existing'] },
    { name: 'Prime all new/repaired drywall' },
  ]},
  { name: 'Cabinetry & Millwork', sub: 'Cabinets', items: [
    { name: 'Cabinet scope', options: ['New custom','New semi-custom','Reface (new doors)','Refinish/repaint'] },
    { name: 'Base cabinets', hasQty: true },
    { name: 'Upper/wall cabinets', hasQty: true },
    { name: 'Tall/pantry cabinets', hasQty: true },
    { name: 'Island cabinets', options: ['Yes','N/A'] },
    { name: 'Open shelving', options: ['Yes','N/A'] },
    { name: 'Cabinet hardware', options: ['Knobs','Pulls','Combo'], hasQty: true },
    { name: 'Specialty inserts (pullouts, dividers, lazy susan)' },
    { name: 'Reeded glass panels', hasQty: true },
    { name: 'Soft-close hinges and drawer slides' },
  ]},
  { name: 'Countertops', sub: 'Countertops', items: [
    { name: 'Countertop material', options: ['Quartz','Granite','Marble','Butcher block','Concrete','Other'] },
    { name: 'Fabrication and installation', hasQty: true, unit: 'SF' },
    { name: 'Edge profile', options: ['Eased','Bullnose','Ogee','Mitered','Waterfall'] },
    { name: 'Waterfall edge', options: ['Island','Peninsula','Both sides','N/A'] },
    { name: 'Sink cutout' },
    { name: 'Cooktop cutout', options: ['Yes','N/A'] },
  ]},
  { name: 'Backsplash', sub: 'Tile', items: [
    { name: 'Backsplash type', options: ['Tile','Full-height slab','To ceiling','To underside of uppers','N/A'] },
    { name: 'Backsplash material', notes: true },
    { name: 'Pattern/layout', options: ['Straight stack','Brick/offset','Herringbone','Chevron','Custom'] },
    { name: 'Behind range detail', options: ['Same as rest','Accent/feature','Full slab'] },
  ]},
  { name: 'Flooring', sub: 'Flooring', items: [
    { name: 'Remove existing flooring' },
    { name: 'Subfloor prep/repair/leveling' },
    { name: 'Flooring type', options: ['Hardwood','Engineered hardwood','LVP/LVT','Porcelain tile','Natural stone'] },
    { name: 'Installation area', hasQty: true, unit: 'SF' },
    { name: 'Pattern/layout', options: ['Straight','Diagonal','Herringbone','Custom'] },
    { name: 'Transitions to adjacent rooms', options: ['Flush','Reducer','T-molding','Threshold'] },
    { name: 'Base trim / shoe molding', options: ['New','Match existing','Replace damaged'], hasQty: true, unit: 'LF' },
  ]},
  { name: 'Painting', sub: 'Paint', items: [
    { name: 'Wall prep (patch, sand, prime)' },
    { name: 'Paint walls', hasQty: true, unit: 'SF' },
    { name: 'Paint ceiling' },
    { name: 'Paint trim/baseboards' },
    { name: 'Number of colors', options: ['1','2','3','4+'] },
  ]},
  { name: 'Plumbing Fixtures (Finish)', sub: 'Plumbing', items: [
    { name: 'Sink type', options: ['Farmhouse/apron','Undermount','Drop-in','Double bowl'] },
    { name: 'Faucet type', options: ['Pull-down','Pull-out','Standard','Bridge','Wall mount'] },
    { name: 'Faucet finish', options: ['Chrome','Brushed nickel','Matte black','Brushed gold','Oil rubbed bronze'] },
    { name: 'Garbage disposal', options: ['Standard','Premium/quiet'] },
    { name: 'Air switch for disposal' },
    { name: 'Soap dispenser', options: ['Countertop mount','N/A'] },
  ]},
  { name: 'Electrical Fixtures (Finish)', sub: 'Electrical', items: [
    { name: 'Recessed lights (install)', hasQty: true },
    { name: 'Pendant lights (install)', hasQty: true },
    { name: 'Under-cabinet lights', options: ['LED strip','Puck lights','Light bar'] },
    { name: 'Switch plates / outlet covers', options: ['Standard','Decora','Specialty finish'] },
  ]},
  { name: 'Appliances', sub: 'Appliances', items: [
    { name: 'Refrigerator', options: ['Standard','Counter-depth','Panel-ready','Built-in'] },
    { name: 'Range / Cooktop', options: ['Gas range','Electric range','Induction','Gas cooktop'] },
    { name: 'Range size', options: ['30"','36"','48"'] },
    { name: 'Range hood', options: ['Wall mount','Island','Under-cabinet','Insert/liner','Downdraft'] },
    { name: 'Dishwasher', options: ['Standard','Panel-ready','Drawer'] },
    { name: 'Microwave', options: ['Built-in','Drawer','Over-the-range','N/A'] },
    { name: 'Garbage disposal (install)' },
    { name: 'All installation, connections, testing' },
  ]},
  { name: 'Doors & Windows', sub: 'Doors/Windows', items: [
    { name: 'Interior door(s)', options: ['Standard swing','Pocket','Barn door','Bifold','N/A'] },
    { name: 'Door hardware', options: ['New','Reuse existing','Match existing'] },
    { name: 'Window replacement', options: ['Yes - all','Yes - select','No'] },
  ]},
  { name: 'Final', sub: 'GC', items: [
    { name: 'Final cleanup' },
    { name: 'Appliance testing' },
    { name: 'Punch list' },
    { name: 'Building department inspection' },
    { name: 'Client walkthrough' },
  ]},
];

const BATHROOM_TRADES = [
  { name: 'Demolition', sub: 'Demo', items: [
    { name: 'Remove vanity/cabinet' },
    { name: 'Remove toilet' },
    { name: 'Remove shower', options: ['Shower only','Tub/shower combo','Walk-in'] },
    { name: 'Remove bathtub', options: ['Alcove','Freestanding','Drop-in','N/A'] },
    { name: 'Remove flooring', options: ['Tile','Vinyl','Other'] },
    { name: 'Remove wall tile', options: ['Full walls','Shower area only','N/A'] },
    { name: 'Remove mirrors/accessories/light fixtures' },
    { name: 'Remove existing door', options: ['Standard','Pocket','N/A'] },
    { name: 'Debris removal and disposal' },
  ]},
  { name: 'Framing / Structural', sub: 'Framing', items: [
    { name: 'Shower enclosure framing' },
    { name: 'Tub support/platform framing', options: ['Freestanding','Drop-in deck','N/A'] },
    { name: 'Blocking for grab bars' },
    { name: 'Blocking for wall-mounted fixtures', options: ['Wall-mount toilet','Wall-mount vanity','Both','N/A'] },
    { name: 'New door opening', options: ['Standard','Pocket door','Barn door','Widen for ADA','N/A'] },
    { name: 'Shower bench framing', options: ['Built-in floating','Corner','N/A'] },
    { name: 'Niche framing', hasQty: true },
    { name: 'Wall modifications per plans' },
  ]},
  { name: 'Plumbing', sub: 'Plumbing', items: [
    { name: 'Shower type', options: ['Curbless','Curbed','Step-down conversion','Tub/shower combo','N/A'] },
    { name: 'Shower drain type', options: ['Linear drain','Center drain','Trench drain','Standard'] },
    { name: 'Shower valve type', options: ['Pressure balance','Thermostatic','Digital'] },
    { name: 'Shower configuration', options: ['Single head','Rain + handheld','Multi-head/body jets','Steam'] },
    { name: 'Bathtub rough-in', options: ['Freestanding','Drop-in','Alcove','Walk-in (ADA)','N/A'] },
    { name: 'Tub filler type', options: ['Freestanding floor mount','Wall mount','Deck mount','N/A'] },
    { name: 'Vanity sink count', options: ['Single sink','Double sink'] },
    { name: 'Vanity mounting', options: ['Floor standing','Wall mounted (blocking req\'d)'] },
    { name: 'Toilet rough-in', options: ['Standard floor mount','Wall mounted (carrier req\'d)'] },
    { name: 'Bidet rough-in', options: ['Bidet seat (electrical req\'d)','Standalone','N/A'] },
    { name: 'Relocate plumbing lines', notes: true },
    { name: 'New shut-off valves at all fixtures' },
  ]},
  { name: 'Electrical', sub: 'Electrical', items: [
    { name: 'Vanity lighting circuit' },
    { name: 'Overhead lighting circuit' },
    { name: 'Exhaust fan circuit' },
    { name: 'GFCI outlets' },
    { name: 'Heated floor circuit', options: ['Electric mat','N/A'] },
    { name: 'Towel warmer circuit', options: ['Hardwired','Plug-in','N/A'] },
    { name: 'Bidet seat outlet', options: ['Yes','N/A'] },
    { name: 'Dimmer switches', hasQty: true },
  ]},
  { name: 'Waterproofing', sub: 'Tile', items: [
    { name: 'Shower pan method', options: ['Hot mop','Sheet membrane (Kerdi)','Liquid (RedGard)','Pre-formed pan','Mud bed'] },
    { name: 'Shower wall waterproofing', options: ['Kerdi board','RedGard over CBU','Wedi board'] },
    { name: 'Curb type', options: ['Standard curb','Low-profile','N/A (curbless)'] },
    { name: 'Curbless transition detail', options: ['Linear drain at entry','Sloped floor','N/A (curbed)'] },
    { name: 'Shower bench waterproofing', options: ['Yes','N/A'] },
    { name: 'Niche waterproofing' },
    { name: 'Flood test / inspection' },
  ]},
  { name: 'Tile', sub: 'Tile', items: [
    { name: 'Floor tile', hasQty: true, unit: 'SF', notes: true },
    { name: 'Shower floor tile', options: ['Same as floor','Mosaic','Pebble','Different material'] },
    { name: 'Shower wall tile height', options: ['To 48"','To 60"','To ceiling','Full surround'] },
    { name: 'Shower niche(s)', hasQty: true },
    { name: 'Accent tile / feature wall', notes: true },
    { name: 'Tub surround tile', options: ['To 48"','To ceiling','N/A'] },
    { name: 'Wainscoting', options: ['Subway','Zellige','Large format','Custom','N/A'], hasQty: true, unit: 'LF' },
    { name: 'Tile layout/pattern', options: ['Straight','Brick/offset','Herringbone','Chevron','Custom'] },
    { name: 'Schluter/edge trim profiles' },
    { name: 'Grouting and sealing' },
  ]},
  { name: 'Cabinetry', sub: 'Cabinets', items: [
    { name: 'Vanity type', options: ['Prefab','Semi-custom','Custom built','Floating','Furniture piece'] },
    { name: 'Vanity size', options: ['24"','30"','36"','48"','60"','72"','92"+','Custom'] },
    { name: 'Linen cabinet/tower', options: ['Built-in','Freestanding','Recessed','N/A'] },
    { name: 'Medicine cabinet', options: ['Surface mount','Recessed','Lighted','N/A'], hasQty: true },
    { name: 'Storage cabinet', options: ['Yes - custom','Yes - prefab','N/A'] },
    { name: 'Cabinet hardware' },
  ]},
  { name: 'Countertops', sub: 'Countertops', items: [
    { name: 'Countertop material', options: ['Quartz','Marble','Granite','Solid surface','Concrete'] },
    { name: 'Fabrication and installation', hasQty: true, unit: 'SF' },
    { name: 'Sink cutout type', options: ['Undermount','Vessel','Integrated','Drop-in'] },
    { name: 'Edge profile', options: ['Eased','Bullnose','Ogee','Beveled'] },
  ]},
  { name: 'Glass / Shower Enclosure', sub: 'Glass', items: [
    { name: 'Enclosure type', options: ['Frameless','Semi-frameless','Framed','Panel only','N/A'] },
    { name: 'Door type', options: ['Swing door','Sliding','Bypass','Fixed panel'] },
    { name: 'Glass type', options: ['Clear','Low-iron','Frosted','Rain texture'] },
    { name: 'Hardware finish', options: ['Chrome','Brushed nickel','Matte black','Brushed gold','Oil rubbed bronze'] },
  ]},
  { name: 'Plumbing Fixtures (Finish)', sub: 'Plumbing', items: [
    { name: 'Toilet', options: ['Standard 2-piece','1-piece','Wall-hung','Smart toilet','Comfort height'] },
    { name: 'Bidet / bidet seat', options: ['Bidet seat (Washlet)','Standalone','N/A'] },
    { name: 'Sink type', options: ['Undermount','Vessel','Drop-in','Pedestal','Wall-mount'] },
    { name: 'Faucet type', options: ['Single hole','Widespread','Wall mount','Vessel faucet'] },
    { name: 'Faucet finish', options: ['Chrome','Brushed nickel','Matte black','Brushed gold','Aged brass'] },
    { name: 'Shower system', notes: true },
    { name: 'Bathtub', options: ['Freestanding','Drop-in','Alcove','Walk-in (ADA)','N/A'] },
    { name: 'Tub filler', options: ['Freestanding floor mount','Wall mount','Deck mount','N/A'] },
    { name: 'Towel bars/rings', hasQty: true },
    { name: 'Toilet paper holder' },
    { name: 'Robe hooks', hasQty: true },
    { name: 'Accessory finish', options: ['Chrome','Brushed nickel','Matte black','Brushed gold','Match faucet'] },
  ]},
  { name: 'Electrical Fixtures (Finish)', sub: 'Electrical', items: [
    { name: 'Vanity sconces/lights', hasQty: true },
    { name: 'Overhead light fixture' },
    { name: 'Exhaust fan', options: ['Standard','With light','Humidity sensing','Heater combo'] },
    { name: 'Towel warmer', options: ['Hardwired','Plug-in','N/A'] },
  ]},
  { name: 'Flooring', sub: 'Flooring', items: [
    { name: 'Remove existing flooring' },
    { name: 'Subfloor prep/repair' },
    { name: 'Heated floor system', options: ['Electric mat','N/A'] },
    { name: 'Flooring type', options: ['Porcelain tile','Ceramic tile','Natural stone','Marble','LVP'] },
    { name: 'Installation area', hasQty: true, unit: 'SF' },
    { name: 'Base trim', options: ['Tile base','Wood baseboard','N/A'], hasQty: true, unit: 'LF' },
    { name: 'Threshold/transition', options: ['Marble saddle','Schluter','Wood','Flush'] },
  ]},
  { name: 'Painting', sub: 'Paint', items: [
    { name: 'Wall prep and paint' },
    { name: 'Paint ceiling', options: ['Standard','Moisture-resistant'] },
    { name: 'Paint trim/door' },
  ]},
  { name: 'Trim & Finish', sub: 'Finish Carpentry', items: [
    { name: 'Door', options: ['New standard','New pocket','New barn door','Keep existing','Widen for ADA'] },
    { name: 'Door hardware', options: ['Privacy lock','ADA lever','Match existing'] },
    { name: 'Baseboards', options: ['New (5")','Match existing','N/A (tile base)'] },
    { name: 'Closet doors', options: ['New','Keep existing','N/A'] },
  ]},
  { name: 'Final', sub: 'GC', items: [
    { name: 'Final cleanup' },
    { name: 'Fixture testing (water, drain, electrical)' },
    { name: 'Caulking and sealant' },
    { name: 'Punch list' },
    { name: 'Client walkthrough' },
  ]},
];

const GENERAL_CONDITIONS = [
  { name: 'Pre-Construction', items: [
    'Portable toilet installation and weekly servicing',
    'Dumpster rental and waste removal',
    'Floor protection (Ram Board)',
    'Dust barriers / plastic sheeting',
    'Temporary zip walls and doors',
    'Material staging area setup',
    'Lockbox / site access coordination',
    'Neighbor notification',
  ]},
  { name: 'Permits & Inspections', items: [
    'Building permit',
    'Plumbing permit',
    'Electrical permit',
    'Mechanical permit',
    'Plan check fees',
    'Inspection scheduling (all phases)',
  ]},
  { name: 'Project Management', items: [
    'Project coordination and supervision',
    'Subcontractor scheduling and oversight',
    'Daily site visits and quality control',
    'Client communication and updates',
    'Change order management',
  ]},
  { name: 'Post-Construction', items: [
    'Final interior cleaning',
    'Window cleaning',
    'Debris removal',
    'Appliance cleaning',
    'Final punch list coordination',
    'Client walkthrough',
    'Warranty information handover',
  ]},
];

const STANDARD_EXCLUSIONS = [
  'Structural engineering fees',
  'Architectural / design fees',
  'Furniture, window treatments, or decor',
  'Landscaping or exterior work (unless in scope)',
  'Unforeseen conditions beyond contingency',
  'Changes or upgrades beyond specified scope',
  'Utility company fees or service upgrades',
  'HOA fees or approval process',
  'Temporary housing for owner',
  'Storage / moving of owner\'s belongings',
  'Pest control treatment (unless in scope)',
];

// ============================================================
// STATE
// ============================================================
let selectedModules = {};
let moduleInstances = []; // { id, name, label, trades }
let scopeData = {}; // moduleKey -> { tradeIdx -> { itemIdx -> { included, detail, notes, qty } } }
let conditionsData = {};
let exclusionsData = {};
let currentStep = 0;

// ============================================================
// MODULE SELECTOR
// ============================================================
function renderModuleGrid() {
  const grid = document.getElementById('moduleGrid');
  grid.innerHTML = MODULES.map(m => `
    <div class="module-card" id="mod-${m.id}" onclick="toggleModule('${m.id}')">
      <div class="icon">${m.icon}</div>
      <div>
        <h3>${m.name}</h3>
        <p>${m.desc}</p>
      </div>
      ${m.countable ? `<input type="number" class="count-input" id="count-${m.id}" min="1" max="10" value="1" onclick="event.stopPropagation()" onchange="event.stopPropagation()">` : ''}
    </div>
  `).join('');
}

function toggleModule(id) {
  const card = document.getElementById(`mod-${id}`);
  if (selectedModules[id]) {
    delete selectedModules[id];
    card.classList.remove('selected');
  } else {
    selectedModules[id] = true;
    card.classList.add('selected');
  }
}

// ============================================================
// BUILD MODULE STEPS
// ============================================================
function buildModuleSteps() {
  moduleInstances = [];
  const container = document.getElementById('dynamicSteps');
  container.innerHTML = '';

  // Update project badge
  const name = document.getElementById('projectName').value || 'New Project';
  document.getElementById('projectBadge').textContent = name;

  Object.keys(selectedModules).forEach(modId => {
    const modDef = MODULES.find(m => m.id === modId);
    if (!modDef) return;

    if (modDef.countable) {
      const count = parseInt(document.getElementById(`count-${modId}`)?.value || 1);
      for (let i = 1; i <= count; i++) {
        const key = `${modId}-${i}`;
        const label = `${modDef.name} ${i}`;
        moduleInstances.push({ id: modId, key, label, trades: getTradesForModule(modId) });
      }
    } else {
      const key = modId;
      moduleInstances.push({ id: modId, key, label: modDef.name, trades: getTradesForModule(modId) });
    }
  });

  // Build each module step
  moduleInstances.forEach((inst, idx) => {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'step';
    stepDiv.id = `step-mod-${idx}`;

    // Bathroom name input
    let nameInput = '';
    if (inst.id === 'bathroom') {
      nameInput = `
        <div class="card" style="margin-bottom: 12px;">
          <div class="form-row">
            <div class="form-group">
              <label>Bathroom Name / Location</label>
              <input type="text" id="bathname-${inst.key}" placeholder="e.g., Primary Bath, Pool Bath, Girl's Bath">
            </div>
            <div class="form-group">
              <label>Type</label>
              <select id="bathtype-${inst.key}">
                <option>Master Bath</option><option>Guest Bath</option><option>Powder Room</option>
                <option>Jack & Jill</option><option>Hall Bath</option><option>Pool Bath</option>
                <option>ADA/Accessible</option><option>Other</option>
              </select>
            </div>
          </div>
        </div>
      `;
    }

    stepDiv.innerHTML = `
      ${nameInput}
      <div class="card">
        <h2>${inst.label}</h2>
        <div class="subtitle">Check items to include, then fill in details</div>
        ${renderTrades(inst.trades, inst.key)}
      </div>
      <div class="btn-nav">
        <button class="btn btn-outline" onclick="goToModuleStep(${idx - 1})">&#x2190; Back</button>
        <button class="btn btn-primary" onclick="goToModuleStep(${idx + 1})">Next &#x2192;</button>
      </div>
    `;
    container.appendChild(stepDiv);
  });

  // Build general conditions
  buildConditions();
  buildExclusions();

  // Rebuild nav
  rebuildNav();

  // Go to first module
  if (moduleInstances.length > 0) {
    goToModuleStep(0);
  }
}

function getTradesForModule(modId) {
  switch (modId) {
    case 'kitchen': return KITCHEN_TRADES;
    case 'bathroom': return BATHROOM_TRADES;
    case 'paint': return [{ name: 'Interior Painting', sub: 'Paint', items: [
      { name: 'Wall prep throughout (patch, sand, prime)', hasQty: true, unit: 'SF' },
      { name: 'Paint all walls' },
      { name: 'Paint all ceilings' },
      { name: 'Paint all trim/baseboards/casing' },
      { name: 'Paint all interior doors' },
      { name: 'Number of colors', options: ['1-2','3-4','5+'] },
      { name: 'Touch-up/repair drywall before paint' },
    ]}];
    case 'extpaint': return [{ name: 'Exterior Painting', sub: 'Paint', items: [
      { name: 'Pressure wash exterior', hasQty: true, unit: 'SF' },
      { name: 'Scrape and prep' },
      { name: 'Prime and paint walls' },
      { name: 'Paint trim/fascia/soffits' },
      { name: 'Paint exterior doors' },
      { name: 'Paint shutters/accents' },
      { name: 'Paint garage door', options: ['Yes','N/A'] },
    ]}];
    default:
      return [{ name: `${MODULES.find(m=>m.id===modId)?.name || modId} Scope`, sub: 'GC', items: [
        { name: 'Scope items to be detailed', notes: true },
      ]}];
  }
}

function renderTrades(trades, moduleKey) {
  return trades.map((trade, tIdx) => `
    <div class="trade-section">
      <div class="trade-header" onclick="toggleTrade(this)">
        ${trade.name}
        <button class="select-all-btn" onclick="event.stopPropagation(); toggleAllTradeItems('${moduleKey}', ${tIdx}, ${trade.items.length})">Select All</button>
        <span class="toggle">&#x25BC;</span>
      </div>
      <div class="trade-body">
        ${trade.items.map((item, iIdx) => renderScopeItem(item, moduleKey, tIdx, iIdx, trade.sub)).join('')}
      </div>
    </div>
  `).join('');
}

function renderScopeItem(item, moduleKey, tIdx, iIdx, sub) {
  const id = `${moduleKey}-${tIdx}-${iIdx}`;
  return `
    <div class="scope-item" id="si-${id}" onclick="toggleItem('${id}', '${moduleKey}', ${tIdx}, ${iIdx})">
      <div class="toggle-include" id="ti-${id}"></div>
      <div class="item-content">
        <div class="item-name">${item.name}</div>
        <div class="item-details" onclick="event.stopPropagation()">
          ${item.options ? `
            <div>
              <div class="detail-label">Specification</div>
              <select id="det-${id}" onchange="updateItemData('${moduleKey}',${tIdx},${iIdx},'detail',this.value)">
                <option value="">Select...</option>
                ${item.options.map(o => `<option value="${o}">${o}</option>`).join('')}
              </select>
            </div>
          ` : ''}
          ${item.hasQty ? `
            <div>
              <div class="detail-label">Quantity${item.unit ? ` (${item.unit})` : ''}</div>
              <input type="text" id="qty-${id}" placeholder="Qty" onchange="updateItemData('${moduleKey}',${tIdx},${iIdx},'qty',this.value)">
            </div>
          ` : ''}
          <textarea id="notes-${id}" placeholder="Notes / field observations..." onchange="updateItemData('${moduleKey}',${tIdx},${iIdx},'notes',this.value)"></textarea>
        </div>
      </div>
    </div>
  `;
}

function toggleItem(id, moduleKey, tIdx, iIdx) {
  const el = document.getElementById(`si-${id}`);
  const isIncluded = el.classList.toggle('included');
  const ti = document.getElementById(`ti-${id}`);
  ti.innerHTML = isIncluded ? '&#x2713;' : '';

  if (!scopeData[moduleKey]) scopeData[moduleKey] = {};
  if (!scopeData[moduleKey][tIdx]) scopeData[moduleKey][tIdx] = {};
  if (!scopeData[moduleKey][tIdx][iIdx]) scopeData[moduleKey][tIdx][iIdx] = {};
  scopeData[moduleKey][tIdx][iIdx].included = isIncluded;
}

function updateItemData(moduleKey, tIdx, iIdx, field, value) {
  if (!scopeData[moduleKey]) scopeData[moduleKey] = {};
  if (!scopeData[moduleKey][tIdx]) scopeData[moduleKey][tIdx] = {};
  if (!scopeData[moduleKey][tIdx][iIdx]) scopeData[moduleKey][tIdx][iIdx] = {};
  scopeData[moduleKey][tIdx][iIdx][field] = value;
}

function toggleTrade(header) {
  header.classList.toggle('collapsed');
  header.nextElementSibling.classList.toggle('collapsed');
}

function toggleAllTradeItems(moduleKey, tIdx, totalItems) {
  if (!scopeData[moduleKey]) scopeData[moduleKey] = {};
  if (!scopeData[moduleKey][tIdx]) scopeData[moduleKey][tIdx] = {};

  // Check if all items are already included
  let allIncluded = true;
  for (let i = 0; i < totalItems; i++) {
    if (!scopeData[moduleKey][tIdx][i] || !scopeData[moduleKey][tIdx][i].included) {
      allIncluded = false;
      break;
    }
  }

  const newState = !allIncluded;
  for (let i = 0; i < totalItems; i++) {
    const id = `${moduleKey}-${tIdx}-${i}`;
    const el = document.getElementById(`si-${id}`);
    const ti = document.getElementById(`ti-${id}`);
    if (!el) continue;
    if (newState) {
      el.classList.add('included');
      ti.innerHTML = '&#x2713;';
    } else {
      el.classList.remove('included');
      ti.innerHTML = '';
    }
    if (!scopeData[moduleKey][tIdx][i]) scopeData[moduleKey][tIdx][i] = {};
    scopeData[moduleKey][tIdx][i].included = newState;
  }
}

function toggleAllConditions(sIdx, totalItems) {
  if (!conditionsData[sIdx]) conditionsData[sIdx] = {};

  let allIncluded = true;
  for (let i = 0; i < totalItems; i++) {
    if (!conditionsData[sIdx][i]) { allIncluded = false; break; }
  }

  const newState = !allIncluded;
  for (let i = 0; i < totalItems; i++) {
    const el = document.getElementById(`gc-${sIdx}-${i}`);
    const ti = document.getElementById(`gci-${sIdx}-${i}`);
    if (!el) continue;
    if (newState) {
      el.classList.add('included');
      ti.innerHTML = '&#x2713;';
    } else {
      el.classList.remove('included');
      ti.innerHTML = '';
    }
    conditionsData[sIdx][i] = newState;
  }
}

function toggleAllExclusions(total) {
  let allIncluded = true;
  for (let i = 0; i < total; i++) {
    if (!exclusionsData[i]) { allIncluded = false; break; }
  }

  const newState = !allIncluded;
  for (let i = 0; i < total; i++) {
    const el = document.getElementById(`ex-${i}`);
    const ti = document.getElementById(`exi-${i}`);
    if (!el) continue;
    if (newState) {
      el.classList.add('included');
      ti.innerHTML = '&#x2713;';
    } else {
      el.classList.remove('included');
      ti.innerHTML = '';
    }
    exclusionsData[i] = newState;
  }
}

// ============================================================
// GENERAL CONDITIONS & EXCLUSIONS
// ============================================================
function buildConditions() {
  const el = document.getElementById('conditionsContent');
  el.innerHTML = GENERAL_CONDITIONS.map((sec, sIdx) => `
    <div class="trade-section">
      <div class="trade-header" onclick="toggleTrade(this)">
        ${sec.name}
        <button class="select-all-btn" onclick="event.stopPropagation(); toggleAllConditions(${sIdx}, ${sec.items.length})">Select All</button>
        <span class="toggle">&#x25BC;</span>
      </div>
      <div class="trade-body">
        ${sec.items.map((item, iIdx) => `
          <div class="scope-item" id="gc-${sIdx}-${iIdx}" onclick="toggleGC(${sIdx},${iIdx})">
            <div class="toggle-include" id="gci-${sIdx}-${iIdx}"></div>
            <div class="item-content"><div class="item-name">${item}</div></div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function toggleGC(sIdx, iIdx) {
  const el = document.getElementById(`gc-${sIdx}-${iIdx}`);
  const isOn = el.classList.toggle('included');
  document.getElementById(`gci-${sIdx}-${iIdx}`).innerHTML = isOn ? '&#x2713;' : '';
  if (!conditionsData[sIdx]) conditionsData[sIdx] = {};
  conditionsData[sIdx][iIdx] = isOn;
}

function buildExclusions() {
  const el = document.getElementById('exclusionsContent');
  el.innerHTML = `
    <div style="text-align: right; margin-bottom: 8px;">
      <button class="select-all-btn" style="background: var(--blue); border: 1px solid var(--blue); color: white; font-size: 12px; padding: 4px 12px; border-radius: 4px; cursor: pointer;" onclick="toggleAllExclusions(${STANDARD_EXCLUSIONS.length})">Select All</button>
    </div>
  ` + STANDARD_EXCLUSIONS.map((exc, i) => `
    <div class="scope-item" id="ex-${i}" onclick="toggleExclusion(${i})">
      <div class="toggle-include" id="exi-${i}"></div>
      <div class="item-content"><div class="item-name">${exc}</div></div>
    </div>
  `).join('') + `
    <div style="margin-top: 12px;">
      <div class="detail-label">Additional Exclusions</div>
      <textarea id="customExclusions" rows="3" placeholder="Add any project-specific exclusions..." style="width:100%; padding:8px; border:1px solid #CBD5E0; border-radius:6px; font-family:inherit;"></textarea>
    </div>
  `;
}

function toggleExclusion(i) {
  const el = document.getElementById(`ex-${i}`);
  const isOn = el.classList.toggle('included');
  document.getElementById(`exi-${i}`).innerHTML = isOn ? '&#x2713;' : '';
  exclusionsData[i] = isOn;
}

// ============================================================
// NAVIGATION
// ============================================================
function rebuildNav() {
  const nav = document.getElementById('stepNav');
  let btns = `
    <button onclick="goToStep(0)">Project Setup</button>
    <button onclick="goToStep(1)">Modules</button>
  `;
  moduleInstances.forEach((inst, i) => {
    btns += `<button onclick="goToModuleStep(${i})">${inst.label}</button>`;
  });
  btns += `
    <button onclick="goToStep('conditions')">General Conditions</button>
    <button onclick="goToStep('review')">Review & Generate</button>
  `;
  nav.innerHTML = btns;
}

function goToStep(step) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.step-nav button').forEach(b => b.classList.remove('active'));

  if (step === 'conditions') {
    document.getElementById('step-conditions').classList.add('active');
  } else if (step === 'review') {
    document.getElementById('step-review').classList.add('active');
    buildReviewSummary();
  } else {
    document.getElementById(`step-${step}`).classList.add('active');
  }

  window.scrollTo(0, 0);
  updateProgress();
}

function goToModuleStep(idx) {
  if (idx < 0) { goToStep(1); return; }
  if (idx >= moduleInstances.length) { goToStep('conditions'); return; }

  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  document.getElementById(`step-mod-${idx}`).classList.add('active');
  window.scrollTo(0, 0);
  updateProgress();
}

function goToPrevModule() {
  if (moduleInstances.length > 0) {
    goToModuleStep(moduleInstances.length - 1);
  } else {
    goToStep(1);
  }
}

function updateProgress() {
  const total = 2 + moduleInstances.length + 2; // setup, modules, each module, conditions, review
  const activeStep = document.querySelector('.step.active');
  let current = 1;
  if (activeStep) {
    const id = activeStep.id;
    if (id === 'step-0') current = 1;
    else if (id === 'step-1') current = 2;
    else if (id.startsWith('step-mod-')) current = 3 + parseInt(id.split('-')[2]);
    else if (id === 'step-conditions') current = total - 1;
    else if (id === 'step-review') current = total;
  }
  document.getElementById('progressFill').style.width = `${(current / total) * 100}%`;
}

// ============================================================
// REVIEW & SOW GENERATION
// ============================================================
function buildReviewSummary() {
  const el = document.getElementById('reviewSummary');
  const projectName = document.getElementById('projectName').value || 'Untitled';
  const address = document.getElementById('propertyAddress').value || '';
  const client = document.getElementById('clientName').value || '';

  let html = `<div style="margin-bottom: 16px;">
    <strong>${projectName}</strong> | ${address}<br>
    <span style="color: var(--muted);">Client: ${client}</span>
  </div>`;

  html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">';
  moduleInstances.forEach(inst => {
    let itemCount = 0;
    const data = scopeData[inst.key] || {};
    Object.values(data).forEach(trade => {
      Object.values(trade).forEach(item => {
        if (item.included) itemCount++;
      });
    });
    html += `<div style="padding: 12px; background: ${itemCount > 0 ? '#F0FFF4' : '#FFF5F5'}; border-radius: 8px;">
      <strong>${inst.label}</strong><br>
      <span style="color: var(--muted); font-size: 13px;">${itemCount} scope items selected</span>
    </div>`;
  });
  html += '</div>';

  el.innerHTML = html;
}

// ============================================================
// NARRATIVE SOW GENERATION
// ============================================================

const narrativeMap = {
  // Kitchen Demo
  'Remove existing cabinets': (detail) => `Remove ${detail === 'All' ? 'all existing' : detail ? detail.toLowerCase() : 'existing'} kitchen cabinets`,
  'Remove existing countertops': () => 'Remove all existing countertops and disconnect from cabinetry',
  'Remove existing backsplash': () => 'Remove existing backsplash material down to substrate',
  'Remove existing flooring': (detail) => `Remove existing ${detail ? detail.toLowerCase() : ''} flooring to subfloor`,
  'Disconnect/remove appliances': (detail) => `Disconnect and remove all existing appliances${detail ? ' (' + detail.toLowerCase() + ')' : ''}`,
  'Remove plumbing fixtures (sink, faucet, disposal)': () => 'Disconnect and remove existing sink, faucet, and garbage disposal',
  'Remove existing light fixtures': () => 'Remove all existing light fixtures and prepare for new installation',
  'Remove/modify ceiling or soffit': (detail) => detail === 'N/A' ? null : `${detail === 'Full ceiling removal' ? 'Remove existing ceiling' : detail === 'Soffit only' ? 'Remove existing soffit' : 'Modify ceiling/soffit'} per architectural plans`,
  'Widen or modify wall openings per plans': () => 'Widen or modify wall openings per architectural plans',
  'Remove wall (partial or full)': (detail) => `Remove ${detail === 'Partial' ? 'partial wall section' : detail === 'Load-bearing (engineer req\'d)' ? 'load-bearing wall per structural engineer\'s specifications' : 'non-bearing wall'} per plans`,
  'Debris removal and disposal': () => 'Complete debris removal and disposal from site',
  'Save/salvage items from demo': (detail, notes) => notes ? `Salvage and protect the following items: ${notes}` : 'Salvage designated items per owner direction',

  // Kitchen Framing
  'Wall modifications per plans': (detail) => `${detail === 'Remove wall' ? 'Remove wall' : detail === 'Add wall' ? 'Frame new wall' : detail === 'Partial removal' ? 'Partial wall removal' : detail === 'Header required' ? 'Install header and modify wall' : 'Complete wall modifications'} per architectural plans`,
  'Structural beam/header installation per engineer': () => 'Install structural beam and/or header per structural engineer\'s specifications',
  'Blocking for cabinets and heavy fixtures': () => 'Install blocking in walls for cabinet mounting and heavy fixture support',
  'Island framing/support': () => 'Frame island support structure per plans',
  'Pantry area framing': () => 'Frame pantry area per architectural plans',
  'Floor leveling / subfloor repair': () => 'Level subfloor and complete necessary repairs for new finish installation',

  // Kitchen Plumbing
  'Sink rough-in': (detail) => `${detail === 'Relocate' ? 'Relocate' : detail === 'Add second sink' ? 'Install new' : 'Install'} sink rough-in${detail === 'Same location' ? ' at existing location' : ' per architectural plans'}`,
  'Dishwasher water supply and drain': () => 'Install dishwasher water supply and drain lines',
  'Garbage disposal rough-in': () => 'Install rough-in for garbage disposal with dedicated circuit',
  'Gas line for range': (detail) => detail === 'N/A (electric)' ? null : `${detail === 'New run required' ? 'Run new gas line' : detail === 'Relocate' ? 'Relocate gas line' : 'Connect gas line'} for range per code`,
  'Ice maker water line': (detail) => detail === 'N/A' ? null : `${detail === 'New run' ? 'Run new' : 'Connect existing'} ice maker water line to refrigerator location`,
  'Pot filler rough-in': (detail) => detail === 'N/A' ? null : 'Install pot filler rough-in at range location per plans',
  'Water filtration system rough-in': (detail) => detail === 'N/A' ? null : 'Install under-sink water filtration system rough-in',
  'New shut-off valves at all fixtures': () => 'Install new shut-off valves at all plumbing fixtures',

  // Kitchen Electrical
  'Dedicated circuit: Range/Cooktop': (detail) => `Install dedicated ${detail === '240V electric' ? '240V' : '120V'} circuit for range/cooktop`,
  'Dedicated circuit: Refrigerator': () => 'Install dedicated circuit for refrigerator',
  'Dedicated circuit: Dishwasher': () => 'Install dedicated circuit for dishwasher',
  'Dedicated circuit: Microwave': () => 'Install dedicated circuit for microwave',
  'Dedicated circuit: Garbage disposal': () => 'Install dedicated circuit for garbage disposal',
  'General outlet circuits (countertop GFCI)': () => 'Install GFCI-protected countertop outlet circuits per code',
  'Under-cabinet lighting circuit': () => 'Install dedicated circuit for under-cabinet lighting',
  'Pendant/decorative lighting circuit': () => 'Install circuit for pendant and decorative lighting',
  'Recessed lighting': (detail, notes, qty) => `Install ${qty ? qty + ' ' : ''}recessed lights per lighting plan`,
  'Dimmer switches': (detail, notes, qty) => `Install ${qty ? qty + ' ' : ''}dimmer switches per plan`,
  'Outlet relocations/additions': (detail, notes, qty) => `Relocate/add ${qty ? qty + ' ' : ''}outlets per plan`,
  'Range hood electrical': () => 'Install electrical connection for range hood',
  'Island electrical (outlets in island)': (detail) => detail === 'N/A' ? null : 'Install electrical outlets in island per code',

  // Kitchen HVAC
  'Ductwork modification/extension': () => 'Modify and/or extend ductwork to serve renovated kitchen area',
  'Range hood ventilation to exterior': (detail) => `Install range hood ventilation to exterior via ${detail ? detail.toLowerCase() : 'new duct run'}`,
  'Mini-split installation': (detail) => detail === 'N/A' ? null : 'Install mini-split HVAC system per plans',

  // Kitchen Drywall
  'New drywall installation': (detail, notes, qty) => `Install ${qty ? qty + ' SF of ' : ''}new drywall`,
  'Drywall patch and repair': (detail, notes, qty) => `Patch and repair ${qty ? qty + ' SF of ' : ''}existing drywall`,
  'Texture finish': (detail) => `Apply ${detail ? detail.toLowerCase() : 'smooth'} texture finish to all new and repaired drywall`,
  'Prime all new/repaired drywall': () => 'Prime all new and repaired drywall surfaces',

  // Kitchen Cabinets
  'Cabinet scope': (detail) => `${detail === 'New custom' ? 'Fabricate and install new custom' : detail === 'New semi-custom' ? 'Install new semi-custom' : detail === 'Reface (new doors)' ? 'Reface existing cabinets with new doors and drawer fronts' : 'Refinish/repaint existing'} cabinetry per design plans`,
  'Base cabinets': (detail, notes, qty) => `Install ${qty ? qty + ' ' : ''}base cabinet${qty > 1 ? 's' : ''} per layout plan`,
  'Upper/wall cabinets': (detail, notes, qty) => `Install ${qty ? qty + ' ' : ''}upper/wall cabinet${qty > 1 ? 's' : ''} per layout plan`,
  'Tall/pantry cabinets': (detail, notes, qty) => `Install ${qty ? qty + ' ' : ''}tall/pantry cabinet${qty > 1 ? 's' : ''} per layout plan`,
  'Island cabinets': (detail) => detail === 'N/A' ? null : 'Install island cabinetry per design plans',
  'Open shelving': (detail) => detail === 'N/A' ? null : 'Install open shelving per design plans',
  'Cabinet hardware': (detail, notes, qty) => `Install ${detail ? detail.toLowerCase() : ''} cabinet hardware${qty ? ' (' + qty + ' pieces)' : ''}`,
  'Specialty inserts (pullouts, dividers, lazy susan)': () => 'Install specialty cabinet inserts including pullouts, dividers, and organizational accessories',
  'Reeded glass panels': (detail, notes, qty) => `Install ${qty ? qty + ' ' : ''}reeded glass panel insert${qty > 1 ? 's' : ''} in cabinet doors`,
  'Soft-close hinges and drawer slides': () => 'Install soft-close hinges and drawer slides on all cabinets',

  // Kitchen Countertops
  'Countertop material': (detail) => `Template and install ${detail ? detail.toLowerCase() : ''} countertops per design plans`,
  'Fabrication and installation': (detail, notes, qty) => `Fabricate and install countertops${qty ? ' (' + qty + ' SF)' : ''}`,
  'Edge profile': (detail) => `${detail ? detail : 'Eased'} edge profile on all exposed edges`,
  'Waterfall edge': (detail) => detail === 'N/A' ? null : `Install waterfall edge on ${detail ? detail.toLowerCase() : 'island'}`,
  'Sink cutout': () => 'Cut and finish sink cutout per sink specifications',
  'Cooktop cutout': (detail) => detail === 'N/A' ? null : 'Cut and finish cooktop cutout per appliance specifications',

  // Kitchen Backsplash
  'Backsplash type': (detail) => detail === 'N/A' ? null : `Install ${detail ? detail.toLowerCase() : ''} backsplash per design plans`,
  'Backsplash material': (detail, notes) => notes ? `Backsplash material: ${notes}` : null,
  'Pattern/layout': (detail) => detail ? `Install in ${detail.toLowerCase()} pattern per design plans` : null,
  'Behind range detail': (detail) => detail === 'Same as rest' ? null : `Install ${detail ? detail.toLowerCase() : 'accent'} detail behind range`,

  // Kitchen Flooring
  'Remove existing flooring': () => 'Remove existing flooring to subfloor',
  'Subfloor prep/repair/leveling': () => 'Prepare, repair, and level subfloor as needed',
  'Flooring type': (detail) => `Install ${detail ? detail.toLowerCase() : ''} flooring per design plans`,
  'Installation area': (detail, notes, qty) => qty ? `Flooring installation area: ${qty} SF` : null,
  'Transitions to adjacent rooms': (detail) => `Install ${detail ? detail.toLowerCase() : ''} transitions to adjacent rooms`,
  'Base trim / shoe molding': (detail, notes, qty) => `Install ${detail ? detail.toLowerCase() : 'new'} base trim${qty ? ' (' + qty + ' LF)' : ''}`,

  // Kitchen Paint
  'Wall prep (patch, sand, prime)': () => 'Prepare wall surfaces including patching, sanding, and priming',
  'Paint walls': (detail, notes, qty) => `Paint walls${qty ? ' (' + qty + ' SF)' : ''} per color selections`,
  'Paint ceiling': () => 'Paint ceiling per color selection',
  'Paint trim/baseboards': () => 'Paint all trim and baseboards per color selection',
  'Number of colors': (detail) => detail ? `Color scheme: ${detail} color${detail === '1' ? '' : 's'}` : null,

  // Kitchen Plumbing Fixtures
  'Sink type': (detail) => `Install ${detail ? detail.toLowerCase() : ''} sink per design plans`,
  'Faucet type': (detail) => `Install ${detail ? detail.toLowerCase() : ''} faucet per design plans`,
  'Faucet finish': (detail) => detail ? `Faucet finish: ${detail}` : null,
  'Garbage disposal': (detail) => `Install ${detail ? detail.toLowerCase() : 'standard'} garbage disposal`,
  'Air switch for disposal': () => 'Install air switch for garbage disposal',
  'Soap dispenser': (detail) => detail === 'N/A' ? null : 'Install countertop-mounted soap dispenser',

  // Kitchen Electrical Fixtures
  'Recessed lights (install)': (detail, notes, qty) => `Install ${qty ? qty + ' ' : ''}recessed light fixtures`,
  'Pendant lights (install)': (detail, notes, qty) => `Install ${qty ? qty + ' ' : ''}pendant light fixture${qty > 1 ? 's' : ''} per design plans`,
  'Under-cabinet lights': (detail) => `Install ${detail ? detail.toLowerCase() : ''} under-cabinet lighting`,
  'Switch plates / outlet covers': (detail) => `Install ${detail ? detail.toLowerCase() : 'standard'} switch plates and outlet covers throughout`,

  // Kitchen Appliances
  'Refrigerator': (detail) => `Install ${detail ? detail.toLowerCase() : ''} refrigerator per plans`,
  'Range / Cooktop': (detail) => `Install ${detail ? detail.toLowerCase() : ''} per plans`,
  'Range size': (detail) => detail ? `Range size: ${detail}` : null,
  'Range hood': (detail) => `Install ${detail ? detail.toLowerCase() : ''} range hood per plans`,
  'Dishwasher': (detail) => `Install ${detail ? detail.toLowerCase() : 'standard'} dishwasher`,
  'Microwave': (detail) => detail === 'N/A' ? null : `Install ${detail ? detail.toLowerCase() : ''} microwave per plans`,
  'Garbage disposal (install)': () => 'Install and test garbage disposal',
  'All installation, connections, testing': () => 'Complete all appliance connections, testing, and commissioning',

  // Kitchen Doors/Windows
  'Interior door(s)': (detail) => detail === 'N/A' ? null : `Install ${detail ? detail.toLowerCase() : 'new'} interior door(s) per plans`,
  'Door hardware': (detail) => `Install ${detail ? detail.toLowerCase() : 'new'} door hardware`,
  'Window replacement': (detail) => detail === 'No' ? null : `Replace ${detail === 'Yes - all' ? 'all' : 'select'} windows per plans`,

  // Kitchen Final
  'Final cleanup': () => 'Complete comprehensive final cleanup of all work areas',
  'Appliance testing': () => 'Test all appliances for proper operation',
  'Punch list': () => 'Complete comprehensive punch list of all items requiring attention',
  'Building department inspection': () => 'Coordinate final inspection with building department',
  'Client walkthrough': () => 'Conduct final walkthrough with client for review and approval',

  // Bathroom Demo
  'Remove vanity/cabinet': () => 'Remove existing vanity and cabinetry',
  'Remove toilet': () => 'Remove existing toilet',
  'Remove shower': (detail) => `Remove existing ${detail ? detail.toLowerCase() : 'shower'}`,
  'Remove bathtub': (detail) => detail === 'N/A' ? null : `Remove existing ${detail ? detail.toLowerCase() : ''} bathtub`,
  'Remove flooring': (detail) => `Remove existing ${detail ? detail.toLowerCase() : ''} flooring to subfloor`,
  'Remove wall tile': (detail) => detail === 'N/A' ? null : `Remove existing wall tile (${detail ? detail.toLowerCase() : 'as needed'})`,
  'Remove mirrors/accessories/light fixtures': () => 'Remove existing mirrors, accessories, and light fixtures',
  'Remove existing door': (detail) => detail === 'N/A' ? null : `Remove existing ${detail ? detail.toLowerCase() : ''} door`,

  // Bathroom Framing
  'Shower enclosure framing': () => 'Frame shower enclosure per architectural plans',
  'Tub support/platform framing': (detail) => detail === 'N/A' ? null : `Frame ${detail ? detail.toLowerCase() : ''} tub support per plans`,
  'Blocking for grab bars': () => 'Install blocking for grab bar locations',
  'Blocking for wall-mounted fixtures': (detail) => detail === 'N/A' ? null : `Install blocking for ${detail ? detail.toLowerCase() : 'wall-mounted fixtures'}`,
  'New door opening': (detail) => detail === 'N/A' ? null : `Frame ${detail ? detail.toLowerCase() : 'new'} door opening per plans`,
  'Shower bench framing': (detail) => detail === 'N/A' ? null : `Frame ${detail ? detail.toLowerCase() : ''} shower bench per plans`,
  'Niche framing': (detail, notes, qty) => `Frame ${qty ? qty + ' ' : ''}shower niche${qty > 1 ? 's' : ''} per plans`,
  'Wall modifications per plans': () => 'Complete wall modifications per architectural plans',

  // Bathroom Plumbing
  'Shower type': (detail) => detail === 'N/A' ? null : `Install ${detail ? detail.toLowerCase() : ''} shower per architectural plans`,
  'Shower drain type': (detail) => `Install ${detail ? detail.toLowerCase() : 'standard'} shower drain`,
  'Shower valve type': (detail) => `Install ${detail ? detail.toLowerCase() : 'pressure balance'} shower valve`,
  'Shower configuration': (detail) => `Install ${detail ? detail.toLowerCase() : 'standard'} shower configuration`,
  'Bathtub rough-in': (detail) => detail === 'N/A' ? null : `Install ${detail ? detail.toLowerCase() : ''} bathtub rough-in per plans`,
  'Tub filler type': (detail) => detail === 'N/A' ? null : `Install ${detail ? detail.toLowerCase() : ''} tub filler`,
  'Vanity sink count': (detail) => `Install ${detail ? detail.toLowerCase() : 'single sink'} rough-in`,
  'Vanity mounting': (detail) => `Install vanity ${detail ? '(' + detail.toLowerCase() + ')' : ''} per plans`,
  'Toilet rough-in': (detail) => `Install ${detail ? detail.toLowerCase() : 'standard'} toilet rough-in`,
  'Bidet rough-in': (detail) => detail === 'N/A' ? null : `Install ${detail ? detail.toLowerCase() : 'bidet'} rough-in`,
  'Relocate plumbing lines': (detail, notes) => notes ? `Relocate plumbing lines: ${notes}` : 'Relocate plumbing lines per plans',

  // Bathroom Electrical
  'Vanity lighting circuit': () => 'Install dedicated circuit for vanity lighting',
  'Overhead lighting circuit': () => 'Install dedicated circuit for overhead lighting',
  'Exhaust fan circuit': () => 'Install dedicated circuit for exhaust fan',
  'GFCI outlets': () => 'Install GFCI-protected outlets per code',
  'Heated floor circuit': (detail) => detail === 'N/A' ? null : `Install dedicated circuit for ${detail ? detail.toLowerCase() : 'electric mat'} heated floor system`,
  'Towel warmer circuit': (detail) => detail === 'N/A' ? null : `Install ${detail ? detail.toLowerCase() : 'dedicated'} circuit for towel warmer`,
  'Bidet seat outlet': (detail) => detail === 'N/A' ? null : 'Install dedicated GFCI outlet for bidet seat',

  // Bathroom Waterproofing
  'Shower pan method': (detail) => `Install shower pan waterproofing using ${detail ? detail.toLowerCase() : 'approved'} method`,
  'Shower wall waterproofing': (detail) => `Waterproof shower walls using ${detail ? detail.toLowerCase() : 'approved membrane'}`,
  'Curb type': (detail) => detail === 'N/A (curbless)' ? 'Construct curbless shower entry' : `Construct ${detail ? detail.toLowerCase() : 'standard'} shower curb`,
  'Curbless transition detail': (detail) => detail === 'N/A (curbed)' ? null : `Install curbless transition with ${detail ? detail.toLowerCase() : 'appropriate drainage'}`,
  'Shower bench waterproofing': (detail) => detail === 'N/A' ? null : 'Waterproof shower bench per manufacturer specifications',
  'Niche waterproofing': () => 'Waterproof all shower niches per manufacturer specifications',
  'Flood test / inspection': () => 'Perform flood test and coordinate waterproofing inspection',

  // Bathroom Tile
  'Floor tile': (detail, notes, qty) => `Install ${notes ? notes + ' ' : ''}floor tile${qty ? ' (' + qty + ' SF)' : ''}`,
  'Shower floor tile': (detail) => `Install ${detail ? detail.toLowerCase() : ''} shower floor tile`,
  'Shower wall tile height': (detail) => `Install shower wall tile ${detail ? detail.toLowerCase() : 'to ceiling'}`,
  'Shower niche(s)': (detail, notes, qty) => `Tile ${qty ? qty + ' ' : ''}shower niche${qty > 1 ? 's' : ''} with coordinating tile`,
  'Accent tile / feature wall': (detail, notes) => notes ? `Install accent tile/feature wall: ${notes}` : 'Install accent tile per design plans',
  'Tub surround tile': (detail) => detail === 'N/A' ? null : `Install tub surround tile ${detail ? detail.toLowerCase() : ''}`,
  'Wainscoting': (detail, notes, qty) => `Install ${detail ? detail.toLowerCase() : ''} wainscoting${qty ? ' (' + qty + ' LF)' : ''} per design plans`,
  'Tile layout/pattern': (detail) => detail ? `Tile layout: ${detail.toLowerCase()} pattern` : null,
  'Schluter/edge trim profiles': () => 'Install Schluter and/or edge trim profiles at all exposed tile edges',
  'Grouting and sealing': () => 'Grout and seal all tile installations',

  // Bathroom Cabinetry
  'Vanity type': (detail) => `Install ${detail ? detail.toLowerCase() : ''} vanity per design plans`,
  'Vanity size': (detail) => detail ? `Vanity size: ${detail}` : null,
  'Linen cabinet/tower': (detail) => detail === 'N/A' ? null : `Install ${detail ? detail.toLowerCase() : ''} linen cabinet per plans`,
  'Medicine cabinet': (detail, notes, qty) => detail === 'N/A' ? null : `Install ${qty ? qty + ' ' : ''}${detail ? detail.toLowerCase() : ''} medicine cabinet${qty > 1 ? 's' : ''}`,
  'Storage cabinet': (detail) => detail === 'N/A' ? null : `Install ${detail ? detail.toLowerCase().replace('yes - ', '') : ''} storage cabinet per plans`,
  'Cabinet hardware': () => 'Install cabinet hardware per design selections',

  // Bathroom Countertops (reuse kitchen mappings where applicable)

  // Bathroom Glass
  'Enclosure type': (detail) => detail === 'N/A' ? null : `Install ${detail ? detail.toLowerCase() : ''} glass shower enclosure`,
  'Door type': (detail) => `Shower door type: ${detail ? detail.toLowerCase() : 'swing door'}`,
  'Glass type': (detail) => detail ? `Glass type: ${detail.toLowerCase()}` : null,
  'Hardware finish': (detail) => detail ? `Shower hardware finish: ${detail}` : null,

  // Bathroom Plumbing Fixtures
  'Toilet': (detail) => `Install ${detail ? detail.toLowerCase() : 'standard'} toilet`,
  'Bidet / bidet seat': (detail) => detail === 'N/A' ? null : `Install ${detail ? detail.toLowerCase() : 'bidet'}`,
  'Shower system': (detail, notes) => notes ? `Install shower system: ${notes}` : 'Install shower system per design plans',
  'Bathtub': (detail) => detail === 'N/A' ? null : `Install ${detail ? detail.toLowerCase() : ''} bathtub per plans`,
  'Tub filler': (detail) => detail === 'N/A' ? null : `Install ${detail ? detail.toLowerCase() : ''} tub filler`,
  'Towel bars/rings': (detail, notes, qty) => `Install ${qty ? qty + ' ' : ''}towel bar${qty > 1 ? 's' : ''}/ring${qty > 1 ? 's' : ''} per design plans`,
  'Toilet paper holder': () => 'Install toilet paper holder per design plans',
  'Robe hooks': (detail, notes, qty) => `Install ${qty ? qty + ' ' : ''}robe hook${qty > 1 ? 's' : ''} per design plans`,
  'Accessory finish': (detail) => detail ? `Bathroom accessory finish: ${detail}` : null,

  // Bathroom Electrical Fixtures
  'Vanity sconces/lights': (detail, notes, qty) => `Install ${qty ? qty + ' ' : ''}vanity sconce${qty > 1 ? 's' : ''}/light fixture${qty > 1 ? 's' : ''}`,
  'Overhead light fixture': () => 'Install overhead light fixture per design plans',
  'Exhaust fan': (detail) => `Install ${detail ? detail.toLowerCase() : 'standard'} exhaust fan`,
  'Towel warmer': (detail) => detail === 'N/A' ? null : `Install ${detail ? detail.toLowerCase() : ''} towel warmer`,

  // Bathroom Flooring
  'Subfloor prep/repair': () => 'Prepare and repair subfloor as needed',
  'Heated floor system': (detail) => detail === 'N/A' ? null : `Install ${detail ? detail.toLowerCase() : 'electric mat'} heated floor system`,
  'Base trim': (detail, notes, qty) => detail === 'N/A (tile base)' ? null : `Install ${detail ? detail.toLowerCase() : 'new'} base trim${qty ? ' (' + qty + ' LF)' : ''}`,
  'Threshold/transition': (detail) => `Install ${detail ? detail.toLowerCase() : ''} threshold/transition`,

  // Bathroom Paint
  'Wall prep and paint': () => 'Prepare and paint all wall surfaces per color selection',
  'Paint ceiling': (detail) => `Paint ceiling${detail ? ' with ' + detail.toLowerCase() + ' paint' : ''}`,
  'Paint trim/door': () => 'Paint all trim and door per color selection',

  // Bathroom Trim & Finish
  'Door': (detail) => detail === 'Keep existing' ? null : `Install ${detail ? detail.toLowerCase() : 'new'} door per plans`,
  'Baseboards': (detail) => detail === 'N/A (tile base)' ? null : `Install ${detail ? detail.toLowerCase() : 'new'} baseboards`,
  'Closet doors': (detail) => detail === 'N/A' || detail === 'Keep existing' ? null : 'Install new closet doors per plans',

  // Bathroom Final
  'Fixture testing (water, drain, electrical)': () => 'Test all fixtures including water supply, drainage, and electrical connections',
  'Caulking and sealant': () => 'Apply caulking and sealant at all required locations',
};

function toNarrative(itemName, detail, notes, qty, unit) {
  if (narrativeMap[itemName]) {
    const result = narrativeMap[itemName](detail, notes, qty);
    if (result === null) return null;
    let text = result;
    if (notes && !text.includes(notes)) text += `. ${notes}`;
    return text;
  }
  let text = itemName;
  if (detail && detail !== 'Yes') text += ` - ${detail}`;
  if (qty) text += ` (${qty}${unit ? ' ' + unit : ''})`;
  if (notes) text += `. ${notes}`;
  return text;
}

// Phase grouping definitions for kitchen
const KITCHEN_PHASE_MAP = [
  { heading: 'General Scope', trades: [], isGeneral: true },
  { heading: 'Demolition', trades: [0] },
  { heading: 'Structural Modifications', trades: [1] },
  { heading: 'Systems Installation', trades: [2, 3, 4], subSections: { 2: 'Plumbing Updates', 3: 'Electrical Updates', 4: 'HVAC Updates' } },
  { heading: 'Finish Work', trades: [5, 6, 7, 8, 10, 11, 12], subSections: { 5: 'Drywall and Paint', 6: 'Cabinetry', 7: 'Countertops', 8: 'Backsplash', 10: 'Painting', 11: 'Plumbing Fixtures', 12: 'Electrical Fixtures' } },
  { heading: 'Flooring and Trim', trades: [9, 14], subSections: { 9: 'Flooring', 14: 'Doors and Windows' } },
  { heading: 'Appliance Installation', trades: [13] },
  { heading: 'Quality Control', trades: [15] },
];

// Phase grouping definitions for bathroom
const BATHROOM_PHASE_MAP = [
  { heading: 'General Scope', trades: [], isGeneral: true },
  { heading: 'Demolition', trades: [0] },
  { heading: 'Framing', trades: [1] },
  { heading: 'Systems Installation', trades: [2, 3], subSections: { 2: 'Plumbing', 3: 'Electrical' } },
  { heading: 'Waterproofing and Tile', trades: [4, 5], subSections: { 4: 'Waterproofing', 5: 'Tile Installation' } },
  { heading: 'Finishes', trades: [6, 7, 8], subSections: { 6: 'Cabinetry', 7: 'Countertops', 8: 'Glass / Shower Enclosure' } },
  { heading: 'Fixtures', trades: [9, 10], subSections: { 9: 'Plumbing Fixtures', 10: 'Electrical Fixtures' } },
  { heading: 'Flooring', trades: [11] },
  { heading: 'Paint and Trim', trades: [12, 13], subSections: { 12: 'Painting', 13: 'Trim and Finish' } },
  { heading: 'Quality Control', trades: [14] },
];

function getIncludedNarrativeItems(inst, data, tIdx) {
  const trade = inst.trades[tIdx];
  if (!trade) return [];
  const tradeData = data[tIdx] || {};
  const items = [];
  Object.entries(tradeData).forEach(([iIdx, itemData]) => {
    if (!itemData.included) return;
    const itemDef = trade.items[parseInt(iIdx)];
    if (!itemDef) return;
    const text = toNarrative(itemDef.name, itemData.detail, itemData.notes, itemData.qty, itemDef.unit);
    if (text) items.push(text);
  });
  return items;
}

function generateSOW() {
  const projectName = document.getElementById('projectName').value || 'Untitled Project';
  const address = document.getElementById('propertyAddress').value || '';
  const client = document.getElementById('clientName').value || '';
  const propType = document.getElementById('propertyType').value || '';
  const projType = document.getElementById('projectType').value || '';
  const sf = document.getElementById('totalSF').value || '';
  const yearBuilt = document.getElementById('yearBuilt').value || '';
  const bedsBaths = document.getElementById('bedsBaths').value || '';
  const designFirm = document.getElementById('designFirm').value || '';
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  let sow = `<h1>HONEYCOMB DESIGN AND REMODELING<br>SCOPE OF WORK</h1>`;
  sow += `<div class="sow-meta">
    <strong>PROJECT:</strong> ${address}<br>
    <strong>CLIENT:</strong> ${client}<br>
    ${propType ? `${propType} | ` : ''}${sf ? `${sf} SF | ` : ''}${bedsBaths ? `${bedsBaths} | ` : ''}${yearBuilt ? `Year Built: ${yearBuilt}` : ''}<br>
    ${projType ? `<strong>Scope:</strong> ${projType}<br>` : ''}
    <strong>Date:</strong> ${today}<br>
    ${designFirm ? `<strong>Design:</strong> ${designFirm}` : ''}
  </div>`;

  // Each module
  moduleInstances.forEach(inst => {
    const data = scopeData[inst.key] || {};
    let hasItems = false;
    Object.values(data).forEach(trade => {
      Object.values(trade).forEach(item => { if (item.included) hasItems = true; });
    });
    if (!hasItems) return;

    // Get module title
    let moduleTitle = inst.label;
    if (inst.id === 'bathroom') {
      const bathName = document.getElementById(`bathname-${inst.key}`)?.value;
      if (bathName) moduleTitle = bathName;
    }

    sow += `<h2>${moduleTitle.toUpperCase()}</h2>`;

    // Determine phase map
    let phaseMap;
    if (inst.id === 'kitchen') {
      phaseMap = KITCHEN_PHASE_MAP;
    } else if (inst.id === 'bathroom') {
      phaseMap = BATHROOM_PHASE_MAP;
    } else {
      // Generic modules: just list trades as numbered sections
      let secNum = 1;
      sow += `<div class="narrative-section"><div class="section-heading"><span class="sow-section-num">${secNum}. General Scope:</span></div>`;
      sow += `<ol class="narrative-items"><li>Provide all labor and substrate materials for complete ${moduleTitle.toLowerCase()} renovation per architectural plans</li>`;
      sow += `<li>Ensure compliance with California Building Code (CBC) and local jurisdictional requirements</li></ol></div>`;
      secNum++;

      inst.trades.forEach((trade, tIdx) => {
        const items = getIncludedNarrativeItems(inst, data, tIdx);
        if (items.length === 0) return;
        sow += `<div class="narrative-section"><div class="section-heading"><span class="sow-section-num">${secNum}. ${trade.name}:</span></div>`;
        sow += `<ol class="narrative-items">`;
        items.forEach(text => { sow += `<li>${text}</li>`; });
        sow += `</ol></div>`;
        secNum++;
      });
      return;
    }

    // Render using phase map
    let secNum = 1;
    phaseMap.forEach(phase => {
      if (phase.isGeneral) {
        // Always include General Scope
        sow += `<div class="narrative-section"><div class="section-heading"><span class="sow-section-num">${secNum}. ${phase.heading}:</span></div>`;
        sow += `<ol class="narrative-items">`;
        sow += `<li>Provide all labor and substrate materials for complete ${moduleTitle.toLowerCase()} renovation per architectural plans</li>`;
        sow += `<li>Ensure compliance with California Building Code (CBC) and local jurisdictional requirements</li>`;
        sow += `</ol></div>`;
        secNum++;
        return;
      }

      // Check if any trades in this phase have included items
      let phaseHasItems = false;
      let allPhaseItems = {};
      phase.trades.forEach(tIdx => {
        const items = getIncludedNarrativeItems(inst, data, tIdx);
        if (items.length > 0) {
          phaseHasItems = true;
          allPhaseItems[tIdx] = items;
        }
      });

      if (!phaseHasItems) return;

      sow += `<div class="narrative-section"><div class="section-heading"><span class="sow-section-num">${secNum}. ${phase.heading}:</span></div>`;

      if (phase.subSections && phase.trades.length > 1) {
        // Multiple trades grouped with sub-sections
        let hasMultipleActive = Object.keys(allPhaseItems).length > 1;
        phase.trades.forEach(tIdx => {
          const items = allPhaseItems[tIdx];
          if (!items || items.length === 0) return;
          const subName = phase.subSections[tIdx] || inst.trades[tIdx]?.name || '';
          if (hasMultipleActive || phase.subSections) {
            sow += `<div class="narrative-sub-section">${subName}:</div>`;
            sow += `<div class="narrative-sub-items">`;
            items.forEach(text => { sow += `<div>${text}</div>`; });
            sow += `</div>`;
          } else {
            sow += `<ol class="narrative-items">`;
            items.forEach(text => { sow += `<li>${text}</li>`; });
            sow += `</ol>`;
          }
        });
      } else {
        // Single trade or no sub-sections
        sow += `<ol class="narrative-items">`;
        phase.trades.forEach(tIdx => {
          const items = allPhaseItems[tIdx];
          if (!items) return;
          items.forEach(text => { sow += `<li>${text}</li>`; });
        });
        sow += `</ol>`;
      }

      sow += `</div>`;
      secNum++;
    });

    // Finishing Materials / Important Notes
    let ownerItems = [];
    inst.trades.forEach((trade, tIdx) => {
      const tradeData = data[tIdx] || {};
      Object.entries(tradeData).forEach(([iIdx, itemData]) => {
        if (!itemData.included) return;
        const itemDef = trade.items[parseInt(iIdx)];
        if (!itemDef) return;
        // Flag items that are typically owner-provided finish selections
        const finishKeywords = ['material', 'type', 'finish', 'color', 'size'];
        const isFinishItem = finishKeywords.some(kw => itemDef.name.toLowerCase().includes(kw));
        if (isFinishItem && itemData.detail && itemData.detail !== 'Yes') {
          ownerItems.push(`${itemDef.name}: ${itemData.detail}`);
        }
      });
    });

    if (ownerItems.length > 0) {
      sow += `<div class="sow-notes"><strong>Important Notes - Finishing Material Selections:</strong><ul class="sow-materials">`;
      ownerItems.forEach(item => { sow += `<li>${item}</li>`; });
      sow += `</ul></div>`;
    }
  });

  // General Conditions and Notes
  let hasConditions = false;
  GENERAL_CONDITIONS.forEach((sec, sIdx) => {
    const secData = conditionsData[sIdx] || {};
    if (Object.values(secData).some(v => v)) hasConditions = true;
  });

  if (hasConditions) {
    sow += '<h2>GENERAL CONDITIONS AND NOTES</h2>';
    GENERAL_CONDITIONS.forEach((sec, sIdx) => {
      const secData = conditionsData[sIdx] || {};
      const included = Object.entries(secData).filter(([_, v]) => v);
      if (included.length === 0) return;
      sow += `<div class="narrative-section"><div class="section-heading"><span class="sow-section-num">${sec.name}:</span></div>`;
      sow += `<ol class="narrative-items">`;
      included.forEach(([iIdx]) => {
        sow += `<li>${sec.items[parseInt(iIdx)]}</li>`;
      });
      sow += `</ol></div>`;
    });

    // Standard disclaimers
    sow += `<div class="sow-notes">`;
    sow += `<strong>Standard Disclaimers:</strong><br>`;
    sow += `All work to be performed in accordance with current California Building Code (CBC) and local jurisdictional requirements. `;
    sow += `Contractor shall obtain all necessary permits and schedule all required inspections. `;
    sow += `Any unforeseen conditions discovered during construction that require additional work will be addressed via change order. `;
    sow += `Owner is responsible for all finish material selections and timely delivery to job site. `;
    sow += `Schedule is contingent upon timely material deliveries and owner decision-making.`;
    sow += `</div>`;
  }

  // Exclusions
  const includedExclusions = Object.entries(exclusionsData).filter(([_, v]) => v);
  const customExcl = document.getElementById('customExclusions')?.value;
  if (includedExclusions.length > 0 || customExcl) {
    sow += '<h2>EXCLUSIONS</h2>';
    sow += '<p>The following items are expressly excluded from this scope of work:</p>';
    sow += `<ol class="narrative-items">`;
    includedExclusions.forEach(([i]) => {
      sow += `<li>${STANDARD_EXCLUSIONS[parseInt(i)]}</li>`;
    });
    if (customExcl) {
      customExcl.split('\n').filter(l => l.trim()).forEach(l => {
        sow += `<li>${l.trim()}</li>`;
      });
    }
    sow += '</ol>';
  }

  // Notes
  const notes = document.getElementById('projectNotes')?.value;
  if (notes) {
    sow += `<div class="sow-notes"><strong>Additional Notes:</strong><br>${notes}</div>`;
  }

  document.getElementById('sowOutput').innerHTML = sow;
  document.getElementById('sowOutputContainer').style.display = 'block';
  document.getElementById('sowOutputContainer').scrollIntoView({ behavior: 'smooth' });
}

function copySOW() {
  const el = document.getElementById('sowOutput');
  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  document.execCommand('copy');
  sel.removeAllRanges();
  alert('SOW copied to clipboard! You can paste it into a Word document or share it directly.');
}

// ============================================================
// INIT
// ============================================================
renderModuleGrid();
