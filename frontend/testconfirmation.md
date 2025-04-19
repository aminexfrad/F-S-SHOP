# Landing page : 
 ✓ app/landing/__tests__/page.test.tsx (9 tests) 135ms
   ✓ ShopifyFRHomepage > renders the navbar component
   ✓ ShopifyFRHomepage > renders the main headline correctly
   ✓ ShopifyFRHomepage > renders the subheading text correctly
   ✓ ShopifyFRHomepage > displays the new collection button with correct text
   ✓ ShopifyFRHomepage > renders the new spring collection tag with proper styling
   ✓ ShopifyFRHomepage > renders the starting price information correctly
   ✓ ShopifyFRHomepage > renders all 5 product images with correct alt text
   ✓ ShopifyFRHomepage > has the correct background color for the page
   ✓ ShopifyFRHomepage > properly structures the product carousel section

 Test Files  1 passed (1)
      Tests  9 passed (9)

# About page :
$ npx vitest run app/about/__tests__/page.test.ts
 ✓ app/about/__tests__/page.test.tsx (4 tests) 76ms
   ✓ About Page > renders the navbar
   ✓ About Page > renders the About section
   ✓ About Page > renders the Why Choose Us section
   ✓ About Page > renders the image with alt text

 Test Files  1 passed (1)
      Tests  4 passed (4)
   Duration  1.85s (transform 359ms, setup 122ms, collect 469ms, tests 76ms, environment 480ms, prepare 346ms)

# Carousel page :
$ npx vitest run app/carousel/__tests__/page.test.ts
 ✓ app/carousel/__tests__/page.test.tsx (4 tests) 170ms
   ✓ CarouselPage > renders loading state initially
   ✓ CarouselPage > renders error state on fetch failure
   ✓ CarouselPage > renders products and allows scrolling
   ✓ CarouselPage > removes product if image fails to load

 Test Files  1 passed (1)
      Tests  4 passed (4)
   Duration  2.20s (transform 351ms, setup 207ms, collect 642ms, tests 170ms, environment 532ms, prepare 307ms)

# Cart page : 
- Skipped tests for now, unresolved errors


# Components page : 
- Skipped tests for now


# Login page :
$ npx vitest app/login/__tests__/page.test.ts
 ✓ app/login/__tests__/page.test.tsx (6 tests) 506ms
   ✓ Login Component > renders login component correctly
   ✓ Login Component > updates username and password state on input change
   ✓ Login Component > handles successful login
   ✓ Login Component > displays error message on invalid credentials
   ✓ Login Component > displays network error on request failure
   ✓ Login Component > redirects to home page if already authenticated

 Test Files  1 passed (1)
      Tests  6 passed (6)
   Duration  2.41s (transform 197ms, setup 147ms, collect 542ms, tests 506ms, environment 541ms, prepare 350ms)

# Signup Page :
 ✓ app/signup/__tests__/page.test.tsx (6 tests) 3317ms
   ✓ Register Component > renders register component correctly
   ✓ Register Component > updates username, email, and password state on input change 327ms
   ✓ Register Component > handles successful registration 2288ms
   ✓ Register Component > displays error message on invalid registration
   ✓ Register Component > displays network error message on request failure
   ✓ Register Component > redirects to login page if already authenticated

 Test Files  1 passed (1)
      Tests  6 passed (6)
   Duration  4.97s (transform 179ms, setup 134ms, collect 525ms, tests 3.32s, environment 446ms, prepare 279ms)
