const IMG = (id) => `https://images.unsplash.com/${id}?w=900&q=80&auto=format&fit=crop`

const data = {
  hairstyle: {
    key:'hairstyle', title:'Hairstyle', emoji:'✂️', emojiAnim:'floatY',
    brief:'Cuts, color & styling that fit your face and lifestyle.',
    startPrice:'₹499', tagline:'Cuts, color & styling that fit your face and lifestyle.',
    hero: IMG('photo-1517836357463-d25dfeac3438'), // salon hair wash bowl
    about:'From classic bobs to textured layers and contemporary fades, our stylists craft looks that match your face shape, hair texture, and routine. We focus on scalp health, protective techniques, and long-lasting finishes.',
    points:['Face-shape mapping & consultation','Cut, color, and styling packages','Damage-safe techniques & after-care guide'],
      images: [
    '/images/hairstyle1.jpg',
    '/images/hairstyle2.jpg',
    '/images/hairstyle3.jpg',
    '/images/hairstyle4.jpg',
    ],

    quiz:{ title:'Find Your Style — Quick Quiz',
      fields:[
        {type:'select', name:'length', label:'Hair Length', options:['Short','Medium','Long'], required:true},
        {type:'select', name:'texture', label:'Texture', options:['Straight','Wavy','Curly','Coily'], required:true},
        {type:'radio', name:'vibe', label:'Vibe', options:['Elegant','Trendy','Minimal','Bold'], required:true, full:true},
      ],
      recommend: ({length, texture, vibe}) => {
        if (length==='Short' && vibe==='Bold') return {name:'Textured Pixie', details:'Choppy layers with high-definition finish'}
        if (length==='Long' && texture==='Wavy') return {name:'Beach Waves', details:'Soft layers with airy movement'}
        if (length==='Medium' && vibe==='Elegant') return {name:'Classic Lob', details:'Polished long bob for any occasion'}
        if (texture==='Curly') return {name:'Curly Shag', details:'Volume & fringe to frame your face'}
        return {name:'Signature Cut', details:'Tailored to your face shape & lifestyle'}
      }
    },
    faq:[
      {q:'How often should I cut my hair?', a:'Every 6–10 weeks for most styles to maintain shape and health.'},
      {q:'Do you offer damage-safe coloring?', a:'Yes, with bond-builders and after-care to protect hair integrity.'},
      {q:'Can you advise on products?', a:'Absolutely. Your stylist will recommend a routine for your hair type.'},
    ],
    pricing:{ women:[
      {name:'Cut & Style', price:'₹899', duration:'45 min'},
      {name:'Color & Gloss', price:'₹1999', duration:'90 min'},
      {name:'Keratin Smooth', price:'₹3499', duration:'120 min'}
    ], men:[
      {name:'Classic Cut', price:'₹499', duration:'30 min'},
      {name:'Fade & Style', price:'₹699', duration:'40 min'},
      {name:'Beard Groom', price:'₹299', duration:'15 min'}
    ]}
  },

  skincare: {
    key:'skincare', title:'Skin Care', emoji:'💆', emojiAnim:'pulse',
    brief:'Dermatologist-designed facials for glow, clarity & calm.',
    startPrice:'₹999', tagline:'Dermatologist-designed facials and routines for glow, clarity, and calm.',
    hero: IMG('photo-1570172619644-dfd03ed5d881'),
    about:'We personalise treatments around your skin type, sensitivity, and lifestyle. From hydration boosts to acne defense and bridal radiance programs, each session ends with an easy home-care routine.',
    points:['Skin analysis & sensitivity test','Active-ingredient facials (AHA/BHA, Vitamin-C, Niacinamide)','Barrier-friendly routines & sun-care guidance'],
    images: [
  '/images/skincare1.jpg',
  '/images/skincare2.jpg',
  '/images/skincare3.jpg',
  '/images/skincare4.jpg',
],

    quiz:{ title:'Skin Match — Mini Quiz',
      fields:[
        {type:'select', name:'type', label:'Skin Type', options:['Dry','Oily','Combination','Sensitive','Normal'], required:true},
        {type:'select', name:'concern', label:'Primary Concern', options:['Acne','Dark Spots','Dullness','Redness','Aging'], required:true},
        {type:'radio', name:'pref', label:'Preference', options:['Gentle','Intensive','Natural'], required:true, full:true},
      ],
      recommend: ({type, concern, pref}) => {
        if (type==='Sensitive') return {name:'Calm & Barrier Facial', details:'Fragrance-free, ceramide + centella with SPF wrap-up'}
        if (concern==='Acne' && pref!=='Natural') return {name:'Acne Defense Peel', details:'Gentle BHA + clay detox; weekly follow-up'}
        if (concern==='Dark Spots') return {name:'Bright-C Therapy', details:'Vitamin-C infusion + niacinamide serum at home'}
        if (type==='Dry') return {name:'Hydra Glow Facial', details:'Hyaluronic boost mask + lipid balm finish'}
        return {name:'Balanced Glow', details:'Custom AHA enzyme facial with soothing finish'}
      }
    },
    faq:[
      {q:'Is AHA/BHA facial safe for sensitive skin?', a:'We perform a patch test and adjust concentration. Sensitive skin may start with enzyme or lactic facials before AHA/BHA.'},
      {q:'How soon will I see results?', a:'Glow is immediate; clarity for acne/marks usually shows within 2–4 sessions with home care.'},
      {q:'Can pregnant clients take facials?', a:'Yes, with pregnancy-safe options (no salicylic/retinoids). We tailor a gentle routine after consultation.'},
    ],
    pricing:{ women:[
      {name:'Hydra Glow Facial', price:'₹1799', duration:'60 min'},
      {name:'Acne Defense Peel', price:'₹1599', duration:'45 min'},
      {name:'Bright-C Therapy', price:'₹1899', duration:'70 min'}
    ], men:[
      {name:'Detan & Cleanse', price:'₹999', duration:'40 min'},
      {name:'Oil-Control Facial', price:'₹1199', duration:'50 min'}
    ]}
  },

  spa: {
    key:'spa', title:'Spondy Relaxation', emoji:'🧘', emojiAnim:'sway',
    brief:'Targeted neck & back relief to ease spondylosis tension.',
    startPrice:'₹999', tagline:'Targeted neck & back relief to ease spondylosis tension.',
    hero: IMG('photo-1556228720-195a672e8a03'),
    about:'Relieve stiffness and strain with a program focused on cervical and upper-back relaxation. Gentle mobilization, heat therapy, and posture coaching reduce discomfort and improve range of motion.',
    points:['Neck & upper-back focus','Heat therapy + guided stretching','Ergonomic posture guidance'],
    images: [
  '/images/spa1.jpg',
  '/images/spa2.jpg',
  '/images/spa3.jpg',
  '/images/spa4.jpg',
],

    quiz:{ title:'Relief Finder — Quick Check',
      fields:[
        {type:'select', name:'pain', label:'Pain Level', options:['Mild','Moderate','Severe'], required:true},
        {type:'select', name:'area', label:'Primary Area', options:['Neck','Upper Back','Shoulders'], required:true},
        {type:'radio', name:'pref', label:'Touch Pressure', options:['Gentle','Moderate','Deep'], required:true, full:true},
      ],
      recommend: ({pain, area, pref}) => {
        if (pain==='Severe' || pref==='Deep') return {name:'Deep Relief Session', details:'Targeted trigger-point + heat therapy'}
        if (area==='Neck') return {name:'Cervical Ease', details:'Neck mobilization + posture routine'}
        return {name:'Calm Restore', details:'Gentle relaxation + guided stretching'}
      }
    },
    faq:[
      {q:'Is it a medical treatment?', a:'It is a relaxation and wellness service, not a medical procedure. Consult a physician for diagnosis.'},
      {q:'What should I wear?', a:'Comfortable clothing; we provide draping for comfort and privacy.'},
      {q:'Any after-care tips?', a:'Hydration and simple stretches help maintain relief.'},
    ],
    pricing:{ women:[
      {name:'Cervical Ease', price:'₹1199', duration:'45 min'},
      {name:'Deep Relief Session', price:'₹1499', duration:'60 min'}
    ], men:[
      {name:'Upper-Back Restore', price:'₹999', duration:'40 min'},
      {name:'Calm Restore', price:'₹1299', duration:'55 min'}
    ]}
  },

  facial: {
    key:'facial', title:'Facial Treatment', emoji:'💆‍♀️', emojiAnim:'floatY',
    brief:'Custom facials for clarity, radiance, and hydration.',
    startPrice:'₹1199', tagline:'Custom facials for clarity, radiance, and hydration.',
    hero: IMG('photo-1616394584738-c3fa2b618f01'),
    about:'We build facials around your skin’s needs: cleansing, exfoliation, massage, mask, and targeted serums for glow and hydration.',
    points:['Double cleanse & steam','Extraction by request','Mask + serum to finish'],
    images: [
  '/images/face1.jpg',
  '/images/face2.jpg',
  '/images/face3.jpg',
  '/images/face4.jpg',
],

    quiz:{ title:'Glow Guide — Mini Quiz',
      fields:[
        {type:'select', name:'goal', label:'Primary Goal', options:['Hydration','Brightening','Calming','Anti-Aging'], required:true},
        {type:'radio', name:'sensitivity', label:'Sensitivity', options:['Low','Medium','High'], required:true, full:true},
      ],
      recommend: ({goal, sensitivity}) => {
        if (sensitivity==='High') return {name:'Sensitive Calm Facial', details:'Enzyme exfoliation + soothing mask'}
        if (goal==='Brightening') return {name:'Radiance Boost', details:'Vitamin-C + niacinamide combo'}
        if (goal==='Hydration') return {name:'Hydra Plump', details:'Hyaluronic infusion + massage'}
        return {name:'Signature Facial', details:'Balanced steps for overall glow'}
      }
    },
    faq:[
      {q:'How often should I take facials?', a:'Every 4–6 weeks is typical for maintenance of results.'},
      {q:'Do you do extractions?', a:'Yes, on request and when suitable for your skin.'},
    ],
    pricing:{ women:[
      {name:'Radiance Boost', price:'₹1499', duration:'60 min'},
      {name:'Hydra Plump', price:'₹1399', duration:'50 min'}
    ], men:[
      {name:'Clarify & Calm', price:'₹1199', duration:'45 min'}
    ]}
  },

  makeup: {
    key:'makeup', title:'Makeup', emoji:'💄', emojiAnim:'pulse',
    brief:'From natural day looks to full bridal glam.',
    startPrice:'₹999', tagline:'From natural day looks to full bridal glam.',
    hero: IMG('photo-1490474418585-ba9bad8fd0ea'),
    about:'Looks that photograph beautifully and feel comfortable all day. We balance skin prep, shade matching, and long-wear techniques for a flawless finish.',
    points:['Occasion & brief consultation','Skin prep + match','Long-wear finish'],
   images: [
  '/images/make1.jpg',
  '/images/make2.jpg',
  '/images/make3.jpg',
  '/images/make4.jpg',
],

    quiz:{ title:'Look Finder — Quick Quiz',
      fields:[
        {type:'select', name:'event', label:'Event Type', options:['Day Out','Party','Wedding','Photoshoot'], required:true},
        {type:'radio', name:'boldness', label:'Boldness', options:['Soft','Balanced','Glam'], required:true, full:true},
      ],
      recommend: ({event, boldness}) => {
        if (event==='Wedding' || boldness==='Glam') return {name:'Bridal Glam', details:'Sculpt + shimmer with long-wear'}
        if (event==='Photoshoot') return {name:'Photo-Ready', details:'Matte-balanced with setting steps'}
        if (boldness==='Soft') return {name:'Soft Natural', details:'Skin-like finish, neutral tones'}
        return {name:'Signature Party', details:'Balanced glam for evening'}
      }
    },
    faq:[
      {q:'Do you include lashes?', a:'Yes, on request. We match comfort level and style.'},
      {q:'Do you travel for events?', a:'Yes, with advance booking and travel fee.'},
    ],
    pricing:{ women:[
      {name:'Soft Natural', price:'₹1299', duration:'60 min'},
      {name:'Signature Party', price:'₹1699', duration:'75 min'},
      {name:'Bridal Glam', price:'₹4999', duration:'150 min'}
    ], men:[
      {name:'Groom Touch-up', price:'₹999', duration:'45 min'}
    ]}
  },

  eye: {
    key:'eye', title:'Eye Treatment', emoji:'👁️', emojiAnim:'sway',
    brief:'Relaxing eye care for puffiness, strain & dark circles.',
    startPrice:'₹699', tagline:'Relaxing eye care for puffiness, strain & dark circles.',
    hero: IMG('photo-1586487620160-3b62a25f4d83'),
    about:'Soothe tired eyes with chilled masks, gentle massage, and brightening serums. Ideal for screen strain and late nights.',
    points:['Cooling mask + massage','Brightening serum','Relaxation ritual'],
    images: [
  '/images/eye1.jpg',
  '/images/eye2.jpg',
  '/images/eye3.jpg',
  '/images/eye4.jpg',
],
    quiz:{ title:'Eye Care Helper',
      fields:[
        {type:'select', name:'issue', label:'Main Issue', options:['Puffiness','Dark Circles','Eye Strain'], required:true},
        {type:'radio', name:'time', label:'Preferred Time', options:['Quick 20m','Standard 40m','Relax 60m'], required:true, full:true},
      ],
      recommend: ({issue, time}) => {
        if (issue==='Puffiness') return {name:'De-Puff Ritual', details:'Cooling mask + lymphatic massage'}
        if (issue==='Dark Circles') return {name:'Bright Eye Boost', details:'Caffeine + niacinamide focus'}
        return {name:'Screen-Calm', details:'Eye strain relief massage + rest'}
      }
    },
    faq:[
      {q:'Is it safe for contact lens wearers?', a:'Yes, we guide lens removal if needed and use gentle products.'},
      {q:'Any downtime?', a:'None. You can get back to your day right away.'},
    ],
    pricing:{ women:[
      {name:'Bright Eye Boost', price:'₹799', duration:'30 min'}
    ], men:[
      {name:'Screen-Calm', price:'₹699', duration:'30 min'}
    ]}
  },
}

export default data
