// All site copy lives here. Edit this file to change what the site says.

export const director = {
  name: "PULINDU PANSILU",
  roles: ["Film Director", "Editor", "Storyteller"],
  manifesto:
    "Crafting cinematic stories through film, emotion, and visual storytelling.",
  location: "Sri Lanka",
  email: "pulindupansilu@gmail.com",
  // TODO: these four still point at each site's homepage, not real profiles.
  socials: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "YouTube", href: "https://youtube.com" },
    { label: "Vimeo", href: "https://vimeo.com" },
    { label: "LinkedIn", href: "https://linkedin.com" },
  ],
};

export type Film = {
  id: string;
  title: string;
  format: string;
  role: string;
  synopsis: string;
  lang?: string; // BCP-47 tag when the title is not in Latin script
  videoId?: string; // YouTube id; the player only mounts when the row opens
  poster?: string; // 16:9 frame shown on hover
};

export const filmographyIntro =
  "A collection of narrative films exploring human stories, emotion, identity, and imagination.";

export const films: Film[] = [
  {
    id: "driver",
    title: "Driver",
    format: "Short Film",
    role: "Director, Editor, Producer",
    synopsis:
      "A character-driven narrative following a driver's journey through a pivotal moment that changes everything.",
    videoId: "i6pFoCD-ljo",
    poster: "/images/films/driver.jpg",
  },
  {
    id: "the-last-fix",
    title: "The Last Fix",
    format: "Short Film",
    role: "Director, Editor, Producer",
    synopsis:
      "Set in a futuristic world, a story exploring technology, humanity, and the consequences of the choices we make.",
    videoId: "sQcNt6jvkqE",
    poster: "/images/films/the-last-fix.jpg",
  },
  {
    id: "ralahami",
    title: "රාලහාමී",
    format: "Short Film",
    role: "Director, Editor, Producer",
    lang: "si",
    synopsis:
      "A Sri Lankan narrative rooted in local culture, character, and tradition.",
    videoId: "fiYC3ztm_cQ",
    poster: "/images/films/ralahami.jpg",
  },
  {
    id: "script",
    title: "Script",
    format: "Short Film",
    role: "Director, Editor, Producer",
    synopsis:
      "A meta-cinematic story exploring storytelling itself and the relationship between creator and creation.",
    videoId: "Q59MtGgoE5g",
    poster: "/images/films/script.jpg",
  },
  {
    id: "unfinished-prayer",
    title: "Unfinished Prayer",
    format: "Short Film",
    role: "Director, Editor, Producer",
    synopsis:
      "A story of faith, loss, and unresolved emotions as a young man confronts the weight of unfinished moments in his life.",
    poster: "/images/bts/grave-scene.jpg",
  },
];

export type FeaturedProject = {
  id: string;
  title: string;
  year: string;
  description: string;
  image?: string; // still used for the frame when there is no embed yet
  embedUrl?: string; // Vimeo/YouTube embed URL — takes precedence over image
};

export const featuredProjects: FeaturedProject[] = [
  {
    id: "unfinished-prayer-feature",
    title: "Unfinished Prayer",
    year: "In Production",
    description:
      "A narrative short exploring faith, loss, and the emotional struggle of a young man confronting the unfinished moments in his life. Directed, edited and produced independently.",
    image: "/images/bts/grave-scene.jpg",
  },
];

// The career so far. The left column is deliberately an age rather than a
// date — the story here is how early it started.
export type Milestone = {
  year: string;
  title: string;
  detail: string;
};

export const recognition = {
  title: "Beyond the Waves",
  placing: "Second Place",
  role: "Director, Editor, Producer",
  detail:
    "All-Island Short Video Competition, held at the University of Colombo for UN World Tourism Day, 2024.",
  // TikTok rather than an embed: its player brings a tall, heavily branded
  // card that would be the loudest thing on the page, and the film is
  // landscape, so it letterboxes badly inside one.
  watchUrl:
    "https://www.tiktok.com/@pansiluofficial/video/7431207238527749384",
  watchLabel: "Watch on TikTok",
  poster: "/images/beyond-the-waves.jpg",
  posterAlt: "A frame from Beyond the Waves: king coconuts on a table by the sand.",
  image: "/images/award-beyond-the-waves.jpg",
  imageAlt:
    "Receiving the award on stage at the University of Colombo's World Tourism Day ceremony.",
  imageWidth: 2000,
  imageHeight: 1331,
  imageCredit: "Photograph: Travel Voice Media",
};

export const behindTheLensIntro =
  "I was cutting before I was directing, and building before either. This is the order it happened in.";

export const milestones: Milestone[] = [
  {
    year: "Age 13",
    title: "Started Editing Professionally",
    detail: "Working with international clients, from Sri Lanka.",
  },
  {
    year: "Age 15",
    title: "Founded a Creative Agency",
    detail: "The first company, built while still at school.",
  },
  {
    year: "200+",
    title: "Clients",
    detail: "Commercial, branded and content work across seven years.",
  },
  {
    year: "7 Years",
    title: "In Post Production",
    detail: "Editing, colour and finishing. Certified in DaVinci Resolve.",
  },
  {
    year: "5 Films",
    title: "Directed",
    detail:
      "Driver, The Last Fix, රාලහාමී, Script, and Unfinished Prayer.",
  },
  {
    year: "Founded",
    title: "Spectrum Verse",
    detail:
      "The three companies, under one name. Where the work happens now.",
  },
];

// The three ventures, in the order they should read.
export type Venture = {
  id: string;
  name: string;
  description: string;
  // Spectrum Connect is a platform, not a production house. The three sit
  // together under Spectrum Verse, but the kind keeps that distinction legible.
  kind: "production" | "platform";
  // Short line under the name: what this one is for, and where it stands.
  role: string;
  status: string;
};

export const ventures: Venture[] = [
  {
    id: "spectrum-studio",
    kind: "production",
    role: "Film and television",
    status: "Founded",
    name: "Spectrum Studio",
    description:
      "A film and television production company developing original stories, producing independent films, and collaborating with filmmakers around the world.",
  },
  {
    id: "spectrum-media",
    kind: "production",
    role: "Commercial production",
    status: "Founded",
    name: "Spectrum Media",
    description:
      "Creative production services for commercial content, branded storytelling, editing, and visual content creation.",
  },
  {
    id: "spectrum-connect",
    kind: "platform",
    role: "Creator platform",
    status: "In development",
    name: "Spectrum Connect",
    description:
      "A creator-client platform helping creative professionals connect, collaborate, and work together without traditional commission structures.",
  },
];

export type Still = {
  src: string;
  alt: string;
  orientation: "portrait" | "landscape";
  width?: number;
  height?: number;
};

export const behindTheScenes: Still[] = [
  {
    src: "/images/bts/crew-gate.jpg",
    alt: "The crew blocking a scene at a cemetery gate, a boom operator standing by.",
    orientation: "landscape",
  },
  {
    src: "/images/bts/priest-blessing.jpg",
    alt: "The priest in white robe and black stole, hand raised mid-blessing among the graves.",
    orientation: "portrait",
  },
  {
    src: "/images/bts/gimbal-setup.jpg",
    alt: "Balancing the camera on a gimbal before a take, crew gathered around.",
    orientation: "landscape",
  },
  {
    src: "/images/bts/grave-dialogue.jpg",
    alt: "The priest and lead actor rehearsing beside an open grave.",
    orientation: "portrait",
  },
  {
    src: "/images/bts/operator-garden.jpg",
    alt: "Operator lining up a low shot on the gimbal while direction is given over his shoulder.",
    orientation: "portrait",
  },
  {
    src: "/images/bts/monitor-check.jpg",
    alt: "Checking the last take on a phone, the rig still up between setups.",
    orientation: "landscape",
  },
  {
    src: "/images/bts/priest-gravedigger.jpg",
    alt: "The priest and the gravedigger in position, the grave dug and waiting.",
    orientation: "portrait",
  },
  {
    src: "/images/bts/camera-rig.jpg",
    alt: "The camera rig handed between crew, cabled and ready for the next take.",
    orientation: "landscape",
  },
];

// Graded frames from the films themselves, as distinct from the on-set
// photography above. Natural aspects are kept — they are not all 16:9.
export const filmStills: Still[] = [
  {
    src: "/images/stills/cast.jpg",
    alt: "The cast photographed together against a painted backdrop.",
    orientation: "landscape",
    width: 1280,
    height: 993,
  },
  {
    src: "/images/stills/revolver.jpg",
    alt: "A revolver drawn low, the room falling away into teal shadow.",
    orientation: "landscape",
    width: 1280,
    height: 720,
  },
  {
    src: "/images/stills/reading.jpg",
    alt: "Two men in a dim room, one reading aloud from a sheaf of papers.",
    orientation: "landscape",
    width: 1280,
    height: 853,
  },
  {
    src: "/images/stills/workshop.jpg",
    alt: "Old equipment on a workshop shelf, lit by a single bare bulb.",
    orientation: "landscape",
    width: 1280,
    height: 720,
  },
];

export const btsIntro =
  "From the set of Unfinished Prayer — shot on location in Sri Lanka.";

// Editing and post. The reel slot is empty until there is a reel to point at;
// until then the section leans on the craft and the track record.
export const editing = {
  intro:
    "Before I directed, I cut. Seven years in the timeline — for international clients from the age of thirteen, and for more than two hundred through the agency I built at fifteen.",
  // TODO: drop in a YouTube id for the reel and the still below is replaced
  // by the player automatically.
  reelVideoId: "",
  // Shown while there is no reel; once reelVideoId is set the player takes
  // the lead and this drops below it.
  stills: [
    {
      src: "/images/editing-timeline.jpg",
      alt: "Cutting a sequence in Premiere Pro in a sound-treated edit room.",
      width: 1333,
      height: 2000,
    },
  ],
  disciplines: [
    {
      name: "Editing",
      description:
        "Pace and rhythm. Deciding what the audience sees, and when they are allowed to see it.",
    },
    {
      name: "Colour",
      description:
        "Certified in DaVinci Resolve. Grading for mood and continuity rather than for a look.",
    },
    {
      name: "Post Production",
      description:
        "Sound, titles and delivery — the work between the last take and the first screening.",
    },
  ],
};

export type EditedWork = {
  id: string;
  title: string;
  format: string;
  thumb: string;
  videoId?: string; // YouTube
  src?: string; // self-hosted mp4
  square?: boolean; // 1:1 social cut, not 16:9
  category: EditCategory;
};

export type EditCategory = "commercial" | "documentary" | "gaming";

// Order matters: commercial and documentary lead, gaming sits last, so the
// section opens on the work that speaks to film and client briefs.
export const editCategories: { id: EditCategory; label: string }[] = [
  { id: "commercial", label: "Commercial & Branded" },
  { id: "documentary", label: "Documentary & Content" },
  { id: "gaming", label: "Gaming" },
];

export const editedWork: EditedWork[] = [
  {
    id: "live-in-perth",
    title: "Live in Perth",
    format: "Concert Promo",
    // Self-hosted rather than embedded from Drive: Drive applies a daily view
    // quota and starts refusing playback once a file gets traffic.
    src: "/video/live-in-perth.mp4",
    thumb: "/images/edits/live-in-perth.jpg",
    category: "commercial",
  },
  {
    id: "crypto",
    title: "Crypto Strategy",
    format: "Content Edit",
    src: "/video/crypto.mp4",
    thumb: "/images/edits/crypto.jpg",
    category: "commercial",
  },
  {
    id: "promo70",
    title: "Telemedicine",
    format: "Social Ad",
    src: "/video/promo70.mp4",
    thumb: "/images/edits/telemedicine.jpg",
    square: true,
    category: "commercial",
  },
  {
    id: "main2",
    title: "Commentary",
    format: "Talking Head Edit",
    src: "/video/main2.mp4",
    thumb: "/images/edits/main2.jpg",
    category: "documentary",
  },
  {
    id: "samle",
    title: "Flee the Facility",
    format: "Roblox Edit",
    src: "/video/samle.mp4",
    thumb: "/images/edits/flee-the-facility.jpg",
    category: "documentary",
  },
  {
    id: "dahmer",
    title: "Dahmer",
    format: "Documentary Edit",
    src: "/video/dahmer.mp4",
    thumb: "/images/edits/dahmer.jpg",
    category: "documentary",
  },
  {
    id: "abacus",
    title: "Abacus",
    format: "Apex Legends Montage",
    videoId: "N1kuv9aOfIE",
    // Frame pulled from the video rather than YouTube's own thumbnail.
    thumb: "/images/edits/abacus.jpg",
    category: "gaming",
  },
  {
    id: "stance",
    title: "Stance",
    format: "Apex Legends Montage",
    videoId: "KD1zBRhp8Ig",
    thumb: "/images/edits/stance.jpg",
    category: "gaming",
  },
  {
    id: "warp",
    title: "Warp",
    format: "Valorant 3D Montage",
    videoId: "GPoyXyFMULg",
    thumb: "/images/edits/warp.jpg",
    category: "gaming",
  },
  {
    id: "crank-that",
    title: "Crank That",
    format: "Valorant Edit",
    videoId: "oQxBl8YMt2A",
    thumb: "/images/edits/crank-that.jpg",
    category: "gaming",
  },
];

export const spectrumVerse = {
  title: "Spectrum Verse",
  intro:
    "Three companies under one name. Not a brand exercise — a way of covering the whole distance a piece of work travels, from the first idea to the people who finish it.",
  closing:
    "Together they cover every stage: the films themselves, the commercial work that sustains them, and the platform that connects the people making both. Stories and the infrastructure to make them, built side by side.",
};


// One list. Services and Skills were two overlapping lists — "Video Editing"
// against "Editing", "Color Grading" against "Color Grading" — which read as
// padding rather than range.
export const capabilities = [
  "Directing",
  "Editing",
  "Colour Grading",
  "Screenwriting",
  "Story Development",
  "Post Production",
  "Commercial Production",
  "Creative Strategy",
];

export const availableFor = [
  "Film Projects",
  "Commercial Work",
  "Creative Collaborations",
  "Partnerships",
  "Speaking Opportunities",
];

export const about = {
  portrait: "/images/portrait.jpg",
  portraitAlt: "Pulindu Pansilu, photographed in black and white.",
  portraitWidth: 1066,
  portraitHeight: 1600,
  heading:
    "Seven years behind the timeline, now telling the stories from the front.",
  paragraphs: [
    "I am a filmmaker, editor, and creative entrepreneur from Sri Lanka.",
    "My journey began with editing and post-production, eventually evolving into directing narrative films and developing original creative projects.",
    "Today my focus is creating meaningful cinematic experiences while building platforms that empower creators and storytellers.",
    "My work combines visual precision, emotional storytelling, and a commitment to films that leave a lasting impact.",
  ],
};
