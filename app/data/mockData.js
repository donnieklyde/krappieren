export const INITIAL_POSTS = [
    {
        id: 20260129,
        username: "RSHBKR",
        content: "foreshadowings are canceled",
        time: "Just now",
        likes: 0,
        replies: 0,
        avatarUrl: "",
        comments: []
    },
    {
        id: 999999, // High ID to avoid collision or could be 0
        username: "donnieklyde",
        content: "BE NASTY",
        time: "1m",
        likes: 666,
        replies: 0,
        avatarUrl: "", // Use generic or empty
        comments: [],
        language: 'english'
    },
    {
        id: 1,
        username: "zuck",
        content: "Welcome to krappieren. The future is connected (and monetized).",
        time: "2h",
        likes: 1205,
        replies: 45,
        avatarUrl: "https://upload.wikimedia.org/wikipedia/commons/1/18/Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg",
        comments: [
            { id: 101, user: "fan1", text: "So true bestie." },
            { id: 102, user: "hater0", text: "Mid." },
            { id: 103, user: "observer", text: "Verifying the Matrix." },
            { id: 104, user: "observer", text: "Test cross-post persistence." }
        ]
    },
    {
        id: 2,
        username: "elonmusk",
        content: "Looking into buying this platform.",
        time: "5m",
        likes: 5400,
        replies: 342,
        avatarUrl: "",
        comments: []
    },
    {
        id: 3,
        username: "webdesigner",
        content: "Design is not just what it looks like and feels like. Design is how it works. And this works.",
        time: "45m",
        likes: 89,
        replies: 12,
        avatarUrl: "",
        comments: [
            { id: 301, user: "observer", text: "The design is immaculate." }
        ]
    },
    {
        id: 4,
        username: "techinsider",
        content: "Breaking: AI agents are now building whole apps in minutes. #Future #AI #Tech",
        time: "1h",
        likes: 420,
        replies: 56,
        avatarUrl: "",
        comments: []
    },
    {
        id: 5,
        username: "drdoom",
        content: "The market is about to crash. Prepare yourselves.",
        time: "3h",
        likes: 231,
        replies: 88,
        avatarUrl: "",
        comments: []
    },
    {
        id: 6,
        username: "cryptoking",
        content: "Bitcoin to 100k by EOY. Don't miss out. 🚀",
        time: "4h",
        likes: 1024,
        replies: 156,
        avatarUrl: "",
        comments: []
    },
    {
        id: 7,
        username: "travelblogger",
        content: "Just arrived in Tokyo! The food here is incredible. 🍣",
        time: "5h",
        likes: 67,
        replies: 5,
        avatarUrl: "",
        comments: []
    },
    {
        id: 8,
        username: "coffeeaddict",
        content: "If I don't have my espresso in the morning, is it even morning?",
        time: "6h",
        likes: 45,
        replies: 8,
        avatarUrl: "",
        comments: []
    },
    {
        id: 9,
        username: "startupguru",
        content: "Hustle culture is dead. It's about flow culture now.",
        time: "7h",
        likes: 890,
        replies: 120,
        avatarUrl: "",
        comments: []
    },
    {
        id: 10,
        username: "artistamy",
        content: "Working on a new digital piece today. Can't wait to share!",
        time: "8h",
        likes: 12,
        replies: 2,
        avatarUrl: "",
        comments: []
    },
    {
        id: 11,
        username: "gamerpro",
        content: "New speedrun record! 14:02!",
        time: "9h",
        likes: 333,
        replies: 44,
        avatarUrl: "",
        comments: []
    },
    {
        id: 12,
        username: "cheframsay",
        content: "This risotto is RAW!",
        time: "10h",
        likes: 5000,
        replies: 600,
        avatarUrl: "",
        comments: []
    },
    {
        id: 13,
        username: "philosophicalcat",
        content: "If I fits, I sits. That is the law.",
        time: "11h",
        likes: 9999,
        replies: 200,
        avatarUrl: "",
        comments: []
    },
    {
        id: 14,
        username: "fitnessfreak",
        content: "No pain, no gain. 5am club let's go!",
        time: "12h",
        likes: 150,
        replies: 20,
        avatarUrl: "",
        comments: []
    },
    {
        id: 15,
        username: "newsbot",
        content: "Global temperatures reach record highs this summer.",
        time: "13h",
        likes: 10,
        replies: 5,
        avatarUrl: "",
        comments: []
    },
    {
        id: 16,
        username: "historybuff",
        content: "On this day in 1969, humanity landed on the moon. 🌕",
        time: "14h",
        likes: 1969,
        replies: 50,
        avatarUrl: "",
        comments: []
    },
    {
        id: 17,
        username: "memelord",
        content: "Me explaining to my mom that I can't pause an online game:",
        time: "15h",
        likes: 50000,
        replies: 1200,
        avatarUrl: "",
        comments: []
    },
    {
        id: 18,
        username: "sciencedaily",
        content: "New study shows that procrastinating actually helps creativity (if you do it right).",
        time: "16h",
        likes: 800,
        replies: 90,
        avatarUrl: "",
        comments: []
    },
    {
        id: 19,
        username: "dadjokes",
        content: "I'm afraid for the calendar. Its days are numbered.",
        time: "17h",
        likes: 45,
        replies: 200,
        avatarUrl: "",
        comments: []
    },
    {
        id: 20,
        username: "foodiegurl",
        content: "Unpopular opinion: Pineapple belongs on pizza. 🍍🍕",
        time: "18h",
        likes: 200,
        replies: 5000,
        avatarUrl: "",
        comments: [
            { id: 2001, user: "italianchef", text: "Mamma mia... no." }
        ]
    },
    {
        id: 21,
        username: "indiedev",
        content: "Just shipped my first SaaS! $0 MRR but we move. 💻",
        time: "19h",
        likes: 300,
        replies: 120,
        avatarUrl: "",
        comments: []
    },
    {
        id: 22,
        username: "naturephotography",
        content: "Sunset over the Alps. majestic.",
        time: "20h",
        likes: 9000,
        replies: 45,
        avatarUrl: "",
        comments: []
    },
    {
        id: 23,
        username: "cryptoscambot",
        content: "Send 1 ETH get 2 ETH back! (Legit) (Real)",
        time: "21h",
        likes: 0,
        replies: 50,
        avatarUrl: "",
        comments: [
            { id: 2301, user: "realperson", text: "Scam." }
        ]
    },
    {
        id: 24,
        username: "motivationquotes",
        content: "Your only limit is your mind.",
        time: "22h",
        likes: 1540,
        replies: 23,
        avatarUrl: "",
        comments: []
    },
    {
        id: 25,
        username: "catvideos",
        content: "Watch this cat jump over a fence!",
        time: "23h",
        likes: 100000,
        replies: 560,
        avatarUrl: "",
        comments: []
    },
    {
        id: 26,
        username: "coolarchitect",
        content: "Brutalist architecture is making a comeback.",
        time: "1d",
        likes: 440,
        replies: 110,
        avatarUrl: "",
        comments: []
    },
    {
        id: 27,
        username: "moviecritic",
        content: "The ending of Inception explained.",
        time: "1d",
        likes: 300,
        replies: 200,
        avatarUrl: "",
        comments: []
    },
    {
        id: 28,
        username: "randomthoughts",
        content: "Why do we press harder on the remote when the batteries are dead?",
        time: "1d",
        likes: 5600,
        replies: 400,
        avatarUrl: "",
        comments: []
    },
    {
        id: 29,
        username: "fashionnova",
        content: "Denim on denim? Yay or nay?",
        time: "1d",
        likes: 120,
        replies: 340,
        avatarUrl: "",
        comments: []
    },
    {
        id: 30,
        username: "bookworm",
        content: "Just finished 'Dune'. The spice must flow.",
        time: "1d",
        likes: 890,
        replies: 60,
        avatarUrl: "",
        comments: []
    },
    {
        id: 31,
        username: "musiclover",
        content: "Vinyl just sounds better. You can't change my mind.",
        time: "1d",
        likes: 450,
        replies: 78,
        avatarUrl: "",
        comments: []
    },
    {
        id: 32,
        username: "gymrat",
        content: "Leg day. Send help.",
        time: "1d",
        likes: 670,
        replies: 45,
        avatarUrl: "",
        comments: []
    },
    {
        id: 33,
        username: "sneakerhead",
        content: "Got the L on the drop again. 😭",
        time: "2d",
        likes: 230,
        replies: 23,
        avatarUrl: "",
        comments: []
    },
    {
        id: 34,
        username: "uxdesigner",
        content: "Don't make me think.",
        time: "2d",
        likes: 567,
        replies: 12,
        avatarUrl: "",
        comments: []
    },
    {
        id: 35,
        username: "vintageshop",
        content: "Found this typewriter at a yard sale. $5!",
        time: "2d",
        likes: 8900,
        replies: 344,
        avatarUrl: "",
        comments: []
    }
];

export const INITIAL_ACTIVITIES = [
    { id: 1, type: 'money', user: 'fan1', amount: 5, time: '2m ago' },
    { id: 2, type: 'slave', user: 'observer', time: '5m ago' },
    { id: 3, type: 'money', user: 'zuck', amount: 100, time: '1h ago' },
    { id: 4, type: 'money', user: 'randomguy', amount: 1, time: '2h ago' },
    { id: 5, type: 'slave', user: 'hater0', time: '3h ago' },
    { id: 6, type: 'money', user: 'elonmusk', amount: 50, time: '4h ago' },
    { id: 7, type: 'mention', user: 'techinsider', time: '5h ago' },
    { id: 8, type: 'slave', user: 'startupbro', time: '6h ago' },
    { id: 9, type: 'money', user: 'vcguy', amount: 1000, time: '7h ago' },
    { id: 10, type: 'mention', user: 'webdesigner', time: '8h ago' },
    { id: 11, type: 'slave', user: 'intern1', time: '9h ago' },
    { id: 12, type: 'money', user: 'fan2', amount: 2, time: '10h ago' },
    { id: 13, type: 'money', user: 'fan3', amount: 5, time: '11h ago' },
    { id: 14, type: 'slave', user: 'lurker99', time: '12h ago' },
    { id: 15, type: 'mention', user: 'competitorceo', time: '13h ago' },
    { id: 16, type: 'money', user: 'mom', amount: 20, time: '14h ago' },
    { id: 17, type: 'slave', user: 'botaccount', time: '15h ago' },
    { id: 18, type: 'money', user: 'whaleuser', amount: 500, time: '1d ago' },
    { id: 19, type: 'mention', user: 'pressrelease', time: '1d ago' },
    { id: 20, type: 'slave', user: 'new_user_123', time: '1d ago' },
    { id: 21, type: 'money', user: 'cryptobro', amount: 10, time: '1d ago' },
    { id: 22, type: 'slave', user: 'aibot', time: '2d ago' },
    { id: 23, type: 'mention', user: 'zuck', time: '2d ago' },
    { id: 24, type: 'money', user: 'earlyadopter', amount: 25, time: '2d ago' },
    { id: 25, type: 'slave', user: 'latecomer', time: '3d ago' },
];

export const getTakenUsernames = () => {
    const postUsers = INITIAL_POSTS.map(p => p.username);
    const commentUsers = INITIAL_POSTS.flatMap(p => (p.comments || []).map(c => c.user));
    const activityUsers = INITIAL_ACTIVITIES.map(a => a.user);

    const users = new Set([
        ...postUsers,
        ...commentUsers,
        ...activityUsers,
        "admin", "god", "system", "anonymous"
    ]);
    return Array.from(users);
};
