export interface Trade {
  id: string;
  nameKey: string;
  icon: string;
  color: string;
  gradient: string;
  demoPath: string;
}

export const trades: Trade[] = [
  { id: 'plumbing', nameKey: 'trade.plumbing', icon: '🔧', color: 'from-blue-500 to-cyan-400', gradient: 'bg-gradient-to-br from-blue-500 to-cyan-400', demoPath: '/demo/plumbing' },
  { id: 'electrical', nameKey: 'trade.electrical', icon: '⚡', color: 'from-yellow-400 to-orange-500', gradient: 'bg-gradient-to-br from-yellow-400 to-orange-500', demoPath: '/demo/electrical' },
  { id: 'building', nameKey: 'trade.building', icon: '🏗️', color: 'from-stone-500 to-amber-600', gradient: 'bg-gradient-to-br from-stone-500 to-amber-600', demoPath: '/demo/building' },
  { id: 'roofing', nameKey: 'trade.roofing', icon: '🏠', color: 'from-red-500 to-rose-600', gradient: 'bg-gradient-to-br from-red-500 to-rose-600', demoPath: '/demo/roofing' },
  { id: 'drywall', nameKey: 'trade.drywall', icon: '🧱', color: 'from-gray-400 to-slate-500', gradient: 'bg-gradient-to-br from-gray-400 to-slate-500', demoPath: '/demo/drywall' },
  { id: 'wells', nameKey: 'trade.wells', icon: '💧', color: 'from-blue-600 to-indigo-500', gradient: 'bg-gradient-to-br from-blue-600 to-indigo-500', demoPath: '/demo/wells' },
  { id: 'heating', nameKey: 'trade.heating', icon: '🔥', color: 'from-orange-500 to-red-500', gradient: 'bg-gradient-to-br from-orange-500 to-red-500', demoPath: '/demo/heating' },
  { id: 'solar', nameKey: 'trade.solar', icon: '☀️', color: 'from-yellow-400 to-green-500', gradient: 'bg-gradient-to-br from-yellow-400 to-green-500', demoPath: '/demo/solar' },
  { id: 'heatpumps', nameKey: 'trade.heatpumps', icon: '♨️', color: 'from-teal-400 to-emerald-500', gradient: 'bg-gradient-to-br from-teal-400 to-emerald-500', demoPath: '/demo/heatpumps' },
  { id: 'painting', nameKey: 'trade.painting', icon: '🎨', color: 'from-pink-400 to-purple-500', gradient: 'bg-gradient-to-br from-pink-400 to-purple-500', demoPath: '/demo/painting' },
  { id: 'interior', nameKey: 'trade.interior', icon: '🛋️', color: 'from-amber-400 to-yellow-500', gradient: 'bg-gradient-to-br from-amber-400 to-yellow-500', demoPath: '/demo/interior' },
  { id: 'exterior', nameKey: 'trade.exterior', icon: '🏡', color: 'from-emerald-500 to-teal-400', gradient: 'bg-gradient-to-br from-emerald-500 to-teal-400', demoPath: '/demo/exterior' },
  { id: 'gardening', nameKey: 'trade.gardening', icon: '🌿', color: 'from-green-500 to-lime-400', gradient: 'bg-gradient-to-br from-green-500 to-lime-400', demoPath: '/demo/gardening' },
  { id: 'cleaning', nameKey: 'trade.cleaning', icon: '✨', color: 'from-cyan-400 to-blue-400', gradient: 'bg-gradient-to-br from-cyan-400 to-blue-400', demoPath: '/demo/cleaning' },
  { id: 'locksmith', nameKey: 'trade.locksmith', icon: '🔐', color: 'from-zinc-500 to-gray-600', gradient: 'bg-gradient-to-br from-zinc-500 to-gray-600', demoPath: '/demo/locksmith' },
  { id: 'carpentry', nameKey: 'trade.carpentry', icon: '🪵', color: 'from-amber-600 to-orange-700', gradient: 'bg-gradient-to-br from-amber-600 to-orange-700', demoPath: '/demo/carpentry' },
  { id: 'autorepair', nameKey: 'trade.autorepair', icon: '🔩', color: 'from-red-500 to-orange-600', gradient: 'bg-gradient-to-br from-red-500 to-orange-600', demoPath: '/demo/autorepair' },
  { id: 'pestcontrol', nameKey: 'trade.pestcontrol', icon: '🐛', color: 'from-green-600 to-emerald-500', gradient: 'bg-gradient-to-br from-green-600 to-emerald-500', demoPath: '/demo/pestcontrol' },
  { id: 'photography', nameKey: 'trade.photography', icon: '📷', color: 'from-purple-500 to-pink-500', gradient: 'bg-gradient-to-br from-purple-500 to-pink-500', demoPath: '/demo/photography' },
  { id: 'catering', nameKey: 'trade.catering', icon: '🍽️', color: 'from-amber-500 to-orange-500', gradient: 'bg-gradient-to-br from-amber-500 to-orange-500', demoPath: '/demo/catering' },
  { id: 'fitness', nameKey: 'trade.fitness', icon: '💪', color: 'from-violet-500 to-indigo-600', gradient: 'bg-gradient-to-br from-violet-500 to-indigo-600', demoPath: '/demo/fitness' },
  { id: 'beautysalon', nameKey: 'trade.beautysalon', icon: '💅', color: 'from-pink-500 to-rose-400', gradient: 'bg-gradient-to-br from-pink-500 to-rose-400', demoPath: '/demo/beautysalon' },
  { id: 'moving', nameKey: 'trade.moving', icon: '🚚', color: 'from-cyan-600 to-teal-500', gradient: 'bg-gradient-to-br from-cyan-600 to-teal-500', demoPath: '/demo/moving' },
  { id: 'itservices', nameKey: 'trade.itservices', icon: '💻', color: 'from-blue-500 to-indigo-600', gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600', demoPath: '/demo/itservices' },
  { id: 'eshop', nameKey: 'trade.eshop', icon: '🛍️', color: 'from-violet-600 to-fuchsia-500', gradient: 'bg-gradient-to-br from-violet-600 to-fuchsia-500', demoPath: '/demo/eshop' },
  { id: 'womeninbusiness', nameKey: 'trade.womeninbusiness', icon: '👩‍💼', color: 'from-pink-500 to-fuchsia-500', gradient: 'bg-gradient-to-br from-pink-500 to-fuchsia-500', demoPath: '/demo/womeninbusiness' },
  { id: 'virtualassistant', nameKey: 'trade.virtualassistant', icon: '💻', color: 'from-violet-500 to-purple-600', gradient: 'bg-gradient-to-br from-violet-500 to-purple-600', demoPath: '/demo/virtualassistant' },
  { id: 'weddingplanner', nameKey: 'trade.weddingplanner', icon: '💍', color: 'from-rose-400 to-pink-600', gradient: 'bg-gradient-to-br from-rose-400 to-pink-600', demoPath: '/demo/weddingplanner' },
  { id: 'florist', nameKey: 'trade.florist', icon: '🌸', color: 'from-pink-400 to-rose-500', gradient: 'bg-gradient-to-br from-pink-400 to-rose-500', demoPath: '/demo/florist' },
  { id: 'bakery', nameKey: 'trade.bakery', icon: '🧁', color: 'from-amber-400 to-orange-500', gradient: 'bg-gradient-to-br from-amber-400 to-orange-500', demoPath: '/demo/bakery' },
  { id: 'yoga', nameKey: 'trade.yoga', icon: '🧘‍♀️', color: 'from-purple-400 to-violet-600', gradient: 'bg-gradient-to-br from-purple-400 to-violet-600', demoPath: '/demo/yoga' },
  { id: 'nailsalon', nameKey: 'trade.nailsalon', icon: '💅', color: 'from-rose-500 to-pink-600', gradient: 'bg-gradient-to-br from-rose-500 to-pink-600', demoPath: '/demo/nailsalon' },
  { id: 'massage', nameKey: 'trade.massage', icon: '💆‍♀️', color: 'from-cyan-400 to-teal-500', gradient: 'bg-gradient-to-br from-cyan-400 to-teal-500', demoPath: '/demo/massage' },
  { id: 'petgrooming', nameKey: 'trade.petgrooming', icon: '🐾', color: 'from-orange-400 to-amber-500', gradient: 'bg-gradient-to-br from-orange-400 to-amber-500', demoPath: '/demo/petgrooming' },
  { id: 'nutritionist', nameKey: 'trade.nutritionist', icon: '🥗', color: 'from-green-400 to-emerald-500', gradient: 'bg-gradient-to-br from-green-400 to-emerald-500', demoPath: '/demo/nutritionist' },
  { id: 'handmade', nameKey: 'trade.handmade', icon: '🎨', color: 'from-fuchsia-400 to-purple-500', gradient: 'bg-gradient-to-br from-fuchsia-400 to-purple-500', demoPath: '/demo/handmade' },
  { id: 'childcare', nameKey: 'trade.childcare', icon: '👶', color: 'from-sky-400 to-blue-500', gradient: 'bg-gradient-to-br from-sky-400 to-blue-500', demoPath: '/demo/childcare' },
  { id: 'dental', nameKey: 'trade.dental', icon: '🦷', color: 'from-cyan-500 to-teal-600', gradient: 'bg-gradient-to-br from-cyan-500 to-teal-600', demoPath: '/demo/dental' },
  { id: 'realestate', nameKey: 'trade.realestate', icon: '🏢', color: 'from-violet-500 to-purple-700', gradient: 'bg-gradient-to-br from-violet-500 to-purple-700', demoPath: '/demo/realestate' },
  { id: 'accounting', nameKey: 'trade.accounting', icon: '📊', color: 'from-emerald-500 to-green-700', gradient: 'bg-gradient-to-br from-emerald-500 to-green-700', demoPath: '/demo/accounting' },
  { id: 'veterinary', nameKey: 'trade.veterinary', icon: '🐾', color: 'from-amber-500 to-yellow-600', gradient: 'bg-gradient-to-br from-amber-500 to-yellow-600', demoPath: '/demo/veterinary' },
  { id: 'tattoo', nameKey: 'trade.tattoo', icon: '🎨', color: 'from-red-600 to-rose-800', gradient: 'bg-gradient-to-br from-red-600 to-rose-800', demoPath: '/demo/tattoo' },
  { id: 'musicschool', nameKey: 'trade.musicschool', icon: '🎵', color: 'from-violet-600 to-indigo-700', gradient: 'bg-gradient-to-br from-violet-600 to-indigo-700', demoPath: '/demo/musicschool' },
  { id: 'drivingschool', nameKey: 'trade.drivingschool', icon: '🚗', color: 'from-blue-600 to-sky-700', gradient: 'bg-gradient-to-br from-blue-600 to-sky-700', demoPath: '/demo/drivingschool' },
  { id: 'laundry', nameKey: 'trade.laundry', icon: '👔', color: 'from-cyan-600 to-sky-700', gradient: 'bg-gradient-to-br from-cyan-600 to-sky-700', demoPath: '/demo/laundry' },
  { id: 'security', nameKey: 'trade.security', icon: '🛡️', color: 'from-slate-600 to-gray-800', gradient: 'bg-gradient-to-br from-slate-600 to-gray-800', demoPath: '/demo/security' },
  { id: 'translation', nameKey: 'trade.translation', icon: '🌍', color: 'from-teal-500 to-emerald-600', gradient: 'bg-gradient-to-br from-teal-500 to-emerald-600', demoPath: '/demo/translation' },
];
