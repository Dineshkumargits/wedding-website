import fs from 'fs';
import path from 'path';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

export interface RSVP {
  id: string;
  name: string;
  attendance: 'yes' | 'no';
  guestsCount: number;
  dietary?: string;
  message?: string;
  createdAt: string;
}

export interface Wish {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

interface DBData {
  rsvps: RSVP[];
  wishes: Wish[];
}

function initDB(): DBData {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initialData: DBData = { rsvps: [], wishes: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content) as DBData;
  } catch (error) {
    console.error('Error reading database file, resetting database', error);
    const initialData: DBData = { rsvps: [], wishes: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

export function getRSVPs(): RSVP[] {
  const db = initDB();
  return db.rsvps || [];
}

export function saveRSVP(rsvp: Omit<RSVP, 'id' | 'createdAt'>): RSVP {
  const db = initDB();
  const newRSVP: RSVP = {
    ...rsvp,
    id: Math.random().toString(36).substring(2, 9),
    createdAt: new Date().toISOString(),
  };
  db.rsvps.push(newRSVP);
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  return newRSVP;
}

export function getWishes(): Wish[] {
  const db = initDB();
  return db.wishes || [];
}

export function saveWish(wish: Omit<Wish, 'id' | 'createdAt'>): Wish {
  const db = initDB();
  const newWish: Wish = {
    ...wish,
    id: Math.random().toString(36).substring(2, 9),
    createdAt: new Date().toISOString(),
  };
  db.wishes.unshift(newWish); // New wishes at the top
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  return newWish;
}
