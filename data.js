/* ------------------------------------------------------------------
   Mass Central Trail Stays — sample data for the prototype
   Trail mileage is approximate and measured west → east from
   Northampton. In production these positions come from the
   MassTrailTracker.com trail reference; lodging comes from the
   ResNexus-synced property directory. All properties are fictional.
------------------------------------------------------------------- */

const TRAIL = { name: 'Mass Central Rail Trail', length: 123.5, west: 'Northampton', east: 'Boston', gainEast: 4653, gainWest: 4779,
  routeUrl: 'https://ridewithgps.com/routes/53812869', routeName: 'MCRT Full Route (Ride with GPS)', mapUrl: 'https://masstrailtracker.com/map' };

/* Towns along the corridor. `mile` is measured eastbound from Northampton on the
   current best-route alignment (Ride with GPS route 53812869, 123.5 mi); `gain` is
   the climb in feet from the previous town heading east; `y` positions the schematic map. */
const TOWNS = [
  { id: 'northampton', name: 'Northampton', mile: 0.0, gain: 0, y: 200 },
  { id: 'hadley', name: 'Hadley', mile: 3.2, gain: 40, y: 188 },
  { id: 'amherst', name: 'Amherst', mile: 8.3, gain: 180, y: 172 },
  { id: 'belchertown', name: 'Belchertown', mile: 17.8, gain: 810, y: 214 },
  { id: 'ware', name: 'Ware', mile: 33.1, gain: 824, y: 246 },
  { id: 'gilbertville', name: 'Gilbertville', mile: 38.8, gain: 534, y: 222 },
  { id: 'newbraintree', name: 'New Braintree', mile: 42.4, gain: 256, y: 196 },
  { id: 'barre', name: 'Barre', mile: 48.3, gain: 296, y: 150 },
  { id: 'oakham', name: 'Oakham', mile: 52.4, gain: 354, y: 166 },
  { id: 'rutland', name: 'Rutland', mile: 56.5, gain: 392, y: 186 },
  { id: 'holden', name: 'Holden', mile: 66.5, gain: 561, y: 200 },
  { id: 'westboylston', name: 'West Boylston', mile: 73.0, gain: 425, y: 170 },
  { id: 'boylston', name: 'Boylston', mile: 79.1, gain: 324, y: 165 },
  { id: 'clinton', name: 'Clinton', mile: 82.5, gain: 188, y: 140 },
  { id: 'berlin', name: 'Berlin', mile: 86.9, gain: 364, y: 166 },
  { id: 'hudson', name: 'Hudson', mile: 91.7, gain: 224, y: 160 },
  { id: 'sudbury', name: 'Sudbury', mile: 99.4, gain: 198, y: 200 },
  { id: 'wayland', name: 'Wayland', mile: 104.4, gain: 171, y: 206 },
  { id: 'weston', name: 'Weston', mile: 107.6, gain: 162, y: 216 },
  { id: 'waltham', name: 'Waltham', mile: 111.3, gain: 147, y: 206 },
  { id: 'belmont', name: 'Belmont', mile: 114.9, gain: 117, y: 196 },
  { id: 'boston', name: 'Boston (North Point)', mile: 123.5, gain: 129, y: 212 }
];

/* Trail sections with surface mix. Percentages are illustrative. */
const SECTIONS = [
  { id: 'norwottuck', name: 'Norwottuck Branch', from: 0.0, to: 17.8, towns: 'Northampton · Hadley · Amherst · Belchertown',
    surface: { paved: 90, dust: 10, road: 0 }, blurb: 'Crosses the Connecticut River on a 1,492-foot rail bridge, then rolls through farmland and college towns. Flat, paved, busy on weekends.' },
  { id: 'wareriver', name: 'Ware River Valley', from: 17.8, to: 48.3, towns: 'Ware · Gilbertville · New Braintree · Barre',
    surface: { paved: 20, dust: 55, road: 25 }, blurb: 'The quietest stretch. Mill villages, the Ware River, and long stone-dust miles with on-road connectors where the rail bed is still being acquired.' },
  { id: 'wachusett', name: 'Wachusett Highlands', from: 48.3, to: 73.0, towns: 'Barre · Oakham · Rutland · Holden · West Boylston',
    surface: { paved: 15, dust: 80, road: 5 }, blurb: 'The high point of the whole route near Rutland (about 1,000 feet). Woods, ponds, and the Wachusett Reservoir watershed.' },
  { id: 'nashua', name: 'Nashua & Assabet', from: 73.0, to: 91.7, towns: 'Boylston · Clinton · Berlin · Hudson',
    surface: { paved: 60, dust: 25, road: 15 }, blurb: 'Skirts the reservoir, drops into Clinton and follows river valleys east to Hudson\'s revived mill downtown.' },
  { id: 'wayside', name: 'Wayside', from: 91.7, to: 107.6, towns: 'Sudbury · Wayland · Weston',
    surface: { paved: 95, dust: 5, road: 0 }, blurb: 'Newly paved through wetlands and meadows in MetroWest. Smooth, shaded, and close to commuter rail.' },
  { id: 'metro', name: 'Metro Boston', from: 107.6, to: 123.5, towns: 'Waltham · Belmont · Cambridge · Boston',
    surface: { paved: 85, dust: 0, road: 15 }, blurb: 'Urban finish along the Charles and the Fitchburg Cutoff into Cambridge, ending near North Point Park.' }
];

/* Lodging. `dist` is miles from the trail; `mile` is nearest trail mile. */
const LODGING = [
  { id: 'roundhouse', name: 'The Roundhouse Inn', town: 'Northampton', type: 'hotel', mile: 0.4, dist: 0.2, rate: 179, rooms: 24, rating: 4.7, reviews: 212, side: -1,
    amen: { breakfast: false, bike: true, laundry: true, pets: false, luggage: true },
    tagline: 'Converted rail roundhouse two blocks from the western trailhead.',
    desc: 'A 24-room hotel built inside Northampton\'s 1890s freight roundhouse. Exposed brick, tall windows, and a ground-floor café that opens at 6:30 for early departures. The trail\'s western trailhead is a two-minute walk down the old spur.',
    directions: 'From the Northampton trailhead at Woodmont Road, follow the paved spur east 0.2 mi. The inn is the round brick building on your left.',
    breakfast: 'Café on site (not included). Trail lunches available to order the night before.',
    checkin: '3:00 PM', checkout: '11:00 AM', phone: '(413) 555-0142', web: 'roundhouseinn.example', address: '12 Roundhouse Plaza, Northampton, MA 01060',
    roomTypes: [ { name: 'Queen Room', sleeps: 2, rate: 179 }, { name: 'King Room', sleeps: 2, rate: 209 }, { name: 'Loft Suite', sleeps: 4, rate: 289 } ],
    testimonials: [ { q: 'Perfect launch point. Bikes stored in the old engine bay, coffee at 6:30, and we were on the trail by seven.', who: 'Dana R., cycled end-to-end, June' } ] },

  { id: 'paradise', name: 'Paradise Pond B&B', town: 'Northampton', type: 'bnb', mile: 1.0, dist: 0.6, rate: 165, rooms: 4, rating: 4.9, reviews: 88, side: 1,
    amen: { breakfast: true, bike: true, laundry: false, pets: false, luggage: true },
    tagline: 'Four-room Victorian a short walk from the river bridge.',
    desc: 'A quiet 1886 Victorian on a side street above the Mill River. Four rooms, a wraparound porch, and a full breakfast served from 7:00. The hosts have walked the whole trail and keep a shelf of maps for guests.',
    directions: 'Leave the trail at the Damon Road crossing (mile 1.0). Head south on Damon Road 0.4 mi, right on Prospect Street. Blue house with the porch.',
    breakfast: 'Full hot breakfast included, 7:00–9:00. Early "trail breakfast" bag available on request.',
    checkin: '4:00 PM', checkout: '10:30 AM', phone: '(413) 555-0177', web: 'paradisepondbb.example', address: '41 Prospect St, Northampton, MA 01060',
    roomTypes: [ { name: 'Porch Room', sleeps: 2, rate: 165 }, { name: 'River Room', sleeps: 2, rate: 185 }, { name: 'Attic Suite', sleeps: 3, rate: 215 } ],
    testimonials: [ { q: 'The breakfast alone is worth the stop. They packed us sandwiches for the Norwottuck section.', who: 'Marcus & Lee, walked 3 days' } ] },

  { id: 'norwottuck', name: 'Norwottuck Farmhouse Inn', town: 'Amherst', type: 'inn', mile: 8.0, dist: 0.4, rate: 198, rooms: 8, rating: 4.8, reviews: 146, side: -1,
    amen: { breakfast: true, bike: true, laundry: true, pets: true, luggage: true },
    tagline: 'Working farm inn where the trail crosses the Hadley fields.',
    desc: 'An eight-room inn in a restored 1790 farmhouse on the Amherst–Hadley line. Rooms look out over the same fields the trail runs through. Breakfast is farm eggs and whatever came out of the garden that week.',
    directions: 'At mile 8.0, exit north at the Station Road gate. Follow Station Road 0.4 mi; the inn drive is the second left, marked with a green trail sign.',
    breakfast: 'Farm breakfast included, 6:30–9:00.',
    checkin: '3:00 PM', checkout: '11:00 AM', phone: '(413) 555-0119', web: 'norwottuckfarmhouse.example', address: '220 Station Rd, Amherst, MA 01002',
    roomTypes: [ { name: 'Field Room', sleeps: 2, rate: 198 }, { name: 'Barn Loft', sleeps: 4, rate: 268 } ],
    testimonials: [ { q: 'Dog-friendly, bike shed with a work stand, and they moved our bags on to Belchertown. Effortless.', who: 'Priya S., 5-day ride' } ] },

  { id: 'jabish', name: 'Jabish Brook Inn', town: 'Belchertown', type: 'bnb', mile: 18.3, dist: 0.9, rate: 159, rooms: 5, rating: 4.6, reviews: 64, side: 1,
    amen: { breakfast: true, bike: true, laundry: false, pets: false, luggage: true },
    tagline: 'Five rooms by the brook at the end of the paved Norwottuck miles.',
    desc: 'A comfortable five-room B&B on the Belchertown common, just where the paved trail ends and the Ware River section begins. Popular first-night stop for walkers heading east.',
    directions: 'At mile 18.3 the trail meets Route 9. Turn right (south) on Route 9 for 0.6 mi, then left on Maple Street. The inn faces the common.',
    breakfast: 'Continental-plus breakfast included, 7:00–9:30.',
    checkin: '3:00 PM', checkout: '11:00 AM', phone: '(413) 555-0163', web: 'jabishbrookinn.example', address: '8 Maple St, Belchertown, MA 01007',
    roomTypes: [ { name: 'Common Room', sleeps: 2, rate: 159 }, { name: 'Brook Suite', sleeps: 3, rate: 199 } ],
    testimonials: [ { q: 'Exactly 15 miles from Northampton. The innkeeper drew us a map of the on-road connector to Ware.', who: 'The Okafor family' } ] },

  { id: 'millst', name: 'Mill Street Lodge', town: 'Ware', type: 'hotel', mile: 32.8, dist: 0.3, rate: 139, rooms: 32, rating: 4.3, reviews: 301, side: -1,
    amen: { breakfast: true, bike: true, laundry: true, pets: true, luggage: true },
    tagline: 'Renovated mill hotel on the Ware River with a laundry room.',
    desc: 'Thirty-two rooms in a converted textile mill along the Ware River. The most practical stop in the valley: laundry, a bike wash station, a full breakfast, and a diner across the street that opens at 5:30.',
    directions: 'At mile 32.8 turn south onto Mill Street from the trail crossing. The lodge is the large brick mill 0.3 mi ahead on the river.',
    breakfast: 'Hot breakfast buffet included, 6:00–9:30.',
    checkin: '3:00 PM', checkout: '11:00 AM', phone: '(413) 555-0128', web: 'millstreetlodge.example', address: '77 Mill St, Ware, MA 01082',
    roomTypes: [ { name: 'Double Queen', sleeps: 4, rate: 139 }, { name: 'King River View', sleeps: 2, rate: 169 } ],
    testimonials: [ { q: 'Laundry after two days of stone dust. That is all you need to know.', who: 'Jen T., end-to-end walker' } ] },

  { id: 'wareriver', name: 'Ware River Guest House', town: 'Gilbertville', type: 'rental', mile: 38.9, dist: 1.2, rate: 210, rooms: 1, rating: 4.9, reviews: 41, side: 1,
    amen: { breakfast: false, bike: true, laundry: true, pets: true, luggage: true },
    tagline: 'Whole house for groups, on the covered-bridge side of the river.',
    desc: 'A three-bedroom 1840s house in the mill village of Gilbertville, rented whole. Sleeps six, with a full kitchen, a drying room, and a porch that looks at the covered bridge. Ideal for a group riding the Ware River section together.',
    directions: 'At mile 38.9 exit at the Gilbertville covered bridge. Cross the bridge, continue 1.1 mi on Bridge Street. White house with the green shutters.',
    breakfast: 'Self-catered. Kitchen stocked with coffee, eggs and bread for the first morning.',
    checkin: '4:00 PM', checkout: '10:00 AM', phone: '(413) 555-0191', web: 'wareriverguesthouse.example', address: '34 Bridge St, Gilbertville, MA 01031',
    roomTypes: [ { name: 'Whole House (3 BR)', sleeps: 6, rate: 210 } ],
    testimonials: [ { q: 'Six of us, one house, one price. Bags were on the porch before we got there.', who: 'Worcester Cycling Club' } ] },

  { id: 'maplehill', name: 'Maple Hill Inn', town: 'Barre', type: 'inn', mile: 48.0, dist: 0.5, rate: 189, rooms: 9, rating: 4.8, reviews: 173, side: -1,
    amen: { breakfast: true, bike: true, laundry: false, pets: false, luggage: true },
    tagline: 'Nine-room inn on Barre Common with a sugarhouse out back.',
    desc: 'A classic New England inn on the Barre town common, run by the same family for three generations. Breakfast is served in the sugarhouse dining room, and the front porch is the unofficial meeting point for trail travelers heading up into the Wachusett section.',
    directions: 'At mile 48.0 leave the trail at the Barre Depot parking lot. Follow Exchange Street 0.5 mi uphill to the common. The inn is on the north side.',
    breakfast: 'Full breakfast with house maple syrup included, 7:00–9:00.',
    checkin: '3:00 PM', checkout: '11:00 AM', phone: '(978) 555-0104', web: 'maplehillinnbarre.example', address: '2 Common St, Barre, MA 01005',
    roomTypes: [ { name: 'Common View Queen', sleeps: 2, rate: 189 }, { name: 'Sugarhouse King', sleeps: 2, rate: 219 }, { name: 'Family Suite', sleeps: 4, rate: 279 } ],
    testimonials: [ { q: 'Warm welcome, big breakfast, and a real map of the climb toward Rutland on the wall.', who: 'Chris & Amara, 4-day trip' } ] },

  { id: 'barrecommon', name: 'Barre Common House', town: 'Barre', type: 'bnb', mile: 48.5, dist: 0.7, rate: 149, rooms: 4, rating: 4.5, reviews: 52, side: 1,
    amen: { breakfast: true, bike: false, laundry: false, pets: true, luggage: false },
    tagline: 'Budget-friendly four-room B&B a block off the common.',
    desc: 'A friendly four-room B&B in a Greek Revival house one block from Barre Common. Simple, clean rooms and a big breakfast. Bikes can be locked on the back porch; no indoor storage.',
    directions: 'From the Barre Depot lot at mile 48.5, walk up Exchange Street 0.6 mi, right on School Street. Second house on the left.',
    breakfast: 'Full breakfast included, 7:30–9:00.',
    checkin: '3:00 PM', checkout: '10:30 AM', phone: '(978) 555-0139', web: 'barrecommonhouse.example', address: '15 School St, Barre, MA 01005',
    roomTypes: [ { name: 'Standard Queen', sleeps: 2, rate: 149 }, { name: 'Twin Room', sleeps: 2, rate: 149 } ],
    testimonials: [] },

  { id: 'trailside', name: 'Trailside B&B', town: 'Rutland', type: 'bnb', mile: 56.4, dist: 0.1, rate: 215, rooms: 6, rating: 4.9, reviews: 204, side: 1,
    amen: { breakfast: true, bike: true, laundry: true, pets: false, luggage: true },
    tagline: 'Six rooms literally on the trail at the highest point of the route.',
    desc: 'The only inn where you can roll straight off the rail bed into the bike barn. Six rooms in a converted station-keeper\'s house at the top of the Wachusett grade, with sunset views west over the hills you just crossed.',
    directions: 'At mile 56.4 the inn is on the north side of the trail. Turn in at the white gate.',
    breakfast: 'Full breakfast included, 6:30–9:00. Packed lunches $14.',
    checkin: '3:00 PM', checkout: '11:00 AM', phone: '(508) 555-0156', web: 'trailsidebb.example', address: '1 Depot Ln, Rutland, MA 01543',
    roomTypes: [ { name: 'Station Queen', sleeps: 2, rate: 215 }, { name: 'Signal King', sleeps: 2, rate: 245 }, { name: 'Summit Suite', sleeps: 4, rate: 325 } ],
    testimonials: [ { q: 'Woke up, opened the door, and was on the trail. Nothing else on the route is this close.', who: 'Sam H., 3-day ride' }, { q: 'Booked as part of a 4-inn trip and everything lined up. Bags arrived before we did.', who: 'Elena V.' } ] },

  { id: 'eaglelake', name: 'Eagle Lake Lodge', town: 'Holden', type: 'inn', mile: 66.0, dist: 1.4, rate: 169, rooms: 10, rating: 4.4, reviews: 97, side: -1,
    amen: { breakfast: true, bike: true, laundry: false, pets: true, luggage: true },
    tagline: 'Lakeside lodge with a swim dock, a short ride off the trail.',
    desc: 'A ten-room lodge on Eagle Lake, 1.4 miles north of the trail in Holden. Worth the detour for the swim dock and the lakeside dinner service. Shuttle back to the trailhead each morning for guests who would rather not add the miles.',
    directions: 'At mile 66.0 exit at the Holden Depot lot, north on Main Street 0.9 mi, left on Eagle Lake Road 0.5 mi.',
    breakfast: 'Continental breakfast included, 6:30–9:30. Dinner served Thu–Sun.',
    checkin: '3:00 PM', checkout: '11:00 AM', phone: '(508) 555-0187', web: 'eaglelakelodge.example', address: '400 Eagle Lake Rd, Holden, MA 01520',
    roomTypes: [ { name: 'Lodge Room', sleeps: 2, rate: 169 }, { name: 'Lakefront Cabin', sleeps: 4, rate: 249 } ],
    testimonials: [ { q: 'The swim at the end of a 20-mile day made the detour worth it.', who: 'Noor A.' } ] },

  { id: 'wachusett', name: 'Wachusett Reservoir B&B', town: 'West Boylston', type: 'bnb', mile: 72.5, dist: 1.0, rate: 155, rooms: 3, rating: 4.7, reviews: 39, side: -1,
    amen: { breakfast: true, bike: true, laundry: false, pets: false, luggage: true },
    tagline: 'Three quiet rooms overlooking the reservoir causeway.',
    desc: 'A small three-room B&B in a hillside cape above the Wachusett Reservoir. Very quiet, very good coffee, and a view of the Old Stone Church from the breakfast table.',
    directions: 'At mile 72.5, exit at the Thomas Street crossing. North 0.8 mi, right on Reservoir Ridge. Grey cape at the top of the hill.',
    breakfast: 'Full breakfast included, 7:00–9:00.',
    checkin: '4:00 PM', checkout: '10:30 AM', phone: '(508) 555-0122', web: 'wachusettbb.example', address: '9 Reservoir Ridge, West Boylston, MA 01583',
    roomTypes: [ { name: 'Causeway Room', sleeps: 2, rate: 155 }, { name: 'Church View Room', sleeps: 2, rate: 175 } ],
    testimonials: [] },

  { id: 'centralmass', name: 'Central Mass Inn', town: 'West Boylston', type: 'inn', mile: 73.3, dist: 0.3, rate: 175, rooms: 12, rating: 4.6, reviews: 158, side: 1,
    amen: { breakfast: true, bike: true, laundry: true, pets: false, luggage: true },
    tagline: 'Twelve-room inn at the trail\'s midpoint with a bike shop next door.',
    desc: 'Right at the practical midpoint of the whole route. Twelve rooms in a 1920s inn on West Boylston\'s main street, sharing a wall with Causeway Cycles. Laundry, secure bike room, and a tavern downstairs.',
    directions: 'At mile 73.3, the trail crosses West Boylston Street. Turn south 0.3 mi; the inn is on the right, next to the bike shop.',
    breakfast: 'Hot breakfast included, 6:30–9:30.',
    checkin: '3:00 PM', checkout: '11:00 AM', phone: '(508) 555-0171', web: 'centralmassinn.example', address: '118 West Boylston St, West Boylston, MA 01583',
    roomTypes: [ { name: 'Classic Queen', sleeps: 2, rate: 175 }, { name: 'Two-Queen Room', sleeps: 4, rate: 215 } ],
    testimonials: [ { q: 'Halfway point, tune-up next door, tavern downstairs. It plans itself.', who: 'Bill K., cyclist' } ] },

  { id: 'nashua', name: 'Nashua River Inn', town: 'Clinton', type: 'hotel', mile: 82.7, dist: 0.5, rate: 162, rooms: 40, rating: 4.4, reviews: 266, side: 1,
    amen: { breakfast: true, bike: true, laundry: true, pets: true, luggage: true },
    tagline: 'Forty-room riverside hotel in Clinton\'s mill district.',
    desc: 'A full-service hotel in a restored comb-factory building above the Nashua River. Forty rooms, a restaurant, a laundry, and enough capacity for large groups. The Museum of Russian Icons is two blocks away.',
    directions: 'At mile 82.7 exit at the Clinton Depot. South on High Street 0.4 mi; the inn is the long brick building on the river.',
    breakfast: 'Breakfast included, 6:00–10:00.',
    checkin: '3:00 PM', checkout: '12:00 PM', phone: '(978) 555-0148', web: 'nashuariverinn.example', address: '250 High St, Clinton, MA 01510',
    roomTypes: [ { name: 'Standard King', sleeps: 2, rate: 162 }, { name: 'Double Queen', sleeps: 4, rate: 182 }, { name: 'River Suite', sleeps: 4, rate: 242 } ],
    testimonials: [ { q: 'Took our group of 14 without blinking. Bikes in a locked room, laundry running by 5 PM.', who: 'Merrimack Valley Walkers' } ] },

  { id: 'assabet', name: 'Assabet Riverhouse', town: 'Hudson', type: 'hotel', mile: 91.9, dist: 0.2, rate: 199, rooms: 28, rating: 4.7, reviews: 189, side: -1,
    amen: { breakfast: false, bike: true, laundry: true, pets: false, luggage: true },
    tagline: 'Boutique mill hotel on the Assabet, steps from downtown Hudson.',
    desc: 'Twenty-eight rooms in a converted shoe mill on the Assabet River, with Hudson\'s restaurants and brewery a short walk away. No breakfast service, but three cafés within two blocks open before 7.',
    directions: 'At mile 91.9 the trail crosses Main Street in Hudson. The hotel is 0.2 mi south along the river walk.',
    breakfast: 'Not included. Coffee bar in the lobby; cafés on Main Street from 6:30.',
    checkin: '4:00 PM', checkout: '11:00 AM', phone: '(978) 555-0113', web: 'assabetriverhouse.example', address: '60 Main St, Hudson, MA 01749',
    roomTypes: [ { name: 'Mill Queen', sleeps: 2, rate: 199 }, { name: 'River King', sleeps: 2, rate: 239 } ],
    testimonials: [ { q: 'Hudson was our favorite evening of the trip: dinner, brewery, and a real bed by the river.', who: 'Tom & Grace' } ] },

  { id: 'hopbrook', name: 'Hop Brook Guest House', town: 'Sudbury', type: 'bnb', mile: 99.9, dist: 1.1, rate: 205, rooms: 5, rating: 4.8, reviews: 76, side: 1,
    amen: { breakfast: true, bike: true, laundry: false, pets: false, luggage: true },
    tagline: 'Five rooms in a 1720s farmhouse beside the Sudbury meadows.',
    desc: 'One of the oldest houses in Sudbury, with five low-ceilinged rooms, wide pine floors, and a breakfast room facing the meadows. The Wayside section passes a mile north.',
    directions: 'At mile 99.9, exit south at the Hop Brook trailhead lot. Follow Dutton Road 1.1 mi; the guest house is on the left just past the brook.',
    breakfast: 'Full breakfast included, 7:00–9:00.',
    checkin: '3:00 PM', checkout: '11:00 AM', phone: '(978) 555-0195', web: 'hopbrookguesthouse.example', address: '311 Dutton Rd, Sudbury, MA 01776',
    roomTypes: [ { name: 'Meadow Room', sleeps: 2, rate: 205 }, { name: 'Keeping Room Suite', sleeps: 3, rate: 255 } ],
    testimonials: [ { q: 'Felt like sleeping in a history book, in the best way.', who: 'Renee L.' } ] },

  { id: 'charlesriver', name: 'Charles River Hotel', town: 'Waltham', type: 'hotel', mile: 111.1, dist: 0.4, rate: 229, rooms: 60, rating: 4.5, reviews: 412, side: 1,
    amen: { breakfast: true, bike: true, laundry: true, pets: true, luggage: true },
    tagline: 'Sixty rooms on Moody Street, one stop from the commuter rail.',
    desc: 'A modern sixty-room hotel on the Charles in Waltham\'s Moody Street restaurant district. The last big-capacity stop before Boston and the easiest place to end a trip by train.',
    directions: 'At mile 111.1, the trail meets the Charles River path. Follow the river path east 0.4 mi to Moody Street; the hotel is across the bridge.',
    breakfast: 'Breakfast included, 6:00–10:00.',
    checkin: '3:00 PM', checkout: '12:00 PM', phone: '(781) 555-0160', web: 'charlesriverhotel.example', address: '1 Moody St, Waltham, MA 02453',
    roomTypes: [ { name: 'City King', sleeps: 2, rate: 229 }, { name: 'River Double', sleeps: 4, rate: 259 } ],
    testimonials: [ { q: 'Finished the ride, showered, dinner on Moody Street, train home. Ideal last night.', who: 'Devin P.' } ] },

  { id: 'alewife', name: 'Alewife Lofts', town: 'Cambridge', type: 'rental', mile: 119.6, dist: 0.3, rate: 245, rooms: 6, rating: 4.6, reviews: 58, side: -1,
    amen: { breakfast: false, bike: true, laundry: true, pets: false, luggage: true },
    tagline: 'Six self-check-in lofts at the eastern end of the line.',
    desc: 'Six apartment-style lofts near Alewife station, a short ride from the trail\'s Boston end. Self check-in, a kitchen in every unit, and the Red Line downstairs for getting anywhere in the city.',
    directions: 'At mile 119.6 the Fitchburg Cutoff path passes Alewife station. The lofts are the grey building 0.3 mi south on Cambridgepark Drive.',
    breakfast: 'Self-catered.',
    checkin: '3:00 PM (self check-in)', checkout: '11:00 AM', phone: '(617) 555-0133', web: 'alewifelofts.example', address: '150 Cambridgepark Dr, Cambridge, MA 02140',
    roomTypes: [ { name: 'Studio Loft', sleeps: 2, rate: 245 }, { name: 'One-Bedroom Loft', sleeps: 4, rate: 305 } ],
    testimonials: [] }
];

/* Other map points. kind: parking | bike | food | luggage | trailhead | poi */
const POIS = [
  { id: 'th-northampton', kind: 'trailhead', name: 'Northampton Trailhead (Woodmont Rd)', mile: 0.0, side: 1, note: 'Western terminus. Restrooms, water, 40 spaces.' },
  { id: 'bk-northampton', kind: 'bike', name: 'Bridge Street Cycles', mile: 0.6, side: 1, note: 'Rentals, repairs, tubes. Opens 9 AM.' },
  { id: 'fd-northampton', kind: 'food', name: 'Depot Diner', mile: 0.3, side: -1, note: 'Breakfast from 6 AM.' },
  { id: 'lg-northampton', kind: 'luggage', name: 'Valley Bag Shuttle (west hub)', mile: 0.5, side: 1, note: 'Bag pickup 7–9 AM. Serves miles 0–42.' },
  { id: 'poi-ctriver', kind: 'poi', name: 'Connecticut River Rail Bridge', mile: 2.1, side: -1, note: '1,492-foot 1887 truss bridge. Best view of the trip.' },
  { id: 'fd-hadley', kind: 'food', name: 'Hadley Farm Stand', mile: 3.9, side: 1, note: 'Cider donuts, fruit, water. Seasonal.' },
  { id: 'th-amherst', kind: 'trailhead', name: 'Station Road Trailhead', mile: 8.0, side: 1, note: 'Restrooms, 25 spaces.' },
  { id: 'bk-amherst', kind: 'bike', name: 'Valley Bike Works', mile: 8.6, side: -1, note: 'Full shop. Closed Mondays.' },
  { id: 'fd-belchertown', kind: 'food', name: 'Common Café', mile: 18.1, side: 1, note: 'Sandwiches, coffee. Closes 3 PM.' },
  { id: 'poi-quabbin', kind: 'poi', name: 'Quabbin Reservoir Overlook', mile: 24.6, side: -1, note: '0.6 mi spur to the Winsor Dam view.' },
  { id: 'th-ware', kind: 'trailhead', name: 'Ware Depot Trailhead', mile: 32.9, side: 1, note: 'Restrooms, water, 30 spaces.' },
  { id: 'fd-ware', kind: 'food', name: 'Mill Street Diner', mile: 32.8, side: 1, note: 'Opens 5:30 AM.' },
  { id: 'poi-gilbertville', kind: 'poi', name: 'Gilbertville Covered Bridge', mile: 38.9, side: 1, note: '1886 covered bridge over the Ware River.' },
  { id: 'lg-barre', kind: 'luggage', name: 'Valley Bag Shuttle (Barre hub)', mile: 48.2, side: 1, note: 'Transfer point. Serves miles 15–70.' },
  { id: 'fd-barre', kind: 'food', name: 'Common Table', mile: 48.6, side: -1, note: 'Dinner Wed–Sun.' },
  { id: 'bk-barre', kind: 'bike', name: 'Barre Bike & Ski', mile: 48.8, side: 1, note: 'Repairs, limited parts.' },
  { id: 'poi-rutland', kind: 'poi', name: 'Rutland Summit (highest point)', mile: 56.1, side: -1, note: 'About 1,000 ft. Bench and marker.' },
  { id: 'th-rutland', kind: 'trailhead', name: 'Rutland Depot Trailhead', mile: 56.5, side: -1, note: 'Water, 20 spaces.' },
  { id: 'fd-holden', kind: 'food', name: 'Depot Pizza', mile: 66.6, side: 1, note: 'Until 9 PM.' },
  { id: 'poi-wachusett', kind: 'poi', name: 'Old Stone Church & Reservoir', mile: 72.7, side: -1, note: '1892 church on the Wachusett Reservoir shore.' },
  { id: 'bk-westboylston', kind: 'bike', name: 'Causeway Cycles', mile: 73.3, side: 1, note: 'Next to Central Mass Inn. Tune-ups while you sleep.' },
  { id: 'lg-westboylston', kind: 'luggage', name: 'Valley Bag Shuttle (central hub)', mile: 73.5, side: -1, note: 'Serves miles 42–104.' },
  { id: 'fd-westboylston', kind: 'food', name: 'Reservoir Tavern', mile: 73.2, side: -1, note: 'Downstairs at Central Mass Inn.' },
  { id: 'th-clinton', kind: 'trailhead', name: 'Clinton Depot Trailhead', mile: 82.5, side: -1, note: 'Restrooms, 30 spaces.' },
  { id: 'fd-clinton', kind: 'food', name: 'High Street Kitchen', mile: 82.8, side: 1, note: 'Lunch and dinner.' },
  { id: 'poi-berlin', kind: 'poi', name: 'Berlin Orchards', mile: 87.2, side: 1, note: 'Pick-your-own in fall. Cider.' },
  { id: 'fd-hudson', kind: 'food', name: 'Rail Trail Brewing', mile: 92.0, side: 1, note: 'Pizza, beer, outdoor seating.' },
  { id: 'bk-hudson', kind: 'bike', name: 'Assabet Cyclery', mile: 91.5, side: -1, note: 'Full shop, rentals.' },
  { id: 'th-sudbury', kind: 'trailhead', name: 'Hop Brook Trailhead', mile: 99.9, side: -1, note: 'Boardwalk section starts here.' },
  { id: 'poi-wayland', kind: 'poi', name: 'Wayland Depot & Freight House', mile: 104.4, side: -1, note: '1881 station, café in season.' },
  { id: 'fd-waltham', kind: 'food', name: 'Moody Street (30+ restaurants)', mile: 111.2, side: 1, note: 'Every cuisine, most open late.' },
  { id: 'lg-waltham', kind: 'luggage', name: 'Valley Bag Shuttle (east hub)', mile: 110.9, side: -1, note: 'Final bag delivery point.' },
  { id: 'th-boston', kind: 'trailhead', name: 'North Point Park (Boston end)', mile: 123.5, side: 1, note: 'Eastern terminus. Red/Green Line nearby.' }
];

/* Parking and restroom points from the Ride with GPS route author (real places). */
const ROUTE_POIS = [
  { id: 'rw-166628774', kind: 'restroom', name: 'Whole Foods', town: 'Hadley', mile: 5.2, side: -1, note: 'Restroom stop noted by the route author.', src: 'route' },
  { id: 'rw-166628775', kind: 'parking', name: 'Belchertown parking for MCRT', town: 'Amherst', mile: 9.9, side: 1, note: 'Trailhead or lot parking.', src: 'route' },
  { id: 'rw-166628776', kind: 'parking', name: 'Parking', town: 'Belchertown', mile: 11.4, side: -1, note: 'Trailhead or lot parking.', src: 'route' },
  { id: 'rw-166628777', kind: 'parking', name: 'Parking', town: 'Belchertown', mile: 16.5, side: 1, note: 'Trailhead or lot parking.', src: 'route' },
  { id: 'rw-166628778', kind: 'restroom', name: 'Town Hall  / Police station', town: 'Belchertown', mile: 17.9, side: -1, note: 'Restroom stop noted by the route author.', src: 'route' },
  { id: 'rw-166628779', kind: 'restroom', name: 'Dunkin / Gas station', town: 'Palmer Town', mile: 23.8, side: 1, note: 'Restroom stop noted by the route author.', src: 'route' },
  { id: 'rw-166628780', kind: 'restroom', name: 'Walmart', town: 'Ware', mile: 29.9, side: -1, note: 'Restroom stop noted by the route author.', src: 'route' },
  { id: 'rw-166628781', kind: 'restroom', name: 'McDonalds', town: 'Ware', mile: 32.5, side: 1, note: 'Restroom stop noted by the route author.', src: 'route' },
  { id: 'rw-166628782', kind: 'restroom', name: 'Grenville Park (seasonal)', town: 'Ware', mile: 34.0, side: -1, note: 'Restroom stop noted by the route author.', src: 'route' },
  { id: 'rw-166628783', kind: 'restroom', name: 'porta potty year round', town: 'Oakham', mile: 50.8, side: 1, note: 'Restroom stop noted by the route author.', src: 'route' },
  { id: 'rw-166628784', kind: 'restroom', name: 'Porta potty year round', town: 'Rutland', mile: 53.9, side: -1, note: 'Restroom stop noted by the route author.', src: 'route' },
  { id: 'rw-166628785', kind: 'parking', name: 'rt 122', town: 'Rutland', mile: 53.9, side: 1, note: 'Trailhead or lot parking.', src: 'route' },
  { id: 'rw-166628786', kind: 'parking', name: 'Powder Mill Pond lot', town: 'Barre', mile: 48.9, side: -1, note: 'Trailhead or lot parking.', src: 'route' },
  { id: 'rw-166628787', kind: 'parking', name: 'Blue Trail access', town: 'Hardwick', mile: 39.0, side: 1, note: 'Trailhead or lot parking.', src: 'route' },
  { id: 'rw-166628788', kind: 'parking', name: 'MCRT Church St parking area', town: 'Ware', mile: 36.1, side: -1, note: 'Trailhead or lot parking.', src: 'route' },
  { id: 'rw-166628789', kind: 'parking', name: 'Grenville Park', town: 'Ware', mile: 34.1, side: 1, note: 'Trailhead or lot parking.', src: 'route' },
  { id: 'rw-166628790', kind: 'parking', name: 'Walmart', town: 'Ware', mile: 29.9, side: -1, note: 'Trailhead or lot parking.', src: 'route' },
  { id: 'rw-166628791', kind: 'parking', name: 'Rabbit Run. trailhead', town: 'Belchertown', mile: 23.5, side: 1, note: 'Trailhead or lot parking.', src: 'route' },
  { id: 'rw-166628792', kind: 'restroom', name: 'Porta potty year round', town: 'Rutland', mile: 57.9, side: -1, note: 'Restroom stop noted by the route author.', src: 'route' },
  { id: 'rw-166628793', kind: 'restroom', name: 'Porta potty year round', town: 'Holden', mile: 66.8, side: 1, note: 'Restroom stop noted by the route author.', src: 'route' },
  { id: 'rw-166628794', kind: 'restroom', name: 'Porta potty year round', town: 'Holden', mile: 70.3, side: -1, note: 'Restroom stop noted by the route author.', src: 'route' },
  { id: 'rw-166628795', kind: 'parking', name: 'River St trailhead lot', town: 'Holden', mile: 70.3, side: 1, note: 'Trailhead or lot parking.', src: 'route' },
  { id: 'rw-166628796', kind: 'restroom', name: 'Porta potty year round', town: 'West Boylston', mile: 73.1, side: -1, note: 'Restroom stop noted by the route author.', src: 'route' },
  { id: 'rw-166628797', kind: 'parking', name: 'Thomas St lot', town: 'West Boylston', mile: 73.1, side: 1, note: 'Trailhead or lot parking.', src: 'route' },
  { id: 'rw-166628798', kind: 'restroom', name: 'Porta potty year round', town: 'Sterling', mile: 76.9, side: -1, note: 'Restroom stop noted by the route author.', src: 'route' },
  { id: 'rw-166628799', kind: 'restroom', name: 'Clinton Sports Fields Porta Potty', town: 'Clinton', mile: 80.7, side: 1, note: 'Soccer Fields Porta Potties', src: 'route' },
  { id: 'rw-166628800', kind: 'restroom', name: 'Dunkin Donuts', town: 'Sudbury', mile: 99.9, side: -1, note: 'Restroom stop noted by the route author.', src: 'route' },
  { id: 'rw-166628801', kind: 'restroom', name: 'Wayland Police Station', town: 'Wayland', mile: 104.5, side: 1, note: 'Restroom stop noted by the route author.', src: 'route' },
  { id: 'rw-166628802', kind: 'parking', name: 'Wayland Library', town: 'Wayland', mile: 104.6, side: -1, note: 'Trailhead or lot parking.', src: 'route' },
  { id: 'rw-166628803', kind: 'parking', name: 'Main St lot', town: 'Hudson', mile: 92.4, side: 1, note: 'Trailhead or lot parking.', src: 'route' },
  { id: 'rw-166628804', kind: 'parking', name: 'Concord rd / MCRT parking', town: 'Weston', mile: 107.4, side: -1, note: 'Trailhead or lot parking.', src: 'route' },
  { id: 'rw-166628805', kind: 'parking', name: 'Parking on JOnes Rd', town: 'Waltham', mile: 109.3, side: 1, note: 'Trailhead or lot parking.', src: 'route' },
  { id: 'rw-166628806', kind: 'restroom', name: 'Market Basket', town: 'Waltham', mile: 110.0, side: -1, note: 'Restroom stop noted by the route author.', src: 'route' }
];
POIS.push(...ROUTE_POIS);

const POI_KINDS = {
  lodging:   { label: 'Inns, B&Bs & hotels', color: '#14532D' },
  trailhead: { label: 'Trailheads',           color: '#4E8C5F' },
  parking:   { label: 'Parking',              color: '#2F5F8A' },
  restroom:  { label: 'Restrooms & water',    color: '#3C8FA3' },
  bike:      { label: 'Bike & supply shops',  color: '#C08F2E' },
  food:      { label: 'Restaurants',          color: '#B85C38' },
  luggage:   { label: 'Luggage transfer',     color: '#6D4C8E' },
  poi:       { label: 'Points of interest',   color: '#4A4F4D' }
};

const TYPE_LABEL = { bnb: 'B&B', inn: 'Inn', hotel: 'Hotel', rental: 'Vacation rental' };

/* Packaged inn-to-inn tours. Each is a preset for the trip engine plus a
   per-person package price (double occupancy). Day counts and daily
   mileage are computed from the engine so they always match the itinerary. */
const TOURS = [
  { id: 'weekend', name: 'Norwottuck Weekend', route: 'Northampton to Belchertown', start: 'northampton', end: 'belchertown', mpd: 10, mode: 'walk', rating: 'Easy', price: 495, single: 120, bikeRental: 65, meals: '1 breakfast · 2 packed lunches', groupMax: 14, scene: 'walker',
    overview: 'Two days on the flattest, best-loved miles of the trail: across the Connecticut River on the 1887 rail bridge, through Hadley farm stands to a farmhouse inn in Amherst, then on to the Belchertown common where the paved miles end.',
    highlights: ['1,492-foot Connecticut River rail bridge', 'Hadley farm stands and cider donuts', 'A Belchertown B&B whose innkeeper draws you the map east', 'Quabbin Reservoir overlook spur'],
    departures: ['2026-09-19', '2026-09-26', '2026-10-10', '2026-10-17'],
    testimonial: { q: 'Exactly the right first trail trip. We never touched our bags and breakfast was waiting both mornings.', who: 'The Okafor family, Norwottuck Weekend' } },
  { id: 'highlands', name: 'Highlands to the Harbor', route: 'Barre to Boston', start: 'barre', end: 'boston', mpd: 25, mode: 'bike', rating: 'Active', price: 1095, single: 240, bikeRental: 120, meals: '2 breakfasts · 3 packed lunches · 1 dinner', groupMax: 14, scene: 'rider',
    overview: 'Start on Barre Common, climb to the trail\'s high point in Rutland, coast past the Wachusett Reservoir and down river valleys through Clinton and Hudson, then follow the Wayside miles and the Charles into the city.',
    highlights: ['Rutland summit, the highest point on the route', 'Old Stone Church on the Wachusett Reservoir', 'Dinner and a brewery in Hudson\'s mill downtown', 'Finish at North Point Park with the Red Line home'],
    departures: ['2026-09-25', '2026-10-09', '2026-10-16'],
    testimonial: { q: 'Halfway point, tune-up next door, tavern downstairs. It plans itself.', who: 'Bill K., Highlands to the Harbor' } },
  { id: 'fiveday', name: 'Five-Day Trail Walk', route: 'Northampton to Hudson', start: 'northampton', end: 'hudson', mpd: 20, mode: 'walk', rating: 'Active', price: 1595, single: 360, bikeRental: 0, meals: '4 breakfasts · 5 packed lunches · 2 dinners', groupMax: 12, scene: 'walker',
    overview: 'Ninety miles on foot at a steady pace, with a real bed, a real breakfast, and your bags waiting every night. Farmhouse inns, mill villages, the Wachusett highlands, and river towns.',
    highlights: ['A 1790 farmhouse inn on the Hadley fields', 'Gilbertville covered bridge', 'Sunset from the station house at Rutland summit', 'Swim dock at Eagle Lake after the longest day'],
    departures: ['2026-09-21', '2026-10-05', '2026-10-12'],
    testimonial: { q: 'Laundry after two days of stone dust. That is all you need to know.', who: 'Jen T., Five-Day Trail Walk' } },
  { id: 'endtoend', name: 'Mass Central End-to-End', route: 'Northampton to Boston', start: 'northampton', end: 'boston', mpd: 26, mode: 'bike', rating: 'Active', price: 1795, single: 390, bikeRental: 165, meals: '4 breakfasts · 5 packed lunches · 2 dinners', groupMax: 14, scene: 'rider',
    overview: 'The whole route, river to harbor, in five days by bike with about 4,650 feet of climbing. Every night at an inn that knows what a 20-mile day feels like, every morning with your bags already on the van.',
    highlights: ['All 123 miles of the current route, Connecticut River to Boston Harbor', 'Roll straight off the rail bed into the bike barn at Trailside B&B', 'Maple syrup breakfast on Barre Common', 'Moody Street dinner and a train home from Waltham'],
    departures: ['2026-09-20', '2026-10-04', '2026-10-11', '2026-10-18'],
    testimonial: { q: 'Booked as part of a 4-inn trip and everything lined up. Bags arrived before we did.', who: 'Elena V., Mass Central End-to-End' } }
];
const TOUR_INCLUDES = [
  'Every night at a trailside inn or B&B, double occupancy',
  'Breakfast each morning where the inn serves it',
  'Luggage transfer between every stay',
  'A packed trail lunch each walking or riding day',
  'Printed maps plus the offline Trail Mode download',
  '24-hour traveler line and a support van on call',
  'Ride leader and mechanic on guided departures'
];

const RESOURCES = [
  { name: 'MCRT full route on Ride with GPS', desc: '123.5 mi, +4,779 ft westbound. The turn-by-turn alignment this site\'s mileage is based on.', url: 'https://ridewithgps.com/routes/53812869' },
  { name: 'RN2B route (Ride Northampton to Boston)', desc: 'The Fall 2024 group-ride alignment recommended on MassTrailTracker.', url: 'https://ridewithgps.com/routes/47996539' },
  { name: 'MassTrailTracker.com', desc: 'Interactive trail map and status by segment. The reference map behind this site.', url: 'https://masstrailtracker.com' },
  { name: 'Mass Central Rail Trail Coalition', desc: 'Trail news, section openings, volunteer days.', url: 'https://masscentralrailtrail.org' },
  { name: 'Wachusett Greenways', desc: 'Maintains the Rutland–West Boylston miles. Trail conditions.', url: 'https://www.wachusettgreenways.org' },
  { name: 'Norwottuck Rail Trail (DCR)', desc: 'State park page for the Northampton–Belchertown section.', url: 'https://www.mass.gov/locations/norwottuck-rail-trail' },
  { name: 'NWS Boston/Norton forecast', desc: 'Trail-corridor weather, radar and warnings.', url: 'https://www.weather.gov/box/' },
  { name: 'MBTA Commuter Rail', desc: 'Fitchburg Line stations at Waltham, Weston, and beyond for one-way trips.', url: 'https://www.mbta.com/schedules/commuter-rail' }
];

const EMERGENCY = [
  { label: 'Emergency', value: '911' },
  { label: 'Mass. State Police (non-emergency)', value: '(508) 820-2300' },
  { label: 'DCR Trail Emergencies', value: '(617) 722-1188' },
  { label: 'Valley Bag Shuttle dispatch', value: '(413) 555-0100' },
  { label: 'Trail Stays 24-hr traveler line', value: '(855) 555-0199' }
];

const MPH = { walk: 3, bike: 10 };
const BAG_RATE = 25; /* per transfer, per party */

/* Storytelling details surfaced on cards and property pages.
   `highlights` are drawn from each property's own description;
   `hosts` marks hosts known for trail knowledge; `est` is the build
   date for historic houses; `local` flags distinctive locally owned
   hotels and rentals. */
const LODGING_STORY = {
  roundhouse:   { est: 1890, local: true,  highlights: ['Converted 1890s freight roundhouse with exposed brick', 'Café opens at 6:30 for early departures', 'Bikes stored in the old engine bay', 'Two-minute walk to the western trailhead'] },
  paradise:     { est: 1886, hosts: true,  highlights: ['1886 Victorian with a wraparound porch above the Mill River', 'Full hot breakfast from 7:00, or a trail bag to go', 'Hosts have walked the whole trail and keep a shelf of maps', 'Packed sandwiches for the Norwottuck section'] },
  norwottuck:   { est: 1790, hosts: true,  highlights: ['Restored 1790 farmhouse on a working farm', 'Rooms look out over the fields the trail runs through', 'Farm eggs and whatever came out of the garden that week', 'Bike shed with a work stand, and dogs are welcome'] },
  jabish:       { hosts: true,             highlights: ['Faces the Belchertown common', 'Where the paved miles end and the Ware River section begins', 'The innkeeper draws the on-road connector map for guests', 'Classic first-night stop for eastbound walkers'] },
  millst:       { local: true,             highlights: ['Converted textile mill on the Ware River', 'Laundry room and a bike wash station', 'Hot breakfast buffet from 6:00', 'Diner across the street opens at 5:30'] },
  wareriver:    { est: 1840,               highlights: ['1840s village house rented whole, sleeps six', 'Porch looks at the Gilbertville covered bridge', 'Full kitchen and a drying room for wet gear', 'Kitchen stocked with coffee, eggs and bread for the first morning'] },
  maplehill:    { hosts: true,             highlights: ['Run by the same family for three generations', 'Breakfast in the sugarhouse with house maple syrup', 'The front porch is the meeting point for trail travelers', 'Hand-drawn map of the climb toward Rutland on the wall'] },
  barrecommon:  {                          highlights: ['Greek Revival house one block from Barre Common', 'Big breakfast, simple clean rooms', 'Easiest rate in the Wachusett section', 'Pets welcome'] },
  trailside:    { hosts: true,             highlights: ['Roll straight off the rail bed into the bike barn', 'Converted station-keeper\'s house at the top of the Wachusett grade', 'Sunset views west over the hills you just crossed', 'Packed lunches and full breakfast from 6:30'] },
  eaglelake:    {                          highlights: ['Swim dock on Eagle Lake at the end of a long day', 'Lakeside dinner service Thursday to Sunday', 'Morning shuttle back to the trailhead', 'Lakefront cabins for families'] },
  wachusett:    { hosts: true,             highlights: ['View of the Old Stone Church from the breakfast table', 'Three rooms, very quiet', 'Very good coffee', 'Hillside cape above the reservoir causeway'] },
  centralmass:  { est: 1920, hosts: true,  highlights: ['At the practical midpoint of the whole route', 'Shares a wall with Causeway Cycles for overnight tune-ups', 'Tavern downstairs, laundry upstairs', '1920s inn on West Boylston\'s main street'] },
  nashua:       {                          highlights: ['Restored comb factory above the Nashua River', 'Room for groups of 14 or more', 'Restaurant and laundry on site', 'Museum of Russian Icons two blocks away'] },
  assabet:      { local: true,             highlights: ['Converted shoe mill on the Assabet River', 'Hudson\'s restaurants and brewery a short walk away', 'River walk straight from the trail crossing', 'Three cafés within two blocks open before 7'] },
  hopbrook:     { est: 1720, hosts: true,  highlights: ['One of the oldest houses in Sudbury, built in the 1720s', 'Wide pine floors and low-ceilinged rooms', 'Breakfast room facing the meadows', 'A mile from the Wayside boardwalk'] },
  charlesriver: {                          highlights: ['Moody Street restaurant district at the door', 'Commuter rail one stop away for the trip home', 'Sixty rooms for large groups', 'Breakfast from 6:00'] },
  alewife:      {                          highlights: ['Self check-in lofts with a kitchen in every unit', 'Red Line downstairs for anywhere in the city', 'Short ride from the Boston end of the trail', 'Laundry in the building'] }
};
LODGING.forEach(l => Object.assign(l, LODGING_STORY[l.id] || {}));
