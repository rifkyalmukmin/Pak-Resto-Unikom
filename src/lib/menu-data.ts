export interface MenuItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string | null;
  isAvailable: boolean;
  categoryName: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  menuItems: MenuItem[];
}

export const CATEGORIES: Category[] = [
  {
    id: "1",
    name: "Appetizer",
    slug: "appetizer",
    description: "Hidangan pembuka yang menggugah selera.",
    menuItems: [
      {
        id: "a1",
        name: "Mix Dim Sum",
        slug: "mix-dim-sum",
        description: "Aneka dim sum pilihan yang dikukus sempurna dengan saus spesial rumah.",
        price: 55000,
        image: "/images/menu/mix-dim-sum.png",
        isAvailable: true,
        categoryName: "Appetizer",
      },
      {
        id: "a2",
        name: "Caesar Salad",
        slug: "caesar-salad",
        description: "Salad romaine segar dengan dressing caesar klasik, crouton renyah, dan parmesan.",
        price: 45000,
        image: "/images/menu/caesar-salad.png",
        isAvailable: true,
        categoryName: "Appetizer",
      },
    ],
  },
  {
    id: "2",
    name: "Main Course",
    slug: "main-course",
    description: "Hidangan utama yang diracik dengan penuh dedikasi.",
    menuItems: [
      {
        id: "m1",
        name: "Nasi Goreng Spesial",
        slug: "nasi-goreng-spesial",
        description: "Nasi goreng dengan telur mata sapi, ayam suwir, dan acar timun segar.",
        price: 65000,
        image: "/images/menu/nasi-goreng.png",
        isAvailable: true,
        categoryName: "Main Course",
      },
      {
        id: "m2",
        name: "Ayam Goreng Rempah",
        slug: "ayam-goreng-rempah",
        description: "Ayam goreng dengan bumbu rempah pilihan yang meresap sempurna hingga ke tulang.",
        price: 75000,
        image: "/images/menu/ayam-goreng.png",
        isAvailable: true,
        categoryName: "Main Course",
      },
      {
        id: "m3",
        name: "Rendang Sapi",
        slug: "rendang-sapi",
        description: "Rendang sapi empuk dengan bumbu rempah Minang yang kaya dan autentik.",
        price: 95000,
        image: "/images/menu/rendang-sapi.png",
        isAvailable: false,
        categoryName: "Main Course",
      },
    ],
  },
  {
    id: "3",
    name: "Dessert and Snack",
    slug: "dessert-and-snack",
    description: "Penutup manis yang sempurna untuk melengkapi makan Anda.",
    menuItems: [
      {
        id: "d1",
        name: "Chocolate Lava Cake",
        slug: "chocolate-lava-cake",
        description: "Kue coklat hangat dengan isian lava coklat leleh yang memanjakan lidah.",
        price: 55000,
        image: "/images/menu/chocolate-lava.png",
        isAvailable: true,
        categoryName: "Dessert and Snack",
      },
    ],
  },
  {
    id: "4",
    name: "Beverage",
    slug: "beverage",
    description: "Minuman segar untuk menemani hidangan Anda.",
    menuItems: [
      {
        id: "b1",
        name: "Iced Cappuccino",
        slug: "iced-cappuccino",
        description: "Espresso dengan susu segar dan busa susu yang lembut, disajikan dingin menyegarkan.",
        price: 38000,
        image: "/images/menu/iced-cappucino.png",
        isAvailable: true,
        categoryName: "Beverage",
      },
      {
        id: "b2",
        name: "Lychee Tea",
        slug: "lychee-tea",
        description: "Teh premium dengan perasan leci segar dan es batu pilihan yang menyegarkan.",
        price: 28000,
        image: "/images/menu/lychee-tea.png",
        isAvailable: true,
        categoryName: "Beverage",
      },
    ],
  },
];

export const ALL_MENU_ITEMS: MenuItem[] = CATEGORIES.flatMap((c) => c.menuItems);

export function findBySlug(slug: string): MenuItem | undefined {
  return ALL_MENU_ITEMS.find((i) => i.slug === slug);
}
