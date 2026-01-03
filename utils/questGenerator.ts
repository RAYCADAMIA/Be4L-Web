import { Quest, QuestStatus, QuestType, User } from '../types';
import { OTHER_USERS } from '../constants';

// Quest templates for each category
const QUEST_TEMPLATES = {
    Sports: [
        { activity: 'Pickleball', titles: ['Quick Pickleball Match', 'Morning Pickleball', 'Doubles Tournament', 'Beginner Pickleball'], descriptions: ['Looking for players', 'Casual game', 'Tournament style', 'New players welcome'] },
        { activity: 'Basketball', titles: ['5v5 Basketball', 'Pick-up Game', 'Half Court Run', '3v3 Tournament'], descriptions: ['Need 2 more', 'Casual run', 'Competitive game', 'Winner stays on'] },
        { activity: 'Badminton', titles: ['Badminton Singles', 'Doubles Match', 'Badminton Practice', 'Mixed Doubles'], descriptions: ['1v1 matches', 'Need partner', 'Improve skills', 'Fun game'] },
        { activity: 'Volleyball', titles: ['Beach Volleyball', '6v6 Volleyball', 'Volleyball Practice', 'Sunset Volleyball'], descriptions: ['At the beach', 'Full team', 'Work on serves', 'Chill vibes'] },
        { activity: 'Tennis', titles: ['Tennis Singles', 'Tennis Doubles', 'Practice Rally', 'Tennis Drills'], descriptions: ['Competitive match', 'Need 2 more', 'Casual hitting', 'Improve technique'] },
    ],
    Adventures: [
        { activity: 'Hiking', titles: ['Mountain Hike', 'Trail Walk', 'Peak Expedition', 'Nature Hike'], descriptions: ['5km trail', 'Easy walk', 'Summit push', 'Wildlife spotting'] },
        { activity: 'Bouldering', titles: ['Bouldering Session', 'Rock Climbing', 'Indoor Climbing', 'Outdoor Climb'], descriptions: ['V4-V6 routes', 'Beginners welcome', 'At the gym', 'Natural rocks'] },
        { activity: 'Kayaking', titles: ['River Kayak', 'Sea Kayaking', 'Kayak Tour', 'Paddle Trip'], descriptions: ['Calm waters', 'Coastal route', 'Guided tour', 'Group paddle'] },
        { activity: 'Camping', titles: ['Weekend Camp', 'Overnight Camping', 'Beach Camping', 'Mountain Camp'], descriptions: ['2 nights', 'Under stars', 'By the sea', 'Highland camp'] },
        { activity: 'Surfing', titles: ['Surf Session', 'Learn to Surf', 'Dawn Patrol', 'Surf Lesson'], descriptions: ['Good waves', 'Beginners class', 'Early surf', 'Instructor led'] },
    ],
    Travel: [
        { activity: 'Backpacking', titles: ['Backpacking Adventure', 'Europe Trip', 'Southeast Asia Run'], descriptions: ['Low budget', 'Hostel life', 'New cultures', 'Moving fast'] },
        { activity: 'Island Hopping', titles: ['Samal Hopping', 'Siargao Session', 'El Nido Tour'], descriptions: ['Crystal clear water', 'Boat life', 'Sun and sand', 'Hidden lagoons'] },
        { activity: 'City Tour', titles: ['Tokyo Explore', 'Paris Walk', 'Bangkok Markets'], descriptions: ['Urban vibes', 'Food trip', 'Night life', 'Historical sites'] },
    ],
    Social: [
        { activity: 'Coffee', titles: ['Coffee Meetup', 'Cafe Hangout', 'Coffee & Chat', 'Morning Coffee'], descriptions: ['New cafe', 'Casual chat', 'Get to know', 'Favorite spot'] },
        { activity: 'Bar', titles: ['Happy Hour', 'Bar Night', 'Drinks Out', 'Pub Crawl'], descriptions: ['After work', 'Weekend vibes', 'Catch up', 'Multiple bars'] },
        { activity: 'Restaurant', titles: ['Dinner Out', 'Brunch Spot', 'Food Trip', 'Try New Place'], descriptions: ['Italian food', 'Weekend brunch', 'Foodie adventure', 'New opening'] },
        { activity: 'Museum', titles: ['Gallery Visit', 'Museum Tour', 'Art Exhibition', 'Cultural Trip'], descriptions: ['New exhibit', 'Guided tour', 'Contemporary art', 'History museum'] },
        { activity: 'Concert', titles: ['Live Music', 'Concert Night', 'Band Performance', 'DJ Set'], descriptions: ['Local band', 'Big venue', 'Outdoor show', 'Electronic music'] },
    ],
    Train: [
        { activity: 'Running', titles: ['Morning Run', '5K Run', 'Trail Running', 'Speed Training'], descriptions: ['Easy pace', 'Group run', 'Nature trails', 'Interval training'] },
        { activity: 'Gym', titles: ['Leg Day', 'Upper Body', 'CrossFit WOD', 'Core Training'], descriptions: ['Heavy squats', 'Chest & back', 'Intense workout', 'Ab focused'] },
        { activity: 'Cycling', titles: ['Morning Ride', 'Mountain Biking', 'Road Cycling', 'Bike Trail'], descriptions: ['20km route', 'Off-road fun', 'Fast pace', 'Scenic route'] },
        { activity: 'Swimming', titles: ['Lap Swimming', 'Open Water', 'Swim Practice', 'Pool Session'], descriptions: ['Endurance laps', 'Lake swimming', 'Technique work', 'Morning swim'] },
        { activity: 'Yoga', titles: ['Sunrise Yoga', 'Power Yoga', 'Yoga Flow', 'Meditation Session'], descriptions: ['Beach yoga', 'Intense flow', 'Relaxing poses', 'Mindfulness'] },
    ],
    Others: [
        { activity: 'Gaming', titles: ['LAN Party', 'Gaming Session', 'Console Gaming', 'Board Games'], descriptions: ['Multiplayer', 'Chill gaming', 'Fighting games', 'Strategy games'] },
        { activity: 'Study', titles: ['Study Group', 'Library Study', 'Group Project', 'Study Session'], descriptions: ['Exam prep', 'Quiet study', 'Team work', 'Focus time'] },
        { activity: 'Movie', titles: ['Movie Night', 'Cinema Trip', 'Film Screening', 'Movie Marathon'], descriptions: ['New release', 'Theater outing', 'Indie film', 'Classic movies'] },
        { activity: 'Volunteering', titles: ['Beach Cleanup', 'Community Service', 'Charity Event', 'Help Out'], descriptions: ['Environmental', 'Give back', 'Fundraiser', 'Make impact'] },
        { activity: 'Cooking', titles: ['Cooking Class', 'Cook Together', 'Meal Prep', 'Baking Session'], descriptions: ['Learn new dish', 'Group cooking', 'Healthy meals', 'Desserts'] },
    ],
};

const LOCATIONS = [
    'Abreeza Sports Club', 'Metro Fitness Center', 'Davao Beach', 'Eden Nature Park',
    'SM Davao', 'People\'s Park', 'Matina Town Square', 'Roxas Avenue',
    'Samal Island', 'Crocodile Park', 'Philippine Eagle Center', 'Jack\'s Ridge',
    'Kadayawan Village', 'Shrine Hills', 'Marco Polo Davao', 'Azuela Cove',
    'Riverfront Corporate City', 'Damosa Gateway', 'Lanang Premier', 'Times Beach'
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
export function generateRandomQuests(category: string, date: Date, count: number = 10): Quest[] {
    const quests: Quest[] = [];
    const templates = category === 'All'
        ? Object.values(QUEST_TEMPLATES).flat()
        : QUEST_TEMPLATES[category as keyof typeof QUEST_TEMPLATES] || [];

    if (templates.length === 0) return [];

    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    for (let i = 0; i < count; i++) {
        const template = getRandomElement(templates);
        const title = getRandomElement(template.titles);
        const description = getRandomElement(template.descriptions);
        const host = getRandomElement(OTHER_USERS) as User;
        const maxParticipants = getRandomInt(4, 12);
        const currentParticipants = getRandomInt(1, maxParticipants - 1);
        const fee = Math.random() > 0.7 ? getRandomInt(5, 25) : 0;
        const questType = Math.random() > 0.8 ? QuestType.COMPETITION : QuestType.CASUAL;

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

        quests.push({
            id: `gen-${category}-${dateStr}-${i}`,
            host_id: host.id,
            host: host,
            type: questType,
            category: category === 'All' ? getRandomElement(['Sports', 'Adventures', 'Travel', 'Train', 'Social', 'Others']) : category,
            title: title,
            description: `${description}. ${Math.random() > 0.5 ? 'All skill levels welcome!' : 'Looking forward to meeting you!'}`,
            start_time: timeStr,
            max_participants: maxParticipants,
            current_participants: currentParticipants,
            status: currentParticipants >= maxParticipants ? QuestStatus.FULL : QuestStatus.OPEN,
            fee: fee,
            is_public: true,
            location: getRandomElement(LOCATIONS),
            activity: template.activity,
        });
    }

    return quests;
}
