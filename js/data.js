const articles = [
    {
        title: "The IMERSE Lab: A New Era of Autonomous Surgical Robotics",
        author: "Lori Preci",
        date: "Nov 3, 2025",
        image: "https://static.wixstatic.com/media/11b1c4_790a12e131b64175aa547cdd45d902c1~mv2.jpg",
        link: "https://www.catalyst-magazine.com/post/the-imerse-lab-a-new-era-of-autonomous-surgical-robotics",
        category: "biotech",
        excerpt: "Inside Johns Hopkins University’s IMERSE Lab, surgical robotics is entering a new frontier."
    },
    {
        title: "Decoding Demyelination: Dr. Jeffrey Huang's Innovative Research on MS",
        author: "Naama Ben-Dor",
        date: "Oct 22, 2025",
        image: "https://static.wixstatic.com/media/11b1c4_64403204e5444555b7109a01bfbb794b~mv2.jpg",
        link: "https://www.catalyst-magazine.com/post/decoding-demyelination-a-look-inside-dr-jeffrey-huang-s-innovative-research-on-ms",
        category: "neuro",
        excerpt: "Dr. Jeffrey Huang's lab holds a patent for a potential new MS drug targeting amino acid transporters."
    },
    {
        title: "I Am, therefore I See: How The Brain Edits Reality on The Fly",
        author: "Le Nguyen",
        date: "Oct 9, 2025",
        image: "https://static.wixstatic.com/media/11b1c4_9dd8aec783314c05bfffc9e0f6123770~mv2.jpg",
        link: "https://www.catalyst-magazine.com/post/i-am-therefore-i-see-how-the-brain-edits-reality-on-the-fly",
        category: "neuro",
        excerpt: "Dr. Sarah Shomstein reveals how our mind silently sorts the sensory chaos around us."
    },
    {
        title: "The Geography of Risk: How D.C. Neighborhoods Shape Children's Health",
        author: "Alexis Tamm",
        date: "Sep 18, 2025",
        image: "https://static.wixstatic.com/media/11b1c4_067249c3dd7549b3b2825cc93ee675ec~mv2.jpg",
        link: "https://www.catalyst-magazine.com/post/the-geography-of-risk-how-d-c-neighborhoods-shape-children-s-health",
        category: "public",
        excerpt: "Environmental racism and climate hazards disproportionately harm marginalized communities in D.C."
    },
    {
        title: "The Cosmic Journey of Dr. Duilia De Mello",
        author: "Layla Abdoulaye",
        date: "Sep 8, 2025",
        image: "https://static.wixstatic.com/media/11b1c4_f6fb601d0e8342bcbb0bda53453f6e30~mv2.jpg",
        link: "https://www.catalyst-magazine.com/post/the-cosmic-journey-of-dr-duilia-de-mello",
        category: "biochemphys",
        excerpt: "Using the universe's oldest light to piece together our cosmic origins from Brazil to NASA."
    },
    {
        title: "How Community-Led Science is Revolutionizing Research",
        author: "Aidan Brown",
        date: "Sep 6, 2025",
        image: "https://static.wixstatic.com/media/11b1c4_37e75f32aa924b718d4eb0309ba0d553~mv2.jpg",
        link: "https://www.catalyst-magazine.com/post/how-community-led-science-is-revolutionizing-research",
        category: "public",
        excerpt: "Scientist Sacoby Wilson is leading a movement to put research tools directly in the hands of the people."
    },
    {
        title: "Charting the Future of Myasthenia Gravis Therapy",
        author: "Alex Carter",
        date: "Aug 18, 2025",
        image: "https://static.wixstatic.com/media/11b1c4_1bb33ffb6fc6402cb87a0b6502e23285~mv2.jpg",
        link: "https://www.catalyst-magazine.com/post/charting-the-future-of-myasthenia-gravis-therapy",
        category: "neuro",
        excerpt: "Leading expert Dr. Henry Kaminski guides us through the latest breakthroughs in MG treatment."
    },
    {
        title: "How Dr. Brandon Kohrt is Expanding Access to Mental Health Care",
        author: "Lori Preci & Aidan Schurr",
        date: "Aug 10, 2025",
        image: "https://static.wixstatic.com/media/11b1c4_2e85837e233748b194ee2be01af0699c~mv2.jpg",
        link: "https://www.catalyst-magazine.com/post/how-dr-brandon-kohrt-is-expanding-access-to-mental-health-care",
        category: "public",
        excerpt: "Combining deep cultural insight with scientific rigor to build inclusive global mental health systems."
    },
    {
        title: "How Coastal Trees Adapt Amid Rising Seas",
        author: "Aidan Brown",
        date: "July 10, 2025",
        image: "https://static.wixstatic.com/media/11b1c4_4c10a42242c843f2ba85e9d2233e47c9~mv2.jpeg",
        link: "https://www.catalyst-magazine.com/post/how-coastal-trees-adapt-amid-rising-seas",
        category: "env",
        excerpt: "Scientist Riley Leff dives deep into the hidden strategies trees use to survive extreme stress."
    },
    {
        title: "From Battling a Rare Bioweapon Pathogen to Pioneering Global Health Security",
        author: "Aidan Schurr",
        date: "Jul 1, 2025",
        image: "https://static.wixstatic.com/media/11b1c4_47e7a044e37c4cceb9dd09977d590c30~mv2.jpg",
        link: "https://www.catalyst-magazine.com/post/reframing-health-as-a-national-security-issue",
        category: "public",
        excerpt: "Rebecca Katz’s plan to volunteer in India was unraveled by a severe illness that doctors struggled to diagnose."
    },
    {
        title: "Designing a Sustainable Future with Sun, Wind, and Water",
        author: "Ginger Taurek",
        date: "June 7, 2025",
        image: "https://static.wixstatic.com/media/11b1c4_0fe12e2d642740d6b58bbda1df751199~mv2.jpeg",
        link: "https://www.catalyst-magazine.com/post/designing-a-sustainable-future-with-sun-wind-and-water",
        category: "env",
        excerpt: "For innovator Scott Sklar, renewable energy is about more than climate—it’s about human survival."
    },
    {
        title: "Elucidating the Brain’s Language Circuitry with Dr. Michael Ullman",
        author: "Catalyst Team",
        date: "May 16, 2025",
        image: "https://static.wixstatic.com/media/11b1c4_4d74a6206a0f43c9a38125c8bc03e28e~mv2.jpg",
        link: "https://www.catalyst-magazine.com/post/elucidating-the-brain-s-language-circuitry-with-dr-michael-ullman",
        category: "neuro",
        excerpt: "Dr. Michael T. Ullman's Declarative/Procedural model links mental lexicon to declarative memory."
    },
    {
        title: "Sitting Down with the Editor-in-Chief of Science Magazine",
        author: "Alex Carter & Aidan Schurr",
        date: "May 07, 2025",
        image: "https://static.wixstatic.com/media/11b1c4_548f96bc13fa4021b9b0c26e3f625fcc~mv2.jpg",
        link: "https://www.catalyst-magazine.com/post/sitting-down-with-the-editor-in-chief-of-science-magazine-to-talk-about-the-future-of-scientific-co",
        category: "public",
        excerpt: "We sat down with Holden Thorp to explore how one of the world’s leading science journals navigates communication."
    },
    {
        title: "Dr. Song Gao’s Chemistry-Policy Crusade Against Hidden Pollutants",
        author: "Naama Ben-Dor",
        date: "Apr 19, 2025",
        image: "https://static.wixstatic.com/media/11b1c4_0384c4b9d49545a3b2e708073485f11b~mv2.jpg",
        link: "https://www.catalyst-magazine.com/post/pollution-to-solution-dr-song-gao-on-science-policy-and-environmental-sustainability",
        category: "env",
        excerpt: "Dr. Song Gao bridges science and policy to tackle climate change, ozone depletion, and environmental sustainability."
    },
    {
        title: "How One Engineer is Changing Sustainable Fuels",
        author: "Aidan Schurr",
        date: "Apr 10, 2025",
        image: "https://static.wixstatic.com/media/11b1c4_4491d15e55c94d058d2a63eedf3cfc42~mv2.png",
        link: "https://www.catalyst-magazine.com/post/how-one-engineer-is-changing-sustainable-fuels",
        category: "env",
        excerpt: "Tyler Wyka bridges engineering, sustainability, and global collaboration to drive real-world solutions."
    },
    {
        title: "How The World of Genetics Shapes Evolution",
        author: "Alex Carter",
        date: "Mar 14, 2025",
        image: "https://static.wixstatic.com/media/11b1c4_9e5fcb3b2c194aba87fb93241ade3b8b~mv2.jpeg",
        link: "https://www.catalyst-magazine.com/post/how-the-world-of-genetics-shapes-evolution",
        category: "biochemphys",
        excerpt: "Dr. Luca Livraghi studies the colorful patterns on butterfly wings to understand evolutionary novelty."
    },
    {
        title: "Serendipity and Science: The Journey of Dr. John Hawdon",
        author: "Lori Preci",
        date: "Mar 05, 2025",
        image: "https://static.wixstatic.com/media/44031f_75620e6213e04a56b298580689208fce~mv2.jpeg",
        link: "https://www.catalyst-magazine.com/post/serendipity-and-science-the-journey-of-dr-john-hawdon",
        category: "biochemphys",
        excerpt: "Dr. Hawdon’s research tackles anthelmintic resistance in parasites, a threat to human and animal health."
    },
    {
        title: "Dr. Brent Harris’ Brain Bank Revolution",
        author: "Aidan Schurr",
        date: "Feb 15, 2025",
        image: "https://static.wixstatic.com/media/11b1c4_0790d57e5eef4d119d3c9497017df5ca~mv2.jpeg",
        link: "https://www.catalyst-magazine.com/post/from-brain-to-bench-to-bedside-and-beyond-how-a-dc-neuroscientist-is-changing-brain-disease-researc",
        category: "neuro",
        excerpt: "Dr. Brent Harris's work in neuropathology, ALS research, and advocacy helps countless lives."
    },
    {
        title: "How Cutting-Edge Research in D.C. is Reshaping Science",
        author: "Yair Ben-Dor",
        date: "Feb 06, 2025",
        image: "https://static.wixstatic.com/media/11b1c4_aa825fc11e6740d0a40a12f2ea19bf56~mv2.jpeg",
        link: "https://www.catalyst-magazine.com/post/how-cutting-edge-research-in-washington-d-c-is-reshaping-science-and-medicine",
        category: "biotech",
        excerpt: "Researchers in D.C. are revolutionizing AI, MS treatments, and cancer therapies."
    },
    {
        title: "A Universe of Plasma: From Satellites to Cells",
        author: "Aidan Schurr",
        date: "Jan 28, 2025",
        image: "https://static.wixstatic.com/media/11b1c4_5623b55dcf734591a3d3feca82b1d76d~mv2.jpeg",
        link: "https://www.catalyst-magazine.com/post/a-universe-of-plasma-how-one-scientist-connects-his-world-from-satellites-to-cells",
        category: "biotech",
        excerpt: "Dr. Michael Keidar applies plasma physics to diverse fields like satellite propulsion and cancer therapy."
    },
    {
        title: "The Road From Academia to Forensic Applications of Chemistry",
        author: "Naama Ben-Dor",
        date: "Jan 10, 2025",
        image: "https://static.wixstatic.com/media/11b1c4_9737d25c5ad74ba7829973eb7513f61a~mv2.jpeg",
        link: "https://www.catalyst-magazine.com/post/the-road-from-academia-to-forensic-applications-of-chemistry",
        category: "biochemphys",
        excerpt: "Dr. Lucas Kane describes his journey from graduate studies in Chemistry to forensic analysis for the Secret Service."
    },
    {
        title: "From Music to Nuclear Policy: Dr. Cahill’s Journey",
        author: "Lori Preci & Yair Ben-Dor",
        date: "Dec 14, 2024",
        image: "https://static.wixstatic.com/media/11b1c4_0c15687348b442c5ab1d0a2295571751~mv2.jpeg",
        link: "https://www.catalyst-magazine.com/post/from-music-to-nuclear-policy-professor-christopher-cahill-s-unexpected-journey-in-science-and-polic",
        category: "biochemphys",
        excerpt: "Professor Christopher Cahill shows how unexpected turns spark curiosity, innovation, and impact in nuclear science."
    }
];
