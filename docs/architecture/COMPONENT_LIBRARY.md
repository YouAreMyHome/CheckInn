# 🎨 Component Library - CheckInn OTA

## 📋 Tổng Quan

Component Library của CheckInn được thiết kế theo nguyên tắc **reusable**, **consistent**, và **accessible**. Tất cả components đều follow design system và coding standards của dự án.

---

## 📁 Cấu Trúc Components

```
src/components/
├── common/              # Common UI Components
├── layout/              # Layout Components
├── auth/                # Authentication Components
├── booking/             # Booking Flow Components
├── dashboard/           # Dashboard Components
├── search/              # Search & Filter Components
└── hotel/               # Hotel-specific Components
```

---

## 🧩 Common Components

### Button

**File**: `components/common/Button.jsx`

```jsx
<Button
  variant="primary|secondary|outline|ghost"
  size="sm|md|lg"
  loading={boolean}
  disabled={boolean}
  onClick={handleClick}
>
  Click me
</Button>
```

**Variants**:

- `primary` - Blue background, white text
- `secondary` - Gray background, white text
- `outline` - Transparent background, colored border
- `ghost` - Transparent background, no border

### Input

**File**: `components/common/Input.jsx`

```jsx
<Input
  type="text|email|password|number"
  placeholder="Enter text..."
  value={value}
  onChange={onChange}
  error={errorMessage}
  disabled={boolean}
  required={boolean}
/>
```

### Modal

**File**: `components/common/Modal.jsx`

```jsx
<Modal
  isOpen={boolean}
  onClose={handleClose}
  title="Modal Title"
  size="sm|md|lg|xl"
>
  <p>Modal content here</p>
</Modal>
```

### LoadingSpinner

**File**: `components/common/LoadingSpinner.jsx`

```jsx
<LoadingSpinner size="sm|md|lg|xl" text="Loading..." color="blue|gray|white" />
```

### EmptyState

**File**: `components/common/EmptyState.jsx`

```jsx
<EmptyState
  icon="🔍"
  title="No results found"
  message="Try adjusting your search criteria"
  action={{
    label: "Reset filters",
    onClick: handleReset,
  }}
/>
```

---

## 🏗️ Layout Components

### Header

**File**: `components/layout/Header.jsx`

```jsx
<Header
  user={userObject}
  onLogin={handleLogin}
  onLogout={handleLogout}
  currentPath={pathname}
/>
```

**Features**:

- Responsive navigation
- User menu dropdown
- Mobile hamburger menu
- Logo và branding
- Search bar integration

### Footer

**File**: `components/layout/Footer.jsx`

```jsx
<Footer />
```

**Features**:

- Company information
- Link categories
- Social media links
- Newsletter signup
- Copyright notice

### MainLayout

**File**: `components/layout/MainLayout.jsx`

```jsx
<MainLayout>
  <YourPageContent />
</MainLayout>
```

**Features**:

- Header + Footer wrapper
- SEO meta tags
- Responsive container
- Scroll to top functionality

---

## 🔐 Authentication Components

### Login

**File**: `components/auth/Login.jsx`

```jsx
<Login
  onSuccess={handleLoginSuccess}
  onError={handleLoginError}
  redirectTo="/dashboard"
/>
```

**Features**:

- Email/password login
- Social login (Google, Facebook)
- Remember me option
- Forgot password link
- Form validation

### Register

**File**: `components/auth/Register.jsx`

```jsx
<Register
  onSuccess={handleRegisterSuccess}
  onError={handleRegisterError}
  redirectTo="/verify-email"
/>
```

**Features**:

- Multi-step registration
- Email verification
- Password strength meter
- Terms acceptance
- Social registration

---

## 🛏️ Booking Components

### BookingContext

**File**: `contexts/BookingContext.jsx`

```jsx
const {
  bookingData,
  updateBookingData,
  currentStep,
  nextStep,
  prevStep,
  jumpToStep,
  validateStep,
  calculatePricing,
} = useBooking();
```

**State Structure**:

```javascript
{
  hotel: Object,          // Hotel information
  selectedRoom: Object,   // Selected room details
  dates: {                // Booking dates
    checkIn: String,
    checkOut: String,
    nights: Number
  },
  guests: {               // Guest information
    adults: Number,
    children: Number,
    rooms: Number
  },
  guestDetails: Object,   // Contact & preferences
  pricing: Object,        // Pricing breakdown
  paymentInfo: Object     // Payment details
}
```

### BookingStepProgress

**File**: `components/booking/BookingStepProgress.jsx`

```jsx
<BookingStepProgress
  currentStep={number}
  totalSteps={number}
  onStepClick={handleStepClick}
  stepNames={arrayOfNames}
/>
```

### BookingSummary

**File**: `components/booking/BookingSummary.jsx`

```jsx
<BookingSummary
  hotel={hotelObject}
  room={roomObject}
  dates={datesObject}
  guests={guestsObject}
  pricing={pricingObject}
  isSticky={boolean}
/>
```

### RoomSelectionStep

**File**: `components/booking/RoomSelectionStep.jsx`

**Features**:

- Available rooms fetching
- Room comparison
- Pricing calculation
- Guest capacity validation
- Room amenities display

### GuestDetailsStep

**File**: `components/booking/GuestDetailsStep.jsx`

**Features**:

- Contact information form
- Special requests
- Arrival information
- Room preferences
- Additional services

---

## 🔍 Search Components

### SearchBar

**File**: `components/search/SearchBar.jsx`

```jsx
<SearchBar
  onSearch={handleSearch}
  initialValues={searchParams}
  placeholder="Search hotels..."
  showAdvanced={boolean}
/>
```

### FilterSidebar

**File**: `components/search/FilterSidebar.jsx`

```jsx
<FilterSidebar
  filters={currentFilters}
  onFilterChange={handleFilterChange}
  onReset={handleReset}
  priceRange={[min, max]}
  amenities={amenitiesArray}
/>
```

### HotelCard

**File**: `components/search/HotelCard.jsx`

```jsx
<HotelCard
  hotel={hotelObject}
  onSelect={handleSelect}
  onFavorite={handleFavorite}
  showPrice={boolean}
  layout="grid|list"
/>
```

---

## 🏨 Hotel Components

### HotelDetail

**File**: `components/hotel/HotelDetail.jsx`

```jsx
<HotelDetail
  hotelId={string}
  checkIn={dateString}
  checkOut={dateString}
  guests={guestsObject}
/>
```

### ImageGallery

**File**: `components/hotel/ImageGallery.jsx`

```jsx
<ImageGallery
  images={imagesArray}
  altText={string}
  showThumbnails={boolean}
  maxImages={number}
/>
```

### AmenitiesSection

**File**: `components/hotel/AmenitiesSection.jsx`

```jsx
<AmenitiesSection
  amenities={amenitiesArray}
  categories={categoriesArray}
  showAll={boolean}
/>
```

### ReviewsSection

**File**: `components/hotel/ReviewsSection.jsx`

```jsx
<ReviewsSection
  hotelId={string}
  reviews={reviewsArray}
  averageRating={number}
  totalReviews={number}
/>
```

---

## 🎯 Dashboard Components

### DashboardLayout

**File**: `components/layout/DashboardLayout.jsx`

```jsx
<DashboardLayout userRole="customer|partner|admin">
  <DashboardContent />
</DashboardLayout>
```

### Sidebar

**File**: `components/dashboard/common/Sidebar.jsx`

```jsx
<Sidebar
  userRole={string}
  currentPath={string}
  onNavigate={handleNavigate}
  collapsed={boolean}
/>
```

### StatCard

**File**: `components/dashboard/common/StatCard.jsx`

```jsx
<StatCard
  title="Total Bookings"
  value={1234}
  change={+12}
  period="vs last month"
  icon="📊"
  color="blue|green|red|yellow"
/>
```

---

## 🎨 Styling Guidelines

### Tailwind Classes

```css
/* Spacing */
spacing: p-4, m-6, space-y-4, space-x-3

/* Colors */
primary: bg-blue-600, text-blue-600, border-blue-600
secondary: bg-gray-600, text-gray-600, border-gray-600
success: bg-green-600, text-green-600, border-green-600
warning: bg-yellow-600, text-yellow-600, border-yellow-600
error: bg-red-600, text-red-600, border-red-600

/* Typography */
headings: text-2xl font-bold, text-xl font-semibold
body: text-base font-normal, text-sm text-gray-600
small: text-xs text-gray-500

/* Shadows */
cards: shadow-sm, shadow-md
modals: shadow-lg, shadow-xl

/* Borders */
radius: rounded-lg, rounded-md, rounded-full
borders: border, border-2, border-gray-200
```

### Component Props Pattern

```jsx
const Component = ({
  // Required props first
  title,
  onSubmit,

  // Optional props with defaults
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,

  // Event handlers
  onClick,
  onChange,

  // Style overrides
  className = "",
  style = {},

  // Children/content
  children,
  ...rest
}) => {
  // Component logic
};

Component.propTypes = {
  title: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(["primary", "secondary"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  onChange: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node,
};
```

---

## 🔧 Utility Functions

### Date Utilities

```javascript
// utils/index.js
formatDate(date, format); // Format date strings
calculateNights(checkIn, checkOut); // Calculate night count
isValidDateRange(start, end); // Validate date range
```

### Currency Utilities

```javascript
formatCurrency(amount, currency); // Format price display
calculateTotal(items); // Sum calculations
applyDiscount(amount, percent); // Apply discounts
```

### Validation Utilities

```javascript
validateEmail(email); // Email validation
validatePhone(phone); // Phone validation
validateRequired(value); // Required field check
validatePassword(password); // Password strength
```

---

## ♿ Accessibility Features

### ARIA Labels

```jsx
// Proper labeling
<button aria-label="Close modal" onClick={onClose}>
  <CloseIcon />
</button>

// Form associations
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// Status announcements
<div role="status" aria-live="polite">
  {loading ? 'Loading...' : 'Content loaded'}
</div>
```

### Keyboard Navigation

- Tab order logical và sequential
- Enter/Space activation cho interactive elements
- Escape key closes modals/dropdowns
- Arrow keys cho navigation lists

### Screen Reader Support

- Semantic HTML elements
- Descriptive alt text cho images
- Form labels và error messages
- Status updates cho dynamic content

---

## 📱 Responsive Patterns

### Mobile-First Grid

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map((item) => (
    <ItemCard key={item.id} item={item} />
  ))}
</div>
```

### Responsive Typography

```jsx
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Responsive Heading
</h1>
```

### Mobile Navigation

```jsx
{
  /* Desktop */
}
<nav className="hidden md:flex space-x-6">
  {navItems.map((item) => (
    <NavLink key={item.id} {...item} />
  ))}
</nav>;

{
  /* Mobile */
}
<button className="md:hidden" onClick={toggleMobileMenu}>
  <HamburgerIcon />
</button>;
```

---

## 🧪 Testing Components

### Jest + React Testing Library

```javascript
// Component.test.js
import { render, screen, fireEvent } from "@testing-library/react";
import Component from "./Component";

test("renders component correctly", () => {
  render(<Component title="Test" />);
  expect(screen.getByText("Test")).toBeInTheDocument();
});

test("handles click events", () => {
  const handleClick = jest.fn();
  render(<Component onClick={handleClick} />);
  fireEvent.click(screen.getByRole("button"));
  expect(handleClick).toHaveBeenCalled();
});
```

### Storybook Documentation

```javascript
// Component.stories.js
export default {
  title: "Components/Common/Button",
  component: Button,
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["primary", "secondary", "outline"],
    },
  },
};

export const Primary = {
  args: {
    variant: "primary",
    children: "Primary Button",
  },
};
```

---

_Last Updated: September 22, 2025_  
_Version: 1.0.0_
