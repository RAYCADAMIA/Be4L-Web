import { Quest, QuestStatus, QuestType, User, QuestVisibilityScope } from '../types';
import { OTHER_USERS } from '../constants';

// Quest templates for each category
// Quest templates for each category
const CANON_TEMPLATES = {
    Sports: [
        { activity: 'Pickleball', titles: ['Davao Pickleball Open', 'SuperSmasher League Finals', 'MTS Pickle Cup'], descriptions: ['Elite pickleball competition at SuperSmasher.', 'Season finale for the local league.', 'Highest stakes pickleball in Davao.'] },
        { activity: 'Golf', titles: ['Rancho Palos Verdes Open', 'Davao Golf Club Championship', 'Apo Golf Invitational'], descriptions: ['Premium golf tournament at Davao\'s finest course.', 'Annual championship for local legends.', 'Elite invitational at the foothills of Mt. Apo.'] },
        { activity: 'Basketball', titles: ['Ballbreakers Invitational', 'Homecourt 5v5 Tournament', 'Coloseo Streetball Finals'], descriptions: ['Elite level basketball.', 'Davao\'s top ballers only.', 'City-wide streetball championship.'] }
    ],
    Adventures: [
        { activity: 'Road Trip', titles: ['Buda Highlands Run', 'Calaunan Scenic Drive', 'Arakan Valley Loop'], descriptions: ['Epic road trip to the fog-covered Buda.', 'Scenic views of the mountains.', 'Full day adventure through the highlands.'] },
        { activity: 'Coastal', titles: ['Coastal Road Sunset Run', 'Azuela Cove Morning Dash', 'Riverfront Loop'], descriptions: ['Scenic run along the Davao Coastal Road.', 'Early morning Azuela run.', 'Riverside cardio session.'] }
    ],
    Travel: [
        { activity: 'Island', titles: ['Samal Island Traverse', 'Talikud Island Escape', 'Island Hopping Adventure'], descriptions: ['Cross-island trekking expedition.', 'Hidden beach discovery.', 'Epic Samal sea loop.'] }
    ],
    Social: [
        { activity: 'Party', titles: ['Psyched House Party', 'Groundead Underground HP', 'Cloud29 Rooftop Social'], descriptions: ['Davao\'s wildest house party.', 'Underground vibes only.', 'Elite social at Davao\'s highest rooftop.'] }
    ],
    Train: [
        { activity: 'Ironman', titles: ['Ironman 70.3 Azuela Prep', 'Quinspot Fitness Camp', 'Coastline Endurance'], descriptions: ['Intense prep for Ironman Davao.', 'High-intensity interval training.', 'Endurance training at the coast.'] }
    ],
    Others: [
        { activity: 'Flea Market', titles: ['Weekend Flea Market', 'Azuela Night Market', 'Obrero Thrift Run'], descriptions: ['Best local finds and food.', 'Night-time shopping spree.', 'Curated thrifting at Obrero.'] }
    ],
    Jobs: [
        { activity: 'Task', titles: ['Math Tutor Needed', 'App Beta Tester', 'Event Crew @ SMX'], descriptions: ['Help a freshman with Calculus.', 'Test a new local lifestyle app.', 'Assist in a major event setup at SMX.'] },
        { activity: 'Gig', titles: ['Social Media Mod', 'Photography Assistant', 'Campus Courier'], descriptions: ['Moderate a local community group.', 'Assist in a wedding shoot.', 'Help deliver study packs around campus.'] }
    ]
};

const QUEST_TEMPLATES = {
    Sports: [
        { activity: 'Pickleball', titles: ['Play Pickleball @ PickleTown', 'Quick Rally @ MTS', 'Pickleball Night', 'Beginner Pickleball Davao'], descriptions: ['Looking for players at PickleTown', 'Casual game at MTS Town Square', 'Sunset pickleball session', 'New to the sport? Let\'s rally!'] },
        { activity: 'Golf', titles: ['9 Holes @ Rancho', 'Driving Range Session', 'Morning Tee Time', 'Golf with Vibes'], descriptions: ['Quick round at Rancho Palos Verdes', 'Working on my swing at the range', 'Early morning tee off at Davao Golf Club', 'Casual golf and chill with the crew'] },
        { activity: 'Basketball', titles: ['Casual 3v3 @ Homecourt', 'Shootaround @ Coloseo', 'Evening Ball @ Ballbreakers', 'Pickup Game'], descriptions: ['Casual hoops at Homecourt', 'Quick shooting session at Coloseo', 'Night ball at Ballbreakers', 'Looking for a full court run'] },
        { activity: 'Bowling', titles: ['Bowling Night @ SM', 'Strike Session', 'Gaisano Bowling Meet', 'Lucky Bowl Run'], descriptions: ['Evening strikes and vibes', 'Casual bowling session', 'Meeting at the bowling lanes', 'Work on your hook shot'] },
    ],
    Adventures: [
        { activity: 'Running', titles: ['Coastal Road Run', 'Azuela Morning Dash', 'Magsaysay Jog', 'Shrine Hill Run'], descriptions: ['Scenic run by the sea', 'Quick Azuela cardio', 'Morning jog at the park', 'Hill sprints at Shrine'] },
        { activity: 'Car Meet', titles: ['South Davao Car Meet', 'Night Riders Meetup', 'JDM Chill Night', 'Azuela Auto Expo'], descriptions: ['Showcasing local builds', 'Night-time cruise and chill', 'JDM enthusiasts only', 'Auto show at Azuela'] },
    ],
    Travel: [
        { activity: 'Road Trip', titles: ['Budda Matcha Run', 'Highlands Cafe Escape', 'Foggy Buda Drive'], descriptions: ['Driving to Buda for the best matcha', 'Escaping the heat at the highlands', 'Cool breeze and foggy mountain views'] },
    ],
    Social: [
        { activity: 'Matcha', titles: ['Matcha Coffee Run', 'The Matcha Spot Meetup', 'Obrero Matcha Hangout', 'Morning Matcha'], descriptions: ['Testing the new matcha spot', 'Brunch and matcha lattes', 'Quick caffeine fix in Obrero', 'Davao\'s best matcha crawl'] },
        { activity: 'Cafe Meet', titles: ['Out of Boredom Cafe Meet', 'Steep Coffee Hangout', 'Glasshouse Session', 'Creative Cafe Work'], descriptions: ['Meeting up just because we\'re bored', 'Coffee and chill at Steep', 'Productive vibes at the Glasshouse', 'Work session at my favorite cafe'] },
        { activity: 'Party', titles: ['Psyched House Party', 'Apartment Vibe Session', 'Weekend Social', 'Night Out'], descriptions: ['Ultimate house party vibes', 'Chill apartment hangout', 'Weekend social gathering', 'Davao nightlife run'] },
    ],
    Train: [
        { activity: 'Gym', titles: ['Morning Lift @ Metro', 'Quinspot Session', 'Gym Grind', 'Hardcore Workout'], descriptions: ['Early session at Metro Fitness', 'Training at Quinspot', 'Daily gym routine', 'Lets get those gains'] },
        { activity: 'Pilates', titles: ['Pilates @ Azuela', 'Core Strength Session', 'Morning Flow', 'Pilates Meetup'], descriptions: ['Elegant flow at Azuela', 'Focusing on core and mobility', 'Early morning pilates session', 'Community workout'] },
    ],
    Others: [
        { activity: 'Flea Market', titles: ['Azuela Market Run', 'Roxas Night Market Eat', 'Flea Market Find'], descriptions: ['Finding gems at the market', 'Best street food in Davao', 'Antique and thrift hunting'] },
    ],
    Jobs: [
        { activity: 'Tutor', titles: ['Help with Homework', 'English Conversation Practice', 'Math Problem Solver'], descriptions: ['Need help with algebra homework', 'Practice English with a local', 'Solve some engineering problems together'] },
        { activity: 'Assistance', titles: ['Grocery Run Help', 'Moving Boxes Assistance', 'Tech Support Needed'], descriptions: ['Help me carry heavy groceries', 'Need an extra pair of hands for moving', 'Help me fix my laptop software'] },
    ],
};

const LOCATIONS = [
    'SuperSmasher Pickleball', 'PickleTown Davao', 'MTS Pickle Courts', 'Azuela Cove',
    'Buda Highlands', 'Davao Coastal Road', 'Metro Fitness Center', 'Matina Town Square',
    'SM Lanang Premier', 'SM City Davao - Bowling', 'Quinspot', 'Ballbreakers HQ',
    'Homecourt Davao', 'Coloseo Streetball', 'The Matcha Spot', 'Steep Coffee - Obrero',
    'Glasshouse Coffee', 'Roxas Night Market', 'People\'s Park', 'Abreeza Mall',
    'Cloud29 Rooftop', 'Azuela Night Market', 'Shrine Hill', 'Magsaysay Park',
    'Rancho Palos Verdes', 'Davao Golf Club', 'Apo Golf & Country Club',
    'UP Mindanao Library', 'Ateneo de Davao University', 'SMX Convention Center',
    'Obrero Shared Space', 'Davao City Library', 'Workspace Davao'
];

const TIMES = [
    'Today, 6:00 AM', 'Today, 8:00 AM', 'Today, 10:00 AM', 'Today, 2:00 PM',
    'Today, 4:00 PM', 'Today, 6:00 PM', 'Today, 7:00 PM', 'Today, 8:00 PM',
    'Tomorrow, 7:00 AM', 'Tomorrow, 9:00 AM', 'Tomorrow, 11:00 AM', 'Tomorrow, 3:00 PM',
    'Tomorrow, 5:00 PM', 'Tomorrow, 7:00 PM'
];

function getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate random quests for a specific category and date
export function generateRandomQuests(category: string, date: Date, count: number = 10, specificType?: QuestType): Quest[] {
    const quests: Quest[] = [];

    // Choose templates based on type
    let templates: any[] = [];
    if (specificType === QuestType.CANON) {
        const canonBase = category === 'All'
            ? Object.values(CANON_TEMPLATES).flat()
            : CANON_TEMPLATES[category as keyof typeof CANON_TEMPLATES] || [];
        const regularBase = category === 'All'
            ? Object.values(QUEST_TEMPLATES).flat()
            : QUEST_TEMPLATES[category as keyof typeof QUEST_TEMPLATES] || [];
        templates = [...canonBase, ...regularBase];
    } else {
        templates = category === 'All'
            ? Object.values(QUEST_TEMPLATES).flat()
            : QUEST_TEMPLATES[category as keyof typeof QUEST_TEMPLATES] || [];
    }

    if (templates.length === 0) return [];

    const d = date instanceof Date ? date : new Date(date);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    for (let i = 0; i < count; i++) {
        let template;

        // Force specific templates for the first 5 cards if category is 'All' for presentation
        if (category === 'All' && i < 5) {
            const featuredActivities = ['Pickleball', 'Golf', 'Party', 'Flea Market', 'Matcha'];
            const targetActivity = featuredActivities[i];
            template = templates.find(t => t.activity === targetActivity);
            if (!template) template = getRandomElement(templates);
        } else {
            template = getRandomElement(templates);
        }

        const title = getRandomElement(template.titles) as string;
        const description = getRandomElement(template.descriptions) as string;
        const host = getRandomElement(OTHER_USERS) as User;
        const maxParticipants = getRandomInt(4, 12);
        const currentParticipants = getRandomInt(1, maxParticipants - 1);
        const fee = Math.random() > 0.7 ? getRandomInt(5, 25) : 0;

        // Use specific type if provided, otherwise random between SPONTY and RANDOM
        const questType = specificType || (Math.random() > 0.7 ? QuestType.SPONTY : QuestType.RANDOM);

        const auraReward = questType === QuestType.CANON ? getRandomInt(50, 100) : (questType === QuestType.SPONTY ? getRandomInt(20, 40) : getRandomInt(10, 25));
        const expReward = questType === QuestType.CANON ? getRandomInt(300, 600) : (questType === QuestType.SPONTY ? getRandomInt(100, 250) : getRandomInt(50, 150));

        // Set time to be on the specified date
        const hours = getRandomInt(6, 21);
        const minutes = getRandomInt(0, 3) * 15; // 0, 15, 30, 45
        const questDate = new Date(date);
        questDate.setHours(hours, minutes, 0, 0);

        const timeStr = questDate.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        // Generate more dense coordinates for Sponty pins
        const locationCoords = questType === QuestType.SPONTY ? {
            latitude: 7.0736 + (Math.random() - 0.5) * 0.04,
            longitude: 125.6128 + (Math.random() - 0.5) * 0.04
        } : undefined;

        // Sample captures from Unsplash to show in pins
        const sampleCaptures = [
            'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=200',
            'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=200',
            'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=200',
            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=200',
            'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=200'
        ];

        quests.push({
            id: `gen-${category}-${dateStr}-${questType}-${i}-${Math.random().toString(36).substr(2, 5)}`,
            host_id: host.id,
            host: host,
            mode: questType as any,
            source: 'SYSTEM_GENERATED',
            category: category === 'All' ? getRandomElement(['Sports', 'Adventures', 'Travel', 'Train', 'Social', 'Jobs', 'Others']) : category,
            title: title,
            description: `${description}. ${Math.random() > 0.5 ? 'All skill levels welcome!' : 'Looking forward to meeting you!'}`,
            start_time: questDate.toISOString(),
            max_participants: maxParticipants,
            capacity: maxParticipants,
            current_participants: currentParticipants,
            status: currentParticipants >= maxParticipants ? QuestStatus.ACTIVE : QuestStatus.DISCOVERABLE,
            fee: fee,
            is_public: true,
            visibility_scope: QuestVisibilityScope.PUBLIC,
            join_mode: 'OPEN_ACTIVE',
            approval_required: false,
            location: {
                lat: locationCoords?.latitude || 7.0707,
                lng: locationCoords?.longitude || 125.6087,
                place_name: getRandomElement(LOCATIONS)
            },
            location_coords: locationCoords,
            host_capture_url: questType === QuestType.SPONTY ? getRandomElement(sampleCaptures) : undefined,
            activity: template.activity,
            aura_reward: auraReward,
            exp_reward: expReward,
            participants: [host, ...OTHER_USERS.slice(0, currentParticipants - 1)],
            participant_ids: [host.id, ...OTHER_USERS.slice(0, currentParticipants - 1).map(u => u.id)]
        });
    }

    return quests;
}
