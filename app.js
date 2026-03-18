
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
// INPUT SOURCE TRACKING
// ============================================================
function handleInputSourceChange() {
  const type = document.getElementById('inputSourceType').value;
  document.getElementById('sourceDetailSiteWalk').style.display = type === 'site_walk' ? 'block' : 'none';
  document.getElementById('sourceDetailPlans').style.display = type === 'plans' ? 'block' : 'none';
  document.getElementById('sourceDetailDesign').style.display = type === 'design' ? 'block' : 'none';
  document.getElementById('sourceDetailCombined').style.display = type === 'combined' ? 'block' : 'none';

  // Auto-set status to PRELIMINARY for site walk only
  if (type === 'site_walk') {
    document.getElementById('sowStatus').value = 'PRELIMINARY';
  }
}

function getInputSourceText() {
  const type = document.getElementById('inputSourceType').value;
  if (type === 'site_walk') {
    const date = document.getElementById('siteWalkDate').value;
    const by = document.getElementById('siteWalkBy').value;
    const dateStr = date ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date not specified';
    return `Site walk observations only. Walk conducted ${dateStr}${by ? ' by ' + by : ''}.`;
  } else if (type === 'plans') {
    const sheets = document.getElementById('planSheets').value;
    return `Architectural plans provided by Gustavo. Plan sheets referenced: ${sheets || 'See plan set'}.`;
  } else if (type === 'design') {
    const docs = document.getElementById('designDocs').value;
    return `Design documents provided by Carolina. Documents referenced: ${docs || 'See design package'}.`;
  } else {
    const date = document.getElementById('combSiteWalkDate').value;
    const by = document.getElementById('combSiteWalkBy').value;
    const sheets = document.getElementById('combPlanSheets').value;
    const docs = document.getElementById('combDesignDocs').value;
    const dateStr = date ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date not specified';
    let text = 'Combined sources:';
    text += ` Site walk ${dateStr}${by ? ' by ' + by : ''}.`;
    if (sheets) text += ` Plan sheets: ${sheets}.`;
    if (docs) text += ` Design documents: ${docs}.`;
    return text;
  }
}

function isSiteWalkOnly() {
  return document.getElementById('inputSourceType').value === 'site_walk';
}

// ============================================================
// VERSION CONTROL
// ============================================================
let versionHistory = [];
let currentVersion = 1.0;
let sowGenerated = false;

function promptRevision() {
  const changeNotes = prompt('What changed from the previous version?\n\nDescribe the revision before generating.');
  if (!changeNotes || !changeNotes.trim()) {
    alert('Revision notes are required. Please describe what changed.');
    return;
  }
  // Save current version to history
  const prevVersion = document.getElementById('sowVersion').value;
  const prevDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const prevNotes = document.getElementById('sowRevisionNotes').value;
  versionHistory.push({ version: prevVersion, date: prevDate, notes: prevNotes });

  // Increment version
  currentVersion = parseFloat(prevVersion) + 0.1;
  currentVersion = Math.round(currentVersion * 10) / 10;
  document.getElementById('sowVersion').value = currentVersion.toFixed(1);
  document.getElementById('sowRevisionNotes').value = changeNotes.trim();

  // Show revision history
  updateRevisionHistoryDisplay();

  // Generate new version
  generateAllVersions();
}

function updateRevisionHistoryDisplay() {
  if (versionHistory.length === 0) return;
  const histEl = document.getElementById('revisionHistory');
  const listEl = document.getElementById('revisionHistoryList');
  histEl.style.display = 'block';
  let html = '';
  versionHistory.forEach(v => {
    html += `<div style="margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px solid #EDF2F7;"><strong>v${v.version}</strong> (${v.date}): ${v.notes}</div>`;
  });
  listEl.innerHTML = html;
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
    { name: 'Texture finish', options: ['Smooth (Level 5)','Smooth (Level 4)','Orange peel','Knockdown','Skip trowel','Match existing'] },
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
  'Texture finish': (detail) => {
    const finishMap = {
      'Smooth (Level 5)': 'Apply Level 5 smooth finish to all new and repaired drywall. Level 5 includes skim coat over entire surface for uniform appearance under critical lighting conditions',
      'Smooth (Level 4)': 'Apply Level 4 smooth finish to all new and repaired drywall surfaces',
      'Orange peel': 'Apply orange peel texture to match existing wall finish',
      'Knockdown': 'Apply knockdown texture to match existing wall finish',
      'Skip trowel': 'Apply skip trowel texture finish per design specifications',
      'Match existing': 'Match existing wall texture throughout (exact texture match not guaranteed due to age and application variables)'
    };
    return finishMap[detail] || `Apply ${detail ? detail.toLowerCase() : 'smooth'} texture finish to all new and repaired drywall`;
  },
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
  'Shower floor tile': (detail) => `Install ${detail ? detail.toLowerCase() : ''} shower floor tile. Note: shower floor tile is installed with slope to drain per waterproofing specifications`,
  'Shower wall tile height': (detail) => `Install shower wall tile ${detail ? detail.toLowerCase() : 'to ceiling'}. Tile size and layout per design plans; grout color per owner selection`,
  'Shower niche(s)': (detail, notes, qty) => `Tile ${qty ? qty + ' ' : ''}shower niche${qty > 1 ? 's' : ''} with coordinating tile. Niche dimensions per design; shelf trim per tile selection`,
  'Accent tile / feature wall': (detail, notes) => notes ? `Install accent tile/feature wall: ${notes}. Note: accent tile may require additional layout time depending on pattern complexity` : 'Install accent tile per design plans',
  'Tub surround tile': (detail) => detail === 'N/A' ? null : `Install tub surround tile ${detail ? detail.toLowerCase() : ''}`,
  'Wainscoting': (detail, notes, qty) => `Install ${detail ? detail.toLowerCase() : ''} wainscoting${qty ? ' (' + qty + ' LF)' : ''} per design plans`,
  'Tile layout/pattern': (detail) => detail ? `Layout: ${detail.toLowerCase()} pattern per design plans. Note: complex patterns (herringbone, chevron) require additional labor` : null,
  'Tile size': (detail) => detail ? `Tile size: ${detail}. Note: tile size affects layout complexity and labor` : null,
  'Grout color': (detail) => detail ? `Grout color: ${detail}` : null,
  'Tile layout pattern': (detail) => detail ? `Layout: ${detail} pattern per design plans` : null,
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
  let text;
  if (narrativeMap[itemName]) {
    const result = narrativeMap[itemName](detail, notes, qty);
    if (result === null) return null;
    text = result;
    if (notes && !text.includes(notes)) text += `. ${notes}`;
  } else {
    text = itemName;
    if (detail && detail !== 'Yes') text += ` - ${detail}`;
    if (qty) text += ` (${qty}${unit ? ' ' + unit : ''})`;
    if (notes) text += `. ${notes}`;
  }

  // Plan reference tagging: if plans or combined source, check for sheet references
  const sourceType = document.getElementById('inputSourceType')?.value;
  if (sourceType === 'plans' || sourceType === 'combined') {
    const hasRef = /\[.*(?:Sheet|sheet|A\d|S\d|E\d|M\d|Schedule|Detail|Plan)/i.test(notes || '');
    if (!hasRef) {
      text += ` <span class="no-plan-ref">[NO PLAN REFERENCE \u2014 VERIFY BEFORE BIDDING]</span>`;
    }
  }

  return text;
}

// ============================================================
// TRADE EXCLUSIONS — what is NOT included per trade
// ============================================================
const TRADE_EXCLUSIONS = {
  'Demolition': [
    'Structural modifications unless explicitly listed above',
    'Hazardous material removal unless tested and confirmed absent',
    'Disposal of owner-retained items',
    'Repair of unforeseen conditions exposed during demolition'
  ],
  'Framing': [
    'Structural engineering calculations unless Gustavo is providing them as part of this project',
    'Shear wall installation unless shown on plans',
    'Any framing not explicitly listed above'
  ],
  'Plumbing': [
    'Main line repair or replacement',
    'Water heater replacement unless listed',
    'Gas line work unless listed',
    'Any fixture not listed in the rough-in schedule'
  ],
  'Electrical': [
    'Panel upgrade unless explicitly listed',
    'Low voltage wiring unless listed',
    'Any circuit or outlet not listed above'
  ],
  'HVAC': [
    'Equipment replacement unless listed',
    'Ductwork beyond the scope area',
    'Any work requiring structural penetration not shown on plans'
  ],
  'Insulation': [
    'Title 24 compliance documentation unless Honeycomb has confirmed it is included',
    'Spray foam unless explicitly listed'
  ],
  'Drywall': [
    'Skim coat or Level 5 finish unless explicitly listed',
    'Plaster repair in areas outside the scope',
    'Painting'
  ],
  'Waterproofing': [
    'Surface waterproofing outside the shower area',
    'Remediation of existing water damage unless listed'
  ],
  'Tile': [
    'Substrate preparation and waterproofing unless listed as part of this scope',
    'Tile supplied by trade unless explicitly stated',
    'Grout sealer unless listed',
    'Removal and replacement of tile outside the scope area'
  ],
  'Cabinetry': [
    'Cabinet procurement',
    'Countertop installation',
    'Appliance installation',
    'Touch-up painting of adjacent walls'
  ],
  'Countertops': [
    'Sink procurement unless listed',
    'Faucet installation',
    'Undermount sink installation unless listed'
  ],
  'Finish Plumbing': [
    'Fixture procurement',
    'Any rough plumbing modifications',
    'Gas appliance connections unless listed'
  ],
  'Finish Electrical': [
    'Fixture procurement',
    'Any panel work',
    'Low voltage or smart home wiring unless listed'
  ],
  'Painting': [
    'Drywall repair and patching unless explicitly listed',
    'Exterior painting unless listed',
    'Cabinet painting unless listed',
    'Protection and removal of furniture or owner belongings'
  ],
  'Finish Carpentry': [
    'Furniture installation',
    'Built-ins not explicitly listed',
    'Stair work unless listed'
  ],
  'Flooring': [
    'Subfloor replacement unless listed',
    'Floor leveling beyond 3/16 inch in 10 feet unless listed',
    'Transitions to areas outside the scope'
  ],
  'Final': [
    'Exterior cleaning unless listed',
    'Window cleaning exterior',
    'Appliance deep cleaning unless listed'
  ],
  'Glass': [
    'Custom glass fabrication beyond standard sizing',
    'Replacement of glass damaged after installation',
    'Hardware upgrades beyond specified finish'
  ],
  'Appliances': [
    'Appliance procurement unless explicitly stated',
    'Extended warranties',
    'Modifications to cabinetry or countertops for appliance fitment'
  ]
};

// ============================================================
// TRADE COMPLETION CRITERIA — what "done" means per trade
// ============================================================
const TRADE_COMPLETION = {
  'Demolition': 'All items listed for removal have been removed. All debris has been hauled from the property. Subfloor and structural elements are exposed and accessible for inspection. Adjacent surfaces and structures to remain are undamaged. Area is broom clean and ready for rough trades.',
  'Framing': 'All framing shown on plans is complete. All blocking and backing is installed per blocking schedule. Framing dimensions have been verified against cabinet and fixture specifications. Framing inspection has been scheduled and passed. Written confirmation from trade that dimensions are correct before walls are closed.',
  'Plumbing': 'All rough-in locations match fixture specifications provided by Honeycomb. Rough plumbing inspection has been passed. Written confirmation from trade that all dimensions are correct. Stubs are capped and labeled.',
  'Electrical': 'All circuits are roughed in per plan. All rough-in locations match fixture and appliance specifications. Rough electrical inspection has been passed. All circuits are labeled at the panel.',
  'HVAC': 'All ductwork and equipment is installed per plan. HVAC inspection has been passed. All exhaust fans are ducted to exterior and tested at required CFM.',
  'Insulation': 'All insulation is installed per plan and Title 24 requirements where applicable. Insulation inspection has been passed. No walls have been closed before inspection.',
  'Drywall': 'All surfaces are finished to the specified level. No visible seams, fastener heads, or tool marks. Corners are straight. All surfaces are ready for paint without additional preparation by the painter.',
  'Waterproofing': 'Flood test has been completed and passed. Flood test result is documented with a photograph showing standing water and timestamp. Honeycomb has provided written sign-off before tile installation begins.',
  'Tile': 'All tile is installed, grouted, and sealed. Grout joints are consistent and fully filled. No lippage exceeding 1/16 inch on floor tile or 1/32 inch on wall tile. All tile cuts are clean. All installation debris and packaging have been removed from the site.',
  'Cabinetry': 'All cabinets are plumb and level within 1/8 inch. All doors and drawers open and close correctly. All hardware is installed and functioning. Gaps at walls are filled or scribed. No visible damage to any cabinet finish.',
  'Countertops': 'Countertop is installed with no chips or cracks. All seams are tight and polished. Sink cutout is correct. Caulk joint at wall is complete and consistent. Undermount sink clips are installed and holding.',
  'Finish Plumbing': 'All fixtures are installed and operational. No leaks at any connection after 24 hours. Water pressure and flow are tested and normal. Disposal and dishwasher are operational if in scope.',
  'Finish Electrical': 'All devices and fixtures are installed and operational. All circuits have been tested. No tripped breakers. Final electrical inspection has been passed.',
  'Painting': 'All surfaces are painted to specified coats and sheen. No visible brush marks, roller marks, or missed areas on finish coat. Lines at all transitions are clean. All masking and protection have been removed. No paint on tile, hardware, fixtures, or floors.',
  'Finish Carpentry': 'All trim is installed, nailed, filled, and sanded. Joints are tight. Corner miters are correct. All nail holes are filled and sanded smooth. Ready for paint without additional preparation.',
  'Flooring': 'Flooring is installed per manufacturer requirements. Transitions are installed at all doorways. All flooring debris has been removed. Subfloor preparation is documented if required.',
  'Final': 'Property is in move-in ready condition. All surfaces are clean. No construction debris remains on the property including garage and exterior areas used during construction.',
  'Glass': 'Glass enclosure is installed plumb and level. All hardware is functioning. Door swings freely. No chips or scratches. Silicone joints are complete and consistent.',
  'Appliances': 'All appliances are installed per manufacturer specifications. All connections are tested and operational. All appliances are clean and free of protective film. Manufacturer warranties and operating instructions have been provided.'
};

// ============================================================
// TRADE HANDOFFS — what each trade receives and hands off
// ============================================================
const TRADE_HANDOFFS = {
  'Demolition': {
    receives: 'Access to property confirmed with Honeycomb. Protection of surfaces to remain is in place.',
    handsOff: 'All demolished material removed. Subfloor and structure exposed and accessible. Utilities disconnected at demolished elements. Area broom clean.'
  },
  'Framing': {
    receives: 'Demolition complete and approved by Honeycomb. Subfloor structure verified sound.',
    handsOff: 'All framing complete and inspected. Blocking schedule complete. Dimensions verified against specifications. Area ready for rough mechanical trades.'
  },
  'Plumbing': {
    receives: 'Framing complete. Blocking installed at all fixture locations per blocking schedule.',
    handsOff: 'All stubs capped and labeled. Inspection passed. No penetrations left open. Work area clean.'
  },
  'Electrical': {
    receives: 'Framing complete. Blocking installed at all device locations.',
    handsOff: 'All rough-in complete. Inspection passed. Panel circuits labeled. No open penetrations in fire-rated assemblies.'
  },
  'HVAC': {
    receives: 'Framing complete. Ceiling and wall cavities accessible.',
    handsOff: 'All ductwork complete. Equipment installed. Inspection passed. All penetrations sealed.'
  },
  'Insulation': {
    receives: 'All rough mechanical inspections passed. No open penetrations remaining.',
    handsOff: 'Insulation inspection passed. No walls closed before inspection.'
  },
  'Drywall': {
    receives: 'Insulation inspection passed. All blocking confirmed in place. No open penetrations.',
    handsOff: 'All surfaces finished to specified level. Corners straight. Ready for paint. Drywall dust cleaned from all surfaces including floors, cabinets if installed, and window sills.'
  },
  'Waterproofing': {
    receives: 'Shower substrate complete and dry. Framing and blocking confirmed correct for shower application.',
    handsOff: 'Flood test passed and documented with photograph. Written sign-off from Honeycomb on file. Surface ready for tile.'
  },
  'Tile': {
    receives: 'Waterproofing flood test passed and signed off by Honeycomb. Drywall complete and primed in adjacent areas. Cabinet layout approved so tile cuts at cabinets are correct.',
    handsOff: 'All tile installed, grouted, and sealed. All installation debris removed. Floor tile protected with Ram Board or equivalent until project complete.'
  },
  'Cabinetry': {
    receives: 'Flooring complete if flooring runs under cabinets, or subfloor prepared to correct height if cabinets sit on subfloor. Walls drywalled and primed. Rough plumbing and electrical confirmed correct for cabinet layout.',
    handsOff: 'All cabinets installed, plumb, level, and functioning. Hardware installed. Countertop surface clean and ready for template. Area clean of cabinet packaging and debris.'
  },
  'Countertops': {
    receives: 'Cabinets fully installed and confirmed level by Honeycomb. Sink and faucet specifications confirmed. Minimum one week after cabinet installation confirmation before template.',
    handsOff: 'Countertop installed. Seams polished. Sink cutout confirmed. Caulk joint complete. Area clean and ready for finish plumbing.'
  },
  'Finish Plumbing': {
    receives: 'Countertops installed. Sink cutout confirmed. Tile complete. Cabinet installation complete.',
    handsOff: 'All fixtures installed and tested. No leaks. Operational confirmation documented.'
  },
  'Finish Electrical': {
    receives: 'Drywall painted. Tile complete. Cabinet installation complete.',
    handsOff: 'All fixtures and devices installed and operational. Final inspection passed.'
  },
  'Painting': {
    receives: 'Drywall finish complete and ready for paint per specified level. All trim installed and nail holes filled. Tile complete. Cabinets installed and protected.',
    handsOff: 'All surfaces painted to specified coats and sheen. All masking removed. No paint on adjacent surfaces. Floor protection reinstalled after painting if removed.'
  },
  'Finish Carpentry': {
    receives: 'Painting complete or painting sequence confirmed with Honeycomb. Flooring installed.',
    handsOff: 'All trim installed, filled, sanded. Ready for paint touch-up if needed.'
  },
  'Flooring': {
    receives: 'Drywall complete. All wet trades complete. Subfloor confirmed flat to manufacturer specification.',
    handsOff: 'Flooring installed. Transitions installed. Subfloor documentation complete if remediation was required. Floor protected with Ram Board or equivalent.'
  },
  'Final': {
    receives: 'All punch list items complete and approved by Honeycomb.',
    handsOff: 'Property in move-in ready condition.'
  },
  'Glass': {
    receives: 'Tile complete and cured. Shower pan confirmed level.',
    handsOff: 'Glass enclosure installed and functioning. Hardware operational. Silicone joints complete.'
  },
  'Appliances': {
    receives: 'Cabinets and countertops installed. All utility connections accessible.',
    handsOff: 'All appliances installed, connected, and tested. Protective film removed. Warranties provided.'
  }
};

// Helper: find exclusions/completion/handoffs for a trade by matching keys
function getTradeExclusions(tradeName) {
  const name = tradeName.toLowerCase();
  for (const [key, val] of Object.entries(TRADE_EXCLUSIONS)) {
    if (name.includes(key.toLowerCase())) return val;
  }
  return null;
}

function getTradeCompletion(tradeName) {
  const name = tradeName.toLowerCase();
  for (const [key, val] of Object.entries(TRADE_COMPLETION)) {
    if (name.includes(key.toLowerCase())) return val;
  }
  return null;
}

function getTradeHandoff(tradeName) {
  const name = tradeName.toLowerCase();
  for (const [key, val] of Object.entries(TRADE_HANDOFFS)) {
    if (name.includes(key.toLowerCase())) return val;
  }
  return null;
}

// Generate exclusions + completion + handoff HTML for a set of trade indices
function renderTradeExclusionsAndCompletion(inst, tradeIndices) {
  let html = '';
  const allExclusions = [];
  const allCompletions = [];
  const allReceives = [];
  const allHandsOff = [];

  tradeIndices.forEach(tIdx => {
    const trade = inst.trades[tIdx];
    if (!trade) return;
    const excl = getTradeExclusions(trade.name) || getTradeExclusions(trade.sub || '');
    if (excl) excl.forEach(e => { if (!allExclusions.includes(e)) allExclusions.push(e); });
    const comp = getTradeCompletion(trade.name) || getTradeCompletion(trade.sub || '');
    if (comp && !allCompletions.includes(comp)) allCompletions.push(comp);
    const handoff = getTradeHandoff(trade.name) || getTradeHandoff(trade.sub || '');
    if (handoff) {
      if (handoff.receives && !allReceives.includes(handoff.receives)) allReceives.push(handoff.receives);
      if (handoff.handsOff && !allHandsOff.includes(handoff.handsOff)) allHandsOff.push(handoff.handsOff);
    }
  });

  if (allExclusions.length > 0) {
    html += `<div class="sow-exclusions-block"><strong>NOT INCLUDED IN THIS SCOPE:</strong><ul>`;
    allExclusions.forEach(e => { html += `<li>${e}</li>`; });
    html += `</ul></div>`;
  }

  if (allCompletions.length > 0) {
    html += `<div class="sow-completion-block"><strong>WORK IS COMPLETE WHEN:</strong>`;
    allCompletions.forEach(c => { html += `<p>${c}</p>`; });
    html += `</div>`;
  }

  if (allReceives.length > 0 || allHandsOff.length > 0) {
    html += `<div class="sow-handoff-block"><strong>HANDOFF:</strong>`;
    if (allReceives.length > 0) {
      html += `<div class="handoff-section"><div class="handoff-label">RECEIVES FROM PREVIOUS TRADE:</div>`;
      allReceives.forEach(r => { html += `<p>${r}</p>`; });
      html += `<p class="handoff-note">If this condition is not met, the trade must notify Honeycomb before starting work.</p>`;
      html += `</div>`;
    }
    if (allHandsOff.length > 0) {
      html += `<div class="handoff-section"><div class="handoff-label">HANDS OFF TO NEXT TRADE:</div>`;
      allHandsOff.forEach(h => { html += `<p>${h}</p>`; });
      html += `<p class="handoff-note">Honeycomb inspects against these criteria before authorizing the next trade to begin.</p>`;
      html += `</div>`;
    }
    html += `</div>`;
  }

  return html;
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

// ============================================================
// CALIFORNIA COMPLIANCE — mandatory on every document
// ============================================================
function generateCaliforniaCompliance(yearBuilt) {
  let html = `<h2>CALIFORNIA COMPLIANCE</h2>`;

  // ── LEAD AND ASBESTOS ──
  html += `<div class="compliance-section"><div class="compliance-heading">LEAD AND ASBESTOS</div>`;
  const yr = parseInt(yearBuilt);
  if (yr && yr < 1978) {
    html += `<p>This property was constructed before 1978. California law requires contractors to follow lead-safe work practices on all renovation, repair, and painting projects. The contractor is responsible for compliance with EPA RRP rules and California OSHA requirements for lead-safe work practices. Honeycomb will provide the EPA lead disclosure pamphlet to the homeowner prior to construction start. No sanding, cutting, or demolition of painted surfaces may occur without compliance with these requirements.</p>`;
  } else {
    html += `<p>Structure built 1978 or later. Lead and asbestos disclosure requirements under EPA RRP rules do not apply. If suspect materials are encountered during demolition, stop work and notify Honeycomb immediately.</p>`;
  }
  html += `</div>`;

  // ── LIEN RIGHTS NOTIFICATION ──
  html += `<div class="compliance-section"><div class="compliance-heading">LIEN RIGHTS NOTIFICATION</div>`;
  html += `<p><strong>NOTICE TO OWNER:</strong> Under California law, those who furnish labor, services, equipment, or materials for this project may have a claim against the property if they are not paid. This claim is known as a mechanic\u2019s lien. If a mechanic\u2019s lien is recorded against your property, it could result in loss of the property. You may wish to protect yourself against this consequence by requesting your contractor to obtain a lien release from all persons who furnish labor, services, equipment, or materials for this project. A preliminary 20-day notice is required to preserve lien rights in California. Subcontractors and material suppliers must serve this notice within 20 days of first furnishing labor or materials.</p>`;
  html += `</div>`;

  // ── TITLE 24 ENERGY COMPLIANCE ──
  // Check if any scope items trigger Title 24
  const title24Keywords = ['window', 'door', 'hvac', 'duct', 'lighting', 'light', 'recessed', 'pendant', 'insulation', 'water heater', 'mini-split'];
  let title24Triggered = false;
  moduleInstances.forEach(inst => {
    const data = scopeData[inst.key] || {};
    inst.trades.forEach((trade, tIdx) => {
      const tradeData = data[tIdx] || {};
      Object.entries(tradeData).forEach(([iIdx, itemData]) => {
        if (!itemData.included) return;
        const itemDef = trade.items[parseInt(iIdx)];
        if (!itemDef) return;
        const nameLC = itemDef.name.toLowerCase();
        const tradeLC = trade.name.toLowerCase();
        if (title24Keywords.some(kw => nameLC.includes(kw) || tradeLC.includes(kw))) {
          title24Triggered = true;
        }
      });
    });
  });

  html += `<div class="compliance-section"><div class="compliance-heading">TITLE 24 ENERGY COMPLIANCE</div>`;
  if (title24Triggered) {
    html += `<p>This scope includes work that triggers California Title 24 energy compliance requirements. Honeycomb will confirm compliance requirements with the permitting authority prior to permit submission. Any compliance measures required will be incorporated into the relevant trade scope by written revision before work begins. Contractors must not proceed with triggered work until Title 24 compliance measures are confirmed in writing by Honeycomb.</p>`;
  } else {
    html += `<p>No Title 24 energy compliance triggers identified in this scope. If during construction any work is added that includes window or door replacement, HVAC equipment or ductwork, lighting changes, insulation, or water heater replacement, notify Honeycomb before proceeding.</p>`;
  }
  html += `</div>`;

  // ── OSHA AND DUST CONTROL ──
  // Check if demolition is in scope
  let hasDemolition = false;
  moduleInstances.forEach(inst => {
    const data = scopeData[inst.key] || {};
    inst.trades.forEach((trade, tIdx) => {
      if (trade.name.toLowerCase().includes('demolition') || (trade.sub && trade.sub.toLowerCase() === 'demo')) {
        const tradeData = data[tIdx] || {};
        if (Object.values(tradeData).some(item => item.included)) {
          hasDemolition = true;
        }
      }
    });
  });

  html += `<div class="compliance-section"><div class="compliance-heading">OSHA AND DUST CONTROL</div>`;
  if (hasDemolition) {
    html += `<p>All demolition work must comply with California OSHA requirements for dust control and debris management. Contractor must use appropriate containment and HEPA filtration where required. Contractor is responsible for compliance with applicable air quality regulations. Failure to comply is the contractor\u2019s sole responsibility.</p>`;
  } else {
    html += `<p>No demolition in this scope. If demolition is added by change order, OSHA dust and debris requirements apply.</p>`;
  }
  html += `</div>`;

  return html;
}

// ============================================================
// TL;DR DATA — Quick-reference summaries for Trade Version
// ============================================================
const TRADE_TLDR = {
  'Demolition': {
    doing: 'Remove all existing materials as listed in the scope items below',
    supplying: 'Dumpster, labor, and hauling. Honeycomb provides floor protection and dust barriers',
    done: 'All listed items removed, debris hauled, area broom clean and ready for rough trades',
    stopWork: 'Do not begin demolition before confirming salvage list with Honeycomb. Do not remove structural elements without engineer approval on file'
  },
  'Framing': {
    doing: 'Complete all framing modifications, blocking, and structural work per plans',
    supplying: 'All framing lumber, fasteners, hardware, and structural connectors',
    done: 'All framing complete, blocking installed per schedule, framing inspection passed, dimensions verified',
    stopWork: 'Do not close any walls before Honeycomb inspection and photo documentation. Do not proceed without engineer-stamped plans for structural work'
  },
  'Plumbing': {
    doing: 'Rough in all water supply, drain, waste, and vent lines per fixture specifications',
    supplying: 'All rough plumbing materials including pipe, fittings, valves, and stubs',
    done: 'All rough-in locations match specs, inspection passed, stubs capped and labeled',
    stopWork: 'Do not stub out before confirming fixture specs with Honeycomb. Do not cover any plumbing before inspection'
  },
  'Electrical': {
    doing: 'Rough in all circuits, outlets, and switch locations per electrical plan',
    supplying: 'All rough electrical materials including wire, boxes, conduit, and panel breakers',
    done: 'All circuits roughed in per plan, inspection passed, circuits labeled at panel',
    stopWork: 'Do not close any walls before electrical inspection. Do not proceed without confirmed fixture and appliance specs'
  },
  'HVAC': {
    doing: 'Install or modify ductwork and mechanical ventilation per plans',
    supplying: 'All ductwork, fittings, equipment, and exhaust components',
    done: 'All ductwork installed, inspection passed, exhaust fans ducted to exterior and tested',
    stopWork: 'Do not cover ductwork before inspection. Do not install equipment without confirming location with Honeycomb'
  },
  'Drywall': {
    doing: 'Install, tape, and finish all drywall surfaces to specified level',
    supplying: 'All drywall sheets, tape, mud, corner bead, and finishing materials',
    done: 'All surfaces finished to specified level, no visible seams or fastener heads, ready for paint',
    stopWork: 'Do not hang drywall before all rough inspections have passed. Do not proceed before insulation inspection if applicable'
  },
  'Waterproofing': {
    doing: 'Waterproof shower pan, walls, bench, and niches per specified method',
    supplying: 'All waterproofing membranes, sealants, and test materials',
    done: 'Flood test passed and documented with photograph, Honeycomb written sign-off on file',
    stopWork: 'Do not tile before receiving written flood test sign-off from Honeycomb. Do not proceed with flood test before Honeycomb is notified'
  },
  'Tile': {
    doing: 'Install floor and shower tile per the layout approved by Honeycomb',
    supplying: 'Adhesive, grout, grout sealer, and all installation materials. Tile supplied by Honeycomb',
    done: 'All tile installed, grouted, sealed, no lippage exceeding 1/16 inch on floor or 1/32 inch on wall, all debris removed',
    stopWork: 'Do not start tile before receiving written flood test sign-off. Do not grout before layout is approved on site'
  },
  'Cabinetry': {
    doing: 'Install all cabinets plumb, level, and per approved layout',
    supplying: 'Installation hardware, shims, screws, and fillers. Cabinets supplied by Honeycomb',
    done: 'All cabinets plumb and level within 1/8 inch, doors and drawers functioning, hardware installed',
    stopWork: 'Do not install cabinets before confirming floor is level and drywall is complete. Do not drill countertop template holes without Honeycomb approval'
  },
  'Countertops': {
    doing: 'Template, fabricate, and install countertops per specifications',
    supplying: 'Countertop material, fabrication, adhesive, and caulk. Material selected by owner',
    done: 'Countertop installed with no chips or cracks, seams tight, sink cutout correct, caulk complete',
    stopWork: 'Do not template before cabinets are confirmed level by Honeycomb. Do not cut sink hole before confirming sink model'
  },
  'Finish Plumbing': {
    doing: 'Install all plumbing fixtures and connect to rough-in stubs',
    supplying: 'Supply lines, wax rings, caulk, and connection hardware. Fixtures supplied by owner',
    done: 'All fixtures installed and operational, no leaks after 24 hours, water pressure tested',
    stopWork: 'Do not install fixtures before countertops and tile are complete. Do not connect disposal before electrical is confirmed live'
  },
  'Finish Electrical': {
    doing: 'Install all light fixtures, devices, and covers',
    supplying: 'Wire nuts, plates, and mounting hardware. Fixtures supplied by owner',
    done: 'All fixtures and devices installed and operational, final inspection passed',
    stopWork: 'Do not install fixtures before paint is complete. Do not energize circuits before final inspection'
  },
  'Painting': {
    doing: 'Prep, prime, and paint all surfaces to specified coats and sheen',
    supplying: 'All paint, primer, caulk, tape, and application materials. Colors selected by owner',
    done: 'All surfaces painted, no visible marks on finish coat, lines clean at transitions, no paint on adjacent surfaces',
    stopWork: 'Do not paint before drywall finish is approved by Honeycomb. Do not remove masking before Honeycomb inspection'
  },
  'Finish Carpentry': {
    doing: 'Install all trim, baseboards, door hardware, and millwork',
    supplying: 'All trim, nails, filler, caulk, and adhesive. Trim material supplied by Honeycomb or owner',
    done: 'All trim installed, joints tight, nail holes filled and sanded, ready for paint',
    stopWork: 'Do not install trim before flooring is complete. Do not cut trim without confirming profile with Honeycomb'
  },
  'Flooring': {
    doing: 'Prepare subfloor and install flooring per manufacturer requirements',
    supplying: 'Adhesive, underlayment, transitions, and installation materials. Flooring material supplied by owner',
    done: 'Flooring installed per manufacturer spec, transitions installed, debris removed',
    stopWork: 'Do not install before subfloor flatness is confirmed. Do not remove floor protection until Honeycomb authorizes'
  },
  'Final': {
    doing: 'Complete final cleanup, testing, punch list, and client walkthrough',
    supplying: 'Cleaning supplies and touch-up materials',
    done: 'Property in move-in ready condition, all surfaces clean, no construction debris remaining',
    stopWork: 'Do not schedule client walkthrough before all punch list items are complete and approved by Honeycomb'
  },
  'Glass': {
    doing: 'Measure, fabricate, and install glass shower enclosure per specifications',
    supplying: 'Glass panels, hardware, silicone, and all mounting materials',
    done: 'Enclosure installed plumb and level, hardware functioning, door swings freely, silicone complete',
    stopWork: 'Do not measure before tile is complete and cured. Do not install before confirming hardware finish with Honeycomb'
  },
  'Appliances': {
    doing: 'Install all appliances and connect to utilities',
    supplying: 'Connection hardware, gas flex lines, and power cords as needed. Appliances supplied by owner',
    done: 'All appliances installed, connected, tested, protective film removed, warranties provided',
    stopWork: 'Do not install before cabinets and countertops are complete. Do not connect gas without confirming shut-off valve is accessible'
  }
};

// ============================================================
// TL;DR RENDER HELPER
// ============================================================
function renderTLDR(tradeName) {
  const name = tradeName.toLowerCase();
  let tldr = null;
  for (const [key, val] of Object.entries(TRADE_TLDR)) {
    if (name.includes(key.toLowerCase())) { tldr = val; break; }
  }
  if (!tldr) return '';
  return `<div class="sow-tldr"><div class="tldr-title">TL;DR — ${tradeName.toUpperCase()}</div>
    <strong>What you are doing:</strong> ${typeof tldr.doing === 'function' ? tldr.doing() : tldr.doing}<br>
    <strong>What you are responsible for supplying:</strong> ${tldr.supplying}<br>
    <strong>What done looks like:</strong> ${tldr.done}<br>
    <strong>What you must not do before notifying Honeycomb:</strong> ${tldr.stopWork}
  </div>`;
}

// ============================================================
// CLIENT NARRATIVE HELPER — strips technical jargon
// ============================================================
function toNarrativeClient(itemName, detail, notes, qty) {
  if (narrativeMap[itemName]) {
    const result = narrativeMap[itemName](detail, notes, qty);
    if (result === null) return null;
    let text = result;
    text = text.replace(/<span class="no-plan-ref">.*?<\/span>/g, '');
    text = text.replace(/\[Sheet.*?\]/g, '');
    text = text.replace(/\[NO PLAN REFERENCE.*?\]/g, '');
    text = text.replace(/per architectural plans/g, 'per your approved design');
    text = text.replace(/per code/g, 'to meet building requirements');
    text = text.replace(/per plans/g, 'per your approved design');
    text = text.replace(/per design plans/g, 'as designed');
    text = text.replace(/GFCI-protected/g, 'safety');
    text = text.replace(/rough-in/g, 'preparation');
    return text;
  }
  let text = itemName;
  if (detail && detail !== 'Yes' && detail !== 'N/A') text += ` (${detail})`;
  return text;
}

function generateSOW(returnOnly) {
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
  const version = document.getElementById('sowVersion').value || '1.0';
  const status = document.getElementById('sowStatus').value || 'PRELIMINARY';
  const revisionNotes = document.getElementById('sowRevisionNotes').value || 'Initial issue.';

  // Input source
  const inputSource = getInputSourceText();
  const siteWalkOnly = isSiteWalkOnly();

  // Force PRELIMINARY if site walk only
  const effectiveStatus = siteWalkOnly ? 'PRELIMINARY' : status;

  // Supersedes notice
  let sow = `<div class="sow-supersedes">THIS IS VERSION ${version} DATED ${today}. THIS DOCUMENT SUPERSEDES ALL PREVIOUS VERSIONS. DO NOT WORK FROM A PREVIOUS VERSION.</div>`;

  // Preliminary scope warning (site walk only)
  if (siteWalkOnly) {
    sow += `<div class="sow-preliminary-warning"><strong>PRELIMINARY SCOPE \u2014 SITE WALK ONLY</strong><br>This scope was generated from site walk observations without plans or design documents. It is subject to revision once architectural plans and design documents are available. Do not use this document for bidding without Honeycomb review and written approval. STATUS WILL CHANGE TO APPROVED ONLY AFTER PLAN AND DOCUMENT REVIEW IS COMPLETE.</div>`;
  }

  sow += `<h1>HONEYCOMB DESIGN AND REMODELING<br>SCOPE OF WORK</h1>`;
  sow += `<div class="sow-meta">
    <strong>PROJECT:</strong> ${address}<br>
    <strong>CLIENT:</strong> ${client}<br>
    ${propType ? `${propType} | ` : ''}${sf ? `${sf} SF | ` : ''}${bedsBaths ? `${bedsBaths} | ` : ''}${yearBuilt ? `Year Built: ${yearBuilt}` : ''}<br>
    ${projType ? `<strong>Scope:</strong> ${projType}<br>` : ''}
    <strong>Date:</strong> ${today}<br>
    ${designFirm ? `<strong>Design:</strong> ${designFirm}<br>` : ''}
    <strong>Version:</strong> ${version} | <strong>Status:</strong> ${effectiveStatus}<br>
    <strong>Revision Date:</strong> ${today}<br>
    <strong>Revision Notes:</strong> ${revisionNotes}<br>
    <strong>Input Source:</strong> ${inputSource}
  </div>`;

  // After first generation, show the Revision button
  sowGenerated = true;
  document.getElementById('btnRevision').style.display = 'inline-block';

  // ── CALIFORNIA COMPLIANCE (mandatory, every document) ──
  sow += generateCaliforniaCompliance(yearBuilt);

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
        // Add TL;DR for this trade
        sow += renderTLDR(trade.name);
        sow += `<ol class="narrative-items">`;
        items.forEach(text => { sow += `<li>${text}</li>`; });
        sow += `</ol>`;
        sow += renderTradeExclusionsAndCompletion(inst, [tIdx]);
        sow += `<!-- INTERNAL_NOTES_MARKER:${trade.name} -->`;
        sow += `</div>`;
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

      // Add TL;DR for each trade in this phase
      phase.trades.forEach(tIdx => {
        const trade = inst.trades[tIdx];
        if (trade && allPhaseItems[tIdx]) {
          sow += renderTLDR(trade.name);
        }
      });

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

      // Add exclusions and completion criteria for this phase's trades
      sow += renderTradeExclusionsAndCompletion(inst, phase.trades);
      sow += `<!-- INTERNAL_NOTES_MARKER:${phase.heading} -->`;

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

    // Owner-Provided Materials list
    const ownerMaterialsByModule = {
      'kitchen': [
        'Kitchen cabinets and cabinet hardware',
        'Countertops (granite, quartz, marble, etc.)',
        'Kitchen appliances (refrigerator, range, dishwasher, microwave, garbage disposal)',
        'Flooring materials (tile, hardwood, luxury vinyl, etc.)',
        'Backsplash tile and materials',
        'Paint colors and finishes',
        'Plumbing fixtures (sink, faucet)',
        'Light fixtures and electrical devices',
        'Window treatments'
      ],
      'bathroom': [
        'Bathroom vanity and vanity top',
        'Plumbing fixtures (toilet, sink, faucet, shower fixtures)',
        'Flooring materials (tile, luxury vinyl, etc.)',
        'Wall tile for shower and backsplash areas',
        'Paint colors and finishes',
        'Light fixtures and electrical devices',
        'Bathroom accessories and hardware',
        'Mirror and medicine cabinet',
        'Glass shower enclosure (if applicable)',
        'Window treatments'
      ],
      'laundry': [
        'Laundry appliances (washer, dryer)',
        'Cabinets and countertops',
        'Flooring materials',
        'Paint colors and finishes',
        'Light fixtures and electrical devices',
        'Hardware and accessories'
      ],
      'paint': [
        'Paint colors for walls, ceiling, and trim',
        'Accent or specialty finishes'
      ],
      'extpaint': [
        'Exterior paint colors',
        'Specialty coatings or stains'
      ]
    };

    const ownerMats = ownerMaterialsByModule[inst.id] || [];
    if (ownerMats.length > 0) {
      sow += `<div class="sow-owner-materials"><strong>Finishing Materials (Owner Provided):</strong><ul>`;
      ownerMats.forEach(m => { sow += `<li>${m}</li>`; });
      sow += `</ul></div>`;
      sow += `<p class="sow-pricing-note"><em>The quoted price will include all labor, equipment, and substrate material costs for ${moduleTitle.toLowerCase()}. All finish materials to be selected and provided by owner unless otherwise specified.</em></p>`;
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

    sow += `<div class="sow-notes">`;
    sow += `<strong>Important Notes:</strong><ul>`;
    sow += `<li>All finish materials (cabinets, countertops, appliances, flooring, paint, fixtures, hardware) to be selected and provided by owner unless otherwise specified in this scope</li>`;
    sow += `<li>Contractor provides labor and substrate materials only unless explicitly noted</li>`;
    sow += `<li>Drywall texture will match existing unless otherwise specified in room scope above</li>`;
    sow += `<li>Trim where replaced will match existing profile and dimensions unless otherwise specified</li>`;
    sow += `<li>Finish match for existing wood flooring, stain, or paint is not guaranteed due to age, sun exposure, and application variables</li>`;
    sow += `<li>Any unforeseen conditions discovered during construction that require additional work will be addressed via change order process</li>`;
    sow += `<li>Project timeline is dependent on material selections, timely delivery, and permit approval process</li>`;
    sow += `<li>Owner is responsible for timely finish material selections to avoid project delays</li>`;
    sow += `</ul></div>`;
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

  if (returnOnly) return sow;
  document.getElementById('sowOutputTrade').innerHTML = sow;
  document.getElementById('sowOutputContainer').style.display = 'block';
  document.getElementById('sowOutputContainer').scrollIntoView({ behavior: 'smooth' });
}

// ============================================================
// CLIENT VERSION — plain language for homeowner
// ============================================================
function generateClientSOW() {
  const projectName = document.getElementById('projectName').value || 'Untitled Project';
  const address = document.getElementById('propertyAddress').value || '';
  const client = document.getElementById('clientName').value || '';
  const yearBuilt = document.getElementById('yearBuilt').value || '';
  const version = document.getElementById('sowVersion').value || '1.0';
  const status = document.getElementById('sowStatus').value || 'PRELIMINARY';
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  let sow = `<h1 style="font-size:24px;">Honeycomb Design and Remodeling<br>Scope of Work — Client Copy</h1>`;
  sow += `<div class="sow-meta">
    <strong>Project:</strong> ${address}<br>
    <strong>Prepared for:</strong> ${client}<br>
    <strong>Date:</strong> ${today}<br>
    <strong>Version:</strong> ${version} | <strong>Status:</strong> ${status}
  </div>`;

  // Project Overview
  sow += `<h2 style="font-size:18px; border-bottom:2px solid var(--gold); padding-bottom:8px;">Project Overview</h2>`;
  const moduleNames = moduleInstances.map(i => i.label).join(', ');
  sow += `<p style="line-height:1.7; color:#4A5568;">This scope of work describes the renovation of your home at ${address}. The project includes work in the following areas: ${moduleNames}. This document outlines what will be done, what materials are needed, and what to expect during the construction process.</p>`;

  // Room-by-room descriptions
  sow += `<h2 style="font-size:18px; border-bottom:2px solid var(--gold); padding-bottom:8px;">What We Are Doing</h2>`;
  moduleInstances.forEach(inst => {
    const data = scopeData[inst.key] || {};
    let hasItems = false;
    Object.values(data).forEach(trade => {
      Object.values(trade).forEach(item => { if (item.included) hasItems = true; });
    });
    if (!hasItems) return;

    let title = inst.label;
    if (inst.id === 'bathroom') {
      const bn = document.getElementById(`bathname-${inst.key}`)?.value;
      if (bn) title = bn;
    }

    sow += `<h3 style="font-size:16px; color:var(--navy); margin-top:20px;">${title}</h3>`;
    sow += `<p style="line-height:1.7; color:#4A5568;">`;

    // Collect all included items across all trades for this module
    let descriptions = [];
    inst.trades.forEach((trade, tIdx) => {
      const tradeData = data[tIdx] || {};
      Object.entries(tradeData).forEach(([iIdx, itemData]) => {
        if (!itemData.included) return;
        const itemDef = trade.items[parseInt(iIdx)];
        if (!itemDef) return;
        let text = toNarrativeClient(itemDef.name, itemData.detail, itemData.notes, itemData.qty);
        if (text) descriptions.push(text);
      });
    });

    if (descriptions.length > 0) {
      sow += `In this space, we will: `;
      sow += descriptions.map((d, i) => i === 0 ? d.charAt(0).toLowerCase() + d.slice(1) : d.toLowerCase()).join('; ');
      sow += '.';
    }
    sow += `</p>`;
  });

  // Materials and Selections
  const ownerMats = {
    'kitchen': ['Kitchen cabinets and hardware', 'Countertop material and color', 'All kitchen appliances', 'Backsplash tile', 'Flooring material', 'Paint colors', 'Sink and faucet', 'Light fixtures'],
    'bathroom': ['Vanity and vanity top', 'Toilet, sink, faucet, and shower fixtures', 'Floor and wall tile', 'Paint colors', 'Light fixtures', 'Mirror and accessories', 'Shower glass (if applicable)'],
    'laundry': ['Washer and dryer', 'Cabinets and countertop', 'Flooring', 'Paint colors'],
    'paint': ['Paint colors for all rooms'],
    'extpaint': ['Exterior paint colors']
  };

  sow += `<h2 style="font-size:18px; border-bottom:2px solid var(--gold); padding-bottom:8px;">Materials and Selections</h2>`;
  sow += `<p style="line-height:1.7; color:#4A5568;">Honeycomb provides all labor and construction materials (framing, drywall, plumbing and electrical supplies, etc.). You are responsible for selecting and providing the finishing materials listed below. We are happy to help guide your selections.</p>`;
  moduleInstances.forEach(inst => {
    const mats = ownerMats[inst.id];
    if (mats && mats.length > 0) {
      sow += `<p style="margin:8px 0 4px 0;"><strong>${inst.label}:</strong></p><ul style="margin:0 0 8px 20px; color:#4A5568;">`;
      mats.forEach(m => { sow += `<li>${m}</li>`; });
      sow += `</ul>`;
    }
  });

  // What to Expect
  sow += `<h2 style="font-size:18px; border-bottom:2px solid var(--gold); padding-bottom:8px;">What to Expect During Construction</h2>`;
  sow += `<p style="line-height:1.7; color:#4A5568;">Your renovation will proceed through the following phases. Each phase must be completed and inspected before the next begins.</p>`;
  sow += `<ol style="line-height:1.8; color:#4A5568;">`;
  sow += `<li><strong>Demolition</strong> — Removal of existing materials. Your home will be dusty and noisy during this phase. We install dust barriers and floor protection before beginning. Typically 1\u20133 days depending on scope.</li>`;
  sow += `<li><strong>Rough Construction</strong> — Framing, plumbing pipes, electrical wiring, and ductwork are installed inside the walls. The space will look unfinished. This phase includes city inspections. Typically 1\u20133 weeks.</li>`;
  sow += `<li><strong>Closing Walls</strong> — Insulation, drywall, and initial wall finishing. The rooms begin to take shape. Typically 1\u20132 weeks.</li>`;
  sow += `<li><strong>Finishes</strong> — Tile, cabinets, countertops, flooring, paint, and fixtures are installed. This is when your selections come to life. Typically 2\u20134 weeks depending on scope.</li>`;
  sow += `<li><strong>Final Details</strong> — Hardware, touch-ups, cleaning, and final inspections. We walk through the completed project together before handover. Typically 3\u20135 days.</li>`;
  sow += `</ol>`;

  // Change Orders
  sow += `<h2 style="font-size:18px; border-bottom:2px solid var(--gold); padding-bottom:8px;">Changes During Construction</h2>`;
  sow += `<p style="line-height:1.7; color:#4A5568;">If you would like to change anything after this scope is approved \u2014 whether adding something new, upgrading a material, or modifying the layout \u2014 Honeycomb will prepare a written change order showing the cost and time impact before any work proceeds. No changes are made without your written approval.</p>`;

  // Payment Schedule
  sow += `<h2 style="font-size:18px; border-bottom:2px solid var(--gold); padding-bottom:8px;">Payment Schedule</h2>`;
  sow += `<p style="line-height:1.7; color:#4A5568;">Payments are requested at specific project milestones. You will only be asked to pay after work has been completed and verified. The typical milestone schedule is:</p>`;
  sow += `<ul style="line-height:1.8; color:#4A5568;">`;
  sow += `<li>Upon contract signing (deposit)</li>`;
  sow += `<li>When demolition is complete and verified</li>`;
  sow += `<li>When rough construction passes city inspection</li>`;
  sow += `<li>When cabinets and tile are installed</li>`;
  sow += `<li>Upon project completion and final walkthrough</li>`;
  sow += `</ul>`;
  sow += `<p style="line-height:1.7; color:#4A5568;">Specific payment amounts will be included in your contract.</p>`;

  // California Compliance (simplified for homeowner)
  const yr = parseInt(yearBuilt);
  if (yr && yr < 1978) {
    sow += `<h2 style="font-size:18px; border-bottom:2px solid var(--gold); padding-bottom:8px;">A Note About Your Home</h2>`;
    sow += `<p style="line-height:1.7; color:#4A5568;">Because your home was built before 1978, there is a possibility that some materials contain lead-based paint. This is common in homes of this era and is nothing to be alarmed about. California law requires us to follow specific safety practices when working on surfaces that may contain lead. This means our crew will use protective coverings, proper ventilation, and careful cleanup procedures throughout the project. We will provide you with an EPA informational pamphlet before construction begins. These practices protect you, your family, and our workers.</p>`;
  }

  return sow;
}

// ============================================================
// ESTIMATING INPUT FILE GENERATOR
// ============================================================
function generateEstimatingInput() {
  const address = document.getElementById('propertyAddress').value || 'Unknown';
  const version = document.getElementById('sowVersion').value || '1.0';
  const status = document.getElementById('sowStatus').value || 'PRELIMINARY';
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const yearBuilt = document.getElementById('yearBuilt').value || 'Unknown';
  const projType = document.getElementById('projectType').value || 'Custom';
  const sf = document.getElementById('totalSF').value || 'NOT PROVIDED';
  const occupied = document.getElementById('ownerOccupied')?.value || 'UNKNOWN';
  const yr = parseInt(yearBuilt);
  const prePre1978 = yr && yr < 1978;

  let openItems = [];

  // Header
  let html = `<div class="est-header">`;
  html += `<strong>ESTIMATING INPUT FILE</strong><br>`;
  html += `Project: ${address}<br>`;
  html += `Version: ${version}<br>`;
  html += `Date: ${today}<br>`;
  html += `Status: ${status}<br>`;
  html += `Source: generated from SOW v${version}<br><br>`;
  html += `<em>Note: labor scope and quantities only. The estimating engine prices labor. Materials are handled separately.</em>`;
  html += `</div>`;

  // Project Basics
  html += `<div class="est-trade-block">`;
  html += `<div class="est-trade-name">PROJECT BASICS</div>`;
  html += `<div class="est-field"><strong>Structure year built:</strong> ${yearBuilt}</div>`;
  html += `<div class="est-field"><strong>Project type:</strong> ${projType}</div>`;
  html += `<div class="est-field"><strong>Total scope area in square feet:</strong> ${sf === 'NOT PROVIDED' ? '<span class="est-unknown">NOT PROVIDED</span>' : sf}</div>`;
  html += `<div class="est-field"><strong>Number of rooms in scope:</strong> ${moduleInstances.length}</div>`;
  html += `<div class="est-field"><strong>Occupied during construction:</strong> ${occupied === 'Yes - phased approach needed' ? 'YES' : occupied === 'No' ? 'NO' : 'UNKNOWN'}</div>`;
  if (sf === 'NOT PROVIDED' || !sf) openItems.push('Total scope area in square feet — not provided');
  html += `</div>`;

  // Trades in Scope
  html += `<h2 style="font-size:18px; margin-top:24px; border-bottom:2px solid var(--navy); padding-bottom:6px; font-family:monospace;">TRADES IN SCOPE</h2>`;

  moduleInstances.forEach(inst => {
    const data = scopeData[inst.key] || {};
    let moduleTitle = inst.label;
    if (inst.id === 'bathroom') {
      const bn = document.getElementById(`bathname-${inst.key}`)?.value;
      if (bn) moduleTitle = bn;
    }

    inst.trades.forEach((trade, tIdx) => {
      const tradeData = data[tIdx] || {};
      const includedItems = [];
      let quantities = [];
      let hasUnknownQty = false;

      Object.entries(tradeData).forEach(([iIdx, itemData]) => {
        if (!itemData.included) return;
        const itemDef = trade.items[parseInt(iIdx)];
        if (!itemDef) return;

        let desc = itemDef.name;
        if (itemData.detail && itemData.detail !== 'Yes') desc += ` (${itemData.detail})`;
        includedItems.push(desc);

        // Collect quantities
        if (itemDef.hasQty && itemData.qty) {
          quantities.push(`${itemDef.name}: ${itemData.qty} ${itemDef.unit || 'EA'}`);
        } else if (itemDef.hasQty && !itemData.qty) {
          quantities.push(`${itemDef.name}: <span class="est-unknown">UNKNOWN</span>`);
          hasUnknownQty = true;
          openItems.push(`${moduleTitle} — ${trade.name}: ${itemDef.name} quantity unknown`);
        }
      });

      if (includedItems.length === 0) return;

      html += `<div class="est-trade-block">`;
      html += `<div class="est-trade-name">TRADE: ${trade.name} (${moduleTitle})</div>`;

      // Labor Scope
      html += `<div class="est-field"><strong>LABOR SCOPE:</strong> ${includedItems.join('. ')}.</div>`;

      // Quantities
      html += `<div class="est-field"><strong>QUANTITIES:</strong>`;
      if (quantities.length > 0) {
        html += `<ul style="margin:4px 0 0 20px;">`;
        quantities.forEach(q => { html += `<li>${q}</li>`; });
        html += `</ul>`;
      } else {
        html += ` Lump sum scope — no unit quantities applicable.`;
      }
      html += `</div>`;

      // Complexity Flags
      let flags = [];
      if (prePre1978) flags.push('Pre-1978 structure — lead-safe work practices required');
      if (occupied === 'Yes - phased approach needed') flags.push('Occupied home — phased approach needed');
      // Check for specific complexity indicators
      includedItems.forEach(item => {
        const lc = item.toLowerCase();
        if (lc.includes('relocat')) flags.push('Relocation work — increased labor');
        if (lc.includes('custom')) flags.push('Custom work — non-standard labor');
        if (lc.includes('load-bearing') || lc.includes('structural')) flags.push('Structural work — engineering coordination required');
        if (lc.includes('curbless')) flags.push('Curbless shower — precision slope work required');
        if (lc.includes('herringbone') || lc.includes('chevron')) flags.push('Complex pattern layout — increased tile labor');
        if (lc.includes('level 5')) flags.push('Level 5 drywall finish — premium labor');
        if (lc.includes('waterfall')) flags.push('Waterfall edge countertop — fabrication complexity');
      });
      // Deduplicate
      flags = [...new Set(flags)];

      html += `<div class="est-field"><strong>COMPLEXITY FLAGS:</strong>`;
      if (flags.length > 0) {
        html += `<ul style="margin:4px 0 0 20px;">`;
        flags.forEach(f => { html += `<li>${f}</li>`; });
        html += `</ul>`;
      } else {
        html += ` None identified — standard conditions.`;
      }
      html += `</div>`;

      // Notes
      let tradeNotes = [];
      Object.entries(tradeData).forEach(([iIdx, itemData]) => {
        if (itemData.included && itemData.notes) {
          const itemDef = trade.items[parseInt(iIdx)];
          if (itemDef) tradeNotes.push(`${itemDef.name}: ${itemData.notes}`);
        }
      });
      html += `<div class="est-field"><strong>NOTES:</strong> ${tradeNotes.length > 0 ? tradeNotes.join('. ') : 'None.'}</div>`;

      html += `</div>`;
    });
  });

  // Open Items
  if (openItems.length > 0) {
    html += `<div class="est-open-items">`;
    html += `<strong>OPEN ITEMS — RESOLVE BEFORE FINAL ESTIMATE</strong>`;
    html += `<ul style="margin:8px 0 0 20px;">`;
    openItems.forEach(item => { html += `<li>${item}</li>`; });
    html += `</ul>`;
    html += `</div>`;
  } else {
    html += `<div class="est-summary"><strong>All quantities confirmed. Estimate can proceed.</strong></div>`;
  }

  // Summary notice
  const addrSlug = address.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
  const filename = `${addrSlug}-Estimating-Input-v${version}.md`;

  html += `<div class="est-summary">`;
  html += `<strong>ESTIMATING INPUT FILE GENERATED</strong><br>`;
  html += `Saved as: <code>${filename}</code><br><br>`;
  if (openItems.length > 0) {
    html += `<strong>Open items before estimate can be finalized:</strong><br>`;
    html += `<ul style="margin:4px 0 8px 20px;">`;
    openItems.forEach(item => { html += `<li>${item}</li>`; });
    html += `</ul>`;
  }
  html += `<strong>Recommended next step:</strong> send this file to the estimating engine. `;
  if (openItems.length > 0) {
    html += `For any open items, resolve before requesting a final estimate. A preliminary estimate can be run with UNKNOWN quantities flagged as ranges.`;
  } else {
    html += `All quantities confirmed — request final estimate.`;
  }
  html += `</div>`;

  return html;
}

// ============================================================
// THREE-VERSION ORCHESTRATION
// ============================================================
function generateAllVersions() {
  const doClient = document.getElementById('genClient').checked;
  const doTrade = document.getElementById('genTrade').checked;
  const doInternal = document.getElementById('genInternal').checked;

  if (!doClient && !doTrade && !doInternal) {
    alert('Please select at least one version to generate.');
    return;
  }

  // Show revision button after first generation
  sowGenerated = true;
  document.getElementById('btnRevision').style.display = 'inline-block';

  // Build tabs
  let tabs = '';
  let firstTab = '';

  if (doClient) {
    const clientHTML = generateClientSOW();
    document.getElementById('sowOutputClient').innerHTML = clientHTML;
    document.getElementById('sowOutputClient').style.display = 'none';
    tabs += `<button class="sow-version-tab" onclick="switchSOWTab('Client')" id="tab-Client">Client Version</button>`;
    if (!firstTab) firstTab = 'Client';
  }

  if (doTrade) {
    generateSOW(); // This writes to sowOutputTrade
    document.getElementById('sowOutputTrade').style.display = 'none';
    tabs += `<button class="sow-version-tab" onclick="switchSOWTab('Trade')" id="tab-Trade">Trade Version</button>`;
    if (!firstTab) firstTab = 'Trade';
  }

  if (doInternal) {
    const tradeHTML = generateSOW(true);
    let internalHTML = tradeHTML;

    // Add internal header
    const internalHeaderHTML = `<div class="sow-internal-block"><div class="internal-title">HONEYCOMB INTERNAL DOCUMENT \u2014 DO NOT SHARE WITH CLIENT OR TRADE</div><p style="margin:4px 0; font-size:13px;">This version contains bid tracking, cost data, and internal notes for Honeycomb team use only.</p></div>`;
    internalHTML = internalHTML.replace('<h1>', internalHeaderHTML + '<h1>');

    // Replace internal notes markers with actual internal blocks
    internalHTML = internalHTML.replace(/<!-- INTERNAL_NOTES_MARKER:(.*?) -->/g, (match, phaseName) => {
      return `<div class="sow-internal-block">
        <div class="internal-title">INTERNAL \u2014 DO NOT SHARE</div>
        <div class="field-row"><span class="field-label">Bid status:</span><span class="field-value">&nbsp;</span></div>
        <div class="field-row"><span class="field-label">Bid type:</span><span class="field-value">&nbsp;</span></div>
        <div class="field-row"><span class="field-label">If anchored, amount shared:</span><span class="field-value">&nbsp;</span></div>
        <div class="field-row"><span class="field-label">Vendor/trade assigned:</span><span class="field-value">&nbsp;</span></div>
        <div class="field-row"><span class="field-label">Contact:</span><span class="field-value">&nbsp;</span></div>
        <div class="field-row"><span class="field-label">Notes:</span><span class="field-value">&nbsp;</span></div>
      </div>`;
    });

    // Add draw tracking table
    internalHTML += `<div class="sow-internal-block">
      <div class="internal-title">INTERNAL \u2014 DRAW TRACKING (Andrea's Use \u2014 Do Not Share)</div>
      <table class="sow-draw-table">
        <thead><tr><th>Milestone</th><th>Confirmed By</th><th>Date Confirmed</th><th>Draw Amount</th><th>Invoice Prepared</th><th>Invoice Sent</th><th>Payment Received</th></tr></thead>
        <tbody>
          <tr><td>Contract signing (deposit)</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr><td>Demolition complete</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr><td>Rough inspections passed</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr><td>Cabinets and tile installed</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr><td>Substantial completion</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr><td>Final walkthrough approved</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
        </tbody>
      </table>
    </div>`;

    document.getElementById('sowOutputInternal').innerHTML = internalHTML;
    document.getElementById('sowOutputInternal').style.display = 'none';
    tabs += `<button class="sow-version-tab" onclick="switchSOWTab('Internal')" id="tab-Internal">Internal Version</button>`;
    if (!firstTab) firstTab = 'Internal';
  }

  // Always generate Estimating Input
  const estHTML = generateEstimatingInput();
  document.getElementById('sowOutputEstimating').innerHTML = estHTML;
  document.getElementById('sowOutputEstimating').style.display = 'none';
  tabs += `<button class="sow-version-tab" onclick="switchSOWTab('Estimating')" id="tab-Estimating">Estimating Input</button>`;

  document.getElementById('sowVersionTabs').innerHTML = tabs;
  document.getElementById('sowOutputContainer').style.display = 'block';

  // Activate first tab
  if (firstTab) switchSOWTab(firstTab);
  document.getElementById('sowOutputContainer').scrollIntoView({ behavior: 'smooth' });
}

function switchSOWTab(type) {
  // Hide all
  ['Client', 'Trade', 'Internal', 'Estimating'].forEach(t => {
    const el = document.getElementById('sowOutput' + t);
    if (el) el.style.display = 'none';
    const tab = document.getElementById('tab-' + t);
    if (tab) tab.classList.remove('active');
  });
  // Show selected
  const el = document.getElementById('sowOutput' + type);
  if (el) el.style.display = 'block';
  const tab = document.getElementById('tab-' + type);
  if (tab) tab.classList.add('active');
  // Store active tab for copy
  window._activeSOWTab = type;
}

function copyActiveSOW() {
  const type = window._activeSOWTab || 'Trade';
  const el = document.getElementById('sowOutput' + type);
  if (!el) return;
  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  document.execCommand('copy');
  sel.removeAllRanges();
  // Flash feedback
  const btn = document.querySelector('#sowOutputContainer .btn-primary');
  if (btn) {
    const orig = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = orig, 2000);
  }
}

function copySOW() {
  copyActiveSOW();
}

// ============================================================
// INIT
// ============================================================
renderModuleGrid();
