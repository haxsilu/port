// Placeholder content — replace with the real director's details.
// Everything the site renders is sourced from this file.

export const director = {
  name: "ELIAS MARR",
  roles: ["Director", "Editor", "Storyteller"],
  manifesto:
    "I make films about the space between what people say and what they mean. Every cut is a decision about what the audience is allowed to feel, and when.",
  email: "hello@eliasmarr.com",
  socials: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Vimeo", href: "https://vimeo.com" },
    { label: "IMDb", href: "https://imdb.com" },
    { label: "Letterboxd", href: "https://letterboxd.com" },
  ],
};

export type Film = {
  id: string;
  title: string;
  year: string;
  role: string;
  festivals: string[];
  synopsis: string;
};

export const films: Film[] = [
  {
    id: "hollow-light",
    title: "Hollow Light",
    year: "2024",
    role: "Director, Editor",
    festivals: ["Sundance — Official Selection", "TIFF — Discovery"],
    synopsis:
      "A lighthouse keeper's last winter, told entirely in the hours before dawn.",
  },
  {
    id: "static-bloom",
    title: "Static Bloom",
    year: "2023",
    role: "Director",
    festivals: ["Cannes — Directors' Fortnight", "Sundance"],
    synopsis:
      "Two estranged sisters rebuild their mother's radio station over one summer.",
  },
  {
    id: "the-quiet-machine",
    title: "The Quiet Machine",
    year: "2022",
    role: "Editor",
    festivals: ["Berlinale — Panorama"],
    synopsis:
      "A factory town automates itself out of existence, and no one notices until it's done.",
  },
  {
    id: "low-tide",
    title: "Low Tide",
    year: "2021",
    role: "Director, Editor",
    festivals: ["Venice — Orizzonti", "AFI Fest"],
    synopsis:
      "A coastal search-and-rescue crew keeps looking long after everyone else has stopped.",
  },
  {
    id: "paper-moons",
    title: "Paper Moons",
    year: "2020",
    role: "Director",
    festivals: ["SXSW — Narrative Feature Competition"],
    synopsis: "A father teaches his daughter to forge his own signature.",
  },
  {
    id: "afterglow",
    title: "Afterglow",
    year: "2019",
    role: "Editor",
    festivals: ["Tribeca"],
    synopsis: "The last night shift at a shuttering amusement park.",
  },
];

export type FeaturedProject = {
  id: string;
  title: string;
  year: string;
  description: string;
  embedUrl?: string; // Vimeo/YouTube embed URL — omit to show a placeholder frame
};

export const featuredProjects: FeaturedProject[] = [
  {
    id: "hollow-light-feature",
    title: "Hollow Light",
    year: "2024",
    description:
      "Shot over eleven nights on 16mm, Hollow Light follows a lighthouse keeper counting down his final winter on the rock. The film was built in the edit — three hundred hours of tide, fog, and static, cut down to eighty-two minutes of near-silence.",
  },
  {
    id: "static-bloom-feature",
    title: "Static Bloom",
    year: "2023",
    description:
      "A study in restraint: two sisters, one radio tower, and the summer they stop pretending they don't miss each other. Premiered at Cannes' Directors' Fortnight to a nine-minute standing ovation.",
  },
];

export type AwardEntry = {
  year: string;
  title: string;
  detail: string;
};

export const awards: AwardEntry[] = [
  {
    year: "2024",
    title: "Sundance Film Festival",
    detail: "Official Selection — Hollow Light",
  },
  {
    year: "2024",
    title: "TIFF Discovery",
    detail: "Programmed Feature — Hollow Light",
  },
  {
    year: "2023",
    title: "Cannes Directors' Fortnight",
    detail: "Official Selection — Static Bloom",
  },
  {
    year: "2023",
    title: "Independent Spirit Awards",
    detail: "Nominee, Best Editing — Static Bloom",
  },
  {
    year: "2022",
    title: "Berlinale Panorama",
    detail: "Official Selection — The Quiet Machine",
  },
  {
    year: "2021",
    title: "Venice Orizzonti",
    detail: "Official Selection — Low Tide",
  },
  {
    year: "2020",
    title: "SXSW",
    detail: "Narrative Feature Competition — Paper Moons",
  },
];

export const about = {
  heading: "Nine years, six films, one obsession with the space before things happen.",
  paragraphs: [
    "I started as an editor because I wanted to know how time actually works in a story — not how it's written, how it's felt. That's still the job, even now that I direct.",
    "My films are slow on purpose. I'm interested in the moment right before a decision, the held breath before someone tells the truth. Audiences call it quiet. I call it honest.",
    "Based between Lisbon and wherever the next film is shooting. Currently developing a fourth feature.",
  ],
};
