Colors:

Background colors:
  Main background     → bg-[#0A0A14]
  Card background     → bg-[#12121F]
  Navbar background   → bg-[#0A0A14]/80   (80% opacity)
  Border color        → border-[#1E1E35]
  Hover card bg       → hover:bg-[#1A1A2E]

Text colors:
  White text          → text-white
  Gray text           → text-gray-400
  Light gray          → text-gray-300
  Very faint text     → text-gray-600
  Indigo text         → text-indigo-400
  Purple text         → text-purple-400

Button colors:
  Primary button bg   → bg-indigo-600
  Primary hover       → hover:bg-indigo-500
  Outline button      → border border-white/30
  Outline hover       → hover:bg-white hover:text-black

Gradient text:
  → bg-gradient-to-r from-indigo-400 to-purple-400
    bg-clip-text text-transparent

Gradient background:
  → bg-gradient-to-r from-indigo-600 to-purple-600








Typography :

Hero headline (biggest):
  → text-5xl md:text-6xl lg:text-7xl
  → font-extrabold
  → leading-tight
  → tracking-tight

Section title (large):
  → text-3xl md:text-4xl
  → font-bold
  → text-white

Section subtitle:
  → text-lg md:text-xl
  → text-gray-400
  → max-w-xl mx-auto

Card title:
  → text-xl
  → font-semibold
  → text-white

Card description:
  → text-sm md:text-base
  → text-gray-400
  → leading-relaxed

Small label above title:
  → text-xs
  → uppercase
  → tracking-widest
  → text-indigo-400
  → font-semibold

Navbar links:
  → text-sm
  → text-gray-300
  → hover:text-white
  → transition-colors duration-200

Footer text:
  → text-sm
  → text-gray-500








Spacing & Layout:

Page sections padding:
  → py-20 md:py-28 px-6 md:px-12 lg:px-20

Max width container:
  → max-w-7xl mx-auto

Section inner container:
  → max-w-6xl mx-auto

Center content:
  → flex flex-col items-center justify-center text-center

Navbar height + padding:
  → h-16 md:h-20 px-6 md:px-12

Gap between elements:
  → space-y-4    (small gap)
  → space-y-6    (medium gap)
  → space-y-10   (large gap)
  → gap-6        (grid gap small)
  → gap-8        (grid gap medium)
  → gap-12       (grid gap large)






Buttons:

Primary button (filled):
  → px-6 py-3
  → bg-indigo-600
  → hover:bg-indigo-500
  → text-white
  → font-semibold
  → rounded-lg
  → transition-all duration-200
  → hover:shadow-lg hover:shadow-indigo-500/25
  → cursor-pointer

Large primary button:
  → px-8 py-4
  → text-lg
  → (rest same as above)

Outline button:
  → px-6 py-3
  → border border-white/20
  → hover:border-white/60
  → hover:bg-white/5
  → text-white
  → font-semibold
  → rounded-lg
  → transition-all duration-200
  → cursor-pointer

Small badge/pill button:
  → px-4 py-1.5
  → rounded-full
  → bg-indigo-500/10
  → border border-indigo-500/20
  → text-indigo-400
  → text-sm
  → font-medium






Cards:

Basic feature card:
  → p-6
  → bg-[#12121F]
  → border border-[#1E1E35]
  → rounded-2xl
  → hover:border-indigo-500/50
  → hover:bg-[#1A1A2E]
  → transition-all duration-300
  → cursor-pointer

Testimonial card:
  → p-6
  → bg-[#12121F]
  → border border-[#1E1E35]
  → rounded-2xl
  → hover:-translate-y-1
  → transition-all duration-300

Glowing card:
  → p-6
  → bg-[#12121F]
  → border border-indigo-500/30
  → rounded-2xl
  → shadow-lg shadow-indigo-500/10

Stats card:
  → p-5
  → bg-[#12121F]
  → border border-[#1E1E35]
  → rounded-xl
  → text-center





Grids:

Features grid (3 columns):
  → grid grid-cols-1
    md:grid-cols-2
    lg:grid-cols-3
  → gap-6

Two column layout:
  → grid grid-cols-1
    lg:grid-cols-2
  → gap-12
  → items-center

Four column stats:
  → grid grid-cols-2
    lg:grid-cols-4
  → gap-4

Testimonials (3 columns):
  → grid grid-cols-1
    md:grid-cols-3
  → gap-6



