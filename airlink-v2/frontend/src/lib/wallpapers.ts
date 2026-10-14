export interface WallpaperPreset {
  id: string;
  name: string;
  subname: string;
  category: 'macos' | 'neon' | 'nature' | 'minimal';
  url: string;
  thumbnail: string;
  fallbackGradient: string;
  accent: string;
}

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  {
    id: 'vorssaint-neon',
    name: 'macOS Neon Waves (Vorssaint)',
    subname: 'คลื่นแสงนีออน ม่วง-คราม สไตล์ Vorssaint (ค่าเริ่มต้น)',
    category: 'neon',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2560&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=480&q=75',
    fallbackGradient: 'linear-gradient(135deg, #12072b 0%, #1a0f3d 50%, #08182b 100%)',
    accent: '#8b5cf6',
  },
  {
    id: 'sonoma-amber',
    name: 'macOS Sonoma Sunset',
    subname: 'ทิวเขาสีทอง ส้มทองอำพัน & พระอาทิตย์ตกดิน',
    category: 'macos',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2560&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=480&q=75',
    fallbackGradient: 'linear-gradient(135deg, #2b0f07 0%, #5c2411 50%, #1a0a2b 100%)',
    accent: '#f59e0b',
  },
  {
    id: 'sequoia-forest',
    name: 'macOS Sequoia Redwoods',
    subname: 'ป่าสนเรดวูด ม่านหมอกยามเช้า & เขียวมรกตสดชื่น',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2560&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=480&q=75',
    fallbackGradient: 'linear-gradient(135deg, #071f1a 0%, #0f3d32 50%, #08182b 100%)',
    accent: '#10b981',
  },
  {
    id: 'ventura-ocean',
    name: 'macOS Ventura Oceanic',
    subname: 'ทะเลครามลึก แสงสะท้อนเกลียวคลื่นสีฟ้าสดใส',
    category: 'macos',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2560&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=480&q=75',
    fallbackGradient: 'linear-gradient(135deg, #061e38 0%, #0b3d6f 50%, #0a192f 100%)',
    accent: '#0ea5e9',
  },
  {
    id: 'monterey-cosmic',
    name: 'macOS Monterey Cosmic Dark',
    subname: 'ยอดเขาจักรวาล ดอยสนสีม่วงราตรี & แสงออโรร่า',
    category: 'macos',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2560&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=480&q=75',
    fallbackGradient: 'linear-gradient(135deg, #18092b 0%, #351357 50%, #0f0724 100%)',
    accent: '#a855f7',
  },
  {
    id: 'cyberpunk-city',
    name: 'Cyberpunk Neon Midnight',
    subname: 'มหานครยามค่ำคืน แสงไฟนีออนไซเบอร์ & ตึกระฟ้า',
    category: 'neon',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=2560&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=480&q=75',
    fallbackGradient: 'linear-gradient(135deg, #050508 0%, #170d2b 50%, #070712 100%)',
    accent: '#ec4899',
  },
  {
    id: 'minimal-slate',
    name: 'Minimalist Deep Obsidian',
    subname: 'เรียบหรูระดับโปร สีชาร์โคลเทาเข้ม ถนอมสายตา',
    category: 'minimal',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=2560&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=480&q=75',
    fallbackGradient: 'linear-gradient(135deg, #0b0f19 0%, #1e293b 50%, #090d16 100%)',
    accent: '#64748b',
  },
];

